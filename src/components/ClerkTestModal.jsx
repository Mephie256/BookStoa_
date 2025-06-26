import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { X } from 'lucide-react';

const ClerkTestModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Clerk Test - {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Switch */}
        <div className="flex mb-4">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-l-lg ${
              mode === 'login' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-r-lg ${
              mode === 'register' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Clerk Components */}
        {mode === 'login' ? (
          <SignIn 
            routing="hash"
            afterSignInUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: "bg-green-600 hover:bg-green-700",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                formFieldInput: "bg-gray-700 border-gray-600 text-white",
                footerActionLink: "text-green-400 hover:text-green-300",
                formFieldLabel: "text-gray-300",
                dividerLine: "bg-gray-600",
                dividerText: "text-gray-400"
              }
            }}
          />
        ) : (
          <SignUp 
            routing="hash"
            afterSignUpUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: "bg-green-600 hover:bg-green-700",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                formFieldInput: "bg-gray-700 border-gray-600 text-white",
                footerActionLink: "text-green-400 hover:text-green-300",
                formFieldLabel: "text-gray-300",
                dividerLine: "bg-gray-600",
                dividerText: "text-gray-400"
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClerkTestModal;
