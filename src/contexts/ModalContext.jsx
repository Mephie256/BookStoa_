import { createContext, useContext, useState } from 'react';
import Modal from '../components/ui/Modal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
    children: null
  });

  const showModal = (options) => {
    setModal({
      isOpen: true,
      title: options.title || 'Notification',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      children: options.children || null
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showAlert = (message, title = 'Alert', type = 'info') => {
    return new Promise((resolve) => {
      showModal({
        title,
        message,
        type,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          hideModal();
          resolve(true);
        }
      });
    });
  };

  const showConfirm = (message, title = 'Confirm', options = {}) => {
    return new Promise((resolve) => {
      showModal({
        title,
        message,
        type: 'confirm',
        confirmText: options.confirmText || 'Yes',
        cancelText: options.cancelText || 'No',
        showCancel: true,
        onConfirm: () => {
          hideModal();
          resolve(true);
        },
        onCancel: () => {
          hideModal();
          resolve(false);
        }
      });
    });
  };

  const showSuccess = (message, title = 'Success') => {
    return showAlert(message, title, 'success');
  };

  const showError = (message, title = 'Error') => {
    return showAlert(message, title, 'error');
  };

  const showWarning = (message, title = 'Warning') => {
    return showAlert(message, title, 'warning');
  };

  const value = {
    showModal,
    hideModal,
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      >
        {modal.children}
      </Modal>
    </ModalContext.Provider>
  );
};
