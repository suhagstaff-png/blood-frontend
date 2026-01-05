// src/components/SearchDonorPage.js
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Helper to create a stable browser id without external deps
 */
const createBrowserId = () =>
  "browser_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);

const SearchDonorPage = () => {
  const [browserId, setBrowserId] = useState(null);
  const [searchRequestId, setSearchRequestId] = useState(null);

  const [filters, setFilters] = useState({
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
    area: "",
  });

  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    bloodGroup: "",
    bloodBagsNeeded: 1,
  });

  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [sortedDonors, setSortedDonors] = useState([]);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(true);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [currentDonor, setCurrentDonor] = useState(null);

  const bloodGroups = [
    { value: "", label: "All Blood Groups" },
    { value: "A+", label: "A Positive (A+)" },
    { value: "A-", label: "A Negative (A-)" },
    { value: "B+", label: "B Positive (B+)" },
    { value: "B-", label: "B Negative (B-)" },
    { value: "O+", label: "O Positive (O+)" },
    { value: "O-", label: "O Negative (O-)" },
    { value: "AB+", label: "AB Positive (AB+)" },
    { value: "AB-", label: "AB Negative (AB-)" },
  ];

  // Bangladesh geographical data (unchanged structure, only English names)
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
        { id: "dhaka", name: "Dhaka", lat: 23.8103, lng: 90.4125 },
        { id: "gazipur", name: "Gazipur", lat: 23.9999, lng: 90.4203 },
        { id: "narayanganj", name: "Narayanganj", lat: 23.6333, lng: 90.5 },
        { id: "narsingdi", name: "Narsingdi", lat: 23.9167, lng: 90.7167 },
        { id: "tangail", name: "Tangail", lat: 24.25, lng: 89.9167 },
        { id: "kishoreganj", name: "Kishoreganj", lat: 24.4333, lng: 90.7833 },
        { id: "manikganj", name: "Manikganj", lat: 23.8667, lng: 90.0 },
        { id: "munshiganj", name: "Munshiganj", lat: 23.55, lng: 90.5333 },
        { id: "rajbari", name: "Rajbari", lat: 23.75, lng: 89.65 },
        { id: "faridpur", name: "Faridpur", lat: 23.6, lng: 89.8333 },
        { id: "gopalganj", name: "Gopalganj", lat: 23.0167, lng: 89.8167 },
        { id: "madaripur", name: "Madaripur", lat: 23.1667, lng: 90.1833 },
        { id: "shariatpur", name: "Shariatpur", lat: 23.2, lng: 90.35 },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram", lat: 22.3569, lng: 91.7832 },
        { id: "coxsbazar", name: "Cox's Bazar", lat: 21.4272, lng: 92.005 },
        { id: "rangamati", name: "Rangamati", lat: 22.6333, lng: 92.2 },
        { id: "bandarban", name: "Bandarban", lat: 22.1953, lng: 92.2184 },
        { id: "khagrachari", name: "Khagrachari", lat: 23.1, lng: 91.9833 },
        { id: "feni", name: "Feni", lat: 23.0159, lng: 91.3976 },
        { id: "lakshmipur", name: "Lakshmipur", lat: 22.9458, lng: 90.8283 },
        { id: "noakhali", name: "Noakhali", lat: 22.8667, lng: 91.1 },
        { id: "chandpur", name: "Chandpur", lat: 23.2333, lng: 90.65 },
        {
          id: "brahmanbaria",
          name: "Brahmanbaria",
          lat: 23.9667,
          lng: 91.1,
        },
        { id: "comilla", name: "Comilla", lat: 23.4667, lng: 91.1833 },
      ],
      sylhet: [
        { id: "sylhet", name: "Sylhet", lat: 24.891, lng: 91.871 },
        { id: "moulvibazar", name: "Moulvibazar", lat: 24.4833, lng: 91.7667 },
        { id: "habiganj", name: "Habiganj", lat: 24.3747, lng: 91.415 },
        { id: "sunamganj", name: "Sunamganj", lat: 25.0667, lng: 91.4 },
      ],
      rajshahi: [
        { id: "rajshahi", name: "Rajshahi", lat: 24.3745, lng: 88.6042 },
        { id: "natore", name: "Natore", lat: 24.4167, lng: 88.9667 },
        { id: "naogaon", name: "Naogaon", lat: 24.8, lng: 88.9333 },
        {
          id: "chapainawabganj",
          name: "Chapainawabganj",
          lat: 24.6,
          lng: 88.2667,
        },
        { id: "pabna", name: "Pabna", lat: 24.0, lng: 89.25 },
        { id: "sirajganj", name: "Sirajganj", lat: 24.45, lng: 89.7167 },
        { id: "bogra", name: "Bogra", lat: 24.85, lng: 89.3667 },
        { id: "joypurhat", name: "Joypurhat", lat: 25.1, lng: 89.0167 },
      ],
      khulna: [
        { id: "khulna", name: "Khulna", lat: 22.8456, lng: 89.5403 },
        { id: "bagerhat", name: "Bagerhat", lat: 22.6667, lng: 89.7833 },
        { id: "satkhira", name: "Satkhira", lat: 22.7167, lng: 89.0667 },
        { id: "jessore", name: "Jessore", lat: 23.1667, lng: 89.2167 },
        { id: "jhenaidah", name: "Jhenaidah", lat: 23.5333, lng: 89.0167 },
        { id: "magura", name: "Magura", lat: 23.4833, lng: 89.4167 },
        { id: "kushtia", name: "Kushtia", lat: 23.9, lng: 89.1333 },
        { id: "meherpur", name: "Meherpur", lat: 23.7667, lng: 88.6333 },
        { id: "chuadanga", name: "Chuadanga", lat: 23.6333, lng: 88.8333 },
        { id: "narail", name: "Narail", lat: 23.1667, lng: 89.5 },
      ],
      barishal: [
        { id: "barishal", name: "Barishal", lat: 22.701, lng: 90.3535 },
        { id: "bhola", name: "Bhola", lat: 22.6833, lng: 90.65 },
        { id: "patuakhali", name: "Patuakhali", lat: 22.35, lng: 90.3167 },
        { id: "pirojpur", name: "Pirojpur", lat: 22.5833, lng: 89.9667 },
        { id: "barguna", name: "Barguna", lat: 22.15, lng: 90.1167 },
        { id: "jhalokati", name: "Jhalokati", lat: 22.6333, lng: 90.2 },
      ],
      rangpur: [
        { id: "rangpur", name: "Rangpur", lat: 25.7439, lng: 89.2752 },
        { id: "dinajpur", name: "Dinajpur", lat: 25.6333, lng: 88.6333 },
        { id: "gaibandha", name: "Gaibandha", lat: 25.328, lng: 89.55 },
        { id: "kurigram", name: "Kurigram", lat: 25.8054, lng: 89.6362 },
        { id: "lalmonirhat", name: "Lalmonirhat", lat: 25.9167, lng: 89.45 },
        { id: "nilphamari", name: "Nilphamari", lat: 25.9333, lng: 88.85 },
        { id: "panchagarh", name: "Panchagarh", lat: 26.3333, lng: 88.55 },
        { id: "thakurgaon", name: "Thakurgaon", lat: 26.0333, lng: 88.4667 },
      ],
      mymensingh: [
        { id: "mymensingh", name: "Mymensingh", lat: 24.7471, lng: 90.4203 },
        { id: "jamalpur", name: "Jamalpur", lat: 24.9375, lng: 89.9375 },
        { id: "sherpur", name: "Sherpur", lat: 25.02, lng: 90.01 },
        { id: "netrokona", name: "Netrokona", lat: 24.8833, lng: 90.7333 },
      ],
    },
    upazilas: {
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar", lat: 24.891, lng: 91.871 },
        { id: "beanibazar", name: "Beanibazar", lat: 24.8167, lng: 92.1 },
        { id: "bishwanath", name: "Bishwanath", lat: 24.7667, lng: 91.7833 },
        { id: "companiganj", name: "Companiganj", lat: 25.0167, lng: 91.8667 },
        {
          id: "dakshin_surma",
          name: "Dakshin Surma",
          lat: 24.85,
          lng: 91.8833,
        },
        { id: "fenchuganj", name: "Fenchuganj", lat: 24.6833, lng: 91.9167 },
        { id: "golapganj", name: "Golapganj", lat: 24.8333, lng: 92.0 },
        { id: "gowainghat", name: "Gowainghat", lat: 25.0833, lng: 91.9333 },
        { id: "jaintiapur", name: "Jaintiapur", lat: 25.1167, lng: 92.1167 },
        { id: "kanaighat", name: "Kanaighat", lat: 25.0, lng: 92.2333 },
        { id: "osmaninagar", name: "Osmaninagar", lat: 24.7667, lng: 91.6667 },
        { id: "balaganj", name: "Balaganj", lat: 24.7167, lng: 91.8333 },
        { id: "zakiganj", name: "Zakiganj", lat: 24.9167, lng: 92.3667 },
      ],
      dhaka: [
        { id: "dhaka_sadar", name: "Dhaka Sadar", lat: 23.7104, lng: 90.4074 },
        { id: "dhamrai", name: "Dhamrai", lat: 23.9167, lng: 90.2167 },
        { id: "dohar", name: "Dohar", lat: 23.5833, lng: 90.1333 },
        { id: "keraniganj", name: "Keraniganj", lat: 23.7, lng: 90.35 },
        { id: "nawabganj", name: "Nawabganj", lat: 23.6667, lng: 90.1667 },
        { id: "savar", name: "Savar", lat: 23.8667, lng: 90.2667 },
      ],
    },
    areas: {
      sylhet_sadar: [
        { id: "hawapara", name: "Hawapara", lat: 24.891, lng: 91.871 },
        { id: "kumarpara", name: "Kumarpara", lat: 24.895, lng: 91.868 },
        { id: "bandarbazar", name: "Bandarbazar", lat: 24.888, lng: 91.874 },
        { id: "zindabazar", name: "Zindabazar", lat: 24.893, lng: 91.87 },
        { id: "subhanighat", name: "Subhanighat", lat: 24.887, lng: 91.877 },
        { id: "mirabazar", name: "Mirabazar", lat: 24.89, lng: 91.865 },
        { id: "shahjalal", name: "Shahjalal", lat: 24.9, lng: 91.86 },
        { id: "amberkhana", name: "Amberkhana", lat: 24.885, lng: 91.872 },
        { id: "tilagor", name: "Tilagor", lat: 24.882, lng: 91.868 },
        { id: "moghla", name: "Moghla", lat: 24.88, lng: 91.875 },
      ],
      dhaka_sadar: [
        { id: "farmgate", name: "Farmgate", lat: 23.759, lng: 90.385 },
        { id: "dhanmondi", name: "Dhanmondi", lat: 23.745, lng: 90.37 },
        { id: "gulshan", name: "Gulshan", lat: 23.794, lng: 90.415 },
        { id: "banani", name: "Banani", lat: 23.794, lng: 90.405 },
        { id: "uttara", name: "Uttara", lat: 23.875, lng: 90.383 },
        { id: "mirpur", name: "Mirpur", lat: 23.805, lng: 90.365 },
        { id: "mohammadpur", name: "Mohammadpur", lat: 23.765, lng: 90.355 },
        { id: "motijheel", name: "Motijheel", lat: 23.734, lng: 90.425 },
        { id: "newmarket", name: "New Market", lat: 23.73, lng: 90.395 },
        { id: "shahbagh", name: "Shahbagh", lat: 23.737, lng: 90.395 },
      ],
    },
  };

  // -------------------------
  // --- Initialization ------
  // -------------------------
  useEffect(() => {
    let bid = localStorage.getItem("browserId");
    if (!bid) {
      bid = createBrowserId();
      localStorage.setItem("browserId", bid);
    }
    setBrowserId(bid);

    // load donors & saved search after setting browserId
    fetchDonors();
  }, []);

  // whenever browserId is known (and donors loaded), try to fetch saved request
  useEffect(() => {
    if (browserId) {
      fetchSavedSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserId]);

  // Fetch all donors from API
  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/donors"
      );
      console.log("Donors API Response:", response.data);

      if (response.data.status === "success" || response.data.success) {
        const donorsData =
          response.data.data?.users || response.data.users || [];
        setDonors(donorsData);
        console.log("Donors loaded:", donorsData.length);
      } else {
        setDonors([]);
        console.log("No donors found or API error");
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved search for this browser (if exists)
  const fetchSavedSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/search-requests/browser/${browserId}/latest`
      );

      if (res.data.status === "success" && res.data.data?.searchRequest) {
        const sr = res.data.data.searchRequest;
        console.log("Loaded saved search:", sr);

        // populate UI
        if (sr.patientInfo) {
          setPatientInfo({
            patientName: sr.patientInfo.patientName || "",
            bloodGroup: sr.patientInfo.bloodGroup || "",
            bloodBagsNeeded: sr.patientInfo.bloodBagsNeeded || 1,
          });
        }

        if (sr.filters) {
          setFilters({
            bloodGroup: sr.filters.bloodGroup || "",
            division: sr.filters.division || "",
            district: sr.filters.district || "",
            upazila: sr.filters.upazila || "",
            area: sr.filters.area || "",
          });
        }

        // selectedDonors may be populated user objects if backend .populate() used
        setSelectedDonors(sr.selectedDonors || []);

        // set found donors (backend may have stored foundDonors array of ids;
        // we will map available donors by _id if possible)
        const found = (sr.foundDonors || []).map((fd) => {
          // if fd is object with fields, use it; otherwise try match from donors list
          if (fd && fd._id) return fd;
          return donors.find((d) => d._id === fd) || { _id: fd };
        });

        setFilteredDonors(found);
        setSortedDonors(found);
        setSearchPerformed(true);
        setSearchRequestId(sr._id);
      }
    } catch (error) {
      // 404 or not found is fine
      if (error.response && error.response.status === 404) {
        console.log("No saved search for this browserId");
      } else {
        console.error("Error fetching saved search:", error);
      }
    }
  };

  // -------------------------
  // --- Utilities ----------
  // -------------------------
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const getDonorCoordinates = (donor) => {
    try {
      if (donor.location && donor.location.coordinates) {
        return {
          lat: donor.location.coordinates.latitude,
          lng: donor.location.coordinates.longitude,
        };
      }

      if (donor.area && bangladeshGeoData.areas[donor.area]) {
        const areaData = bangladeshGeoData.areas[donor.area][0];
        if (areaData) return { lat: areaData.lat, lng: areaData.lng };
      }

      if (donor.upazila && bangladeshGeoData.upazilas[donor.upazila]) {
        const upazilaData = bangladeshGeoData.upazilas[donor.upazila][0];
        if (upazilaData) return { lat: upazilaData.lat, lng: upazilaData.lng };
      }

      if (donor.district) {
        const division = donor.division || "dhaka";
        const districtData = bangladeshGeoData.districts[division]?.find(
          (d) => d.id === donor.district
        );
        if (districtData)
          return { lat: districtData.lat, lng: districtData.lng };
      }

      const divisionCoords = {
        dhaka: { lat: 23.8103, lng: 90.4125 },
        chattogram: { lat: 22.3569, lng: 91.7832 },
        rajshahi: { lat: 24.3745, lng: 88.6042 },
        khulna: { lat: 22.8456, lng: 89.5403 },
        barishal: { lat: 22.701, lng: 90.3535 },
        sylhet: { lat: 24.891, lng: 91.871 },
        rangpur: { lat: 25.7439, lng: 89.2752 },
        mymensingh: { lat: 24.7471, lng: 90.4203 },
      };

      return divisionCoords[donor.division] || { lat: 23.8103, lng: 90.4125 };
    } catch (error) {
      console.error("Error getting donor coordinates:", error);
      return { lat: 23.8103, lng: 90.4125 };
    }
  };

  const getSelectedAreaCoordinates = () => {
    if (filters.area && bangladeshGeoData.areas[filters.area]) {
      const areaData = bangladeshGeoData.areas[filters.area][0];
      return { lat: areaData.lat, lng: areaData.lng };
    }

    if (filters.upazila && bangladeshGeoData.upazilas[filters.upazila]) {
      const upazilaData = bangladeshGeoData.upazilas[filters.upazila][0];
      return { lat: upazilaData.lat, lng: upazilaData.lng };
    }

    if (filters.district) {
      const division = filters.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
        (d) => d.id === filters.district
      );
      if (districtData) return { lat: districtData.lat, lng: districtData.lng };
    }

    if (filters.division) {
      const divisionCoords = {
        dhaka: { lat: 23.8103, lng: 90.4125 },
        chattogram: { lat: 22.3569, lng: 91.7832 },
        rajshahi: { lat: 24.3745, lng: 88.6042 },
        khulna: { lat: 22.8456, lng: 89.5403 },
        barishal: { lat: 22.701, lng: 90.3535 },
        sylhet: { lat: 24.891, lng: 91.871 },
        rangpur: { lat: 25.7439, lng: 89.2752 },
        mymensingh: { lat: 24.7471, lng: 90.4203 },
      };
      return divisionCoords[filters.division] || { lat: 23.8103, lng: 90.4125 };
    }

    return null;
  };

  // Function to get Google Maps URL for a donor
  const getGoogleMapsUrl = (donor) => {
    const coords = getDonorCoordinates(donor);

    // Construct location string from donor's address components
    let locationQuery = "";

    if (donor.area) {
      const areaData = bangladeshGeoData.areas[donor.area]?.[0];
      if (areaData) locationQuery = areaData.name;
    } else if (donor.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[donor.upazila]?.[0];
      if (upazilaData) locationQuery = upazilaData.name;
    } else if (donor.district) {
      const division = donor.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
        (d) => d.id === donor.district
      );
      if (districtData) locationQuery = districtData.name;
    } else if (donor.division) {
      const divisionData = bangladeshGeoData.divisions.find(
        (d) => d.id === donor.division
      );
      if (divisionData) locationQuery = divisionData.name;
    }

    // If we have coordinates, use them for more precise location
    if (coords.lat && coords.lng) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    } else if (locationQuery) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        locationQuery + ", Bangladesh"
      )}`;
    } else {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        "Bangladesh"
      )}`;
    }
  };

  // Function to get Google Maps URL for multiple donors (all on one map)
  const getAllDonorsGoogleMapsUrl = () => {
    if (sortedDonors.length === 0) return "";

    // Create a map with markers for all donors
    let markers = "";

    sortedDonors.forEach((donor, index) => {
      const coords = getDonorCoordinates(donor);
      if (coords.lat && coords.lng) {
        markers += `&markers=color:red%7Clabel:${index + 1}%7C${coords.lat},${
          coords.lng
        }`;
      }
    });

    // If we have markers, create a map with all of them
    if (markers) {
      return `https://www.google.com/maps/dir/?api=1${markers}`;
    }

    // Fallback to Bangladesh map
    return "https://www.google.com/maps/@23.8103,90.4125,7z";
  };

  // Function to open Google Maps for a single donor
  const openDonorInGoogleMaps = (donor, e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    const url = getGoogleMapsUrl(donor);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Function to open Google Maps with all donors
  const openAllDonorsInGoogleMaps = () => {
    const url = getAllDonorsGoogleMapsUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // -------------------------
  // --- Handlers -----------
  // -------------------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
      };

      if (name === "division") {
        newFilters.district = "";
        newFilters.upazila = "";
        newFilters.area = "";
      }
      if (name === "district") {
        newFilters.upazila = "";
        newFilters.area = "";
      }
      if (name === "upazila") {
        newFilters.area = "";
      }

      return newFilters;
    });
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // If user is editing an existing saved search, update instead of creating new
  const handleStartSearch = async () => {
    if (
      !patientInfo.patientName ||
      !patientInfo.bloodGroup ||
      !patientInfo.bloodBagsNeeded
    ) {
      alert(
        "Please enter patient name, blood group, and required number of blood bags"
      );
      return;
    }

    setShowPatientModal(false);
    await handleSearch({ createIfMissing: true });
  };

  // Main search function — can create or update DB search
  const handleSearch = async ({ createIfMissing = false } = {}) => {
    setIsLoading(true);
    setSearchPerformed(true);

    try {
      // ensure filters.bloodGroup matches patient blood group
      const appliedFilters = { ...filters, bloodGroup: patientInfo.bloodGroup };
      setFilters(appliedFilters);

      // Filter donors locally
      const filtered = donors.filter((donor) => {
        const bloodMatch = donor.bloodGroup === patientInfo.bloodGroup;
        const divisionMatch =
          !appliedFilters.division ||
          donor.division === appliedFilters.division;
        const districtMatch =
          !appliedFilters.district ||
          donor.district === appliedFilters.district;
        const upazilaMatch =
          !appliedFilters.upazila || donor.upazila === appliedFilters.upazila;
        const areaMatch =
          !appliedFilters.area || donor.area === appliedFilters.area;
        const willingToDonate = donor.wantToDonate === true;
        const verified = donor.isEmailVerified === true;

        return (
          bloodMatch &&
          divisionMatch &&
          districtMatch &&
          upazilaMatch &&
          areaMatch &&
          willingToDonate &&
          verified
        );
      });

      // Calculate distances and sort if possible
      const selectedCoords = getSelectedAreaCoordinates();
      let donorsWithDistance = filtered.map((donor) => {
        const donorCoords = getDonorCoordinates(donor);
        let distance = null;
        if (selectedCoords) {
          distance = calculateDistance(
            selectedCoords.lat,
            selectedCoords.lng,
            donorCoords.lat,
            donorCoords.lng
          );
        }
        return {
          ...donor,
          distance,
          coordinates: donorCoords,
        };
      });

      if (selectedCoords) {
        donorsWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return parseFloat(a.distance) - parseFloat(b.distance);
        });
      }

      setFilteredDonors(donorsWithDistance);
      setSortedDonors(donorsWithDistance);

      // Save search request to backend (create or update)
      if (searchRequestId) {
        // update existing
        await axios.put(
          `http://localhost:5000/api/search-requests/browser/${browserId}/latest`,
          {
            patientInfo,
            filters: appliedFilters,
            foundDonors: donorsWithDistance.map((d) => d._id),
            selectedDonors: selectedDonors.map((d) => d._id),
            status:
              selectedDonors.length >= patientInfo.bloodBagsNeeded
                ? "completed"
                : "active",
          }
        );
      } else if (createIfMissing) {
        // create new and store id
        const res = await axios.post(
          "http://localhost:5000/api/search-requests",
          {
            browserId,
            patientInfo,
            filters: appliedFilters,
            foundDonors: donorsWithDistance.map((d) => d._id),
            selectedDonors: selectedDonors.map((d) => d._id),
            status:
              selectedDonors.length >= patientInfo.bloodBagsNeeded
                ? "completed"
                : "active",
            searchDate: new Date(),
          }
        );

        if (res.data.status === "success" && res.data.data?.searchRequest) {
          setSearchRequestId(res.data.data.searchRequest._id);
        }
      } else {
        // no DB change requested
      }
    } catch (error) {
      console.error("Error in search:", error);
      setFilteredDonors([]);
      setSortedDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save selected donors to backend (if request exists)
  const updateSelectedDonors = async (payloadSelectedDonors = null) => {
    try {
      const payload = {
        selectedDonors: (payloadSelectedDonors || selectedDonors).map(
          (d) => d._id
        ),
        status:
          (payloadSelectedDonors || selectedDonors).length >=
          patientInfo.bloodBagsNeeded
            ? "completed"
            : "active",
      };

      // if searchRequestId exists, update by browserId route (it updates latest for that browser)
      await axios.put(
        `http://localhost:5000/api/search-requests/browser/${browserId}/latest`,
        payload
      );
    } catch (error) {
      console.error("Error updating selected donors:", error);
    }
  };

  const handleReset = async () => {
    // reset local UI AND DB for this browser if present
    try {
      if (browserId) {
        await axios.delete(
          `http://localhost:5000/api/search-requests/browser/${browserId}/reset`
        );
      }
    } catch (error) {
      console.error("Error resetting search in backend:", error);
    } finally {
      // clear all UI state
      setFilters({
        bloodGroup: "",
        division: "",
        district: "",
        upazila: "",
        area: "",
      });
      setPatientInfo({
        patientName: "",
        bloodGroup: "",
        bloodBagsNeeded: 1,
      });
      setFilteredDonors([]);
      setSortedDonors([]);
      setSelectedDonors([]);
      setSearchPerformed(false);
      setShowPatientModal(true);
      setSearchRequestId(null);
      // Keep the same browserId: we want the browser identity to persist.
    }
  };

  const handleDonorClick = (donor) => {
    if (selectedDonors.find((d) => d._id === donor._id)) {
      setCurrentDonor(donor);
      setShowDonorModal(true);
      return;
    }

    if (selectedDonors.length < patientInfo.bloodBagsNeeded) {
      const newSelectedDonors = [...selectedDonors, donor];
      setSelectedDonors(newSelectedDonors);
      setCurrentDonor(donor);
      setShowDonorModal(true);
      updateSelectedDonors(newSelectedDonors);
    } else {
      setCurrentDonor(donor);
      setShowDonorModal(true);
    }
  };

  const handleSelectDonor = (donor) => {
    if (selectedDonors.find((d) => d._id === donor._id)) {
      setShowDonorModal(true);
      return;
    }

    let newSelectedDonors;
    if (selectedDonors.length >= patientInfo.bloodBagsNeeded) {
      newSelectedDonors = [...selectedDonors.slice(1), donor];
    } else {
      newSelectedDonors = [...selectedDonors, donor];
    }

    setSelectedDonors(newSelectedDonors);
    setShowDonorModal(false);
    updateSelectedDonors(newSelectedDonors);
  };

  const handleRemoveDonor = (donorId) => {
    const newSelectedDonors = selectedDonors.filter((d) => d._id !== donorId);
    setSelectedDonors(newSelectedDonors);
    updateSelectedDonors(newSelectedDonors);
  };

  const handleCancelRequest = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/search-requests/browser/${browserId}/latest`,
        {
          status: "cancelled",
          cancelledAt: new Date(),
        }
      );

      setSelectedDonors([]);
      alert("Blood request has been cancelled");
    } catch (error) {
      console.error("Error cancelling request:", error);
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

  const getAreas = () => {
    return filters.upazila && bangladeshGeoData.areas[filters.upazila]
      ? bangladeshGeoData.areas[filters.upazila]
      : [];
  };

  const getLocationText = (donor) => {
    const parts = [];

    if (donor.area) {
      const areaData = bangladeshGeoData.areas[donor.area]?.[0];
      if (areaData) parts.push(`Area: ${areaData.name}`);
    }

    if (donor.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[donor.upazila]?.[0];
      if (upazilaData) parts.push(`Upazila: ${upazilaData.name}`);
    }

    if (donor.district) {
      const division = donor.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
        (d) => d.id === donor.district
      );
      if (districtData) parts.push(`District: ${districtData.name}`);
    }

    if (donor.division) {
      const divisionData = bangladeshGeoData.divisions.find(
        (d) => d.id === donor.division
      );
      if (divisionData) parts.push(`Division: ${divisionData.name}`);
    }

    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const getDonorCardLocation = (donor) => {
    const parts = [];

    if (donor.area) {
      const areaData = bangladeshGeoData.areas[donor.area]?.[0];
      if (areaData) parts.push(areaData.name);
    }

    if (donor.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[donor.upazila]?.[0];
      if (upazilaData) parts.push(upazilaData.name);
    }

    if (donor.district) {
      const division = donor.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
        (d) => d.id === donor.district
      );
      if (districtData) parts.push(districtData.name);
    }

    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const getDetailedDonorLocation = (donor) => {
    const parts = [];

    if (donor.area) {
      const areaData = bangladeshGeoData.areas[donor.area]?.[0];
      if (areaData) parts.push(areaData.name);
    }

    if (donor.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[donor.upazila]?.[0];
      if (upazilaData) parts.push(upazilaData.name);
    }

    if (donor.district) {
      const division = donor.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
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

    return parts.length > 0 ? parts.join(" ➤ ") : "Location not specified";
  };

  const getSelectedLocationText = () => {
    const parts = [];

    if (filters.area) {
      const areaData = bangladeshGeoData.areas[filters.area]?.[0];
      if (areaData) parts.push(areaData.name);
    }

    if (filters.upazila) {
      const upazilaData = bangladeshGeoData.upazilas[filters.upazila]?.[0];
      if (upazilaData) parts.push(upazilaData.name);
    }

    if (filters.district) {
      const division = filters.division || "dhaka";
      const districtData = bangladeshGeoData.districts[division]?.find(
        (d) => d.id === filters.district
      );
      if (districtData) parts.push(districtData.name);
    }

    if (filters.division) {
      const divisionData = bangladeshGeoData.divisions.find(
        (d) => d.id === filters.division
      );
      if (divisionData) parts.push(divisionData.name);
    }

    return parts.join(", ") || "All Areas";
  };

  // -------------------------
  // --- Render -------------
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            Find Blood Donors
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find blood donors based on required blood group and location.
            {filters.area && " Nearest donors will be shown based on distance."}
          </p>
        </div>

        {/* Search Filters Card */}
        {searchPerformed && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Search Blood Donors
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPatientModal(true)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
            </div>

            {filters.area && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-semibold">
                  📍 Current Location: {getSelectedLocationText()}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Donors will be sorted by distance (nearest first)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled
                >
                  <option value={patientInfo.bloodGroup}>
                    {
                      bloodGroups.find(
                        (bg) => bg.value === patientInfo.bloodGroup
                      )?.label
                    }
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Filtered based on patient's blood group
                </p>
              </div>

              {/* Division */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District
                </label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  disabled={!filters.division}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upazila/Thana
                </label>
                <select
                  name="upazila"
                  value={filters.upazila}
                  onChange={handleFilterChange}
                  disabled={!filters.district}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Upazilas</option>
                  {getUpazilas().map((upazila) => (
                    <option key={upazila.id} value={upazila.id}>
                      {upazila.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area
                </label>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  disabled={!filters.upazila}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Areas</option>
                  {getAreas().map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => handleSearch({ createIfMissing: true })}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Searching...
                  </>
                ) : (
                  "Search Again"
                )}
              </button>

              <button
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                New Search
              </button>

              {/* View All Donors on Google Maps Button */}
              {sortedDonors.length > 0 && (
                <button
                  onClick={openAllDonorsInGoogleMaps}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    ></path>
                  </svg>
                  View All on Google Maps
                </button>
              )}

              {selectedDonors.length > 0 && (
                <button
                  onClick={handleCancelRequest}
                  className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected Donors Section */}
        {selectedDonors.length > 0 && (
          <div className="bg-green-50 rounded-2xl shadow-xl p-6 mb-8 border border-green-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-800">
                Selected Donors ({selectedDonors.length}/
                {patientInfo.bloodBagsNeeded})
              </h2>
              {selectedDonors.length >= patientInfo.bloodBagsNeeded && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✅ Complete
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDonors.map((donor, index) => (
                <div
                  key={donor._id}
                  className="bg-white rounded-lg p-4 border border-green-300 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {donor.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {donor.bloodGroup}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDonor(donor._id)}
                      className="text-red-600 hover:text-red-800 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📞 {donor.phone}</p>
                    <p>📧 {donor.email}</p>
                    <p className="font-semibold text-green-700">
                      📍 {getDetailedDonorLocation(donor)}
                    </p>
                    {donor.distance && (
                      <p className="text-blue-600 font-semibold">
                        📍 Distance: {donor.distance} km
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => openDonorInGoogleMaps(donor, e)}
                    className="mt-3 w-full bg-blue-100 text-blue-700 py-1 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      ></path>
                    </svg>
                    Open in Google Maps
                  </button>
                </div>
              ))}
            </div>

            {selectedDonors.length >= patientInfo.bloodBagsNeeded ? (
              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 font-semibold text-center">
                  ✅ You have selected all required donors. Please contact them.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800 font-semibold text-center">
                  ⚠️ Select{" "}
                  {patientInfo.bloodBagsNeeded - selectedDonors.length} more
                  donor(s)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {searchPerformed && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Found Donors ({sortedDonors.length})
                  {filters.area && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (nearest first)
                    </span>
                  )}
                </h2>
                {sortedDonors.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Click on any donor card to view details or map location
                  </p>
                )}
              </div>
              {sortedDonors.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {sortedDonors.length} donors found
                  </span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for donors...</p>
              </div>
            ) : sortedDonors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-4xl">😔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Donors Found
                </h3>
                <p className="text-gray-600 mb-4">
                  No donors found with your selected filters. Please try
                  different filters.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Search Again
                </button>
              </div>
            ) : (
              <>
                {/* Google Maps Button for All Donors */}
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={openAllDonorsInGoogleMaps}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
                        strokeWidth="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      ></path>
                    </svg>
                    View All Donors on Google Maps
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedDonors.map((donor) => {
                    const isSelected = selectedDonors.find(
                      (d) => d._id === donor._id
                    );
                    const isDisabled =
                      selectedDonors.length >= patientInfo.bloodBagsNeeded &&
                      !isSelected;

                    return (
                      <div
                        key={donor._id}
                        className={`rounded-xl p-6 border hover:shadow-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-green-50 border-green-300 ring-2 ring-green-400"
                            : isDisabled
                            ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                            : "bg-red-50 border-red-200 hover:border-red-300"
                        }`}
                        onClick={() => !isDisabled && handleDonorClick(donor)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                isSelected
                                  ? "bg-green-600"
                                  : isDisabled
                                  ? "bg-gray-500"
                                  : "bg-red-600"
                              }`}
                            >
                              {donor.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">
                                {donor.fullName || "No Name"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {donor.bloodGroup || "No Group"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isSelected
                                  ? "bg-green-100 text-green-800"
                                  : isDisabled
                                  ? "bg-gray-200 text-gray-600"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {isSelected
                                ? "Selected"
                                : isDisabled
                                ? "Informed"
                                : "Active"}
                            </span>
                            {donor.distance && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {donor.distance} km
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-start text-sm text-gray-700">
                            <svg
                              className="w-4 h-4 mr-2 mt-1 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              ></path>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              ></path>
                            </svg>
                            <span className="font-semibold leading-tight">
                              {getDetailedDonorLocation(donor)}
                            </span>
                          </div>

                          {donor.lastDonation && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                ></path>
                              </svg>
                              Last Donation:{" "}
                              {new Date(donor.lastDonation).toLocaleDateString(
                                "en-US"
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <div
                            className={`flex-1 py-2 rounded-lg font-semibold text-center ${
                              isSelected
                                ? "bg-green-600 text-white"
                                : isDisabled
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {isSelected
                              ? "Already Selected"
                              : isDisabled
                              ? "Maximum Limit"
                              : "View Details"}
                          </div>
                          <button
                            onClick={(e) => openDonorInGoogleMaps(donor, e)}
                            className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : isDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                            title="Open in Google Maps"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Emergency Section */}
        <div className="bg-red-600 text-white rounded-2xl p-6 mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">
              🚨 Emergency Blood Need?
            </h3>
            <p className="mb-4">Call our emergency helpline directly</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:10666"
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center"
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
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                10666
              </a>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
              >
                Become a Donor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Information Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-6 text-center">
              Enter Patient Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={patientInfo.patientName}
                  onChange={handlePatientInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={patientInfo.bloodGroup}
                  onChange={handlePatientInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups
                    .filter((bg) => bg.value !== "")
                    .map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Blood Bags *
                </label>
                <select
                  name="bloodBagsNeeded"
                  value={patientInfo.bloodBagsNeeded}
                  onChange={handlePatientInfoChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} bag(s)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleStartSearch}
                disabled={
                  !patientInfo.patientName ||
                  !patientInfo.bloodGroup ||
                  !patientInfo.bloodBagsNeeded
                }
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Find Donors
              </button>
              <button
                onClick={() => setShowPatientModal(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donor Contact Modal */}
      {showDonorModal && currentDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-6 text-center">
              Donor Information
            </h2>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {currentDonor.fullName?.charAt(0) || "U"}
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {currentDonor.fullName || "No Name"}
              </h3>
              <p className="text-lg text-red-600 font-semibold">
                {currentDonor.bloodGroup || "No Group"}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-3 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <span className="font-semibold">
                  {currentDonor.phone || "No phone number"}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-3 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>{currentDonor.email || "No email"}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-3 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span className="font-semibold">
                  {getLocationText(currentDonor)}
                </span>
              </div>

              {currentDonor.distance && (
                <div className="flex items-center text-blue-600 font-semibold">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Distance from you: {currentDonor.distance} km</span>
                </div>
              )}

              {currentDonor.lastDonation && (
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-3 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>
                    Last Donation:{" "}
                    {new Date(currentDonor.lastDonation).toLocaleDateString(
                      "en-US"
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {selectedDonors.find((d) => d._id === currentDonor._id) ? (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold">
                    ✅ This donor is already selected
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectDonor(currentDonor)}
                  disabled={
                    selectedDonors.length >= patientInfo.bloodBagsNeeded
                  }
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    selectedDonors.length >= patientInfo.bloodBagsNeeded
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {selectedDonors.length >= patientInfo.bloodBagsNeeded
                    ? `Maximum ${patientInfo.bloodBagsNeeded} donors selected`
                    : "Select This Donor"}
                </button>
              )}

              <a
                href={`tel:${currentDonor.phone}`}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
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
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                Call Directly
              </a>

              {/* Google Maps Button in Modal */}
              <button
                onClick={() => {
                  const url = getGoogleMapsUrl(currentDonor);
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  ></path>
                </svg>
                View on Google Maps
              </button>

              <button
                onClick={() => setShowDonorModal(false)}
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDonorPage;
