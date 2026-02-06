# PesaPal Payment Setup Guide

Quick guide to get PesaPal payments working in your BookStoa app.

## Step 1: Environment Setup

Your `.env` file already has the PesaPal credentials:

```env
VITE_PESAPAL_CONSUMER_KEY=tudEYtsLOPDVLzzKtMrbUGkb+uUMSnB0
VITE_PESAPAL_CONSUMER_SECRET=GmgqFFkkzXjuz8E/+MKmzrrVzuE=
VITE_PESAPAL_ENVIRONMENT=sandbox
```

## Step 2: Database Migration

Run the migration to create the payments table:

```bash
node run-payments-table-migration.js
```

You should see:
```
✅ Payments table migration completed successfully!
```

## Step 3: Test the Integration

### Create a Paid Book

1. Go to Admin Dashboard: `/admin`
2. Click "Upload Book"
3. Fill in book details
4. **Important:** Uncheck "Free Book" and set a price (e.g., 10000 UGX)
5. Upload cover and PDF
6. Click "Upload Book"

### Test Payment Flow

1. **View the book** - Go to the book detail page
2. **See the price badge** - Should show "UGX 10,000" on the card
3. **Click "Purchase"** - Opens payment modal
4. **Review details** - Shows book info and price
5. **Click "Pay"** - Redirects to PesaPal sandbox
6. **Complete payment** - Use PesaPal test credentials
7. **Verify callback** - Should redirect back and show success
8. **Access book** - "Start Reading" button should now work

## Step 4: Verify Payment in Database

Check if payment was recorded:

```javascript
// In browser console on book detail page
const userId = 'your-user-id';
const bookId = 'your-book-id';

const result = await paymentsService.hasUserPaidForBook(userId, bookId);
console.log('Has paid:', result.hasPaid);
```

## Features Implemented

### ✅ Payment Modal
- Shows book details and price
- Secure payment via PesaPal
- Error handling

### ✅ Payment Processing
- Creates order with PesaPal
- Saves payment record to database
- Redirects to PesaPal payment page

### ✅ Payment Verification
- Callback page verifies payment status
- Updates database with payment result
- Redirects to book on success

### ✅ Access Control
- Free books: Immediate access
- Paid books: Requires payment
- Checks payment status before allowing access
- Shows appropriate buttons based on payment status

### ✅ UI Updates
- Price badge on book cards
- "FREE" badge for free books
- Purchase button for unpaid books
- "Start Reading" for paid/free books
- Download only available after payment

## Payment Statuses

- **Pending** - Payment initiated, waiting for completion
- **Completed** - Payment successful, user has access
- **Failed** - Payment failed, user can retry
- **Cancelled** - Payment cancelled by user

## Testing in Sandbox

PesaPal sandbox allows you to test without real money:

1. Use sandbox credentials (already in `.env`)
2. PesaPal will provide test payment methods
3. Complete test transactions
4. Verify the flow works correctly

## Going Live

When ready for production:

1. Get production credentials from PesaPal
2. Update `.env`:
   ```env
   VITE_PESAPAL_CONSUMER_KEY=your_live_key
   VITE_PESAPAL_CONSUMER_SECRET=your_live_secret
   VITE_PESAPAL_ENVIRONMENT=live
   ```
3. Test with small amounts first
4. Monitor payments in PesaPal dashboard

## Troubleshooting

### "Payment initiation failed"
- Check PesaPal credentials in `.env`
- Verify internet connection
- Check browser console for errors

### "Payment record not found"
- Ensure database migration ran successfully
- Check if payment was saved to database
- Verify order ID matches

### Callback not working
- Check callback URL is accessible
- Verify route is registered in `App.jsx`
- Check for CORS issues

## Support

For detailed documentation, see `PESAPAL_INTEGRATION.md`

For PesaPal API docs: https://developer.pesapal.com/official-extensions/documentation
