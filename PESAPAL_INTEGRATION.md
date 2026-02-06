# PesaPal Payment Integration

This document explains how PesaPal payment gateway has been integrated into the BookStoa application for handling paid book purchases.

## Overview

PesaPal is a payment gateway that supports multiple payment methods including:
- Mobile Money (MTN, Airtel, etc.)
- Credit/Debit Cards (Visa, Mastercard)
- Bank Transfers

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# PesaPal Payment Gateway
VITE_PESAPAL_CONSUMER_KEY=tudEYtsLOPDVLzzKtMrbUGkb+uUMSnB0
VITE_PESAPAL_CONSUMER_SECRET=GmgqFFkkzXjuz8E/+MKmzrrVzuE=
VITE_PESAPAL_ENVIRONMENT=sandbox
```

**Environments:**
- `sandbox` - For testing (default)
- `live` - For production

## Database Schema

### Payments Table

The `payments` table stores all payment transactions:

```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  book_id TEXT NOT NULL REFERENCES books(id),
  order_id TEXT UNIQUE NOT NULL,
  order_tracking_id TEXT UNIQUE,
  merchant_reference TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'UGX' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  confirmation_code TEXT,
  payment_status_description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);
```

**Payment Statuses:**
- `pending` - Payment initiated but not completed
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user

### Running the Migration

```bash
node run-payments-table-migration.js
```

## Services

### 1. PesaPal Service (`src/services/pesapalService.js`)

Handles communication with PesaPal API:

**Key Functions:**
- `authenticate()` - Get auth token from PesaPal
- `submitOrder(orderData)` - Submit payment order
- `getTransactionStatus(orderTrackingId)` - Check payment status
- `createBookPayment(book, user)` - Create payment for a book
- `checkPaymentStatus(orderTrackingId)` - Verify payment completion

### 2. Payments Service (`src/services/paymentsService.js`)

Handles database operations for payments:

**Key Functions:**
- `createPayment(paymentData)` - Save payment record
- `updatePaymentStatus(orderId, statusData)` - Update payment status
- `hasUserPaidForBook(userId, bookId)` - Check if user has paid
- `getUserPayments(userId)` - Get user's payment history

## Components

### PaymentModal (`src/components/PaymentModal.jsx`)

Modal component for initiating payments:
- Shows book details and price
- Displays payment information
- Redirects to PesaPal for payment

### PaymentCallback (`src/pages/PaymentCallback.jsx`)

Handles payment verification after redirect from PesaPal:
- Verifies payment status
- Updates database
- Redirects user to book page

## Payment Flow

### 1. User Initiates Payment

```javascript
// On BookDetail page
<button onClick={() => setShowPaymentModal(true)}>
  Purchase for UGX 10,000
</button>
```

### 2. Payment Modal Opens

```javascript
<PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  book={book}
  user={user}
/>
```

### 3. Create Payment Order

```javascript
// In PaymentModal
const result = await createBookPayment(book, user);

// Save to database
await paymentsService.createPayment({
  userId: user.id,
  bookId: book.id,
  orderId: result.orderId,
  amount: book.price,
  currency: 'UGX',
});

// Redirect to PesaPal
window.location.href = result.redirectUrl;
```

### 4. User Completes Payment on PesaPal

User is redirected to PesaPal payment page where they:
- Choose payment method
- Enter payment details
- Complete transaction

### 5. Callback Verification

```javascript
// PesaPal redirects to: /payment/callback?OrderTrackingId=xxx

// In PaymentCallback component
const result = await checkPaymentStatus(orderTrackingId);

// Update database
await paymentsService.updatePaymentStatus(orderId, {
  status: 'completed',
  paymentMethod: result.paymentMethod,
  confirmationCode: result.confirmed,
});

// Redirect to book
navigate(`/book/${bookId}`);
```

### 6. Access Control

```javascript
// Check if user has paid before allowing access
const { hasPaid } = await paymentsService.hasUserPaidForBook(userId, bookId);

if (!hasPaid && !book.is_free) {
  // Show payment modal
  setShowPaymentModal(true);
} else {
  // Allow access to book
  setIsPDFViewerOpen(true);
}
```

## UI Integration

### Book Card

Shows payment status:
```javascript
{!isFree && (
  <div className="bg-green-600 text-white px-2 py-1 rounded-md">
    {formatPrice(price)}
  </div>
)}
{isFree && (
  <div className="bg-gray-700/90 text-green-400 px-2 py-1 rounded-md">
    FREE
  </div>
)}
```

### Book Detail Page

Shows appropriate button based on payment status:
```javascript
{book.is_free || hasPaid ? (
  <button onClick={handleStartReading}>
    Start Reading
  </button>
) : (
  <button onClick={() => setShowPaymentModal(true)}>
    Purchase for {formatPrice(book.price)}
  </button>
)}
```

## Testing

### Sandbox Mode

1. Set environment to sandbox:
```env
VITE_PESAPAL_ENVIRONMENT=sandbox
```

2. Use PesaPal test credentials for payment

3. Test payment flow:
   - Create a paid book (is_free = false, price > 0)
   - Click purchase button
   - Complete payment on PesaPal sandbox
   - Verify callback and database update

### Production Mode

1. Get production credentials from PesaPal
2. Update environment variables:
```env
VITE_PESAPAL_CONSUMER_KEY=your_live_key
VITE_PESAPAL_CONSUMER_SECRET=your_live_secret
VITE_PESAPAL_ENVIRONMENT=live
```

3. Test with small amounts first

## Security Considerations

1. **Never expose secrets in frontend code** - Use environment variables
2. **Verify payments on callback** - Always check status with PesaPal API
3. **Store payment records** - Keep audit trail in database
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Use HTTPS** - Required for production

## Troubleshooting

### Payment Not Completing

1. Check PesaPal credentials are correct
2. Verify callback URL is accessible
3. Check payment status in PesaPal dashboard
4. Review browser console for errors

### Database Errors

1. Ensure payments table exists (run migration)
2. Check database connection
3. Verify user and book IDs are valid

### Redirect Issues

1. Verify callback URL in `.env` matches your domain
2. Check route is registered in `App.jsx`
3. Ensure no CORS issues

## API Endpoints

### PesaPal API

- **Auth:** `POST /api/Auth/RequestToken`
- **Submit Order:** `POST /api/Transactions/SubmitOrderRequest`
- **Check Status:** `GET /api/Transactions/GetTransactionStatus`

### Base URLs

- **Sandbox:** `https://cybqa.pesapal.com/pesapalv3`
- **Live:** `https://pay.pesapal.com/v3`

## Support

- **PesaPal Documentation:** https://developer.pesapal.com/official-extensions/documentation
- **PesaPal Support:** support@pesapal.com

## Future Enhancements

1. **Webhooks/IPN** - Real-time payment notifications
2. **Refunds** - Handle payment refunds
3. **Payment History** - User dashboard for payments
4. **Analytics** - Track payment metrics
5. **Multiple Currencies** - Support other currencies beyond UGX
