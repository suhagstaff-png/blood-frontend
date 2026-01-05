import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { Link, useNavigate } from "react-router-dom";

// Make sure to bind modal to your appElement for accessibility
Modal.setAppElement("#root");

const SignupPage2 = () => {
  const [formData, setFormData] = useState({
    division: "",
    district: "",
    upazila: "",
    area: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success", // 'success' or 'error'
  });
  const navigate = useNavigate();

  // Bangladesh Geographical Data
  const bangladeshData = {
    divisions: [
      { id: "dhaka", name: "Dhaka Division" },
      { id: "chattogram", name: "Chattogram Division" },
      { id: "rajshahi", name: "Rajshahi Division" },
      { id: "khulna", name: "Khulna Division" },
      { id: "barishal", name: "Barishal Division" },
      { id: "sylhet", name: "Sylhet Division" },
      { id: "rangpur", name: "Rangpur Division" },
      { id: "mymensingh", name: "Mymensingh Division" },
    ],
    districts: {
      dhaka: [
        { id: "dhaka", name: "Dhaka" },
        { id: "gazipur", name: "Gazipur" },
        { id: "narayanganj", name: "Narayanganj" },
        { id: "narsingdi", name: "Narsingdi" },
        { id: "manikganj", name: "Manikganj" },
        { id: "munshiganj", name: "Munshiganj" },
        { id: "faridpur", name: "Faridpur" },
        { id: "rajbari", name: "Rajbari" },
        { id: "gopalganj", name: "Gopalganj" },
        { id: "madaripur", name: "Madaripur" },
        { id: "shariatpur", name: "Shariatpur" },
        { id: "kishoreganj", name: "Kishoreganj" },
        { id: "tangail", name: "Tangail" },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram" },
        { id: "coxsbazar", name: "Cox's Bazar" },
        { id: "rangamati", name: "Rangamati" },
        { id: "bandarban", name: "Bandarban" },
        { id: "khagrachari", name: "Khagrachari" },
        { id: "noakhali", name: "Noakhali" },
        { id: "feni", name: "Feni" },
        { id: "lakshmipur", name: "Lakshmipur" },
        { id: "chandpur", name: "Chandpur" },
        { id: "brahmanbaria", name: "Brahmanbaria" },
        { id: "comilla", name: "Comilla" },
      ],
      rajshahi: [
        { id: "rajshahi", name: "Rajshahi" },
        { id: "natore", name: "Natore" },
        { id: "chapainawabganj", name: "Chapainawabganj" },
        { id: "naogaon", name: "Naogaon" },
        { id: "pabna", name: "Pabna" },
        { id: "sirajganj", name: "Sirajganj" },
        { id: "bogra", name: "Bogra" },
        { id: "joypurhat", name: "Joypurhat" },
      ],
      khulna: [
        { id: "khulna", name: "Khulna" },
        { id: "bagerhat", name: "Bagerhat" },
        { id: "satkhira", name: "Satkhira" },
        { id: "jessore", name: "Jessore" },
        { id: "jhenaidah", name: "Jhenaidah" },
        { id: "magura", name: "Magura" },
        { id: "narail", name: "Narail" },
        { id: "kushtia", name: "Kushtia" },
        { id: "meherpur", name: "Meherpur" },
        { id: "chuadanga", name: "Chuadanga" },
      ],
      barishal: [
        { id: "barishal", name: "Barishal" },
        { id: "bhola", name: "Bhola" },
        { id: "patuakhali", name: "Patuakhali" },
        { id: "barguna", name: "Barguna" },
        { id: "jhalokati", name: "Jhalokati" },
        { id: "pirojpur", name: "Pirojpur" },
      ],
      sylhet: [
        { id: "sylhet", name: "Sylhet" },
        { id: "moulvibazar", name: "Moulvibazar" },
        { id: "habiganj", name: "Habiganj" },
        { id: "sunamganj", name: "Sunamganj" },
      ],
      rangpur: [
        { id: "rangpur", name: "Rangpur" },
        { id: "dinajpur", name: "Dinajpur" },
        { id: "gaibandha", name: "Gaibandha" },
        { id: "kurigram", name: "Kurigram" },
        { id: "lalmonirhat", name: "Lalmonirhat" },
        { id: "nilphamari", name: "Nilphamari" },
        { id: "panchagarh", name: "Panchagarh" },
        { id: "thakurgaon", name: "Thakurgaon" },
      ],
      mymensingh: [
        { id: "mymensingh", name: "Mymensingh" },
        { id: "jamalpur", name: "Jamalpur" },
        { id: "netrokona", name: "Netrokona" },
        { id: "sherpur", name: "Sherpur" },
      ],
    },
    upazilas: {
      // Dhaka Division
      dhaka: [
        { id: "dhanmondi", name: "Dhanmondi" },
        { id: "gulshan", name: "Gulshan" },
        { id: "banani", name: "Banani" },
        { id: "mirpur", name: "Mirpur" },
        { id: "uttara", name: "Uttara" },
        { id: "motijheel", name: "Motijheel" },
        { id: "ramna", name: "Ramna" },
        { id: "pallabi", name: "Pallabi" },
        { id: "kafrul", name: "Kafrul" },
        { id: "cantonment", name: "Cantonment" },
      ],
      gazipur: [
        { id: "gazipur_sadar", name: "Gazipur Sadar" },
        { id: "kaliakair", name: "Kaliakair" },
        { id: "kapasia", name: "Kapasia" },
        { id: "sreepur", name: "Sreepur" },
      ],
      narayanganj: [
        { id: "narayanganj_sadar", name: "Narayanganj Sadar" },
        { id: "sonargaon", name: "Sonargaon" },
        { id: "bandar", name: "Bandar" },
        { id: "arat", name: "Araihazar" },
        { id: "rupganj", name: "Rupganj" },
      ],
      narsingdi: [
        { id: "narsingdi_sadar", name: "Narsingdi Sadar" },
        { id: "belabo", name: "Belabo" },
        { id: "monohardi", name: "Monohardi" },
        { id: "palash", name: "Palash" },
        { id: "raipura", name: "Raipura" },
        { id: "shibpur", name: "Shibpur" },
      ],
      manikganj: [
        { id: "manikganj_sadar", name: "Manikganj Sadar" },
        { id: "singair", name: "Singair" },
        { id: "saturia", name: "Saturia" },
        { id: "harirampur", name: "Harirampur" },
      ],
      // Chattogram Division
      chattogram: [
        { id: "chattogram_sadar", name: "Chattogram Sadar" },
        { id: "hathazari", name: "Hathazari" },
        { id: "patiya", name: "Patiya" },
        { id: "sitakunda", name: "Sitakunda" },
        { id: "sandwip", name: "Sandwip" },
        { id: "mirsharai", name: "Mirsharai" },
      ],
      coxsbazar: [
        { id: "cox_sadar", name: "Cox's Bazar Sadar" },
        { id: "ukhiya", name: "Ukhiya" },
        { id: "teknaf", name: "Teknaf" },
        { id: "ramu", name: "Ramu" },
      ],
      rangamati: [
        { id: "rangamati_sadar", name: "Rangamati Sadar" },
        { id: "kawkhali", name: "Kawkhali" },
        { id: "kaptai", name: "Kaptai" },
        { id: "baghaichari", name: "Baghaichari" },
      ],
      // Rajshahi Division
      rajshahi: [
        { id: "rajshahi_sadar", name: "Rajshahi Sadar" },
        { id: "paba", name: "Paba" },
        { id: "durgapur", name: "Durgapur" },
        { id: "mohanpur", name: "Mohanpur" },
        { id: "charghat", name: "Charghat" },
      ],
      bogra: [
        { id: "bogra_sadar", name: "Bogra Sadar" },
        { id: "sariakandi", name: "Sariakandi" },
        { id: "shibganj", name: "Shibganj" },
        { id: "dhunat", name: "Dhunat" },
      ],
      // Khulna Division
      khulna: [
        { id: "khulna_sadar", name: "Khulna Sadar" },
        { id: "sonadanga", name: "Sonadanga" },
        { id: "khalishpur", name: "Khalishpur" },
        { id: "daulatpur", name: "Daulatpur" },
      ],
      jessore: [
        { id: "jessore_sadar", name: "Jessore Sadar" },
        { id: "chougachha", name: "Chougachha" },
        { id: "abhaynagar", name: "Abhaynagar" },
        { id: "bagherpara", name: "Bagherpara" },
      ],
      // Barishal Division
      barishal: [
        { id: "barishal_sadar", name: "Barishal Sadar" },
        { id: "babuganj", name: "Babuganj" },
        { id: "banaripara", name: "Banaripara" },
        { id: "gaurnadi", name: "Gaurnadi" },
      ],
      // Sylhet Division
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar" },
        { id: "beanibazar", name: "Beanibazar" },
        { id: "golapganj", name: "Golapganj" },
        { id: "kanaighat", name: "Kanaighat" },
      ],
      // Rangpur Division
      rangpur: [
        { id: "rangpur_sadar", name: "Rangpur Sadar" },
        { id: "pirgachha", name: "Pirgachha" },
        { id: "badarganj", name: "Badarganj" },
        { id: "mithapukur", name: "Mithapukur" },
      ],
      // Mymensingh Division
      mymensingh: [
        { id: "mymensingh_sadar", name: "Mymensingh Sadar" },
        { id: "trishal", name: "Trishal" },
        { id: "fulbaria", name: "Fulbaria" },
        { id: "gafargaon", name: "Gafargaon" },
      ],
    },
    areas: {
      dhanmondi: [
        { id: "dhanmondi_1", name: "Dhanmondi 1" },
        { id: "dhanmondi_2", name: "Dhanmondi 2" },
        { id: "dhanmondi_3", name: "Dhanmondi 3" },
        { id: "dhanmondi_4", name: "Dhanmondi 4" },
        { id: "dhanmondi_5", name: "Dhanmondi 5" },
      ],
      gulshan: [
        { id: "gulshan_1", name: "Gulshan 1" },
        { id: "gulshan_2", name: "Gulshan 2" },
        { id: "banani", name: "Banani" },
        { id: "baridhara", name: "Baridhara" },
      ],
      mirpur: [
        { id: "mirpur_1", name: "Mirpur 1" },
        { id: "mirpur_2", name: "Mirpur 2" },
        { id: "mirpur_6", name: "Mirpur 6" },
        { id: "mirpur_10", name: "Mirpur 10" },
        { id: "mirpur_11", name: "Mirpur 11" },
        { id: "mirpur_12", name: "Mirpur 12" },
        { id: "mirpur_13", name: "Mirpur 13" },
        { id: "mirpur_14", name: "Mirpur 14" },
      ],
      uttara: [
        { id: "uttara_1", name: "Uttara 1" },
        { id: "uttara_2", name: "Uttara 2" },
        { id: "uttara_3", name: "Uttara 3" },
        { id: "uttara_4", name: "Uttara 4" },
      ],
      gazipur_sadar: [
        { id: "konabari", name: "Konabari" },
        { id: "bhawal", name: "Bhawal" },
        { id: "tongi", name: "Tongi" },
      ],
      narayanganj_sadar: [
        { id: "chashara", name: "Chashara" },
        { id: "bandar", name: "Bandar" },
        { id: "kadamrasul", name: "Kadamrasul" },
      ],
      chattogram_sadar: [
        { id: "agrabad", name: "Agrabad" },
        { id: "chawkbazar", name: "Chawkbazar" },
        { id: "kotwali", name: "Kotwali" },
        { id: "pahartali", name: "Pahartali" },
        { id: "panchlaish", name: "Panchlaish" },
      ],
      rajshahi_sadar: [
        { id: "shahmukhdum", name: "Shahmukhdum" },
        { id: "boalia", name: "Boalia" },
        { id: "motihar", name: "Motihar" },
        { id: "rajpara", name: "Rajpara" },
      ],
      khulna_sadar: [
        { id: "khalishpur", name: "Khalishpur" },
        { id: "sonadanga", name: "Sonadanga" },
        { id: "daulatpur", name: "Daulatpur" },
        { id: "khanjahan_ali", name: "Khan Jahan Ali" },
      ],
      barishal_sadar: [
        { id: "nattullabad", name: "Nattullabad" },
        { id: "alempur", name: "Alempur" },
        { id: "kawnia", name: "Kawnia" },
        { id: "chahutpur", name: "Chahutpur" },
      ],
      sylhet_sadar: [
        { id: "shahjalal_upashahar", name: "Shahjalal Upashahar" },
        { id: "kumarpara", name: "Kumarpara" },
        { id: "kajalshah", name: "Kajalshah" },
        { id: "mirabazar", name: "Mirabazar" },
      ],
      rangpur_sadar: [
        { id: "alambiditor", name: "Alambiditor" },
        { id: "babukha", name: "Babukha" },
        { id: "bazarsouth", name: "Bazar South" },
        { id: "chandanpat", name: "Chandanpat" },
      ],
      mymensingh_sadar: [
        { id: "chorpara", name: "Chorpara" },
        { id: "chilarchar", name: "Chilarchar" },
        { id: "chorkhaira", name: "Chorkhaira" },
        { id: "dapunia", name: "Dapunia" },
      ],
    },
  };

  // Modal styles
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "400px",
      width: "90%",
      borderRadius: "16px",
      border: "none",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      padding: "0",
      overflow: "hidden",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  const showModal = (title, message, type = "success") => {
    setModalContent({
      title,
      message,
      type,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const step1Data = localStorage.getItem("signupStep1");
    if (!step1Data) {
      navigate("/register");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.division) newErrors.division = "Please select a division";
    if (!formData.district) newErrors.district = "Please select a district";
    if (!formData.upazila) newErrors.upazila = "Please select an upazila";
    // if (!formData.area) newErrors.area = "Please select an area";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

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
      const step1Data = JSON.parse(localStorage.getItem("signupStep1") || "{}");

      const finalData = {
        ...step1Data,
        ...formData,
        passwordConfirm: formData.confirmPassword,
      };

      // Remove confirmPassword from final data before sending to API
      const { confirmPassword, ...apiData } = finalData;

      // API call to register user
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        apiData
      );

      // Clear localStorage
      localStorage.removeItem("signupStep1");

      // Store token
      localStorage.setItem("token", response.data.token);

      // Show success modal
      showModal(
        "Registration Successful!",
        "A verification link has been sent to your email. Please check your email and activate your account.",
        "success"
      );
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again later.";

      showModal("Registration Failed", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalAction = () => {
    closeModal();
    if (modalContent.type === "success") {
      // Navigate to email verification sent page or login page
      navigate("/email-verification-sent");
    }
  };

  const goBack = () => {
    navigate("/register");
  };

  // Get filtered data based on selections
  const getDistricts = () => {
    return formData.division
      ? bangladeshData.districts[formData.division] || []
      : [];
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
              Step 2: Location & Account
            </h1>
            <p className="text-red-100">
              Provide your location and account security information
            </p>

            {/* Progress Steps */}
            <div className="mt-6 flex justify-center space-x-4">
              {[1, 2].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNumber === 2
                        ? "bg-white text-red-600 border-2 border-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 2 && (
                    <div className="w-12 h-1 mx-2 bg-green-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Your Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Division */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="division"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Division *
                    </label>
                    <select
                      id="division"
                      name="division"
                      required
                      value={formData.division}
                      onChange={handleChange}
                      className={`block w-full py-3 px-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                        errors.division ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Division</option>
                      {bangladeshData.divisions.map((division) => (
                        <option key={division.id} value={division.id}>
                          {division.name}
                        </option>
                      ))}
                    </select>
                    {errors.division && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.division}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label
                      htmlFor="district"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      District *
                    </label>
                    <select
                      id="district"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      disabled={!formData.division}
                      className={`block w-full py-3 px-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.district ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select District</option>
                      {getDistricts().map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>

                  {/* Upazila/Thana */}
                  <div>
                    <label
                      htmlFor="upazila"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Upazila/Thana *
                    </label>
                    <select
                      id="upazila"
                      name="upazila"
                      required
                      value={formData.upazila}
                      onChange={handleChange}
                      disabled={!formData.district}
                      className={`block w-full py-3 px-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.upazila ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Upazila/Thana</option>
                      {getUpazilas().map((upazila) => (
                        <option key={upazila.id} value={upazila.id}>
                          {upazila.name}
                        </option>
                      ))}
                    </select>
                    {errors.upazila && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.upazila}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="area"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Area
                    </label>
                    <select
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      disabled={!formData.upazila}
                      className={`block w-full py-3 px-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.area ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Area</option>
                      {getAreas().map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center pt-6 border-t border-gray-200">
                  Account Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Password *
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
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter a strong password"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Confirm Password *
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
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Re-enter your password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Verification Notice */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-semibold">
                        Email Verification Required
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        After registration is completed, a verification link
                        will be sent to your email. Please check your email and
                        click the link to activate your account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={goBack}
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
                    Previous
                  </button>
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
                        Registering...
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Benefits Section */}
          <div className="bg-red-50 border-t border-red-100 p-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                Find Local Blood Donors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-red-700">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">📍</span>
                  </div>
                  <span>Nearby Donors</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🚗</span>
                  </div>
                  <span>Quick Access</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">🔄</span>
                  </div>
                  <span>Accurate Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mb-1">
                    <span className="text-red-600">⏱️</span>
                  </div>
                  <span>Save Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Your location information will only be used to find blood donors.
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Notification Modal"
      >
        <div
          className={`p-6 ${
            modalContent.type === "success" ? "bg-green-50" : "bg-red-50"
          } rounded-lg`}
        >
          <div className="text-center">
            {/* Icon */}
            <div
              className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                modalContent.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {modalContent.type === "success" ? (
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Title */}
            <h3
              className={`mt-3 text-lg font-medium ${
                modalContent.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {modalContent.title}
            </h3>

            {/* Message */}
            <div className="mt-2">
              <p
                className={`text-sm ${
                  modalContent.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {modalContent.message}
              </p>
            </div>

            {/* Button */}
            <div className="mt-4">
              <button
                type="button"
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  modalContent.type === "success"
                    ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                    : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                } transition-colors duration-200`}
                onClick={handleModalAction}
              >
                {modalContent.type === "success" ? "OK" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignupPage2;
