import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = false,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsVisible(false), 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      case 'confirm':
        return <AlertTriangle className="w-8 h-8 text-blue-400" />;
      default:
        return <Info className="w-8 h-8 text-blue-400" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600/20';
      case 'error':
        return 'bg-red-600/20';
      case 'warning':
        return 'bg-yellow-600/20';
      case 'confirm':
        return 'bg-blue-600/20';
      default:
        return 'bg-blue-600/20';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-green-600 hover:bg-green-700';
    }
  };

  if (!isVisible && !isOpen) return null;
// Modals Ui
  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        {/* Modal Card */}
        <div className={`relative bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 flex items-center justify-center w-8 h-8 bg-gray-700/50 hover:bg-red-600 text-gray-300 hover:text-white border-2 border-gray-600/50 hover:border-red-600 rounded-lg transition-all duration-300 font-light text-xl"
          >
            ×
          </button>

          {/* Header with Animated Icon */}
          <div className="px-6 pt-8 pb-4">
            <div className={`flex mx-auto w-16 h-16 items-center justify-center rounded-full mb-4 animate-pulse-scale ${getIconBg()}`}>
              {getIcon()}
            </div>
            
            {/* Title */}
            {title && (
              <h3 className="text-xl font-semibold text-white text-center mb-2">
                {title}
              </h3>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            {children ? (
              <div className="text-gray-300 text-sm leading-relaxed">
                {children}
              </div>
            ) : (
              <p className="text-gray-300 text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={handleConfirm}
              className={`w-full inline-flex items-center justify-center px-6 py-3 ${getButtonColor()} text-white text-base font-medium rounded-lg transition-all duration-200 shadow-lg`}
            >
              {confirmText}
            </button>
            
            {showCancel && (
              <button
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-base font-medium rounded-lg border border-gray-600/50 transition-all duration-200"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Modal;
