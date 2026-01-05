import React, { useState, useEffect } from 'react';

interface DeepModePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeepModePasswordModal: React.FC<DeepModePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Get password from environment variable
    const configuredPassword = import.meta.env.VITE_DEEP_MODE_PASSWORD;

    // Check if password is configured
    if (!configuredPassword || configuredPassword === 'your_password_here') {
      setError('Deep Mode password not configured. Please set VITE_DEEP_MODE_PASSWORD in your .env file.');
      setIsLoading(false);
      return;
    }

    // Validate password
    if (password === configuredPassword) {
      // Success
      setIsLoading(false);
      onSuccess();
      handleClose();
    } else {
      // Incorrect password
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">🚀 Deep Mode</h2>
              <p className="text-sm text-gray-600">Password Required</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800">High API Usage Mode</p>
              <p className="text-xs text-yellow-700 mt-1">
                Deep Mode uses 8-12 API calls per property. This is password-protected to prevent accidental high usage.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deepModePassword" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Deep Mode Password
            </label>
            <input
              type="password"
              id="deepModePassword"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 bg-red-50 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="Enter password"
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <div className="mt-2 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* API Usage Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Deep Mode Features:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ Full property data validation</li>
              <li>✓ Enhanced comparable properties analysis</li>
              <li>✓ Advanced market insights</li>
              <li>✓ Maximum accuracy calculations</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Unlock Deep Mode'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Don't have the password? Check your <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file or contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default DeepModePasswordModal;
