// PesaPal Payment Service
// Documentation: https://developer.pesapal.com/official-extensions/documentation

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Create payment for a book
export const createBookPayment = async (book, user) => {
  try {
    if (!book || !user) {
      throw new Error('Book and user information required');
    }

    if (book.is_free || book.isFree) {
      throw new Error('This book is free');
    }

    const result = await apiRequest('/api/pesapal/create-order', {
      method: 'POST',
      body: JSON.stringify({
        bookId: book.id,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          countryCode: user.countryCode,
        },
      }),
    });

    return {
      success: true,
      orderId: result.orderId,
      orderTrackingId: result.orderTrackingId,
      redirectUrl: result.redirectUrl,
      merchantReference: result.merchantReference,
    };
  } catch (error) {
    console.error('❌ Create payment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Check payment status
export const checkPaymentStatus = async (orderTrackingId) => {
  try {
    const result = await apiRequest(
      `/api/pesapal/transaction-status?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        method: 'GET',
      },
    );

    const status = result.status;
    
    return {
      success: true,
      status: status.payment_status_description,
      statusCode: status.status_code,
      amount: status.amount,
      currency: status.currency,
      paymentMethod: status.payment_method,
      confirmed: status.confirmation_code,
    };
  } catch (error) {
    console.error('❌ Check payment status error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const verifyPayment = async (orderTrackingId, orderId, merchantReference) => {
  try {
    const result = await apiRequest('/api/pesapal/verify', {
      method: 'POST',
      body: JSON.stringify({ orderTrackingId, orderId, merchantReference }),
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  createBookPayment,
  checkPaymentStatus,
  verifyPayment,
};
