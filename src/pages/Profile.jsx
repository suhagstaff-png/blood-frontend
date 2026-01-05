import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
const API_BASE = "http://localhost:5000/api";

const ProfilePage = () => {
  // user + loading
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // tabs
  const [activeTab, setActiveTab] = useState("profile");

  // modals & UI
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // request-specific modal (single search-request)
  const [showSearchRequestModal, setShowSearchRequestModal] = useState(false);
  const [activeSearchRequest, setActiveSearchRequest] = useState(null);

  // scheduling date for accept (YYYY-MM-DD)
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // donation saved modal (after accept)
  const [showDonationSavedModal, setShowDonationSavedModal] = useState(false);
  const [donationSavedData, setDonationSavedData] = useState(null);

  // lists
  const [requests, setRequests] = useState([]); // existing donations.my-requests
  const [selectedSearchRequests, setSelectedSearchRequests] = useState([]); // search-requests where user is selected
  const [donationHistory, setDonationHistory] = useState([]);

  // edit form
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
    area: "",
  });

  // processing state
  const [isProcessing, setIsProcessing] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const navigate = useNavigate();

  // ----- helpers -----
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };
  const formatDateTime = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const addMonths = (date, months) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);

    // handle month overflow (e.g., Jan 31 + 1 month => Feb 28/29)
    if (d.getDate() !== day) {
      d.setDate(0); // last day of previous month
    }
    return d;
  };

  // compute last donation from donationHistory
  const getLastDonation = () => {
    if (!donationHistory || donationHistory.length === 0) return null;
    // sort by acceptedAt -> createdAt descending
    const sorted = [...donationHistory].sort((a, b) => {
      const ta = new Date(a.acceptedAt || a.createdAt || a.date || 0).getTime();
      const tb = new Date(b.acceptedAt || b.createdAt || b.date || 0).getTime();
      return tb - ta;
    });
    return sorted[0];
  };

  const getNextEligibleDate = () => {
    // prefer backend-provided user.disabledUntil
    if (user && user.disabledUntil) {
      return new Date(user.disabledUntil);
    }
    // fallback: last donation + 3 months
    const last = getLastDonation();
    if (last) {
      const lastDate = new Date(last.acceptedAt || last.createdAt || last.date);
      return addMonths(lastDate, 3);
    }
    return null;
  };

  // ----- fetch profile -----
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, authHeaders());
      setUser(res.data.data.user || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, token]);

  // ----- fetch latest search-request for this donor (selectedDonors includes donorId) -----
  const fetchLatestSearchForDonor = useCallback(async (donorId) => {
    if (!donorId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/search-requests/donor/${donorId}/latest`
      );
      setActiveSearchRequest(res.data.data.searchRequest || null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setActiveSearchRequest(null);
      } else {
        console.error("Error fetching latest search for donor:", err);
      }
    }
  }, []);

  // ----- load search-requests where current user is selected (for modal "View My Requests") -----
  const loadSelectedSearchRequests = useCallback(async () => {
    if (!user || !user._id) return;
    setIsProcessing(true);
    try {
      const res = await axios.get(
        `${API_BASE}/search-requests/donor/${user._id}`,
        authHeaders()
      );
      setSelectedSearchRequests(res.data.data.searchRequests || []);
    } catch (err) {
      console.error("Error loading selected search requests:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load requests.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, token]);

  // ----- load "my requests" (donations requests targeted to me) -----
  const loadMyRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE}/donations/my-requests`,
        authHeaders()
      );
      setRequests(res.data.data.requests || []);
    } catch (err) {
      console.error("Error loading my requests:", err);
    }
  }, [token]);

  // ----- load donation history -----
  const loadDonationHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE}/donations/history`,
        authHeaders()
      );
      setDonationHistory(res.data.data.history || []);
    } catch (err) {
      console.error("Error loading donation history:", err);
    }
  }, [token]);

  // initial fetch profile
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // when user loads, fetch donor-specific search request + requests + history
  useEffect(() => {
    if (user && user._id) {
      fetchLatestSearchForDonor(user._id);
      loadMyRequests();
      loadDonationHistory();
      // do NOT auto-load selectedSearchRequests here to avoid extra calls; load when modal opens
    }
  }, [user, fetchLatestSearchForDonor, loadMyRequests, loadDonationHistory]);

  // ----- Profile actions -----
  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const openEditModal = () => {
    setEditForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      bloodGroup: user.bloodGroup || "",
      division: user.division || "",
      district: user.district || "",
      upazila: user.upazila || "",
      area: user.area || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const newData = { ...prev, [name]: value };
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

  const submitProfileUpdate = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/users/update-me`,
        editForm,
        authHeaders()
      );
      setUser(res.data.data.user);
      setShowEditModal(false);
      await MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      const serverMessage =
        err.response?.data?.message ||
        (err.response?.data?.error
          ? JSON.stringify(err.response.data.error)
          : null) ||
        err.message ||
        "Unknown error occurred";
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update profile: ${serverMessage}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // toggle wantToDonate
  const toggleWantToDonate = async (enable) => {
    setIsProcessing(true);
    try {
      if (enable) {
        await axios.patch(`${API_BASE}/donations/enable`, {}, authHeaders());
      } else {
        await axios.patch(`${API_BASE}/donations/disable`, {}, authHeaders());
      }
      const res = await axios.get(`${API_BASE}/auth/me`, authHeaders());
      setUser(res.data.data.user);
    } catch (err) {
      console.error("Error toggling donate status:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to change status.",
      });
      setShowInfoModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Accept donation request from my-requests (existing endpoint)
  const acceptExistingRequest = async (reqId) => {
    setIsProcessing(true);
    try {
      await axios.put(
        `${API_BASE}/donations/${reqId}/accept`,
        {},
        authHeaders()
      );
      await MySwal.fire({
        icon: "success",
        title: "Accepted",
        text: "Request has been accepted. Your profile has been temporarily disabled.",
      });
      // refresh
      await fetchUserProfile();
      await loadMyRequests();
      await loadDonationHistory();
    } catch (err) {
      console.error("Error accepting request:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to accept request.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // create dummy request (dev)
  const createDummyRequestForTesting = async () => {
    if (!user) return;
    try {
      await axios.post(
        `${API_BASE}/donations/request`,
        {
          donorId: user._id,
          requesterName: "Ambulance / Family",
          requesterPhone: "01700000000",
          patientInfo: {
            patientName: "Patient Name (Test)",
            bloodGroup: user.bloodGroup,
            bloodBagsNeeded: 1,
          },
        },
        authHeaders()
      );
      await loadMyRequests();
      await MySwal.fire({
        icon: "success",
        title: "Test Created",
        text: "Test request has been created. Check your requests list.",
      });
    } catch (err) {
      console.error("Error creating test request:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create test request.",
      });
    }
  };

  // ----- SEARCH-REQUEST (donor side): Accept / Reject for selectedSearchRequests -----
  // Accept a search-request (creates donation server-side and updates search-request)
  // now expects scheduledAt param (YYYY-MM-DD or ISO)
  const acceptSearchRequest = async (searchRequestId, scheduledAt) => {
    if (!user || !searchRequestId) return;
    setIsProcessing(true);
    try {
      const res = await axios.put(
        `${API_BASE}/search-requests/donor/${user._id}/${searchRequestId}/accept`,
        { scheduledAt },
        authHeaders()
      );

      const { donation, searchRequest } = res.data.data || {};
      setDonationSavedData(donation || null);
      setShowDonationSavedModal(true);

      // refresh local data
      await fetchUserProfile();
      await fetchLatestSearchForDonor(user._id); // may update/clear
      await loadDonationHistory();
      await loadMyRequests();
      await loadSelectedSearchRequests();

      // remove it client-side too (smoother UX)
      setSelectedSearchRequests((prev) =>
        prev.filter((s) => s._id !== searchRequestId)
      );

      setShowSearchRequestModal(false);
      setActiveSearchRequest(null);
    } catch (err) {
      console.error("Error accepting search-request:", err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to accept request.";
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to accept request: ${serverMessage}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject (remove from selectedDonors) — uses SweetAlert2 for confirmation
  const rejectSearchRequest = async (searchRequestId) => {
    if (!user || !searchRequestId) return;

    try {
      const result = await MySwal.fire({
        title: "Are you sure?",
        text: "Are you sure you want to reject this request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reject",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      setIsProcessing(true);
      const res = await axios.put(
        `${API_BASE}/search-requests/donor/${user._id}/${searchRequestId}/reject`,
        {},
        authHeaders()
      );

      await MySwal.fire({
        icon: "success",
        title: "Rejected",
        text: "You have been successfully removed from this request.",
      });

      // refresh list
      await loadSelectedSearchRequests();
      setSelectedSearchRequests((prev) =>
        prev.filter((s) => s._id !== searchRequestId)
      );

      // if the modal for a single request was open, close it
      if (activeSearchRequest && activeSearchRequest._id === searchRequestId) {
        setShowSearchRequestModal(false);
        setActiveSearchRequest(null);
      }
    } catch (err) {
      console.error("Error rejecting search-request:", err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject request.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDonationSavedModal = async () => {
    setShowDonationSavedModal(false);
    setDonationSavedData(null);
    // refresh history & profile to reflect changes
    await loadDonationHistory();
    await fetchUserProfile();
  };

  // ----- Bangladesh select data (copied full object) -----
  const bangladeshData = {
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
        { id: "faridpur", name: "Faridpur" },
        { id: "gopalganj", name: "Gopalganj" },
        { id: "madaripur", name: "Madaripur" },
        { id: "shariatpur", name: "Shariatpur" },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram" },
        { id: "coxsbazar", name: "Cox's Bazar" },
        { id: "rangamati", name: "Rangamati" },
        { id: "bandarban", name: "Bandarban" },
        { id: "khagrachari", name: "Khagrachari" },
        { id: "feni", name: "Feni" },
        { id: "lakshmipur", name: "Lakshmipur" },
        { id: "noakhali", name: "Noakhali" },
        { id: "chandpur", name: "Chandpur" },
        { id: "brahmanbaria", name: "Brahmanbaria" },
        { id: "comilla", name: "Comilla" },
      ],
      rajshahi: [
        { id: "rajshahi", name: "Rajshahi" },
        { id: "natore", name: "Natore" },
        { id: "naogaon", name: "Naogaon" },
        { id: "chapainawabganj", name: "Chapainawabganj" },
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
        { id: "kushtia", name: "Kushtia" },
        { id: "meherpur", name: "Meherpur" },
        { id: "chuadanga", name: "Chuadanga" },
        { id: "narail", name: "Narail" },
      ],
      barishal: [
        { id: "barishal", name: "Barishal" },
        { id: "bhola", name: "Bhola" },
        { id: "patuakhali", name: "Patuakhali" },
        { id: "pirojpur", name: "Pirojpur" },
        { id: "barguna", name: "Barguna" },
        { id: "jhalokati", name: "Jhalokati" },
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
        { id: "nawabganj", name: "Nawabganj" },
        { id: "savar", name: "Savar" },
      ],
      chattogram: [
        { id: "chattogram_sadar", name: "Chattogram Sadar" },
        { id: "hathazari", name: "Hathazari" },
        { id: "patiya", name: "Patiya" },
      ],
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar" },
        { id: "beanibazar", name: "Beanibazar" },
        { id: "bishwanath", name: "Bishwanath" },
      ],
      rajshahi: [
        { id: "rajshahi_sadar", name: "Rajshahi Sadar" },
        { id: "natore_sadar", name: "Natore Sadar" },
      ],
    },
    areas: {
      dhaka_sadar: [
        { id: "farmgate", name: "Farmgate" },
        { id: "dhanmondi", name: "Dhanmondi" },
        { id: "gulshan", name: "Gulshan" },
        { id: "banani", name: "Banani" },
        { id: "uttara", name: "Uttara" },
        { id: "mirpur", name: "Mirpur" },
      ],
      sylhet_sadar: [
        { id: "hawapara", name: "Hawapara" },
        { id: "kumarpara", name: "Kumarpara" },
        { id: "bandarbazar", name: "Bandarbazar" },
      ],
      chattogram_sadar: [
        { id: "agrabad", name: "Agrabad" },
        { id: "pahartali", name: "Pahartali" },
      ],
    },
  };

  const getDistricts = () =>
    editForm.division && bangladeshData.districts[editForm.division]
      ? bangladeshData.districts[editForm.division]
      : [];

  const getUpazilas = () =>
    editForm.district && bangladeshData.upazilas[editForm.district]
      ? bangladeshData.upazilas[editForm.district]
      : editForm.division && bangladeshData.upazilas[editForm.division]
      ? bangladeshData.upazilas[editForm.division]
      : [];

  const getAreas = () =>
    editForm.upazila && bangladeshData.areas[editForm.upazila]
      ? bangladeshData.areas[editForm.upazila]
      : [];

  // ----- rendering -----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load user information</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const disabledUntil = user.disabledUntil
    ? new Date(user.disabledUntil)
    : null;
  const disabledUntilText = disabledUntil
    ? disabledUntil.toLocaleDateString()
    : null;

  // donation summary values
  const lastDonation = getLastDonation();
  const nextEligible = getNextEligibleDate();
  const totalDonations = donationHistory.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-red-600 font-bold text-3xl">
                    {user.fullName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold">{user.fullName}</h1>
                  <p className="text-red-100 opacity-90">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-red-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                      {user.bloodGroup} Blood Group
                    </span>
                    {user.wantToDonate && (
                      <span className="bg-green-600 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        ✅ Willing to Donate
                      </span>
                    )}
                    {user.isEmailVerified ? (
                      <span className="bg-blue-600 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        ✓ Email Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-600 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        ⚠️ Email Verification Required
                      </span>
                    )}
                    {disabledUntil && (
                      <span className="bg-gray-800 bg-opacity-40 px-3 py-1 rounded-full text-sm">
                        ⛔ Disabled Until: {disabledUntilText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-auto flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={openEditModal}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Single Search Request button (if any) */}
          {activeSearchRequest ? (
            <div className="mb-4">
              <button
                onClick={() => {
                  // open modal with current activeSearchRequest (already set by fetchLatestSearchForDonor)
                  setScheduledDate(new Date().toISOString().slice(0, 10));
                  setShowSearchRequestModal(true);
                }}
                className="w-full bg-white p-4 rounded-2xl shadow-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">My Blood Donation Request</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Patient:{" "}
                    {activeSearchRequest.patientInfo?.patientName || "-"} •
                    Group: {activeSearchRequest.patientInfo?.bloodGroup || "-"}{" "}
                    • Bags:{" "}
                    {activeSearchRequest.patientInfo?.bloodBagsNeeded || "-"}
                  </div>
                </div>
                <div className="text-sm text-gray-500">Details ↗</div>
              </button>
            </div>
          ) : (
            <div className="mb-4 text-center text-gray-600">
              No blood requests for you
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg mb-6">
            <div className="flex overflow-x-auto">
              {["profile", "donation", "activity", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === tab
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  {tab === "profile" && "Profile"}
                  {tab === "donation" && "Donation"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Full Name
                      </label>
                      <p className="text-lg text-gray-800">{user.fullName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-lg text-gray-800">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Mobile Number
                      </label>
                      <p className="text-lg text-gray-800">{user.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Blood Group
                      </label>
                      <p className="text-lg text-gray-800">{user.bloodGroup}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Location
                      </label>
                      <p className="text-lg text-gray-800">
                        {user.area}, {user.upazila}, {user.district},{" "}
                        {user.division}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">
                        Donor Status
                      </label>
                      <p className="text-lg text-gray-800">
                        {user.wantToDonate
                          ? "✅ Willing to Donate"
                          : "❌ Currently Not Willing"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {user.wantToDonate ? (
                    <button
                      disabled={isProcessing}
                      onClick={() => toggleWantToDonate(false)}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      I want to stop participating
                    </button>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => toggleWantToDonate(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Activate for Donation Again
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("donation")}
                    className="bg-white border border-gray-200 px-6 py-3 rounded-lg hover:shadow-md"
                  >
                    View Donation History ({donationHistory.length})
                  </button>
                </div>
              </div>
            )}

            {activeTab === "donation" && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-4xl">💉</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Donation History
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Requests you have accepted will be shown here
                  </p>
                </div>

                {/* Donation summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-500">Total Donations</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {totalDonations}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-500">
                      Last Donation Time
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {lastDonation
                        ? formatDateTime(
                            lastDonation.acceptedAt || lastDonation.createdAt
                          )
                        : "No Records"}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-500">
                      Next Eligible Date
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {nextEligible ? formatDate(nextEligible) : "Eligible Now"}
                    </div>
                  </div>
                </div>

                {/* Donation list */}
                {donationHistory.length === 0 ? (
                  <div className="text-center text-gray-600 py-8">
                    No Records
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donationHistory
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.acceptedAt || b.createdAt) -
                          new Date(a.acceptedAt || a.createdAt)
                      )
                      .map((h) => (
                        <div
                          key={h._id || h.requestId}
                          className="p-4 border rounded-lg bg-white shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {h.patientInfo?.patientName || "Patient"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Group: {h.patientInfo?.bloodGroup || "-"} •
                                Bags: {h.patientInfo?.bloodBagsNeeded || "-"}
                              </div>
                              {h.requesterName && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Requester: {h.requesterName} •{" "}
                                  {h.requesterPhone}
                                </div>
                              )}
                              {h.notes && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Notes: {h.notes}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-2">
                                Record: #{h._id || h.requestId}
                              </div>
                            </div>

                            <div className="text-right md:text-left">
                              <div className="text-sm text-gray-500">
                                Status:{" "}
                                <span className="font-semibold text-gray-800">
                                  {h.status || "accepted"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-2">
                                Accepted Date:{" "}
                                <span className="font-medium">
                                  {formatDateTime(
                                    h.acceptedAt || h.date || h.createdAt
                                  )}
                                </span>
                              </div>
                              {h.scheduledAt && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Scheduled: {formatDate(h.scheduledAt)}
                                </div>
                              )}
                              <div className="mt-3">
                                <button
                                  onClick={() => {
                                    // show details in modal or new page — for now, open the request modal with details
                                    setActiveSearchRequest(
                                      h.searchRequest || null
                                    );
                                    setShowSearchRequestModal(true);
                                  }}
                                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button
              onClick={() => navigate("/find-blood")}
              className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">🩸</span>
              </div>
              <h3 className="font-semibold text-gray-800">Donate Blood</h3>
              <p className="text-sm text-gray-600">Find nearby blood banks</p>
            </button>

            <button className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <h3 className="font-semibold text-gray-800">Appointments</h3>
              <p className="text-sm text-gray-600">Schedule blood donation</p>
            </button>

            <button className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 text-xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-800">Achievements</h3>
              <p className="text-sm text-gray-600">View your achievements</p>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------ MODALS ------------------ */}
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Update Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full p-3 border rounded-lg"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={editForm.bloodGroup}
                  onChange={handleEditChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    )
                  )}
                </select>
              </div>
              <hr className="my-2" />
              <h4 className="font-semibold text-gray-800">Change Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Division
                  </label>
                  <select
                    name="division"
                    value={editForm.division}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select Division</option>
                    {bangladeshData.divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    name="district"
                    value={editForm.district}
                    onChange={handleEditChange}
                    disabled={!editForm.division}
                    className="w-full p-3 border rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Select District</option>
                    {getDistricts().map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Upazila/Thana
                  </label>
                  <select
                    name="upazila"
                    value={editForm.upazila}
                    onChange={handleEditChange}
                    disabled={!editForm.district && !editForm.division}
                    className="w-full p-3 border rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Select Upazila/Thana</option>
                    {getUpazilas().map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Area
                  </label>
                  <select
                    name="area"
                    value={editForm.area}
                    onChange={handleEditChange}
                    disabled={!editForm.upazila}
                    className="w-full p-3 border rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Select Area</option>
                    {getAreas().map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={submitProfileUpdate}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
              >
                {isProcessing ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Modal (selectedSearchRequests) */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                Your Received Blood Requests (Seeker)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="px-3 py-1 rounded bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            {selectedSearchRequests.length === 0 ? (
              <div className="text-center text-gray-600 py-10">No Requests</div>
            ) : (
              <div className="space-y-3">
                {selectedSearchRequests.map((r) => (
                  <div key={r._id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="w-3/4">
                        <div className="font-semibold">
                          {r.requesterName || "Requester"} •{" "}
                          {r.requesterPhone || "-"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Patient: {r.patientInfo?.patientName || "-"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Blood Group: {r.patientInfo?.bloodGroup || "-"}, Bags:{" "}
                          {r.patientInfo?.bloodBagsNeeded || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: {r.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Request Time:{" "}
                          {new Date(
                            r.searchDate || r.createdAt
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2 flex flex-col items-end">
                        <button
                          disabled={isProcessing || !user.wantToDonate}
                          onClick={() => {
                            setActiveSearchRequest(r);
                            setScheduledDate(
                              new Date().toISOString().slice(0, 10)
                            );
                            setShowSearchRequestModal(true);
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded"
                        >
                          Accept
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => rejectSearchRequest(r._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setActiveSearchRequest(r);
                            setShowSearchRequestModal(true);
                          }}
                          className="px-2 py-1 text-xs border rounded"
                        >
                          Details ↗
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Request modal (single activeSearchRequest for current donor + date picker) */}
      {showSearchRequestModal && activeSearchRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Blood Donation Request</h4>
              <button
                onClick={() => {
                  setShowSearchRequestModal(false);
                  setActiveSearchRequest(null);
                }}
                className="px-2 py-1 bg-gray-100 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-semibold">Patient</div>
                <div className="text-sm text-gray-700">
                  {activeSearchRequest.patientInfo?.patientName || "-"}
                </div>
              </div>

              <div>
                <div className="font-semibold">Blood Group</div>
                <div className="text-sm text-gray-700">
                  {activeSearchRequest.patientInfo?.bloodGroup || "-"}
                </div>
              </div>

              <div>
                <div className="font-semibold">Required Bags</div>
                <div className="text-sm text-gray-700">
                  {activeSearchRequest.patientInfo?.bloodBagsNeeded || "-"}
                </div>
              </div>

              <div>
                <div className="font-semibold">Requester</div>
                <div className="text-sm text-gray-700">
                  {activeSearchRequest.requesterName || "-"} •{" "}
                  {activeSearchRequest.requesterPhone || "-"}
                </div>
              </div>

              <div>
                <div className="font-semibold">
                  Scheduled Date (When can you donate)
                </div>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="text-xs text-gray-500 mt-1">
                  You will be disabled for 3 months from the accepted date.
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Request Date:{" "}
                {new Date(
                  activeSearchRequest.searchDate ||
                    activeSearchRequest.createdAt
                ).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  acceptSearchRequest(activeSearchRequest._id, scheduledDate)
                }
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-3 rounded"
              >
                {isProcessing ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={async () => {
                  await rejectSearchRequest(activeSearchRequest._id);
                }}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-3 rounded"
              >
                {isProcessing ? "Processing..." : "Reject & Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation saved modal (after accept search-request) */}
      {showDonationSavedModal && donationSavedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="font-semibold text-lg mb-2">
              You have been successfully marked for blood donation
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Donation record has been saved:
            </p>

            <div className="p-3 border rounded mb-3">
              <div className="font-semibold">
                {donationSavedData.patientInfo?.patientName || "Patient"}
              </div>
              <div className="text-sm text-gray-600">
                Group: {donationSavedData.patientInfo?.bloodGroup || "-"}, Bags:{" "}
                {donationSavedData.patientInfo?.bloodBagsNeeded || "-"}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Record: #{donationSavedData._id}
              </div>
              <div className="text-xs text-gray-500">
                Date:{" "}
                {formatDateTime(
                  donationSavedData.acceptedAt || donationSavedData.createdAt
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeDonationSavedModal}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="font-semibold text-lg mb-2">Note</h4>
            <p className="text-gray-700 mb-4">{infoModalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="font-semibold text-lg mb-2">Logout?</h4>
            <p className="text-gray-700 mb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
