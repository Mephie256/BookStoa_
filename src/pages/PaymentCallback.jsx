import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { verifyPayment } from '../services/pesapalService';
import { Aurora } from '../components/ui/aurora';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [bookId, setBookId] = useState(null);

  useEffect(() => {
    const verifyPaymentRequest = async () => {
      try {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const merchantReference = searchParams.get('OrderMerchantReference');

        if (!orderTrackingId) {
          setStatus('failed');
          setMessage('Invalid payment reference');
          return;
        }

        console.log('🔍 Verifying payment:', orderTrackingId);

        const verification = await verifyPayment(orderTrackingId, null, merchantReference);

        if (!verification.success) {
          throw new Error(verification.error || 'Payment verification failed');
        }

        const updatedPayment = verification.payment;
        setBookId(updatedPayment.book_id);

        const paymentStatus = verification.paymentStatus;

        if (paymentStatus === 'completed') {
          setStatus('success');
          setMessage('Payment successful! You can now access this book.');
          
          // Redirect to book detail after 3 seconds
          setTimeout(() => {
            navigate(`/book/${updatedPayment.book_id}`);
          }, 3000);
        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          setStatus('failed');
          setMessage(`Payment ${paymentStatus}. Please try again.`);
        } else {
          setStatus('checking');
          setMessage('Payment is being processed. Please wait...');
          
          // Check again after 5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        setStatus('failed');
        setMessage(error.message || 'Payment verification failed');
      }
    };

    verifyPaymentRequest();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full opacity-50 z-0">
        <Aurora
          colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
          blend={0.4}
          amplitude={0.6}
          speed={0.12}
          className="w-full h-full"
        />
      </div>
      <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>

      <main className="min-h-screen flex items-center justify-center p-4 relative z-20 md:ml-60 lg:ml-80">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 rounded-md p-8 max-w-md w-full text-center shadow-2xl">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'checking' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === 'failed' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <h1 className="text-2xl font-bold text-white mb-3">
            {status === 'checking' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </h1>
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && bookId && (
              <Link
                to={`/book/${bookId}`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all"
              >
                Go to Book
              </Link>
            )}
            {status === 'failed' && bookId && (
              <Link
                to={`/book/${bookId}`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all"
              >
                Try Again
              </Link>
            )}
            <Link
              to="/"
              className="block w-full px-6 py-3 border border-gray-600/50 text-gray-300 rounded-md font-medium hover:bg-gray-700/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCallback;
