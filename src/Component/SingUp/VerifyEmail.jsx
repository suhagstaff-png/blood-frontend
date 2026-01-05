import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setMessage(location.state.message);
    } else {
      navigate("/register");
    }
  }, [location, navigate]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-verification",
        { email },
        {
          timeout: 30000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Resend error:", error);
      setError(
        error.response?.data?.message ||
          "Could not send verification email. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-2xl">♥</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Verification
            </h1>
            <p className="text-red-100">Verify your email address</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center">
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
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Verification Email Sent
              </h2>

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <p className="text-gray-600 mb-2">
                We've sent a verification link to
              </p>
              <p className="text-gray-800 font-semibold mb-6">{email}</p>

              <p className="text-gray-600 text-sm mb-6">
                Please check your email inbox and click on the verification
                link. The link will be valid for 24 hours.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isLoading ? "Sending..." : "Resend Verification Email"}
                </button>

                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 text-center"
                >
                  Go to Login Page
                </Link>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Didn't receive the email?</strong> Check your spam
                  folder or click the button above to resend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
