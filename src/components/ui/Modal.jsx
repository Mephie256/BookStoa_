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
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'confirm':
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/10',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'confirm':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-500/10',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  if (!isVisible && !isOpen) return null;

  const colors = getColors();

  return (
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

      {/* Modal */}
      <div className={`relative bg-gray-800/95 backdrop-blur-xl rounded-md border ${colors.border} shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b border-gray-700/50 ${colors.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children ? (
            children
          ) : (
            <p className="text-gray-300 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 ${colors.button} text-white rounded-md transition-colors font-medium shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
