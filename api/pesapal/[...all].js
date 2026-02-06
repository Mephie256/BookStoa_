import { neon } from '@neondatabase/serverless';
import { createId } from '@paralleldrive/cuid2';

const getEnv = (key) => process.env[key];

const getPesapalEnv = () => {
  const environment = getEnv('PESAPAL_ENVIRONMENT') || getEnv('VITE_PESAPAL_ENVIRONMENT') || 'sandbox';
  return environment === 'live' ? 'live' : 'sandbox';
};

const getBaseUrl = () => {
  return getPesapalEnv() === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
};

const getDbUrl = () => getEnv('DATABASE_URL') || getEnv('VITE_DATABASE_URL');

const sql = neon(getDbUrl());

let cachedToken = null;
let cachedTokenExpiresAt = 0;
let cachedIpnId = null;

const parseJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const sendJson = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const setCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const getUrlInfo = (req) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const pathname = url.pathname || '';
  const prefix = '/api/pesapal/';
  const subPath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';
  return { url, pathname, subPath };
};

const extractPesapalErrorMessage = (data) => {
  if (!data) return null;
  if (typeof data.message === 'string') return data.message;
  if (data.error && typeof data.error.message === 'string') return data.error.message;
  return null;
};

const requirePesapalCredentials = () => {
  const consumerKey = getEnv('PESAPAL_CONSUMER_KEY') || getEnv('VITE_PESAPAL_CONSUMER_KEY');
  const consumerSecret = getEnv('PESAPAL_CONSUMER_SECRET') || getEnv('VITE_PESAPAL_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing Pesapal credentials');
  }

  return { consumerKey, consumerSecret };
};

const getAuthToken = async () => {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const { consumerKey, consumerSecret } = requirePesapalCredentials();

  const response = await fetch(`${getBaseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractPesapalErrorMessage(data) || `Authentication failed: ${response.status}`);
  }

  if (data?.error) {
    const message = extractPesapalErrorMessage(data) || JSON.stringify(data.error);
    console.error('❌ Pesapal auth returned error payload:', {
      status: response.status,
      error: data.error,
    });
    throw new Error(message || 'Pesapal authentication failed');
  }

  if (!data.token) {
    console.error('❌ Pesapal auth response missing token:', {
      status: response.status,
      body: data,
    });
    throw new Error(extractPesapalErrorMessage(data) || 'No token received from Pesapal');
  }

  cachedToken = data.token;
  cachedTokenExpiresAt = Date.now() + 4 * 60 * 1000;

  return cachedToken;
};

const registerIpnIfNeeded = async (ipnUrl) => {
  const envIpnId = getEnv('PESAPAL_IPN_ID') || getEnv('VITE_PESAPAL_IPN_ID');
  if (envIpnId) return envIpnId;
  if (cachedIpnId) return cachedIpnId;

  const token = await getAuthToken();

  const response = await fetch(`${getBaseUrl()}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'GET',
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractPesapalErrorMessage(data) || `IPN registration failed: ${response.status}`);
  }

  cachedIpnId = data.ipn_id || data.notification_id || data.id || data.notificationId || null;

  if (!cachedIpnId) {
    throw new Error('No IPN id received from Pesapal');
  }

  return cachedIpnId;
};

