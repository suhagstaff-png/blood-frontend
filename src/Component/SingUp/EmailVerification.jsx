import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const EmailVerification = () => {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`
        );

        setStatus("success");
        setMessage(
          "Your email has been successfully verified! You can now log in."
        );

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. Please check if the link is valid or has expired."
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-red-600 font-bold text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {status === "verifying"
                ? "Verifying..."
                : status === "success"
                ? "Verification Successful!"
                : "Verification Failed!"}
            </h1>
          </div>

          <div className="p-8 text-center">
            {status === "verifying" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Your email is being verified...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-green-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">
                  You will be automatically redirected to the login page...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <p className="text-red-600 mb-4">{message}</p>
                <div className="space-y-3">
                  <Link
                    to="/resend-verification"
                    className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Send New Verification Link
                  </Link>
                  <br />
                  <Link
                    to="/login"
                    className="inline-block text-red-600 hover:text-red-700 transition-colors"
                  >
                    Return to Login Page
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
