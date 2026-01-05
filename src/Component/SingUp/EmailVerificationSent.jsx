import { Link } from "react-router-dom";

const EmailVerificationSent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-red-600 font-bold text-2xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Verification Email Sent
            </h1>
          </div>

          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Check Your Email
            </h2>

            <div className="space-y-4 text-gray-600 mb-6">
              <p>We've sent a verification link to your email address.</p>
              <p>
                Please check your email and click the link to activate your
                account.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-left">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  📌 Important:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Don't forget to check your spam folder</li>
                  <li>• The link is valid for 24 hours</li>
                  <li>• You can log in after verification</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Go to Login Page
              </Link>

              <Link
                to="/"
                className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Return to Home Page
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  onClick={() => alert("This feature will be added soon!")}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSent;
