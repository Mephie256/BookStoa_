// Payments Service - Database operations for payment transactions
import { neon } from '@neondatabase/serverless';
import { createId } from '@paralleldrive/cuid2';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

// Create a new payment record
export const createPayment = async (paymentData) => {
  try {
    const payment = {
      id: createId(),
      user_id: paymentData.userId,
      book_id: paymentData.bookId,
      order_id: paymentData.orderId,
      order_tracking_id: paymentData.orderTrackingId || null,
      merchant_reference: paymentData.merchantReference || null,
      amount: paymentData.amount,
      currency: paymentData.currency || 'UGX',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await sql`
      INSERT INTO payments (
        id, user_id, book_id, order_id, order_tracking_id, merchant_reference,
        amount, currency, status, created_at, updated_at
      )
      VALUES (
        ${payment.id}, ${payment.user_id}, ${payment.book_id}, ${payment.order_id},
        ${payment.order_tracking_id}, ${payment.merchant_reference}, ${payment.amount},
        ${payment.currency}, ${payment.status}, ${payment.created_at}, ${payment.updated_at}
      )
      RETURNING *
    `;
    
    return {
      success: true,
      payment: result[0],
    };
  } catch (error) {
    console.error('❌ Create payment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getLatestPaymentForBook = async (userId, bookId) => {
  try {
    const result = await sql`
      SELECT * FROM payments
      WHERE user_id = ${userId}
        AND book_id = ${bookId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return {
      success: true,
      payment: result[0] || null,
    };
  } catch (error) {
    console.error('❌ Get latest payment error:', error);
    return {
      success: false,
      payment: null,
      error: error.message,
    };
  }
};

export const syncLatestPaymentForBook = async (userId, bookId) => {
  try {
    const latest = await getLatestPaymentForBook(userId, bookId);
    const payment = latest.payment;

    if (!payment) {
      return { success: true, synced: false, payment: null };
    }

    if (payment.status === 'completed') {
      return { success: true, synced: false, payment };
    }

    if (!payment.order_tracking_id) {
      return { success: true, synced: false, payment };
    }

    const response = await fetch('/api/pesapal/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderTrackingId: payment.order_tracking_id,
        orderId: payment.order_id,
        merchantReference: payment.merchant_reference,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return {
        success: false,
        synced: false,
        payment,
        error: data.error || data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      synced: true,
      payment: data.payment || payment,
      paymentStatus: data.paymentStatus,
    };
  } catch (error) {
    console.error('❌ Sync latest payment error:', error);
    return {
      success: false,
      synced: false,
      error: error.message,
    };
  }
};

export const checkUserPaidForBook = async (userId, bookId) => {
  const firstCheck = await hasUserPaidForBook(userId, bookId);
  if (firstCheck.success && firstCheck.hasPaid) return firstCheck;

  await syncLatestPaymentForBook(userId, bookId);
  return await hasUserPaidForBook(userId, bookId);
};

// Update payment status
export const updatePaymentStatus = async (orderId, statusData) => {
  try {
    const updateData = {
      status: statusData.status,
      payment_method: statusData.paymentMethod || null,
      confirmation_code: statusData.confirmationCode || null,
      payment_status_description: statusData.paymentStatusDescription || null,
      updated_at: new Date().toISOString(),
      completed_at: statusData.status === 'completed' ? new Date().toISOString() : null,
    };

    const result = await sql`
      UPDATE payments
      SET 
        status = ${updateData.status},
        payment_method = ${updateData.payment_method},
        confirmation_code = ${updateData.confirmation_code},
        payment_status_description = ${updateData.payment_status_description},
        updated_at = ${updateData.updated_at},
        completed_at = ${updateData.completed_at}
      WHERE order_id = ${orderId}
      RETURNING *
    `;

    if (result.length === 0) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    return {
      success: true,
      payment: result[0],
    };
  } catch (error) {
    console.error('❌ Update payment status error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get payment by order ID
export const getPaymentByOrderId = async (orderId) => {
  try {
    const result = await sql`
      SELECT * FROM payments
      WHERE order_id = ${orderId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    return {
      success: true,
      payment: result[0],
    };
  } catch (error) {
    console.error('❌ Get payment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get user's payment history
export const getUserPayments = async (userId) => {
  try {
    const result = await sql`
      SELECT * FROM payments
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return {
      success: true,
      payments: result,
    };
  } catch (error) {
    console.error('❌ Get user payments error:', error);
    return {
      success: false,
      error: error.message,
      payments: [],
    };
  }
};

// Check if user has paid for a book
export const hasUserPaidForBook = async (userId, bookId) => {
  try {
    const result = await sql`
      SELECT * FROM payments
      WHERE user_id = ${userId}
        AND book_id = ${bookId}
        AND status = 'completed'
      LIMIT 1
    `;

    return {
      success: true,
      hasPaid: result.length > 0,
      payment: result[0] || null,
    };
  } catch (error) {
    console.error('❌ Check payment error:', error);
    return {
      success: false,
      hasPaid: false,
      error: error.message,
    };
  }
};

// Get all payments for a book
export const getBookPayments = async (bookId) => {
  try {
    const result = await sql`
      SELECT * FROM payments
      WHERE book_id = ${bookId}
      ORDER BY created_at DESC
    `;

    return {
      success: true,
      payments: result,
    };
  } catch (error) {
    console.error('❌ Get book payments error:', error);
    return {
      success: false,
      error: error.message,
      payments: [],
    };
  }
};

export const paymentsService = {
  createPayment,
  updatePaymentStatus,
  getPaymentByOrderId,
  getUserPayments,
  getLatestPaymentForBook,
  syncLatestPaymentForBook,
  checkUserPaidForBook,
  hasUserPaidForBook,
  getBookPayments,
};

export default paymentsService;
