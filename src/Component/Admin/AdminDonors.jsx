// Component/Admin/AdminDonors.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AdminDonors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
    status: "",
    verification: "",
  });

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/donors", label: "Donors", icon: "🩸" },
    { path: "/admin/requests", label: "Requests", icon: "📋" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  // Bangladesh geographical data
  const bangladeshGeoData = {
    divisions: [
      { id: "dhaka", name: "Dhaka" },
      { id: "chattogram", name: "Chattogram" },
      { id: "rajshahi", name: "Rajshahi" },
      { id: "khulna", name: "Khulna" },
      { id: "barishal", name: "Barishal" },
      { id: "sylhet", name: "Sylhet" },
      { id: "rangpur", name: "Rangpur" },
      { id: "mymensingh", name: "Mymensingh" },
    ],
    districts: {
      dhaka: [
        { id: "dhaka", name: "Dhaka" },
        { id: "gazipur", name: "Gazipur" },
        { id: "narayanganj", name: "Narayanganj" },
        { id: "narsingdi", name: "Narsingdi" },
        { id: "tangail", name: "Tangail" },
        { id: "kishoreganj", name: "Kishoreganj" },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram" },
        { id: "coxsbazar", name: "Cox's Bazar" },
        { id: "rangamati", name: "Rangamati" },
        { id: "bandarban", name: "Bandarban" },
      ],
      sylhet: [
        { id: "sylhet", name: "Sylhet" },
        { id: "moulvibazar", name: "Moulvibazar" },
        { id: "habiganj", name: "Habiganj" },
        { id: "sunamganj", name: "Sunamganj" },
      ],
      rajshahi: [
        { id: "rajshahi", name: "Rajshahi" },
        { id: "natore", name: "Natore" },
        { id: "naogaon", name: "Naogaon" },
        { id: "pabna", name: "Pabna" },
      ],
      khulna: [
        { id: "khulna", name: "Khulna" },
        { id: "bagerhat", name: "Bagerhat" },
        { id: "satkhira", name: "Satkhira" },
        { id: "jessore", name: "Jessore" },
      ],
      barishal: [
        { id: "barishal", name: "Barishal" },
        { id: "bhola", name: "Bhola" },
        { id: "patuakhali", name: "Patuakhali" },
        { id: "pirojpur", name: "Pirojpur" },
      ],
      rangpur: [
        { id: "rangpur", name: "Rangpur" },
        { id: "dinajpur", name: "Dinajpur" },
        { id: "gaibandha", name: "Gaibandha" },
        { id: "kurigram", name: "Kurigram" },
      ],
      mymensingh: [
        { id: "mymensingh", name: "Mymensingh" },
        { id: "jamalpur", name: "Jamalpur" },
        { id: "sherpur", name: "Sherpur" },
        { id: "netrokona", name: "Netrokona" },
      ],
    },
    upazilas: {
      dhaka: [
        { id: "dhaka_sadar", name: "Dhaka Sadar" },
        { id: "dhamrai", name: "Dhamrai" },
        { id: "dohar", name: "Dohar" },
        { id: "keraniganj", name: "Keraniganj" },
      ],
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar" },
        { id: "beanibazar", name: "Beanibazar" },
        { id: "bishwanath", name: "Bishwanath" },
        { id: "companiganj", name: "Companiganj" },
      ],
    },
  };

  const bloodGroups = [
    { value: "", label: "All Blood Groups" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const verificationOptions = [
    { value: "", label: "All Verification" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
  ];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [filters, donors]);

  const fetchDonors = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/users/donors",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data.status === "success" || response.data.success) {
        const donorsData =
          response.data.data?.users || response.data.users || [];
        setDonors(donorsData);
      } else {
        setDonors([]);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      // Fallback to sample data if API fails
      setDonors(getSampleDonors());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleDonors = () => {
    return [
      {
        _id: "1",
        fullName: "Rahim Ahmed",
        email: "rahim@email.com",
        phone: "01712345678",
        bloodGroup: "A+",
        division: "dhaka",
        district: "dhaka",
        upazila: "dhaka_sadar",
        wantToDonate: true,
        isEmailVerified: true,
        lastDonation: "2023-11-15",
        status: "active",
      },
      {
        _id: "2",
        fullName: "Sima Akter",
        email: "sima@email.com",
        phone: "01712345679",
        bloodGroup: "B+",
        division: "sylhet",
        district: "sylhet",
        upazila: "sylhet_sadar",
        wantToDonate: false,
        isEmailVerified: true,
        lastDonation: "2023-10-28",
        status: "inactive",
      },
      {
        _id: "3",
        fullName: "Karim Uddin",
        email: "karim@email.com",
        phone: "01712345680",
        bloodGroup: "O+",
        division: "chattogram",
        district: "chattogram",
        upazila: "",
        wantToDonate: true,
        isEmailVerified: false,
        lastDonation: "2023-11-20",
        status: "active",
      },
      {
        _id: "4",
        fullName: "Ayesha Begum",
        email: "aisha@email.com",
        phone: "01712345681",
        bloodGroup: "AB+",
        division: "rajshahi",
        district: "rajshahi",
        upazila: "",
        wantToDonate: true,
        isEmailVerified: true,
        lastDonation: "2023-11-10",
        status: "active",
      },
    ];
  };

  const filterDonors = () => {
    let filtered = [...donors];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (donor) =>
          donor.fullName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          donor.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          donor.phone?.includes(filters.search)
      );
    }

    // Blood group filter
    if (filters.bloodGroup) {
      filtered = filtered.filter(
        (donor) => donor.bloodGroup === filters.bloodGroup
      );
    }

    // Division filter
    if (filters.division) {
      filtered = filtered.filter(
        (donor) => donor.division === filters.division
      );
    }

    // District filter
    if (filters.district) {
      filtered = filtered.filter(
        (donor) => donor.district === filters.district
      );
    }

    // Upazila filter
    if (filters.upazila) {
      filtered = filtered.filter((donor) => donor.upazila === filters.upazila);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((donor) => donor.status === filters.status);
    }

    // Verification filter
    if (filters.verification === "verified") {
      filtered = filtered.filter((donor) => donor.isEmailVerified === true);
    } else if (filters.verification === "unverified") {
      filtered = filtered.filter((donor) => donor.isEmailVerified === false);
    }

    setFilteredDonors(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
      };

      // Reset dependent filters
      if (name === "division") {
        newFilters.district = "";
        newFilters.upazila = "";
      }
      if (name === "district") {
        newFilters.upazila = "";
      }

      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      bloodGroup: "",
      division: "",
      district: "",
      upazila: "",
      status: "",
      verification: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const getDistricts = () => {
    return filters.division && bangladeshGeoData.districts[filters.division]
      ? bangladeshGeoData.districts[filters.division]
      : [];
  };

  const getUpazilas = () => {
    return filters.district && bangladeshGeoData.upazilas[filters.district]
      ? bangladeshGeoData.upazilas[filters.district]
      : [];
  };

  const getLocationText = (donor) => {
    const parts = [];

    if (donor.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[donor.division]?.find(
        (u) => u.id === donor.upazila
      );
      if (upazilaData) parts.push(upazilaData.name);
    }

    if (donor.district) {
      const districtData = bangladeshGeoData.districts[donor.division]?.find(
        (d) => d.id === donor.district
      );
      if (districtData) parts.push(districtData.name);
    }

    if (donor.division) {
      const divisionData = bangladeshGeoData.divisions.find(
        (d) => d.id === donor.division
      );
      if (divisionData) parts.push(divisionData.name);
    }

    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const getStats = () => {
    const total = donors.length;
    const active = donors.filter((d) => d.status === "active").length;
    const verified = donors.filter((d) => d.isEmailVerified).length;
    const willing = donors.filter((d) => d.wantToDonate).length;

    return { total, active, verified, willing };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        <header className="bg-white shadow-sm border-b border-gray-200 hidden md:block">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Donor Management
              </h2>
              <p className="text-gray-600">
                View and manage all registered blood donors
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">Admin</p>
                <p className="text-sm text-gray-600">System Administrator</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donors</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.verified}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🔒</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Willing to Donate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.willing}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🩸</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Filter Donors
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Reset Filters
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Export Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Name, email or phone number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division
                </label>
                <select
                  name="division"
                  value={filters.division}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="">All Divisions</option>
                  {bangladeshGeoData.divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  disabled={!filters.division}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">All Districts</option>
                  {getDistricts().map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upazila
                </label>
                <select
                  name="upazila"
                  value={filters.upazila}
                  onChange={handleFilterChange}
                  disabled={!filters.district}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">All Upazilas</option>
                  {getUpazilas().map((upazila) => (
                    <option key={upazila.id} value={upazila.id}>
                      {upazila.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification
                </label>
                <select
                  name="verification"
                  value={filters.verification}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  {verificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Donors List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Donors List
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredDonors.length} donors found
                  </p>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Add New Donor
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading donors...</p>
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-4xl">😔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No donors found
                </h3>
                <p className="text-gray-600 mb-4">
                  No donors found matching your selected filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonors.map((donor) => (
                      <tr key={donor._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                              {donor.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {donor.fullName}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {donor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          <div>{donor.email}</div>
                          <div className="text-gray-400">{donor.phone}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {donor.bloodGroup}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {getLocationText(donor)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                donor.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {donor.status === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                donor.isEmailVerified
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {donor.isEmailVerified
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-red-600 hover:text-red-900 text-xs md:text-sm">
                              Edit
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 text-xs md:text-sm">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDonors;
