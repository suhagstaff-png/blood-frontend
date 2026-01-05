import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignupPage1 = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    agreeToTerms: false,
    wantToDonate: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const bloodGroups = [
    { value: "", label: "Select Blood Group" },
    { value: "A+", label: "A Positive (A+)" },
    { value: "A-", label: "A Negative (A-)" },
    { value: "B+", label: "B Positive (B+)" },
    { value: "B-", label: "B Negative (B-)" },
    { value: "O+", label: "O Positive (O+)" },
    { value: "O-", label: "O Negative (O-)" },
    { value: "AB+", label: "AB Positive (AB+)" },
    { value: "AB-", label: "AB Negative (AB-)" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Mobile number is required";
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid mobile number (01XXXXXXXXX)";
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "Please select blood group";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Save to localStorage for step 2
      localStorage.setItem("signupStep1", JSON.stringify(formData));
      navigate("/signup-location");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 py-8">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-red-600 to-red-700"></div>
      <div className="absolute top-20 left-10 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-red-400 rounded-full opacity-20 animate-ping"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-2xl">♥</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Step 1: Personal Information
            </h1>
            <p className="text-red-100">
              Provide your personal information and blood group
            </p>

            {/* Progress Steps */}
            <div className="mt-6 flex justify-center space-x-4">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNumber === 1
                        ? "bg-white text-red-600 border-2 border-white"
                        : "bg-red-200 text-red-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 2 && (
                    <div className="w-12 h-1 mx-2 bg-red-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="01XXXXXXXXX"
                        pattern="01[3-9]\d{8}"
                        maxLength="11"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="bloodGroup"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Blood Group *
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      required
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={`block w-full py-3 px-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                        errors.bloodGroup ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {bloodGroups.map((group) => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>

                {/* Donation Willingness */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center">
                    <input
                      id="wantToDonate"
                      name="wantToDonate"
                      type="checkbox"
                      checked={formData.wantToDonate}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="wantToDonate"
                      className="ml-3 block text-sm text-gray-700"
                    >
                      <span className="font-semibold">
                        I am willing to donate blood
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        If checked, you will be listed as a blood donor and may
                        be contacted for emergency needs
                      </p>
                    </label>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="ml-3 block text-sm text-gray-700"
                    >
                      <span className="font-semibold">
                        I accept the terms and privacy policy *
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        I acknowledge that my information is correct and I
                        understand the terms of blood donation.
                        <Link
                          to="/terms"
                          className="text-red-600 hover:text-red-500 ml-1"
                        >
                          Read terms
                        </Link>
                      </p>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs mt-1 ml-7">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 flex items-center ${
                      isLoading
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Next Step
                        <svg
                          className="w-5 h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-red-600 hover:text-red-500 transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-red-50 border-t border-red-100 p-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                Benefits of Registering as a Blood Donor
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-red-700">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">❤️</span>
                  </div>
                  <span>Save Lives</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🛡️</span>
                  </div>
                  <span>Safe Process</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🎁</span>
                  </div>
                  <span>Free Health Checkup</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🏆</span>
                  </div>
                  <span>Certificate & Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Your information will be kept completely confidential. Read our{" "}
            <Link
              to="/privacy"
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage1;
