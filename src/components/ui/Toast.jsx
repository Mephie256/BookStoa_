import React from 'react';

const SuccessIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25"
      stroke="#22C55E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6 6 12"
      stroke="#ef4444"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6 12 12"
      stroke="#ef4444"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="9" r="7.5" stroke="#ef4444" strokeWidth="1.5" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="7.5" stroke="#3b82f6" strokeWidth="1.5" />
    <path
      d="M9 8v5"
      stroke="#3b82f6"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M9 5.5h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const WarningIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 2.25 16.5 15.75H1.5L9 2.25Z"
      stroke="#f59e0b"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 6.5v4.5"
      stroke="#f59e0b"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M9 13.25h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      y="12.532"
      width="17.498"
      height="2.1"
      rx="1.05"
      transform="rotate(-45.74 0 12.532)"
      fill="currentColor"
      fillOpacity=".7"
    />
    <rect
      x="12.531"
      y="13.914"
      width="17.498"
      height="2.1"
      rx="1.05"
      transform="rotate(-135.74 12.531 13.914)"
      fill="currentColor"
      fillOpacity=".7"
    />
  </svg>
);

const getIcon = (type) => {
  if (type === 'error') return <ErrorIcon />;
  if (type === 'warning') return <WarningIcon />;
  if (type === 'info') return <InfoIcon />;
  return <SuccessIcon />;
};

const Toast = ({ title, message, type = 'success', onClose }) => {
  return (
    <div className="bg-white inline-flex space-x-3 p-3 text-sm rounded border border-gray-200 shadow-lg">
      {getIcon(type)}
      <div className="min-w-0">
        <h3 className="text-slate-700 font-medium truncate">{title}</h3>
        {message ? <p className="text-slate-500 break-words">{message}</p> : null}
      </div>
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="cursor-pointer mb-auto text-slate-400 hover:text-slate-600 active:scale-95 transition"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;
