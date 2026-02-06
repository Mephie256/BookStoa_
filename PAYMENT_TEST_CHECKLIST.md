# Payment Integration Test Checklist

## ✅ Implementation Status

### Database
- [x] Payments table created
- [x] Migration script working
- [x] Payment fields added to books (is_free, price)

### Services
- [x] PesaPal service (API integration)
- [x] Payments service (database operations)
- [x] Fixed to use Neon SQL directly (client-side compatible)

### Components
- [x] PaymentModal component
- [x] PaymentCallback page
- [x] BookDetail integration
- [x] BookCard price badges

### Routes
- [x] Payment callback route added to App.jsx

### Environment
- [x] PesaPal credentials in .env
- [x] Sandbox mode configured

## 🧪 Testing Steps

### 1. Start the App
```bash
npm run dev
```

### 2. Create a Paid Book
1. Go to `/admin`
2. Click "Upload Book"
3. Fill in book details
4. **Uncheck "Free Book"**
5. **Set price: 10000** (UGX)
6. Upload cover and PDF
7. Click "Upload Book"

### 3. View the Book
1. Go to home page
2. Find your paid book
3. **Check:** Should see "UGX 10,000" badge (green background)
4. **Check:** Button should say "View" not "Read"

### 4. Test Payment Flow (Not Logged In)
1. Click on the paid book
2. Click "Purchase" button
3. **Check:** Should show auth modal
4. Sign up or log in

### 5. Test Payment Flow (Logged In)
1. Click "Purchase for UGX 10,000" button
2. **Check:** Payment modal opens
3. **Check:** Shows book details and price
4. **Check:** Shows "Secure payment via PesaPal" message
5. Click "Pay UGX 10,000"
6. **Check:** Redirects to PesaPal sandbox

### 6. Complete Payment on PesaPal
1. On PesaPal page, use test credentials
2. Complete the payment
3. **Check:** Redirects back to `/payment/callback`
4. **Check:** Shows "Processing Payment" with spinner
5. **Check:** Changes to "Payment Successful!"
6. **Check:** Auto-redirects to book page after 3 seconds

### 7. Verify Access
1. On book detail page
2. **Check:** Button now says "Start Reading" (not "Purchase")
3. Click "Start Reading"
4. **Check:** PDF viewer opens
5. **Check:** Download button is now available

### 8. Test Free Books
1. Create a free book (keep "Free Book" checked)
2. View the book
3. **Check:** Shows "FREE" badge (gray background, green text)
4. **Check:** Button says "Read" not "View"
5. **Check:** No payment required
6. Click "Read"
7. **Check:** PDF opens immediately

## 🔍 What to Check in Browser Console

### On Payment Initiation
```
💳 Initiating payment for book: [Book Title]
🔐 Authenticating with PesaPal...
✅ PesaPal authentication successful
💳 Submitting order to PesaPal: {...}
✅ Order submitted successfully: {...}
✅ Payment initiated, redirecting to PesaPal...
```

### On Payment Callback
```
🔍 Verifying payment: [orderTrackingId]
✅ Payment verification successful
✅ Payment status updated
```

### On Book Detail Load (Paid Book)
```
📚 Fetching book with ID: [bookId]
✅ Book fetched successfully: {...}
🔍 Checking if user has paid for book...
✅ User has paid: true/false
```

## ⚠️ Common Issues & Solutions

### Issue: "Payment initiation failed"
**Solution:** Check PesaPal credentials in `.env`

### Issue: "Payment record not found"
**Solution:** Ensure migration ran successfully:
```bash
node run-payments-table-migration.js
```

### Issue: Book shows as free when it should be paid
**Solution:** Check database:
```sql
SELECT id, title, is_free, price FROM books WHERE id = 'book-id';
```

### Issue: Payment completed but still asks for payment
**Solution:** Check payments table:
```sql
SELECT * FROM payments WHERE user_id = 'user-id' AND book_id = 'book-id';
```

### Issue: Callback page shows error
**Solution:** 
1. Check browser console for errors
2. Verify PesaPal returned orderTrackingId
3. Check network tab for API calls

## 📊 Database Verification

### Check if payment was recorded:
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
```

### Check user's payments:
```sql
SELECT * FROM payments WHERE user_id = 'your-user-id';
```

### Check book's payments:
```sql
SELECT * FROM payments WHERE book_id = 'your-book-id';
```

### Check completed payments:
```sql
SELECT * FROM payments WHERE status = 'completed';
```

## ✅ Success Criteria

- [ ] Free books work without payment
- [ ] Paid books show correct price badge
- [ ] Payment modal opens for paid books
- [ ] PesaPal redirect works
- [ ] Payment callback verifies status
- [ ] Database records payment
- [ ] User gets access after payment
- [ ] Download button appears after payment
- [ ] No errors in console
- [ ] UI matches app design (rounded-md, green colors)

## 🚀 Ready for Production

Before going live:
1. Get production PesaPal credentials
2. Update `.env` with live credentials
3. Change environment to `live`
4. Test with small amounts
5. Monitor PesaPal dashboard
6. Set up proper error logging
7. Add payment analytics

## 📝 Notes

- Sandbox mode uses test credentials
- No real money is charged in sandbox
- Payment status updates may take a few seconds
- Always verify payment status on callback
- Keep audit trail in database
