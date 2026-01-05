import { useState } from "react";
import { Link } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
    area: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    wantToDonate: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Bangladesh Geographical Data
  const bangladeshData = {
    divisions: [
      { id: "dhaka", name: "ঢাকা বিভাগ" },
      { id: "chattogram", name: "চট্টগ্রাম বিভাগ" },
      { id: "rajshahi", name: "রাজশাহী বিভাগ" },
      { id: "khulna", name: "খুলনা বিভাগ" },
      { id: "barishal", name: "বরিশাল বিভাগ" },
      { id: "sylhet", name: "সিলেট বিভাগ" },
      { id: "rangpur", name: "রংপুর বিভাগ" },
      { id: "mymensingh", name: "ময়মনসিংহ বিভাগ" },
    ],
    districts: {
      dhaka: [
        { id: "dhaka", name: "ঢাকা" },
        { id: "gazipur", name: "গাজীপুর" },
        { id: "narayanganj", name: "নারায়ণগঞ্জ" },
        { id: "narsingdi", name: "নরসিংদী" },
        { id: "manikganj", name: "মানিকগঞ্জ" },
        { id: "munshiganj", name: "মুন্সীগঞ্জ" },
        { id: "faridpur", name: "ফরিদপুর" },
        { id: "gopalganj", name: "গোপালগঞ্জ" },
        { id: "madaripur", name: "মাদারীপুর" },
        { id: "rajbari", name: "রাজবাড়ী" },
        { id: "shariatpur", name: "শরীয়তপুর" },
        { id: "tangail", name: "টাঙ্গাইল" },
        { id: "kishoreganj", name: "কিশোরগঞ্জ" },
      ],
      chattogram: [
        { id: "chattogram", name: "চট্টগ্রাম" },
        { id: "coxsbazar", name: "কক্সবাজার" },
        { id: "rangamati", name: "রাঙ্গামাটি" },
        { id: "bandarban", name: "বান্দরবান" },
        { id: "khagrachhari", name: "খাগড়াছড়ি" },
        { id: "chandpur", name: "চাঁদপুর" },
        { id: "feni", name: "ফেনী" },
        { id: "lakshmipur", name: "লক্ষ্মীপুর" },
        { id: "noakhali", name: "নোয়াখালী" },
        { id: "brahmanbaria", name: "ব্রাহ্মণবাড়িয়া" },
        { id: "comilla", name: "কুমিল্লা" },
      ],
      rajshahi: [
        { id: "rajshahi", name: "রাজশাহী" },
        { id: "bogra", name: "বগুড়া" },
        { id: "joypurhat", name: "জয়পুরহাট" },
        { id: "naogaon", name: "নওগাঁ" },
        { id: "natore", name: "নাটোর" },
        { id: "chapainawabganj", name: "চাঁপাইনবাবগঞ্জ" },
        { id: "pabna", name: "পাবনা" },
        { id: "sirajganj", name: "সিরাজগঞ্জ" },
      ],
      khulna: [
        { id: "khulna", name: "খুলনা" },
        { id: "bagerhat", name: "বাগেরহাট" },
        { id: "chuadanga", name: "চুয়াডাঙ্গা" },
        { id: "jessore", name: "যশোর" },
        { id: "jhenaidah", name: "ঝিনাইদহ" },
        { id: "kushtia", name: "কুষ্টিয়া" },
        { id: "magura", name: "মাগুরা" },
        { id: "meherpur", name: "মেহেরপুর" },
        { id: "narail", name: "নড়াইল" },
        { id: "satkhira", name: "সাতক্ষীরা" },
      ],
      barishal: [
        { id: "barishal", name: "বরিশাল" },
        { id: "bhola", name: "ভোলা" },
        { id: "jhalokati", name: "ঝালকাঠি" },
        { id: "patuakhali", name: "পটুয়াখালী" },
        { id: "pirojpur", name: "পিরোজপুর" },
        { id: "barguna", name: "বরগুনা" },
      ],
      sylhet: [
        { id: "sylhet", name: "সিলেট" },
        { id: "habiganj", name: "হবিগঞ্জ" },
        { id: "moulvibazar", name: "মৌলভীবাজার" },
        { id: "sunamganj", name: "সুনামগঞ্জ" },
      ],
      rangpur: [
        { id: "rangpur", name: "রংপুর" },
        { id: "dinajpur", name: "দিনাজপুর" },
        { id: "gaibandha", name: "গাইবান্ধা" },
        { id: "kurigram", name: "কুড়িগ্রাম" },
        { id: "lalmonirhat", name: "লালমনিরহাট" },
        { id: "nilphamari", name: "নীলফামারী" },
        { id: "panchagarh", name: "পঞ্চগড়" },
        { id: "thakurgaon", name: "ঠাকুরগাঁও" },
      ],
      mymensingh: [
        { id: "mymensingh", name: "ময়মনসিংহ" },
        { id: "jamalpur", name: "জামালপুর" },
        { id: "netrokona", name: "নেত্রকোণা" },
        { id: "sherpur", name: "শেরপুর" },
      ],
    },
    upazilas: {
      // Dhaka Division Upazilas
      dhaka: [
        { id: "dhanmondi", name: "ধানমন্ডি" },
        { id: "gulshan", name: "গুলশান" },
        { id: "banani", name: "বনানী" },
        { id: "mirpur", name: "মিরপুর" },
        { id: "uttara", name: "উত্তরা" },
        { id: "motijheel", name: "মতিঝিল" },
        { id: "ramna", name: "রমনা" },
        { id: "lalbagh", name: "লালবাগ" },
      ],
      gazipur: [
        { id: "gazipur_sadar", name: "গাজীপুর সদর" },
        { id: "kaliakair", name: "কালিয়াকৈর" },
        { id: "kapasia", name: "কাপাসিয়া" },
        { id: "sreepur", name: "শ্রীপুর" },
      ],
      // Add more upazilas for other districts as needed
      chattogram: [
        { id: "chattogram_sadar", name: "চট্টগ্রাম সদর" },
        { id: "patenga", name: "পতেঙ্গা" },
        { id: "kotwali", name: "কোতোয়ালী" },
        { id: "panchlaish", name: "পাঁচলাইশ" },
      ],
      sylhet: [
        { id: "sylhet_sadar", name: "সিলেট সদর" },
        { id: "south_surma", name: "দক্ষিণ সুরমা" },
        { id: "biswanath", name: "বিশ্বনাথ" },
      ],
    },
    areas: {
      dhanmondi: [
        { id: "dhanmondi_1", name: "ধানমন্ডি ১" },
        { id: "dhanmondi_2", name: "ধানমন্ডি ২" },
        { id: "dhanmondi_3", name: "ধানমন্ডি ৩" },
        { id: "dhanmondi_4", name: "ধানমন্ডি ৪" },
      ],
      gulshan: [
        { id: "gulshan_1", name: "গুলশান ১" },
        { id: "gulshan_2", name: "গুলশান ২" },
        { id: "baridhara", name: "বারিধারা" },
      ],
      uttara: [
        { id: "uttara_1", name: "উত্তরা ১" },
        { id: "uttara_2", name: "উত্তরা ২" },
        { id: "uttara_3", name: "উত্তরা ৩" },
      ],
      chattogram_sadar: [
        { id: "agrabad", name: "আগ্রাবাদ" },
        { id: "chawkbazar", name: "চকবাজার" },
        { id: "kotwali", name: "কোতোয়ালী" },
      ],
    },
  };

  const bloodGroups = [
    { value: "", label: "রক্তের গ্রুপ নির্বাচন করুন" },
    { value: "A+", label: "A পজিটিভ (A+)" },
    { value: "A-", label: "A নেগেটিভ (A-)" },
    { value: "B+", label: "B পজিটিভ (B+)" },
    { value: "B-", label: "B নেগেটিভ (B-)" },
    { value: "O+", label: "O পজিটিভ (O+)" },
    { value: "O-", label: "O নেগেটিভ (O-)" },
    { value: "AB+", label: "AB পজিটিভ (AB+)" },
    { value: "AB-", label: "AB নেগেটিভ (AB-)" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Reset dependent fields when parent field changes
      if (name === "division") {
        newData.district = "";
        newData.upazila = "";
        newData.area = "";
      }
      if (name === "district") {
        newData.upazila = "";
        newData.area = "";
      }
      if (name === "upazila") {
        newData.area = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Signup attempt:", formData);
      // Add your registration logic here
    }, 2000);
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Get filtered data based on selections
  const getDistricts = () => {
    return formData.division ? bangladeshData.districts[formData.division] : [];
  };

  const getUpazilas = () => {
    return formData.district
      ? bangladeshData.upazilas[formData.district] || []
      : [];
  };

  const getAreas = () => {
    return formData.upazila ? bangladeshData.areas[formData.upazila] || [] : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 py-8">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-red-600 to-red-700"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-red-400 rounded-full opacity-20 animate-ping"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Signup Card */}
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
              নতুন অ্যাকাউন্ট তৈরি করুন
            </h1>
            <p className="text-red-100">
              রক্তদাতা হিসেবে নিবন্ধন করুন এবং জীবন বাঁচান
            </p>

            {/* Progress Steps */}
            <div className="mt-6 flex justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNumber === step
                        ? "bg-white text-red-600 border-2 border-white"
                        : stepNumber < step
                        ? "bg-green-500 text-white"
                        : "bg-red-200 text-red-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        stepNumber < step ? "bg-green-500" : "bg-red-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    ব্যক্তিগত তথ্য
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        পূর্ণ নাম *
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="আপনার পূর্ণ নাম লিখুন"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        ইমেইল অ্যাড্রেস *
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="ইমেইল লিখুন"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        মোবাইল নম্বর *
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="০১XXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      পরবর্তী
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
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Blood & Location Information */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    রক্ত ও অবস্থান
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Blood Group */}
                    <div>
                      <label
                        htmlFor="bloodGroup"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        রক্তের গ্রুপ *
                      </label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        required
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                      >
                        {bloodGroups.map((group) => (
                          <option key={group.value} value={group.value}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Division */}
                    <div>
                      <label
                        htmlFor="division"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        বিভাগ *
                      </label>
                      <select
                        id="division"
                        name="division"
                        required
                        value={formData.division}
                        onChange={handleChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                      >
                        <option value="">বিভাগ নির্বাচন করুন</option>
                        {bangladeshData.divisions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label
                        htmlFor="district"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        জেলা *
                      </label>
                      <select
                        id="district"
                        name="district"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!formData.division}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">জেলা নির্বাচন করুন</option>
                        {getDistricts().map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Upazila/Thana */}
                    <div>
                      <label
                        htmlFor="upazila"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        উপজেলা/থানা *
                      </label>
                      <select
                        id="upazila"
                        name="upazila"
                        required
                        value={formData.upazila}
                        onChange={handleChange}
                        disabled={!formData.district}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">উপজেলা/থানা নির্বাচন করুন</option>
                        {getUpazilas().map((upazila) => (
                          <option key={upazila.id} value={upazila.id}>
                            {upazila.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Area */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="area"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        এলাকা
                      </label>
                      <select
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        disabled={!formData.upazila}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">এলাকা নির্বাচন করুন</option>
                        {getAreas().map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
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
                          আমি রক্তদানে আগ্রহী
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          চেক করলে আপনি রক্তদাতা হিসেবে তালিকাভুক্ত হবেন এবং
                          জরুরী প্রয়োজনে আপনার সাথে যোগাযোগ করা হতে পারে
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-400 transform hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      পূর্ববর্তী
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      পরবর্তী
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
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Account Security */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    অ্যাকাউন্ট সুরক্ষা
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        পাসওয়ার্ড *
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="শক্তিশালী পাসওয়ার্ড দিন"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        পাসওয়ার্ড নিশ্চিত করুন *
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
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="পাসওয়ার্ড আবার লিখুন"
                        />
                      </div>
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
                          আমি শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছি *
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          আমি স্বীকার করছি যে আমার তথ্য সঠিক এবং আমি রক্তদানের
                          শর্তাবলী বুঝতে পেরেছি।
                          <a
                            href="#"
                            className="text-red-600 hover:text-red-500 ml-1"
                          >
                            শর্তাবলী পড়ুন
                          </a>
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-400 transform hover:scale-105 transition-all duration-300 flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      পূর্ববর্তী
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.agreeToTerms}
                      className={`px-8 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 flex items-center ${
                        isLoading || !formData.agreeToTerms
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
                          নিবন্ধন করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          অ্যাকাউন্ট তৈরি করুন
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                <Link
                  to="/login"
                  className="font-medium text-red-600 hover:text-red-500 transition-colors"
                >
                  লগইন করুন
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-red-50 border-t border-red-100 p-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                রক্তদাতা হিসেবে নিবন্ধনের সুবিধা
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-red-700">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">❤️</span>
                  </div>
                  <span>জীবন বাঁচান</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🛡️</span>
                  </div>
                  <span>নিরাপদ প্রক্রিয়া</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🎁</span>
                  </div>
                  <span>ফ্রি হেলথ চেকআপ</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🏆</span>
                  </div>
                  <span>সনদ ও পুরস্কার</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            আপনার তথ্য সম্পূর্ণ গোপন রাখা হবে। আমাদের{" "}
            <a
              href="#"
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              গোপনীয়তা নীতি
            </a>{" "}
            পড়ুন।
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
