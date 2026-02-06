import { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createBookPayment } from '../services/pesapalService';

const PaymentModal = ({ isOpen, onClose, book, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const price = book?.price || 0;
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💳 Initiating payment for book:', book.title);

      // Create payment with PesaPal
      const result = await createBookPayment(book, user);

      if (!result.success) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      console.log('✅ Payment initiated, redirecting to PesaPal...');

      // Redirect to PesaPal payment page
      window.location.href = result.redirectUrl;
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/30 rounded-md w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
          <h2 className="text-xl font-semibold text-white">Complete Purchase</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Book Info */}
          <div className="flex gap-4">
            <img
              src={book?.cover_file_url || book?.coverUrl || 'https://via.placeholder.com/80x120'}
              alt={book?.title}
              className="w-20 h-28 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">{book?.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{book?.author}</p>
              <div className="text-green-400 font-semibold text-lg">
                {formatPrice(price)}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-800/50 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-300">
              <CreditCard className="w-4 h-4 text-green-400" />
              <span className="text-sm">Secure payment via PesaPal</span>
            </div>
            <p className="text-xs text-gray-400">
              You will be redirected to PesaPal to complete your payment securely. 
              Accepted payment methods: Mobile Money, Credit/Debit Cards, and Bank Transfer.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Payment Failed</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-600/50 text-gray-300 rounded-md font-medium hover:bg-gray-700/30 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatPrice(price)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
