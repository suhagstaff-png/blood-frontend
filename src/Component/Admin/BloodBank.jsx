import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BloodBank = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBloodBanks, setFilteredBloodBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    division: "",
    district: "",
    address: "",
    contactNumber: "",
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    division: "",
    district: "",
  });

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
        { id: "manikganj", name: "Manikganj" },
        { id: "munshiganj", name: "Munshiganj" },
        { id: "rajbari", name: "Rajbari" },
        { id: "shariatpur", name: "Shariatpur" },
        { id: "faridpur", name: "Faridpur" },
        { id: "gopalganj", name: "Gopalganj" },
        { id: "madaripur", name: "Madaripur" },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram" },
        { id: "coxsbazar", name: "Cox's Bazar" },
        { id: "rangamati", name: "Rangamati" },
        { id: "bandarban", name: "Bandarban" },
        { id: "khagrachari", name: "Khagrachari" },
        { id: "chandpur", name: "Chandpur" },
        { id: "feni", name: "Feni" },
        { id: "lakshmipur", name: "Lakshmipur" },
        { id: "noakhali", name: "Noakhali" },
        { id: "brahmanbaria", name: "Brahmanbaria" },
        { id: "comilla", name: "Comilla" },
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
        { id: "bogra", name: "Bogra" },
        { id: "joypurhat", name: "Joypurhat" },
        { id: "sirajganj", name: "Sirajganj" },
      ],
      khulna: [
        { id: "khulna", name: "Khulna" },
        { id: "bagerhat", name: "Bagerhat" },
        { id: "satkhira", name: "Satkhira" },
        { id: "jessore", name: "Jessore" },
        { id: "jhenaidah", name: "Jhenaidah" },
        { id: "kushtia", name: "Kushtia" },
        { id: "magura", name: "Magura" },
        { id: "meherpur", name: "Meherpur" },
        { id: "narail", name: "Narail" },
        { id: "chuadanga", name: "Chuadanga" },
      ],
      barishal: [
        { id: "barishal", name: "Barishal" },
        { id: "bhola", name: "Bhola" },
        { id: "patuakhali", name: "Patuakhali" },
        { id: "pirojpur", name: "Pirojpur" },
        { id: "barguna", name: "Barguna" },
        { id: "jhalokati", name: "Jhalokati" },
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
        { id: "sherpur", name: "Sherpur" },
        { id: "netrokona", name: "Netrokona" },
      ],
    },
  };

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    filterBloodBanks();
  }, [filters, bloodBanks]);

  const fetchBloodBanks = async () => {
    try {
      setIsLoading(true);
      // Simulate API call - replace with actual API endpoint
      setTimeout(() => {
        const sampleData = getSampleBloodBanks();
        setBloodBanks(sampleData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching blood banks:", error);
      setBloodBanks(getSampleBloodBanks());
      setIsLoading(false);
    }
  };

  const getSampleBloodBanks = () => {
    return [
      {
        _id: "1",
        name: "Dhaka Medical College Blood Bank",
        division: "dhaka",
        district: "dhaka",
        address: "Dhaka Medical College Hospital, Dhaka-1000",
        contactNumber: "01712345678, 02-9660015",
        established: "1995",
      },
      {
        _id: "2",
        name: "Bangabandhu Sheikh Mujib Medical University Blood Bank",
        division: "dhaka",
        district: "dhaka",
        address: "Shahbag, Dhaka-1000",
        contactNumber: "01712345679, 02-55165000",
        established: "2005",
      },
      {
        _id: "3",
        name: "Chattogram Medical College Blood Bank",
        division: "chattogram",
        district: "chattogram",
        address: "Chattogram Medical College Hospital, Chattogram",
        contactNumber: "01712345680, 031-616141",
        established: "1998",
      },
      {
        _id: "4",
        name: "Rajshahi Medical College Blood Bank",
        division: "rajshahi",
        district: "rajshahi",
        address: "Rajshahi Medical College Hospital, Rajshahi",
        contactNumber: "01712345681, 0721-776105",
        established: "1997",
      },
      {
        _id: "5",
        name: "Sylhet M.A.G. Osmani Medical College Blood Bank",
        division: "sylhet",
        district: "sylhet",
        address: "Sylhet-3100",
        contactNumber: "01712345682, 0821-716590",
        established: "2000",
      },
    ];
  };

  const filterBloodBanks = () => {
    let filtered = [...bloodBanks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (bank) =>
          bank.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          bank.address?.toLowerCase().includes(filters.search.toLowerCase()) ||
          bank.contactNumber?.includes(filters.search)
      );
    }

    // Division filter
    if (filters.division) {
      filtered = filtered.filter((bank) => bank.division === filters.division);
    }

    // District filter
    if (filters.district) {
      filtered = filtered.filter((bank) => bank.district === filters.district);
    }

    setFilteredBloodBanks(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
      };

      // Reset district filter when division changes
      if (name === "division") {
        newFilters.district = "";
      }

      return newFilters;
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    // Create new blood bank
    const newBloodBank = {
      _id: Date.now().toString(),
      ...formData,
      established: new Date().getFullYear().toString(),
    };

    // Add to the list
    setBloodBanks((prev) => [newBloodBank, ...prev]);

    // Reset form and close
    setFormData({
      name: "",
      division: "",
      district: "",
      address: "",
      contactNumber: "",
    });
    setShowForm(false);

    alert("Blood bank added successfully!");
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      division: "",
      district: "",
    });
  };

  const getDistricts = () => {
    return filters.division && bangladeshGeoData.districts[filters.division]
      ? bangladeshGeoData.districts[filters.division]
      : [];
  };

  const getDivisionName = (divisionId) => {
    const division = bangladeshGeoData.divisions.find(
      (d) => d.id === divisionId
    );
    return division ? division.name : divisionId;
  };

  const getDistrictName = (divisionId, districtId) => {
    const districts = bangladeshGeoData.districts[divisionId];
    if (districts) {
      const district = districts.find((d) => d.id === districtId);
      return district ? district.name : districtId;
    }
    return districtId;
  };

  const getStats = () => {
    const total = bloodBanks.length;
    const byDivision = {};

    bloodBanks.forEach((bank) => {
      byDivision[bank.division] = (byDivision[bank.division] || 0) + 1;
    });

    return { total, byDivision };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Bangladesh Blood Bank Management
            </h2>
            <p className="text-gray-600">List of all registered blood banks</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
            >
              <span>+</span>
              Add Blood Bank
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Blood Banks</p>
                <p className="text-3xl font-bold text-red-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">🏥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dhaka Division</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.byDivision.dhaka || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chattogram Division</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.byDivision.chattogram || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Other Divisions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.total -
                    (stats.byDivision.dhaka || 0) -
                    (stats.byDivision.chattogram || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🏢</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Filter Blood Banks
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="Blood bank name, address or phone number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              >
                <option value="">All Districts</option>
                {getDistricts().map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Blood Banks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Blood Banks List
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredBloodBanks.length} blood banks found
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blood banks...</p>
            </div>
          ) : filteredBloodBanks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-4xl">🏥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No blood banks found
              </h3>
              <p className="text-gray-600 mb-4">
                No blood banks found matching your selected filters.
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
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Blood Bank Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Division
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBloodBanks.map((bank) => (
                    <tr key={bank._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm mr-3">
                            🏥
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {bank.name}
                            </div>
                            <div className="text-xs text-gray-500 lg:hidden">
                              {getDivisionName(bank.division)} •{" "}
                              {getDistrictName(bank.division, bank.district)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        <span className="font-medium">
                          {getDivisionName(bank.division)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {getDistrictName(bank.division, bank.district)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={bank.address}>
                          {bank.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                        <div className="space-y-1">
                          {bank.contactNumber
                            .split(", ")
                            .map((contact, index) => (
                              <div key={index} className="font-mono">
                                {contact}
                              </div>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-red-600 hover:text-red-900 text-sm">
                            Edit
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 text-sm">
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm">
                            Delete
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

      {/* Add Blood Bank Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Add New Blood Bank
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter full name of blood bank"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleFormChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select Division</option>
                    {bangladeshGeoData.divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleFormChange}
                    required
                    disabled={!formData.division}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                  >
                    <option value="">Select District</option>
                    {formData.division &&
                      bangladeshGeoData.districts[formData.division]?.map(
                        (district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        )
                      )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                  rows="3"
                  placeholder="Enter complete address of blood bank"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  required
                  placeholder="Phone numbers (separate with commas)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: 01712345678, 02-9660015
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Save Blood Bank
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodBank;