const submitOrder = async (orderData) => {
  const token = await getAuthToken();

  const response = await fetch(`${getBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractPesapalErrorMessage(data) || `Order submission failed: ${response.status}`);
  }

  return data;
};

const getTransactionStatus = async (orderTrackingId) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractPesapalErrorMessage(data) || `Status check failed: ${response.status}`);
  }

  return data;
};

const mapStatusCode = (statusCode) => {
  const map = {
    0: 'pending',
    1: 'completed',
    2: 'failed',
    3: 'cancelled',
  };

  const key = typeof statusCode === 'string' ? Number(statusCode) : statusCode;
  return map[key] || 'pending';
};

const createOrderHandler = async (req, res) => {
  const body = await parseJsonBody(req);
  const bookId = body.bookId;
  const user = body.user;

  if (!bookId || !user?.id || !user?.email) {
    return sendJson(res, 400, { success: false, error: 'bookId and user (id, email) are required' });
  }

  const origin = req.headers.origin || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
  const callbackUrl = `${origin}/payment/callback`;
  const ipnUrl = `${origin}/api/pesapal/ipn`;

  const books = await sql`
    SELECT id, title, author, is_free, price
    FROM books
    WHERE id = ${bookId}
    LIMIT 1
  `;

  if (!books || books.length === 0) {
    return sendJson(res, 404, { success: false, error: 'Book not found' });
  }

  const book = books[0];

  if (book.is_free) {
    return sendJson(res, 400, { success: false, error: 'This book is free' });
  }

  const price = Number(book.price || 0);
  if (!Number.isFinite(price) || price <= 0) {
    return sendJson(res, 400, { success: false, error: 'Invalid book price' });
  }

  const orderId = `BOOK-${book.id}-${Date.now()}`;

  const notificationId = await registerIpnIfNeeded(ipnUrl);

  const orderData = {
    id: orderId,
    currency: 'UGX',
    amount: price,
    description: `Purchase of "${book.title}" by ${book.author}`,
    callback_url: callbackUrl,
    notification_id: notificationId,
    billing_address: {
      email_address: user.email,
      phone_number: user.phone || '',
      country_code: user.countryCode || 'UG',
      first_name: (user.name || 'User').split(' ')[0] || 'User',
      middle_name: '',
      last_name: (user.name || '').split(' ').slice(1).join(' ') || '',
      line_1: '',
      line_2: '',
      city: '',
      state: '',
      postal_code: '',
      zip_code: '',
    },
  };

  const result = await submitOrder(orderData);

  const orderTrackingId = result.order_tracking_id;
  const redirectUrl = result.redirect_url;
  const merchantReference = result.merchant_reference;

  const paymentId = createId();

  await sql`
    INSERT INTO payments (
      id, user_id, book_id, order_id, order_tracking_id, merchant_reference,
      amount, currency, status, created_at, updated_at
    ) VALUES (
      ${paymentId}, ${user.id}, ${book.id}, ${orderId}, ${orderTrackingId}, ${merchantReference},
      ${price}, ${'UGX'}, ${'pending'}, NOW(), NOW()
    )
  `;

  return sendJson(res, 200, {
    success: true,
    orderId,
    orderTrackingId,
    merchantReference,
    redirectUrl,
  });
};

const transactionStatusHandler = async (req, res) => {
  const { url } = getUrlInfo(req);
  const orderTrackingId = url.searchParams.get('orderTrackingId');

  if (!orderTrackingId) {
    return sendJson(res, 400, { success: false, error: 'orderTrackingId is required' });
  }

  const status = await getTransactionStatus(orderTrackingId);

  return sendJson(res, 200, { success: true, status });
};

const verifyAndUpdateHandler = async (req, res) => {
  const body = await parseJsonBody(req);
  const orderTrackingId = body.orderTrackingId;
  const orderId = body.orderId;
  const merchantReference = body.merchantReference;

  if (!orderTrackingId || (!orderId && !merchantReference)) {
    return sendJson(res, 400, { success: false, error: 'orderTrackingId and (orderId or merchantReference) are required' });
  }

  const status = await getTransactionStatus(orderTrackingId);

  const paymentStatus = mapStatusCode(status.status_code);

  const updated = await sql`
    UPDATE payments
    SET
      status = ${paymentStatus},
      payment_method = ${status.payment_method || null},
      confirmation_code = ${status.confirmation_code || null},
      payment_status_description = ${status.payment_status_description || null},
      updated_at = NOW(),
      completed_at = CASE WHEN ${paymentStatus} = 'completed' THEN NOW() ELSE NULL END
    WHERE (${orderId || null} IS NOT NULL AND order_id = ${orderId || null})
       OR (${merchantReference || null} IS NOT NULL AND merchant_reference = ${merchantReference || null})
    RETURNING *
  `;

  if (!updated || updated.length === 0) {
    return sendJson(res, 404, { success: false, error: 'Payment record not found' });
  }

  return sendJson(res, 200, {
    success: true,
    payment: updated[0],
    status,
    paymentStatus,
  });
};

const ipnHandler = async (req, res) => {
  const { url } = getUrlInfo(req);

  const orderTrackingId =
    url.searchParams.get('OrderTrackingId') ||
    url.searchParams.get('orderTrackingId') ||
    url.searchParams.get('order_tracking_id');

  const merchantReference =
    url.searchParams.get('OrderMerchantReference') ||
    url.searchParams.get('merchantReference') ||
    url.searchParams.get('merchant_reference');

  const orderId = url.searchParams.get('orderId') || url.searchParams.get('order_id');

  if (!orderTrackingId || (!merchantReference && !orderId)) {
    return sendJson(res, 400, { success: false, error: 'Missing OrderTrackingId or OrderMerchantReference' });
  }

  const status = await getTransactionStatus(orderTrackingId);
  const paymentStatus = mapStatusCode(status.status_code);

  await sql`
    UPDATE payments
    SET
      status = ${paymentStatus},
      payment_method = ${status.payment_method || null},
      confirmation_code = ${status.confirmation_code || null},
      payment_status_description = ${status.payment_status_description || null},
      updated_at = NOW(),
      completed_at = CASE WHEN ${paymentStatus} = 'completed' THEN NOW() ELSE NULL END
    WHERE (${orderId || null} IS NOT NULL AND order_id = ${orderId || null})
       OR (${merchantReference || null} IS NOT NULL AND merchant_reference = ${merchantReference || null})
  `;

  return sendJson(res, 200, { success: true });
};

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const { subPath } = getUrlInfo(req);

    if (req.method === 'POST' && subPath === 'create-order') {
      return await createOrderHandler(req, res);
    }

    if (req.method === 'GET' && subPath === 'transaction-status') {
      return await transactionStatusHandler(req, res);
    }

    if (req.method === 'POST' && subPath === 'verify') {
      return await verifyAndUpdateHandler(req, res);
    }

    if (req.method === 'GET' && subPath === 'ipn') {
      return await ipnHandler(req, res);
    }

    return sendJson(res, 404, { success: false, error: 'Not found' });
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error?.message || 'Internal server error' });
  }
}
