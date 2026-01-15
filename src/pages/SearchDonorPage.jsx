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
        { id: "manikganj", name: "Manikganj", lat: 23.8667, lng: 90.0 },
        { id: "munshiganj", name: "Munshiganj", lat: 23.55, lng: 90.5333 },
        { id: "tangail", name: "Tangail", lat: 24.25, lng: 89.9167 },
        { id: "kishoreganj", name: "Kishoreganj", lat: 24.4333, lng: 90.7833 },
        { id: "faridpur", name: "Faridpur", lat: 23.6, lng: 89.8333 },
        { id: "rajbari", name: "Rajbari", lat: 23.75, lng: 89.65 },
        { id: "gopalganj", name: "Gopalganj", lat: 23.0167, lng: 89.8167 },
        { id: "madaripur", name: "Madaripur", lat: 23.1667, lng: 90.1833 },
        { id: "shariatpur", name: "Shariatpur", lat: 23.2, lng: 90.35 },
      ],
      chattogram: [
        { id: "chattogram", name: "Chattogram", lat: 22.3569, lng: 91.7832 },
        { id: "coxsbazar", name: "Coxsbazar", lat: 21.4272, lng: 92.005 },
        { id: "rangamati", name: "Rangamati", lat: 22.6333, lng: 92.2 },
        { id: "bandarban", name: "Bandarban", lat: 22.1953, lng: 92.2184 },
        { id: "khagrachari", name: "Khagrachari", lat: 23.1, lng: 91.9833 },
        { id: "feni", name: "Feni", lat: 23.0159, lng: 91.3976 },
        { id: "lakshmipur", name: "Lakshmipur", lat: 22.9458, lng: 90.8283 },
        { id: "noakhali", name: "Noakhali", lat: 22.8667, lng: 91.1 },
        { id: "chandpur", name: "Chandpur", lat: 23.2333, lng: 90.65 },
        { id: "brahmanbaria", name: "Brahmanbaria", lat: 23.9667, lng: 91.1 },
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
        { id: "narail", name: "Narail", lat: 23.1667, lng: 89.5 },
        { id: "kushtia", name: "Kushtia", lat: 23.9, lng: 89.1333 },
        { id: "meherpur", name: "Meherpur", lat: 23.7667, lng: 88.6333 },
        { id: "chuadanga", name: "Chuadanga", lat: 23.6333, lng: 88.8333 },
      ],
      barishal: [
        { id: "barishal", name: "Barishal", lat: 22.701, lng: 90.3535 },
        { id: "bhola", name: "Bhola", lat: 22.6833, lng: 90.65 },
        { id: "patuakhali", name: "Patuakhali", lat: 22.35, lng: 90.3167 },
        { id: "barguna", name: "Barguna", lat: 22.15, lng: 90.1167 },
        { id: "jhalokati", name: "Jhalokati", lat: 22.6333, lng: 90.2 },
        { id: "pirojpur", name: "Pirojpur", lat: 22.5833, lng: 89.9667 },
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
        { id: "netrokona", name: "Netrokona", lat: 24.8833, lng: 90.7333 },
        { id: "sherpur", name: "Sherpur", lat: 25.02, lng: 90.01 },
      ],
    },

    upazilas: {
      dhaka: [
        { id: "dhaka_sadar", name: "Dhaka Sadar", lat: 23.7603, lng: 90.3625 },
        { id: "dhamrai", name: "Dhamrai", lat: 23.8103, lng: 90.3625 },
        { id: "dohar", name: "Dohar", lat: 23.8603, lng: 90.3625 },
        { id: "keraniganj", name: "Keraniganj", lat: 23.7603, lng: 90.4125 },
        { id: "nawabganj", name: "Nawabganj", lat: 23.8103, lng: 90.4125 },
        { id: "savar", name: "Savar", lat: 23.8603, lng: 90.4125 },
        { id: "dhanmondi", name: "Dhanmondi", lat: 23.7603, lng: 90.4625 },
        { id: "gulshan", name: "Gulshan", lat: 23.8103, lng: 90.4625 },
        { id: "mirpur", name: "Mirpur", lat: 23.8603, lng: 90.4625 },
        { id: "uttara", name: "Uttara", lat: 23.7603, lng: 90.3625 },
        { id: "motijheel", name: "Motijheel", lat: 23.8103, lng: 90.3625 },
        { id: "mohammadpur", name: "Mohammadpur", lat: 23.8603, lng: 90.3625 },
        { id: "badda", name: "Badda", lat: 23.7603, lng: 90.4125 },
        { id: "khilgaon", name: "Khilgaon", lat: 23.8103, lng: 90.4125 },
      ],
      gazipur: [
        {
          id: "gazipur_sadar",
          name: "Gazipur Sadar",
          lat: 23.9499,
          lng: 90.3703,
        },
        { id: "kaliakair", name: "Kaliakair", lat: 23.9999, lng: 90.3703 },
        { id: "kapasia", name: "Kapasia", lat: 24.0499, lng: 90.3703 },
        { id: "sreepur", name: "Sreepur", lat: 23.9499, lng: 90.4203 },
        { id: "tongi", name: "Tongi", lat: 23.9999, lng: 90.4203 },
      ],
      narayanganj: [
        {
          id: "narayanganj_sadar",
          name: "Narayanganj Sadar",
          lat: 23.5833,
          lng: 90.45,
        },
        { id: "sonargaon", name: "Sonargaon", lat: 23.6333, lng: 90.45 },
        { id: "bandar", name: "Bandar", lat: 23.6833, lng: 90.45 },
        { id: "araihazar", name: "Araihazar", lat: 23.5833, lng: 90.5 },
        { id: "rupganj", name: "Rupganj", lat: 23.6333, lng: 90.5 },
      ],
      narsingdi: [
        {
          id: "narsingdi_sadar",
          name: "Narsingdi Sadar",
          lat: 23.8667,
          lng: 90.6667,
        },
        { id: "belabo", name: "Belabo", lat: 23.9167, lng: 90.6667 },
        { id: "monohardi", name: "Monohardi", lat: 23.9667, lng: 90.6667 },
        { id: "palash", name: "Palash", lat: 23.8667, lng: 90.7167 },
        { id: "raipura", name: "Raipura", lat: 23.9167, lng: 90.7167 },
        { id: "shibpur", name: "Shibpur", lat: 23.9667, lng: 90.7167 },
      ],
      manikganj: [
        {
          id: "manikganj_sadar",
          name: "Manikganj Sadar",
          lat: 23.8167,
          lng: 89.95,
        },
        { id: "singair", name: "Singair", lat: 23.8667, lng: 89.95 },
        { id: "saturia", name: "Saturia", lat: 23.9167, lng: 89.95 },
        { id: "harirampur", name: "Harirampur", lat: 23.8167, lng: 90.0 },
        { id: "ghior", name: "Ghior", lat: 23.8667, lng: 90.0 },
        { id: "shibalaya", name: "Shibalaya", lat: 23.9167, lng: 90.0 },
      ],
      munshiganj: [
        {
          id: "munshiganj_sadar",
          name: "Munshiganj Sadar",
          lat: 23.5,
          lng: 90.4833,
        },
        { id: "sreenagar", name: "Sreenagar", lat: 23.55, lng: 90.4833 },
        { id: "sirajdikhan", name: "Sirajdikhan", lat: 23.6, lng: 90.4833 },
        { id: "louhajang", name: "Louhajang", lat: 23.5, lng: 90.5333 },
        { id: "gazaria", name: "Gazaria", lat: 23.55, lng: 90.5333 },
        { id: "tongibari", name: "Tongibari", lat: 23.6, lng: 90.5333 },
      ],
      tangail: [
        { id: "tangail_sadar", name: "Tangail Sadar", lat: 24.2, lng: 89.8667 },
        { id: "basail", name: "Basail", lat: 24.25, lng: 89.8667 },
        { id: "bhuapur", name: "Bhuapur", lat: 24.3, lng: 89.8667 },
        { id: "delduar", name: "Delduar", lat: 24.2, lng: 89.9167 },
        { id: "ghatail", name: "Ghatail", lat: 24.25, lng: 89.9167 },
        { id: "kalihati", name: "Kalihati", lat: 24.3, lng: 89.9167 },
        { id: "madhupur", name: "Madhupur", lat: 24.2, lng: 89.9667 },
        { id: "mirzapur", name: "Mirzapur", lat: 24.25, lng: 89.9667 },
      ],
      kishoreganj: [
        {
          id: "kishoreganj_sadar",
          name: "Kishoreganj Sadar",
          lat: 24.3833,
          lng: 90.7333,
        },
        { id: "bajitpur", name: "Bajitpur", lat: 24.4333, lng: 90.7333 },
        { id: "bhairab", name: "Bhairab", lat: 24.4833, lng: 90.7333 },
        { id: "hossainpur", name: "Hossainpur", lat: 24.3833, lng: 90.7833 },
        { id: "itna", name: "Itna", lat: 24.4333, lng: 90.7833 },
        { id: "karimganj", name: "Karimganj", lat: 24.4833, lng: 90.7833 },
        { id: "katiadi", name: "Katiadi", lat: 24.3833, lng: 90.8333 },
        { id: "nikli", name: "Nikli", lat: 24.4333, lng: 90.8333 },
      ],
      faridpur: [
        {
          id: "faridpur_sadar",
          name: "Faridpur Sadar",
          lat: 23.55,
          lng: 89.7833,
        },
        { id: "alfadanga", name: "Alfadanga", lat: 23.6, lng: 89.7833 },
        { id: "boalmari", name: "Boalmari", lat: 23.65, lng: 89.7833 },
        { id: "madhukhali", name: "Madhukhali", lat: 23.55, lng: 89.8333 },
        { id: "bhanga", name: "Bhanga", lat: 23.6, lng: 89.8333 },
        { id: "nagarkanda", name: "Nagarkanda", lat: 23.65, lng: 89.8333 },
        { id: "sadarpur", name: "Sadarpur", lat: 23.55, lng: 89.8833 },
      ],
      rajbari: [
        { id: "rajbari_sadar", name: "Rajbari Sadar", lat: 23.7, lng: 89.6 },
        { id: "goalanda", name: "Goalanda", lat: 23.75, lng: 89.6 },
        { id: "pangsha", name: "Pangsha", lat: 23.8, lng: 89.6 },
        { id: "baliakandi", name: "Baliakandi", lat: 23.7, lng: 89.65 },
        { id: "kalukhali", name: "Kalukhali", lat: 23.75, lng: 89.65 },
      ],
      gopalganj: [
        {
          id: "gopalganj_sadar",
          name: "Gopalganj Sadar",
          lat: 22.9667,
          lng: 89.7667,
        },
        { id: "kashiani", name: "Kashiani", lat: 23.0167, lng: 89.7667 },
        { id: "tungipara", name: "Tungipara", lat: 23.0667, lng: 89.7667 },
        { id: "kotalipara", name: "Kotalipara", lat: 22.9667, lng: 89.8167 },
        { id: "muksudpur", name: "Muksudpur", lat: 23.0167, lng: 89.8167 },
      ],
      madaripur: [
        {
          id: "madaripur_sadar",
          name: "Madaripur Sadar",
          lat: 23.1167,
          lng: 90.1333,
        },
        { id: "rajoir", name: "Rajoir", lat: 23.1667, lng: 90.1333 },
        { id: "kalkini", name: "Kalkini", lat: 23.2167, lng: 90.1333 },
        { id: "shibchar", name: "Shibchar", lat: 23.1167, lng: 90.1833 },
      ],
      shariatpur: [
        {
          id: "shariatpur_sadar",
          name: "Shariatpur Sadar",
          lat: 23.15,
          lng: 90.3,
        },
        { id: "naria", name: "Naria", lat: 23.2, lng: 90.3 },
        { id: "zajira", name: "Zajira", lat: 23.25, lng: 90.3 },
        { id: "gosairhat", name: "Gosairhat", lat: 23.15, lng: 90.35 },
        { id: "bhedarganj", name: "Bhedarganj", lat: 23.2, lng: 90.35 },
        { id: "damudya", name: "Damudya", lat: 23.25, lng: 90.35 },
      ],
      chattogram: [
        {
          id: "chattogram_sadar",
          name: "Chattogram Sadar",
          lat: 22.3069,
          lng: 91.7332,
        },
        { id: "hathazari", name: "Hathazari", lat: 22.3569, lng: 91.7332 },
        { id: "patiya", name: "Patiya", lat: 22.4069, lng: 91.7332 },
        { id: "sitakunda", name: "Sitakunda", lat: 22.3069, lng: 91.7832 },
        { id: "mirsharai", name: "Mirsharai", lat: 22.3569, lng: 91.7832 },
        { id: "rangunia", name: "Rangunia", lat: 22.4069, lng: 91.7832 },
        { id: "raozan", name: "Raozan", lat: 22.3069, lng: 91.8332 },
        { id: "anwara", name: "Anwara", lat: 22.3569, lng: 91.8332 },
        { id: "boalkhali", name: "Boalkhali", lat: 22.4069, lng: 91.8332 },
      ],
      coxsbazar: [
        { id: "cox_sadar", name: "Cox Sadar", lat: 21.3772, lng: 91.955 },
        { id: "ukhiya", name: "Ukhiya", lat: 21.4272, lng: 91.955 },
        { id: "teknaf", name: "Teknaf", lat: 21.4772, lng: 91.955 },
        { id: "ramu", name: "Ramu", lat: 21.3772, lng: 92.005 },
        { id: "chakaria", name: "Chakaria", lat: 21.4272, lng: 92.005 },
        { id: "moheshkhali", name: "Moheshkhali", lat: 21.4772, lng: 92.005 },
        { id: "pekua", name: "Pekua", lat: 21.3772, lng: 92.055 },
      ],
      rangamati: [
        {
          id: "rangamati_sadar",
          name: "Rangamati Sadar",
          lat: 22.5833,
          lng: 92.15,
        },
        { id: "kawkhali", name: "Kawkhali", lat: 22.6333, lng: 92.15 },
        { id: "kaptai", name: "Kaptai", lat: 22.6833, lng: 92.15 },
        { id: "baghaichari", name: "Baghaichari", lat: 22.5833, lng: 92.2 },
        { id: "barkal", name: "Barkal", lat: 22.6333, lng: 92.2 },
        { id: "langadu", name: "Langadu", lat: 22.6833, lng: 92.2 },
        { id: "rajasthali", name: "Rajasthali", lat: 22.5833, lng: 92.25 },
      ],
      bandarban: [
        {
          id: "bandarban_sadar",
          name: "Bandarban Sadar",
          lat: 22.1453,
          lng: 92.1684,
        },
        { id: "alikadam", name: "Alikadam", lat: 22.1953, lng: 92.1684 },
        { id: "lama", name: "Lama", lat: 22.2453, lng: 92.1684 },
        {
          id: "naikhongchhari",
          name: "Naikhongchhari",
          lat: 22.1453,
          lng: 92.2184,
        },
        {
          id: "rowangchhari",
          name: "Rowangchhari",
          lat: 22.1953,
          lng: 92.2184,
        },
        { id: "ruma", name: "Ruma", lat: 22.2453, lng: 92.2184 },
        { id: "thanchi", name: "Thanchi", lat: 22.1453, lng: 92.2684 },
      ],
      khagrachari: [
        {
          id: "khagrachari_sadar",
          name: "Khagrachari Sadar",
          lat: 23.05,
          lng: 91.9333,
        },
        { id: "dighinala", name: "Dighinala", lat: 23.1, lng: 91.9333 },
        {
          id: "lakshmichhari",
          name: "Lakshmichhari",
          lat: 23.15,
          lng: 91.9333,
        },
        { id: "mahalchhari", name: "Mahalchhari", lat: 23.05, lng: 91.9833 },
        { id: "manikchhari", name: "Manikchhari", lat: 23.1, lng: 91.9833 },
        { id: "matiranga", name: "Matiranga", lat: 23.15, lng: 91.9833 },
        { id: "panchhari", name: "Panchhari", lat: 23.05, lng: 92.0333 },
        { id: "ramgarh", name: "Ramgarh", lat: 23.1, lng: 92.0333 },
      ],
      feni: [
        { id: "feni_sadar", name: "Feni Sadar", lat: 22.9659, lng: 91.3476 },
        {
          id: "chhagalnaiya",
          name: "Chhagalnaiya",
          lat: 23.0159,
          lng: 91.3476,
        },
        {
          id: "daganbhuiyan",
          name: "Daganbhuiyan",
          lat: 23.0659,
          lng: 91.3476,
        },
        { id: "fulgazi", name: "Fulgazi", lat: 22.9659, lng: 91.3976 },
        { id: "parshuram", name: "Parshuram", lat: 23.0159, lng: 91.3976 },
        { id: "sonagazi", name: "Sonagazi", lat: 23.0659, lng: 91.3976 },
      ],
      lakshmipur: [
        {
          id: "lakshmipur_sadar",
          name: "Lakshmipur Sadar",
          lat: 22.8958,
          lng: 90.7783,
        },
        { id: "raipur", name: "Raipur", lat: 22.9458, lng: 90.7783 },
        { id: "ramganj", name: "Ramganj", lat: 22.9958, lng: 90.7783 },
        { id: "ramgati", name: "Ramgati", lat: 22.8958, lng: 90.8283 },
        { id: "kamalnagar", name: "Kamalnagar", lat: 22.9458, lng: 90.8283 },
      ],
      noakhali: [
        {
          id: "noakhali_sadar",
          name: "Noakhali Sadar",
          lat: 22.8167,
          lng: 91.05,
        },
        { id: "begumganj", name: "Begumganj", lat: 22.8667, lng: 91.05 },
        { id: "chatkhil", name: "Chatkhil", lat: 22.9167, lng: 91.05 },
        {
          id: "companiganj_noakhali",
          name: "Companiganj Noakhali",
          lat: 22.8167,
          lng: 91.1,
        },
        { id: "hatiya", name: "Hatiya", lat: 22.8667, lng: 91.1 },
        { id: "kabirhat", name: "Kabirhat", lat: 22.9167, lng: 91.1 },
        { id: "senbagh", name: "Senbagh", lat: 22.8167, lng: 91.15 },
        { id: "sonaimuri", name: "Sonaimuri", lat: 22.8667, lng: 91.15 },
      ],
      chandpur: [
        {
          id: "chandpur_sadar",
          name: "Chandpur Sadar",
          lat: 23.1833,
          lng: 90.6,
        },
        { id: "faridganj", name: "Faridganj", lat: 23.2333, lng: 90.6 },
        { id: "haimchar", name: "Haimchar", lat: 23.2833, lng: 90.6 },
        { id: "hajiganj", name: "Hajiganj", lat: 23.1833, lng: 90.65 },
        { id: "kachua", name: "Kachua", lat: 23.2333, lng: 90.65 },
        {
          id: "matlab_dakshin",
          name: "Matlab Dakshin",
          lat: 23.2833,
          lng: 90.65,
        },
        { id: "shahrasti", name: "Shahrasti", lat: 23.1833, lng: 90.7 },
      ],
      brahmanbaria: [
        {
          id: "brahmanbaria_sadar",
          name: "Brahmanbaria Sadar",
          lat: 23.9167,
          lng: 91.05,
        },
        { id: "akhaura", name: "Akhaura", lat: 23.9667, lng: 91.05 },
        { id: "ashuganj", name: "Ashuganj", lat: 24.0167, lng: 91.05 },
        { id: "bancharampur", name: "Bancharampur", lat: 23.9167, lng: 91.1 },
        { id: "kasba", name: "Kasba", lat: 23.9667, lng: 91.1 },
        { id: "nabinagar", name: "Nabinagar", lat: 24.0167, lng: 91.1 },
        { id: "nasirnagar", name: "Nasirnagar", lat: 23.9167, lng: 91.15 },
        { id: "sarail", name: "Sarail", lat: 23.9667, lng: 91.15 },
      ],
      comilla: [
        {
          id: "comilla_sadar",
          name: "Comilla Sadar",
          lat: 23.4167,
          lng: 91.1333,
        },
        { id: "barura", name: "Barura", lat: 23.4667, lng: 91.1333 },
        { id: "brahmanpara", name: "Brahmanpara", lat: 23.5167, lng: 91.1333 },
        { id: "burichang", name: "Burichang", lat: 23.4167, lng: 91.1833 },
        { id: "chandina", name: "Chandina", lat: 23.4667, lng: 91.1833 },
        { id: "chauddagram", name: "Chauddagram", lat: 23.5167, lng: 91.1833 },
        { id: "daudkandi", name: "Daudkandi", lat: 23.4167, lng: 91.2333 },
        { id: "debidwar", name: "Debidwar", lat: 23.4667, lng: 91.2333 },
        { id: "homna", name: "Homna", lat: 23.5167, lng: 91.2333 },
        { id: "laksam", name: "Laksam", lat: 23.4167, lng: 91.1333 },
      ],
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar", lat: 24.841, lng: 91.821 },
        { id: "beanibazar", name: "Beanibazar", lat: 24.891, lng: 91.821 },
        { id: "golapganj", name: "Golapganj", lat: 24.941, lng: 91.821 },
        { id: "kanaighat", name: "Kanaighat", lat: 24.841, lng: 91.871 },
        { id: "bishwanath", name: "Bishwanath", lat: 24.891, lng: 91.871 },
        { id: "fenchuganj", name: "Fenchuganj", lat: 24.941, lng: 91.871 },
        { id: "gowainghat", name: "Gowainghat", lat: 24.841, lng: 91.921 },
        { id: "jaintiapur", name: "Jaintiapur", lat: 24.891, lng: 91.921 },
        { id: "zakiganj", name: "Zakiganj", lat: 24.941, lng: 91.921 },
        { id: "balaganj", name: "Balaganj", lat: 24.841, lng: 91.821 },
        { id: "osmaninagar", name: "Osmaninagar", lat: 24.891, lng: 91.821 },
        {
          id: "companiganj_sylhet",
          name: "Companiganj Sylhet",
          lat: 24.941,
          lng: 91.821,
        },
      ],
      moulvibazar: [
        {
          id: "moulvibazar_sadar",
          name: "Moulvibazar Sadar",
          lat: 24.4333,
          lng: 91.7167,
        },
        { id: "kamalganj", name: "Kamalganj", lat: 24.4833, lng: 91.7167 },
        { id: "kulaura", name: "Kulaura", lat: 24.5333, lng: 91.7167 },
        { id: "rajnagar", name: "Rajnagar", lat: 24.4333, lng: 91.7667 },
        { id: "sreemangal", name: "Sreemangal", lat: 24.4833, lng: 91.7667 },
        { id: "juri", name: "Juri", lat: 24.5333, lng: 91.7667 },
        { id: "barlekha", name: "Barlekha", lat: 24.4333, lng: 91.8167 },
      ],
      habiganj: [
        {
          id: "habiganj_sadar",
          name: "Habiganj Sadar",
          lat: 24.3247,
          lng: 91.365,
        },
        { id: "bahubal", name: "Bahubal", lat: 24.3747, lng: 91.365 },
        { id: "chunarughat", name: "Chunarughat", lat: 24.4247, lng: 91.365 },
        { id: "madhabpur", name: "Madhabpur", lat: 24.3247, lng: 91.415 },
        { id: "nabiganj", name: "Nabiganj", lat: 24.3747, lng: 91.415 },
        { id: "lakhai", name: "Lakhai", lat: 24.4247, lng: 91.415 },
        { id: "ajmiriganj", name: "Ajmiriganj", lat: 24.3247, lng: 91.465 },
        { id: "baniachong", name: "Baniachong", lat: 24.3747, lng: 91.465 },
      ],
      sunamganj: [
        {
          id: "sunamganj_sadar",
          name: "Sunamganj Sadar",
          lat: 25.0167,
          lng: 91.35,
        },
        { id: "chhatak", name: "Chhatak", lat: 25.0667, lng: 91.35 },
        { id: "derai", name: "Derai", lat: 25.1167, lng: 91.35 },
        { id: "dharamapasha", name: "Dharamapasha", lat: 25.0167, lng: 91.4 },
        { id: "bishwambarpur", name: "Bishwambarpur", lat: 25.0667, lng: 91.4 },
        { id: "dowarabazar", name: "Dowarabazar", lat: 25.1167, lng: 91.4 },
        { id: "jagannathpur", name: "Jagannathpur", lat: 25.0167, lng: 91.45 },
        { id: "jamalganj", name: "Jamalganj", lat: 25.0667, lng: 91.45 },
        { id: "sulla", name: "Sulla", lat: 25.1167, lng: 91.45 },
        { id: "shanthiganj", name: "Shanthiganj", lat: 25.0167, lng: 91.35 },
        { id: "tahirpur", name: "Tahirpur", lat: 25.0667, lng: 91.35 },
      ],
      rajshahi: [
        {
          id: "rajshahi_sadar",
          name: "Rajshahi Sadar",
          lat: 24.3245,
          lng: 88.5542,
        },
        { id: "paba", name: "Paba", lat: 24.3745, lng: 88.5542 },
        { id: "durgapur", name: "Durgapur", lat: 24.4245, lng: 88.5542 },
        { id: "mohanpur", name: "Mohanpur", lat: 24.3245, lng: 88.6042 },
        { id: "charghat", name: "Charghat", lat: 24.3745, lng: 88.6042 },
        { id: "puthia", name: "Puthia", lat: 24.4245, lng: 88.6042 },
        { id: "bagha", name: "Bagha", lat: 24.3245, lng: 88.6542 },
        { id: "godagari", name: "Godagari", lat: 24.3745, lng: 88.6542 },
        { id: "tanore", name: "Tanore", lat: 24.4245, lng: 88.6542 },
      ],
      natore: [
        {
          id: "natore_sadar",
          name: "Natore Sadar",
          lat: 24.3667,
          lng: 88.9167,
        },
        { id: "bagatipara", name: "Bagatipara", lat: 24.4167, lng: 88.9167 },
        { id: "baraigram", name: "Baraigram", lat: 24.4667, lng: 88.9167 },
        { id: "gurudaspur", name: "Gurudaspur", lat: 24.3667, lng: 88.9667 },
        { id: "lalpur", name: "Lalpur", lat: 24.4167, lng: 88.9667 },
        { id: "singra", name: "Singra", lat: 24.4667, lng: 88.9667 },
      ],
      naogaon: [
        {
          id: "naogaon_sadar",
          name: "Naogaon Sadar",
          lat: 24.75,
          lng: 88.8833,
        },
        { id: "atrai", name: "Atrai", lat: 24.8, lng: 88.8833 },
        { id: "badalgachhi", name: "Badalgachhi", lat: 24.85, lng: 88.8833 },
        { id: "dhamoirhat", name: "Dhamoirhat", lat: 24.75, lng: 88.9333 },
        { id: "manda", name: "Manda", lat: 24.8, lng: 88.9333 },
        { id: "mohadevpur", name: "Mohadevpur", lat: 24.85, lng: 88.9333 },
        { id: "niamatpur", name: "Niamatpur", lat: 24.75, lng: 88.9833 },
        { id: "patnitala", name: "Patnitala", lat: 24.8, lng: 88.9833 },
        { id: "porsha", name: "Porsha", lat: 24.85, lng: 88.9833 },
        { id: "raninagar", name: "Raninagar", lat: 24.75, lng: 88.8833 },
        { id: "sapahar", name: "Sapahar", lat: 24.8, lng: 88.8833 },
      ],
      chapainawabganj: [
        {
          id: "chapainawabganj_sadar",
          name: "Chapainawabganj Sadar",
          lat: 24.55,
          lng: 88.2167,
        },
        { id: "bholahat", name: "Bholahat", lat: 24.6, lng: 88.2167 },
        { id: "gomastapur", name: "Gomastapur", lat: 24.65, lng: 88.2167 },
        { id: "nachole", name: "Nachole", lat: 24.55, lng: 88.2667 },
        {
          id: "shibganj_chapai",
          name: "Shibganj Chapai",
          lat: 24.6,
          lng: 88.2667,
        },
      ],
      pabna: [
        { id: "pabna_sadar", name: "Pabna Sadar", lat: 23.95, lng: 89.2 },
        { id: "atgharia", name: "Atgharia", lat: 24.0, lng: 89.2 },
        { id: "bera", name: "Bera", lat: 24.05, lng: 89.2 },
        { id: "bhangura", name: "Bhangura", lat: 23.95, lng: 89.25 },
        { id: "chatmohar", name: "Chatmohar", lat: 24.0, lng: 89.25 },
        { id: "ishwardi", name: "Ishwardi", lat: 24.05, lng: 89.25 },
        { id: "santhia", name: "Santhia", lat: 23.95, lng: 89.3 },
        { id: "sujanagar", name: "Sujanagar", lat: 24.0, lng: 89.3 },
      ],
      sirajganj: [
        {
          id: "sirajganj_sadar",
          name: "Sirajganj Sadar",
          lat: 24.4,
          lng: 89.6667,
        },
        { id: "belkuchi", name: "Belkuchi", lat: 24.45, lng: 89.6667 },
        { id: "chauhali", name: "Chauhali", lat: 24.5, lng: 89.6667 },
        { id: "kamarkhanda", name: "Kamarkhanda", lat: 24.4, lng: 89.7167 },
        { id: "kazipur", name: "Kazipur", lat: 24.45, lng: 89.7167 },
        { id: "raiganj", name: "Raiganj", lat: 24.5, lng: 89.7167 },
        { id: "shahjadpur", name: "Shahjadpur", lat: 24.4, lng: 89.7667 },
        { id: "tarash", name: "Tarash", lat: 24.45, lng: 89.7667 },
        { id: "ullahpara", name: "Ullahpara", lat: 24.5, lng: 89.7667 },
      ],
      bogra: [
        { id: "bogra_sadar", name: "Bogra Sadar", lat: 24.8, lng: 89.3167 },
        { id: "adamdighi", name: "Adamdighi", lat: 24.85, lng: 89.3167 },
        { id: "dhunat", name: "Dhunat", lat: 24.9, lng: 89.3167 },
        { id: "dhupchanchia", name: "Dhupchanchia", lat: 24.8, lng: 89.3667 },
        { id: "gabtali", name: "Gabtali", lat: 24.85, lng: 89.3667 },
        { id: "kahaloo", name: "Kahaloo", lat: 24.9, lng: 89.3667 },
        { id: "sariakandi", name: "Sariakandi", lat: 24.8, lng: 89.4167 },
        {
          id: "shibganj_bogra",
          name: "Shibganj Bogra",
          lat: 24.85,
          lng: 89.4167,
        },
        { id: "sonatala", name: "Sonatala", lat: 24.9, lng: 89.4167 },
      ],
      joypurhat: [
        {
          id: "joypurhat_sadar",
          name: "Joypurhat Sadar",
          lat: 25.05,
          lng: 88.9667,
        },
        { id: "akkelpur", name: "Akkelpur", lat: 25.1, lng: 88.9667 },
        { id: "kalai", name: "Kalai", lat: 25.15, lng: 88.9667 },
        { id: "khetlal", name: "Khetlal", lat: 25.05, lng: 89.0167 },
        { id: "panchbibi", name: "Panchbibi", lat: 25.1, lng: 89.0167 },
      ],
      khulna: [
        {
          id: "khulna_sadar",
          name: "Khulna Sadar",
          lat: 22.7956,
          lng: 89.4903,
        },
        { id: "batiaghata", name: "Batiaghata", lat: 22.8456, lng: 89.4903 },
        { id: "dacope", name: "Dacope", lat: 22.8956, lng: 89.4903 },
        {
          id: "daulatpur_khulna",
          name: "Daulatpur Khulna",
          lat: 22.7956,
          lng: 89.5403,
        },
        { id: "dighalia", name: "Dighalia", lat: 22.8456, lng: 89.5403 },
        { id: "dumuria", name: "Dumuria", lat: 22.8956, lng: 89.5403 },
        { id: "paikgachha", name: "Paikgachha", lat: 22.7956, lng: 89.5903 },
        { id: "phultala", name: "Phultala", lat: 22.8456, lng: 89.5903 },
        { id: "rupsa", name: "Rupsa", lat: 22.8956, lng: 89.5903 },
        { id: "terokhada", name: "Terokhada", lat: 22.7956, lng: 89.4903 },
      ],
      bagerhat: [
        {
          id: "bagerhat_sadar",
          name: "Bagerhat Sadar",
          lat: 22.6167,
          lng: 89.7333,
        },
        { id: "chitalmari", name: "Chitalmari", lat: 22.6667, lng: 89.7333 },
        { id: "fakirhat", name: "Fakirhat", lat: 22.7167, lng: 89.7333 },
        {
          id: "kachua_bagerhat",
          name: "Kachua Bagerhat",
          lat: 22.6167,
          lng: 89.7833,
        },
        { id: "mollahat", name: "Mollahat", lat: 22.6667, lng: 89.7833 },
        { id: "mongla", name: "Mongla", lat: 22.7167, lng: 89.7833 },
        { id: "morrelganj", name: "Morrelganj", lat: 22.6167, lng: 89.8333 },
        { id: "rampal", name: "Rampal", lat: 22.6667, lng: 89.8333 },
        { id: "sarankhola", name: "Sarankhola", lat: 22.7167, lng: 89.8333 },
      ],
      satkhira: [
        {
          id: "satkhira_sadar",
          name: "Satkhira Sadar",
          lat: 22.6667,
          lng: 89.0167,
        },
        { id: "assasuni", name: "Assasuni", lat: 22.7167, lng: 89.0167 },
        { id: "debhata", name: "Debhata", lat: 22.7667, lng: 89.0167 },
        { id: "kalaroa", name: "Kalaroa", lat: 22.6667, lng: 89.0667 },
        {
          id: "kaliganj_satkhira",
          name: "Kaliganj Satkhira",
          lat: 22.7167,
          lng: 89.0667,
        },
        { id: "shyamnagar", name: "Shyamnagar", lat: 22.7667, lng: 89.0667 },
        { id: "tala", name: "Tala", lat: 22.6667, lng: 89.1167 },
      ],
      jessore: [
        {
          id: "jessore_sadar",
          name: "Jessore Sadar",
          lat: 23.1167,
          lng: 89.1667,
        },
        { id: "abhaynagar", name: "Abhaynagar", lat: 23.1667, lng: 89.1667 },
        { id: "bagherpara", name: "Bagherpara", lat: 23.2167, lng: 89.1667 },
        { id: "chougachha", name: "Chougachha", lat: 23.1167, lng: 89.2167 },
        {
          id: "jhikargachha",
          name: "Jhikargachha",
          lat: 23.1667,
          lng: 89.2167,
        },
        { id: "keshabpur", name: "Keshabpur", lat: 23.2167, lng: 89.2167 },
        { id: "manirampur", name: "Manirampur", lat: 23.1167, lng: 89.2667 },
        { id: "sharsha", name: "Sharsha", lat: 23.1667, lng: 89.2667 },
      ],
      jhenaidah: [
        {
          id: "jhenaidah_sadar",
          name: "Jhenaidah Sadar",
          lat: 23.4833,
          lng: 88.9667,
        },
        { id: "harinakunda", name: "Harinakunda", lat: 23.5333, lng: 88.9667 },
        {
          id: "kaliganj_jhenaidah",
          name: "Kaliganj Jhenaidah",
          lat: 23.5833,
          lng: 88.9667,
        },
        { id: "kotchandpur", name: "Kotchandpur", lat: 23.4833, lng: 89.0167 },
        { id: "maheshpur", name: "Maheshpur", lat: 23.5333, lng: 89.0167 },
        { id: "shailkupa", name: "Shailkupa", lat: 23.5833, lng: 89.0167 },
      ],
      magura: [
        {
          id: "magura_sadar",
          name: "Magura Sadar",
          lat: 23.4333,
          lng: 89.3667,
        },
        {
          id: "mohammadpur_magura",
          name: "Mohammadpur Magura",
          lat: 23.4833,
          lng: 89.3667,
        },
        { id: "shalikha", name: "Shalikha", lat: 23.5333, lng: 89.3667 },
        {
          id: "sreepur_magura",
          name: "Sreepur Magura",
          lat: 23.4333,
          lng: 89.4167,
        },
      ],
      narail: [
        { id: "narail_sadar", name: "Narail Sadar", lat: 23.1167, lng: 89.45 },
        { id: "kalia", name: "Kalia", lat: 23.1667, lng: 89.45 },
        {
          id: "lohagara_narail",
          name: "Lohagara Narail",
          lat: 23.2167,
          lng: 89.45,
        },
      ],
      kushtia: [
        {
          id: "kushtia_sadar",
          name: "Kushtia Sadar",
          lat: 23.85,
          lng: 89.0833,
        },
        { id: "bheramara", name: "Bheramara", lat: 23.9, lng: 89.0833 },
        {
          id: "daulatpur_kushtia",
          name: "Daulatpur Kushtia",
          lat: 23.95,
          lng: 89.0833,
        },
        { id: "khoksa", name: "Khoksa", lat: 23.85, lng: 89.1333 },
        { id: "kumarkhali", name: "Kumarkhali", lat: 23.9, lng: 89.1333 },
        {
          id: "mirpur_kushtia",
          name: "Mirpur Kushtia",
          lat: 23.95,
          lng: 89.1333,
        },
      ],
      meherpur: [
        {
          id: "meherpur_sadar",
          name: "Meherpur Sadar",
          lat: 23.7167,
          lng: 88.5833,
        },
        { id: "gangni", name: "Gangni", lat: 23.7667, lng: 88.5833 },
        { id: "mujibnagar", name: "Mujibnagar", lat: 23.8167, lng: 88.5833 },
      ],
      chuadanga: [
        {
          id: "chuadanga_sadar",
          name: "Chuadanga Sadar",
          lat: 23.5833,
          lng: 88.7833,
        },
        { id: "alamdanga", name: "Alamdanga", lat: 23.6333, lng: 88.7833 },
        { id: "damurhuda", name: "Damurhuda", lat: 23.6833, lng: 88.7833 },
        { id: "jibannagar", name: "Jibannagar", lat: 23.5833, lng: 88.8333 },
      ],
      barishal: [
        {
          id: "barishal_sadar",
          name: "Barishal Sadar",
          lat: 22.651,
          lng: 90.3035,
        },
        { id: "agailjhara", name: "Agailjhara", lat: 22.701, lng: 90.3035 },
        { id: "babuganj", name: "Babuganj", lat: 22.751, lng: 90.3035 },
        { id: "bakerganj", name: "Bakerganj", lat: 22.651, lng: 90.3535 },
        { id: "banaripara", name: "Banaripara", lat: 22.701, lng: 90.3535 },
        { id: "gaurnadi", name: "Gaurnadi", lat: 22.751, lng: 90.3535 },
        { id: "hizla", name: "Hizla", lat: 22.651, lng: 90.4035 },
        { id: "mehendiganj", name: "Mehendiganj", lat: 22.701, lng: 90.4035 },
        { id: "muladi", name: "Muladi", lat: 22.751, lng: 90.4035 },
        { id: "wazirpur", name: "Wazirpur", lat: 22.651, lng: 90.3035 },
      ],
      bhola: [
        { id: "bhola_sadar", name: "Bhola Sadar", lat: 22.6333, lng: 90.6 },
        { id: "burhanuddin", name: "Burhanuddin", lat: 22.6833, lng: 90.6 },
        { id: "char_fasson", name: "Char Fasson", lat: 22.7333, lng: 90.6 },
        { id: "daulatkhan", name: "Daulatkhan", lat: 22.6333, lng: 90.65 },
        { id: "lalmohan", name: "Lalmohan", lat: 22.6833, lng: 90.65 },
        { id: "manpura", name: "Manpura", lat: 22.7333, lng: 90.65 },
        { id: "tazumuddin", name: "Tazumuddin", lat: 22.6333, lng: 90.7 },
      ],
      patuakhali: [
        {
          id: "patuakhali_sadar",
          name: "Patuakhali Sadar",
          lat: 22.3,
          lng: 90.2667,
        },
        { id: "bauphal", name: "Bauphal", lat: 22.35, lng: 90.2667 },
        { id: "dashmina", name: "Dashmina", lat: 22.4, lng: 90.2667 },
        { id: "dumki", name: "Dumki", lat: 22.3, lng: 90.3167 },
        { id: "galachipa", name: "Galachipa", lat: 22.35, lng: 90.3167 },
        { id: "kalapara", name: "Kalapara", lat: 22.4, lng: 90.3167 },
        { id: "mirzaganj", name: "Mirzaganj", lat: 22.3, lng: 90.3667 },
        { id: "rangabali", name: "Rangabali", lat: 22.35, lng: 90.3667 },
      ],
      barguna: [
        { id: "barguna_sadar", name: "Barguna Sadar", lat: 22.1, lng: 90.0667 },
        { id: "amtali", name: "Amtali", lat: 22.15, lng: 90.0667 },
        { id: "bamna", name: "Bamna", lat: 22.2, lng: 90.0667 },
        { id: "betagi", name: "Betagi", lat: 22.1, lng: 90.1167 },
        { id: "patharghata", name: "Patharghata", lat: 22.15, lng: 90.1167 },
        { id: "taltali", name: "Taltali", lat: 22.2, lng: 90.1167 },
      ],
      jhalokati: [
        {
          id: "jhalokati_sadar",
          name: "Jhalokati Sadar",
          lat: 22.5833,
          lng: 90.15,
        },
        { id: "kathalia", name: "Kathalia", lat: 22.6333, lng: 90.15 },
        { id: "nalchity", name: "Nalchity", lat: 22.6833, lng: 90.15 },
        { id: "rajapur", name: "Rajapur", lat: 22.5833, lng: 90.2 },
      ],
      pirojpur: [
        {
          id: "pirojpur_sadar",
          name: "Pirojpur Sadar",
          lat: 22.5333,
          lng: 89.9167,
        },
        { id: "bhandaria", name: "Bhandaria", lat: 22.5833, lng: 89.9167 },
        {
          id: "kawkhali_pirojpur",
          name: "Kawkhali Pirojpur",
          lat: 22.6333,
          lng: 89.9167,
        },
        { id: "mathbaria", name: "Mathbaria", lat: 22.5333, lng: 89.9667 },
        { id: "nazirpur", name: "Nazirpur", lat: 22.5833, lng: 89.9667 },
        { id: "nesarabad", name: "Nesarabad", lat: 22.6333, lng: 89.9667 },
      ],
      rangpur: [
        {
          id: "rangpur_sadar",
          name: "Rangpur Sadar",
          lat: 25.6939,
          lng: 89.2252,
        },
        { id: "badarganj", name: "Badarganj", lat: 25.7439, lng: 89.2252 },
        { id: "gangachara", name: "Gangachara", lat: 25.7939, lng: 89.2252 },
        { id: "kaunia", name: "Kaunia", lat: 25.6939, lng: 89.2752 },
        { id: "mithapukur", name: "Mithapukur", lat: 25.7439, lng: 89.2752 },
        { id: "pirgachha", name: "Pirgachha", lat: 25.7939, lng: 89.2752 },
        { id: "pirganj", name: "Pirganj", lat: 25.6939, lng: 89.3252 },
        { id: "taraganj", name: "Taraganj", lat: 25.7439, lng: 89.3252 },
      ],
      dinajpur: [
        {
          id: "dinajpur_sadar",
          name: "Dinajpur Sadar",
          lat: 25.5833,
          lng: 88.5833,
        },
        { id: "birampur", name: "Birampur", lat: 25.6333, lng: 88.5833 },
        { id: "birganj", name: "Birganj", lat: 25.6833, lng: 88.5833 },
        { id: "biral", name: "Biral", lat: 25.5833, lng: 88.6333 },
        { id: "bochaganj", name: "Bochaganj", lat: 25.6333, lng: 88.6333 },
        {
          id: "chirirbandar",
          name: "Chirirbandar",
          lat: 25.6833,
          lng: 88.6333,
        },
        {
          id: "fulbari_dinajpur",
          name: "Fulbari Dinajpur",
          lat: 25.5833,
          lng: 88.6833,
        },
        { id: "ghoraghat", name: "Ghoraghat", lat: 25.6333, lng: 88.6833 },
        { id: "hakimpur", name: "Hakimpur", lat: 25.6833, lng: 88.6833 },
        { id: "kaharole", name: "Kaharole", lat: 25.5833, lng: 88.5833 },
        { id: "khansama", name: "Khansama", lat: 25.6333, lng: 88.5833 },
        { id: "parbatipur", name: "Parbatipur", lat: 25.6833, lng: 88.5833 },
      ],
      gaibandha: [
        {
          id: "gaibandha_sadar",
          name: "Gaibandha Sadar",
          lat: 25.278,
          lng: 89.5,
        },
        { id: "fulchhari", name: "Fulchhari", lat: 25.328, lng: 89.5 },
        { id: "gobindaganj", name: "Gobindaganj", lat: 25.378, lng: 89.5 },
        { id: "palashbari", name: "Palashbari", lat: 25.278, lng: 89.55 },
        { id: "sadullapur", name: "Sadullapur", lat: 25.328, lng: 89.55 },
        { id: "saghata", name: "Saghata", lat: 25.378, lng: 89.55 },
        { id: "sundarganj", name: "Sundarganj", lat: 25.278, lng: 89.6 },
      ],
      kurigram: [
        {
          id: "kurigram_sadar",
          name: "Kurigram Sadar",
          lat: 25.7554,
          lng: 89.5862,
        },
        {
          id: "bhurungamari",
          name: "Bhurungamari",
          lat: 25.8054,
          lng: 89.5862,
        },
        {
          id: "char_rajibpur",
          name: "Char Rajibpur",
          lat: 25.8554,
          lng: 89.5862,
        },
        { id: "chilmari", name: "Chilmari", lat: 25.7554, lng: 89.6362 },
        { id: "nageshwari", name: "Nageshwari", lat: 25.8054, lng: 89.6362 },
        {
          id: "phulbari_kurigram",
          name: "Phulbari Kurigram",
          lat: 25.8554,
          lng: 89.6362,
        },
        { id: "rajarhat", name: "Rajarhat", lat: 25.7554, lng: 89.6862 },
        { id: "roumari", name: "Roumari", lat: 25.8054, lng: 89.6862 },
        { id: "ulipur", name: "Ulipur", lat: 25.8554, lng: 89.6862 },
      ],
      lalmonirhat: [
        {
          id: "lalmonirhat_sadar",
          name: "Lalmonirhat Sadar",
          lat: 25.8667,
          lng: 89.4,
        },
        { id: "aditmari", name: "Aditmari", lat: 25.9167, lng: 89.4 },
        { id: "hatibandha", name: "Hatibandha", lat: 25.9667, lng: 89.4 },
        {
          id: "kaliganj_lalmonirhat",
          name: "Kaliganj Lalmonirhat",
          lat: 25.8667,
          lng: 89.45,
        },
        { id: "patgram", name: "Patgram", lat: 25.9167, lng: 89.45 },
      ],
      nilphamari: [
        {
          id: "nilphamari_sadar",
          name: "Nilphamari Sadar",
          lat: 25.8833,
          lng: 88.8,
        },
        { id: "domar", name: "Domar", lat: 25.9333, lng: 88.8 },
        { id: "dimla", name: "Dimla", lat: 25.9833, lng: 88.8 },
        { id: "jaldhaka", name: "Jaldhaka", lat: 25.8833, lng: 88.85 },
        {
          id: "kishoreganj_nilphamari",
          name: "Kishoreganj Nilphamari",
          lat: 25.9333,
          lng: 88.85,
        },
        { id: "saidpur", name: "Saidpur", lat: 25.9833, lng: 88.85 },
      ],
      panchagarh: [
        {
          id: "panchagarh_sadar",
          name: "Panchagarh Sadar",
          lat: 26.2833,
          lng: 88.5,
        },
        { id: "atwari", name: "Atwari", lat: 26.3333, lng: 88.5 },
        { id: "boda", name: "Boda", lat: 26.3833, lng: 88.5 },
        { id: "debiganj", name: "Debiganj", lat: 26.2833, lng: 88.55 },
        { id: "tetulia", name: "Tetulia", lat: 26.3333, lng: 88.55 },
      ],
      thakurgaon: [
        {
          id: "thakurgaon_sadar",
          name: "Thakurgaon Sadar",
          lat: 25.9833,
          lng: 88.4167,
        },
        { id: "baliadangi", name: "Baliadangi", lat: 26.0333, lng: 88.4167 },
        { id: "haripur", name: "Haripur", lat: 26.0833, lng: 88.4167 },
        {
          id: "pirganj_thakurgaon",
          name: "Pirganj Thakurgaon",
          lat: 25.9833,
          lng: 88.4667,
        },
        { id: "ranisankail", name: "Ranisankail", lat: 26.0333, lng: 88.4667 },
      ],
      mymensingh: [
        {
          id: "mymensingh_sadar",
          name: "Mymensingh Sadar",
          lat: 24.6971,
          lng: 90.3703,
        },
        { id: "bhaluka", name: "Bhaluka", lat: 24.7471, lng: 90.3703 },
        { id: "dhobaura", name: "Dhobaura", lat: 24.7971, lng: 90.3703 },
        { id: "fulbaria", name: "Fulbaria", lat: 24.6971, lng: 90.4203 },
        { id: "gafargaon", name: "Gafargaon", lat: 24.7471, lng: 90.4203 },
        { id: "gauripur", name: "Gauripur", lat: 24.7971, lng: 90.4203 },
        { id: "haluaghat", name: "Haluaghat", lat: 24.6971, lng: 90.4703 },
        { id: "ishwarganj", name: "Ishwarganj", lat: 24.7471, lng: 90.4703 },
        { id: "muktagachha", name: "Muktagachha", lat: 24.7971, lng: 90.4703 },
        { id: "nandail", name: "Nandail", lat: 24.6971, lng: 90.3703 },
        { id: "phulpur", name: "Phulpur", lat: 24.7471, lng: 90.3703 },
        { id: "trishal", name: "Trishal", lat: 24.7971, lng: 90.3703 },
      ],
      jamalpur: [
        {
          id: "jamalpur_sadar",
          name: "Jamalpur Sadar",
          lat: 24.8875,
          lng: 89.8875,
        },
        { id: "bakshiganj", name: "Bakshiganj", lat: 24.9375, lng: 89.8875 },
        { id: "dewanganj", name: "Dewanganj", lat: 24.9875, lng: 89.8875 },
        {
          id: "islampur_jamalpur",
          name: "Islampur Jamalpur",
          lat: 24.8875,
          lng: 89.9375,
        },
        { id: "madarganj", name: "Madarganj", lat: 24.9375, lng: 89.9375 },
        { id: "melandaha", name: "Melandaha", lat: 24.9875, lng: 89.9375 },
        { id: "sarishabari", name: "Sarishabari", lat: 24.8875, lng: 89.9875 },
      ],
      netrokona: [
        {
          id: "netrokona_sadar",
          name: "Netrokona Sadar",
          lat: 24.8333,
          lng: 90.6833,
        },
        { id: "atpara", name: "Atpara", lat: 24.8833, lng: 90.6833 },
        { id: "barhatta", name: "Barhatta", lat: 24.9333, lng: 90.6833 },
        {
          id: "durgapur_netrokona",
          name: "Durgapur Netrokona",
          lat: 24.8333,
          lng: 90.7333,
        },
        { id: "kalmakanda", name: "Kalmakanda", lat: 24.8833, lng: 90.7333 },
        { id: "kendua", name: "Kendua", lat: 24.9333, lng: 90.7333 },
        { id: "khaliajuri", name: "Khaliajuri", lat: 24.8333, lng: 90.7833 },
        { id: "madan", name: "Madan", lat: 24.8833, lng: 90.7833 },
        { id: "mohanganj", name: "Mohanganj", lat: 24.9333, lng: 90.7833 },
        { id: "purbadhala", name: "Purbadhala", lat: 24.8333, lng: 90.6833 },
      ],
      sherpur: [
        { id: "sherpur_sadar", name: "Sherpur Sadar", lat: 24.97, lng: 89.96 },
        { id: "jhenaigati", name: "Jhenaigati", lat: 25.02, lng: 89.96 },
        { id: "nakla", name: "Nakla", lat: 25.07, lng: 89.96 },
        { id: "nalitabari", name: "Nalitabari", lat: 24.97, lng: 90.01 },
        { id: "sreebardi", name: "Sreebardi", lat: 25.02, lng: 90.01 },
      ],
    },

    areas: {
      dhaka_sadar: [
        {
          id: "dhaka_sadar_area_1",
          name: "Dhaka Sadar Area 1",
          lat: 23.74,
          lng: 90.343,
        },
        {
          id: "dhaka_sadar_area_2",
          name: "Dhaka Sadar Area 2",
          lat: 23.75,
          lng: 90.343,
        },
        {
          id: "dhaka_sadar_area_3",
          name: "Dhaka Sadar Area 3",
          lat: 23.76,
          lng: 90.343,
        },
        {
          id: "others_dhaka_sadar",
          name: "Others",
          lat: 23.7603,
          lng: 90.3625,
        },
      ],
      dhamrai: [
        {
          id: "dhamrai_area_1",
          name: "Dhamrai Area 1",
          lat: 23.79,
          lng: 90.343,
        },
        {
          id: "dhamrai_area_2",
          name: "Dhamrai Area 2",
          lat: 23.8,
          lng: 90.343,
        },
        {
          id: "dhamrai_area_3",
          name: "Dhamrai Area 3",
          lat: 23.81,
          lng: 90.343,
        },
        { id: "others_dhamrai", name: "Others", lat: 23.8103, lng: 90.3625 },
      ],
      dohar: [
        { id: "dohar_area_1", name: "Dohar Area 1", lat: 23.84, lng: 90.343 },
        { id: "dohar_area_2", name: "Dohar Area 2", lat: 23.85, lng: 90.343 },
        { id: "dohar_area_3", name: "Dohar Area 3", lat: 23.86, lng: 90.343 },
        { id: "others_dohar", name: "Others", lat: 23.8603, lng: 90.3625 },
      ],
      keraniganj: [
        {
          id: "keraniganj_area_1",
          name: "Keraniganj Area 1",
          lat: 23.74,
          lng: 90.392,
        },
        {
          id: "keraniganj_area_2",
          name: "Keraniganj Area 2",
          lat: 23.75,
          lng: 90.392,
        },
        {
          id: "keraniganj_area_3",
          name: "Keraniganj Area 3",
          lat: 23.76,
          lng: 90.392,
        },
        { id: "others_keraniganj", name: "Others", lat: 23.7603, lng: 90.4125 },
      ],
      nawabganj: [
        {
          id: "nawabganj_area_1",
          name: "Nawabganj Area 1",
          lat: 23.79,
          lng: 90.392,
        },
        {
          id: "nawabganj_area_2",
          name: "Nawabganj Area 2",
          lat: 23.8,
          lng: 90.392,
        },
        {
          id: "nawabganj_area_3",
          name: "Nawabganj Area 3",
          lat: 23.81,
          lng: 90.392,
        },
        { id: "others_nawabganj", name: "Others", lat: 23.8103, lng: 90.4125 },
      ],
      savar: [
        { id: "savar_area_1", name: "Savar Area 1", lat: 23.84, lng: 90.392 },
        { id: "savar_area_2", name: "Savar Area 2", lat: 23.85, lng: 90.392 },
        { id: "savar_area_3", name: "Savar Area 3", lat: 23.86, lng: 90.392 },
        { id: "others_savar", name: "Others", lat: 23.8603, lng: 90.4125 },
      ],
      dhanmondi: [
        {
          id: "dhanmondi_area_1",
          name: "Dhanmondi Area 1",
          lat: 23.74,
          lng: 90.443,
        },
        {
          id: "dhanmondi_area_2",
          name: "Dhanmondi Area 2",
          lat: 23.75,
          lng: 90.443,
        },
        {
          id: "dhanmondi_area_3",
          name: "Dhanmondi Area 3",
          lat: 23.76,
          lng: 90.443,
        },
        { id: "others_dhanmondi", name: "Others", lat: 23.7603, lng: 90.4625 },
      ],
      gulshan: [
        {
          id: "gulshan_area_1",
          name: "Gulshan Area 1",
          lat: 23.79,
          lng: 90.443,
        },
        {
          id: "gulshan_area_2",
          name: "Gulshan Area 2",
          lat: 23.8,
          lng: 90.443,
        },
        {
          id: "gulshan_area_3",
          name: "Gulshan Area 3",
          lat: 23.81,
          lng: 90.443,
        },
        { id: "others_gulshan", name: "Others", lat: 23.8103, lng: 90.4625 },
      ],
      mirpur: [
        { id: "mirpur_area_1", name: "Mirpur Area 1", lat: 23.84, lng: 90.443 },
        { id: "mirpur_area_2", name: "Mirpur Area 2", lat: 23.85, lng: 90.443 },
        { id: "mirpur_area_3", name: "Mirpur Area 3", lat: 23.86, lng: 90.443 },
        { id: "others_mirpur", name: "Others", lat: 23.8603, lng: 90.4625 },
      ],
      uttara: [
        { id: "uttara_area_1", name: "Uttara Area 1", lat: 23.74, lng: 90.343 },
        { id: "uttara_area_2", name: "Uttara Area 2", lat: 23.75, lng: 90.343 },
        { id: "uttara_area_3", name: "Uttara Area 3", lat: 23.76, lng: 90.343 },
        { id: "others_uttara", name: "Others", lat: 23.7603, lng: 90.3625 },
      ],
      motijheel: [
        {
          id: "motijheel_area_1",
          name: "Motijheel Area 1",
          lat: 23.79,
          lng: 90.343,
        },
        {
          id: "motijheel_area_2",
          name: "Motijheel Area 2",
          lat: 23.8,
          lng: 90.343,
        },
        {
          id: "motijheel_area_3",
          name: "Motijheel Area 3",
          lat: 23.81,
          lng: 90.343,
        },
        { id: "others_motijheel", name: "Others", lat: 23.8103, lng: 90.3625 },
      ],
      mohammadpur: [
        {
          id: "mohammadpur_area_1",
          name: "Mohammadpur Area 1",
          lat: 23.84,
          lng: 90.343,
        },
        {
          id: "mohammadpur_area_2",
          name: "Mohammadpur Area 2",
          lat: 23.85,
          lng: 90.343,
        },
        {
          id: "mohammadpur_area_3",
          name: "Mohammadpur Area 3",
          lat: 23.86,
          lng: 90.343,
        },
        {
          id: "others_mohammadpur",
          name: "Others",
          lat: 23.8603,
          lng: 90.3625,
        },
      ],
      badda: [
        { id: "badda_area_1", name: "Badda Area 1", lat: 23.74, lng: 90.392 },
        { id: "badda_area_2", name: "Badda Area 2", lat: 23.75, lng: 90.392 },
        { id: "badda_area_3", name: "Badda Area 3", lat: 23.76, lng: 90.392 },
        { id: "others_badda", name: "Others", lat: 23.7603, lng: 90.4125 },
      ],
      khilgaon: [
        {
          id: "khilgaon_area_1",
          name: "Khilgaon Area 1",
          lat: 23.79,
          lng: 90.392,
        },
        {
          id: "khilgaon_area_2",
          name: "Khilgaon Area 2",
          lat: 23.8,
          lng: 90.392,
        },
        {
          id: "khilgaon_area_3",
          name: "Khilgaon Area 3",
          lat: 23.81,
          lng: 90.392,
        },
        { id: "others_khilgaon", name: "Others", lat: 23.8103, lng: 90.4125 },
      ],
      gazipur_sadar: [
        {
          id: "gazipur_sadar_area_1",
          name: "Gazipur Sadar Area 1",
          lat: 23.93,
          lng: 90.35,
        },
        {
          id: "gazipur_sadar_area_2",
          name: "Gazipur Sadar Area 2",
          lat: 23.94,
          lng: 90.35,
        },
        {
          id: "gazipur_sadar_area_3",
          name: "Gazipur Sadar Area 3",
          lat: 23.95,
          lng: 90.35,
        },
        {
          id: "gazipur_sadar_area_4",
          name: "Gazipur Sadar Area 4",
          lat: 23.96,
          lng: 90.35,
        },
        {
          id: "others_gazipur_sadar",
          name: "Others",
          lat: 23.9499,
          lng: 90.3703,
        },
      ],
      kaliakair: [
        {
          id: "kaliakair_area_1",
          name: "Kaliakair Area 1",
          lat: 23.98,
          lng: 90.35,
        },
        {
          id: "kaliakair_area_2",
          name: "Kaliakair Area 2",
          lat: 23.99,
          lng: 90.35,
        },
        {
          id: "kaliakair_area_3",
          name: "Kaliakair Area 3",
          lat: 24.0,
          lng: 90.35,
        },
        {
          id: "kaliakair_area_4",
          name: "Kaliakair Area 4",
          lat: 24.01,
          lng: 90.35,
        },
        { id: "others_kaliakair", name: "Others", lat: 23.9999, lng: 90.3703 },
      ],
      kapasia: [
        {
          id: "kapasia_area_1",
          name: "Kapasia Area 1",
          lat: 24.03,
          lng: 90.35,
        },
        {
          id: "kapasia_area_2",
          name: "Kapasia Area 2",
          lat: 24.04,
          lng: 90.35,
        },
        {
          id: "kapasia_area_3",
          name: "Kapasia Area 3",
          lat: 24.05,
          lng: 90.35,
        },
        {
          id: "kapasia_area_4",
          name: "Kapasia Area 4",
          lat: 24.06,
          lng: 90.35,
        },
        { id: "others_kapasia", name: "Others", lat: 24.0499, lng: 90.3703 },
      ],
      sreepur: [
        { id: "sreepur_area_1", name: "Sreepur Area 1", lat: 23.93, lng: 90.4 },
        { id: "sreepur_area_2", name: "Sreepur Area 2", lat: 23.94, lng: 90.4 },
        { id: "sreepur_area_3", name: "Sreepur Area 3", lat: 23.95, lng: 90.4 },
        { id: "sreepur_area_4", name: "Sreepur Area 4", lat: 23.96, lng: 90.4 },
        { id: "others_sreepur", name: "Others", lat: 23.9499, lng: 90.4203 },
      ],
      tongi: [
        { id: "tongi_area_1", name: "Tongi Area 1", lat: 23.98, lng: 90.4 },
        { id: "tongi_area_2", name: "Tongi Area 2", lat: 23.99, lng: 90.4 },
        { id: "tongi_area_3", name: "Tongi Area 3", lat: 24.0, lng: 90.4 },
        { id: "tongi_area_4", name: "Tongi Area 4", lat: 24.01, lng: 90.4 },
        { id: "others_tongi", name: "Others", lat: 23.9999, lng: 90.4203 },
      ],
      narayanganj_sadar: [
        {
          id: "narayanganj_sadar_area_1",
          name: "Narayanganj Sadar Area 1",
          lat: 23.563,
          lng: 90.43,
        },
        {
          id: "narayanganj_sadar_area_2",
          name: "Narayanganj Sadar Area 2",
          lat: 23.573,
          lng: 90.43,
        },
        {
          id: "narayanganj_sadar_area_3",
          name: "Narayanganj Sadar Area 3",
          lat: 23.583,
          lng: 90.43,
        },
        {
          id: "narayanganj_sadar_area_4",
          name: "Narayanganj Sadar Area 4",
          lat: 23.593,
          lng: 90.43,
        },
        {
          id: "others_narayanganj_sadar",
          name: "Others",
          lat: 23.5833,
          lng: 90.45,
        },
      ],
      sonargaon: [
        {
          id: "sonargaon_area_1",
          name: "Sonargaon Area 1",
          lat: 23.613,
          lng: 90.43,
        },
        {
          id: "sonargaon_area_2",
          name: "Sonargaon Area 2",
          lat: 23.623,
          lng: 90.43,
        },
        {
          id: "sonargaon_area_3",
          name: "Sonargaon Area 3",
          lat: 23.633,
          lng: 90.43,
        },
        {
          id: "sonargaon_area_4",
          name: "Sonargaon Area 4",
          lat: 23.643,
          lng: 90.43,
        },
        { id: "others_sonargaon", name: "Others", lat: 23.6333, lng: 90.45 },
      ],
      bandar: [
        { id: "bandar_area_1", name: "Bandar Area 1", lat: 23.663, lng: 90.43 },
        { id: "bandar_area_2", name: "Bandar Area 2", lat: 23.673, lng: 90.43 },
        { id: "bandar_area_3", name: "Bandar Area 3", lat: 23.683, lng: 90.43 },
        { id: "bandar_area_4", name: "Bandar Area 4", lat: 23.693, lng: 90.43 },
        { id: "others_bandar", name: "Others", lat: 23.6833, lng: 90.45 },
      ],
      araihazar: [
        {
          id: "araihazar_area_1",
          name: "Araihazar Area 1",
          lat: 23.563,
          lng: 90.48,
        },
        {
          id: "araihazar_area_2",
          name: "Araihazar Area 2",
          lat: 23.573,
          lng: 90.48,
        },
        {
          id: "araihazar_area_3",
          name: "Araihazar Area 3",
          lat: 23.583,
          lng: 90.48,
        },
        {
          id: "araihazar_area_4",
          name: "Araihazar Area 4",
          lat: 23.593,
          lng: 90.48,
        },
        { id: "others_araihazar", name: "Others", lat: 23.5833, lng: 90.5 },
      ],
      rupganj: [
        {
          id: "rupganj_area_1",
          name: "Rupganj Area 1",
          lat: 23.613,
          lng: 90.48,
        },
        {
          id: "rupganj_area_2",
          name: "Rupganj Area 2",
          lat: 23.623,
          lng: 90.48,
        },
        {
          id: "rupganj_area_3",
          name: "Rupganj Area 3",
          lat: 23.633,
          lng: 90.48,
        },
        {
          id: "rupganj_area_4",
          name: "Rupganj Area 4",
          lat: 23.643,
          lng: 90.48,
        },
        { id: "others_rupganj", name: "Others", lat: 23.6333, lng: 90.5 },
      ],
      narsingdi_sadar: [
        {
          id: "narsingdi_sadar_area_1",
          name: "Narsingdi Sadar Area 1",
          lat: 23.847,
          lng: 90.647,
        },
        {
          id: "narsingdi_sadar_area_2",
          name: "Narsingdi Sadar Area 2",
          lat: 23.857,
          lng: 90.647,
        },
        {
          id: "narsingdi_sadar_area_3",
          name: "Narsingdi Sadar Area 3",
          lat: 23.867,
          lng: 90.647,
        },
        {
          id: "narsingdi_sadar_area_4",
          name: "Narsingdi Sadar Area 4",
          lat: 23.877,
          lng: 90.647,
        },
        {
          id: "others_narsingdi_sadar",
          name: "Others",
          lat: 23.8667,
          lng: 90.6667,
        },
      ],
      belabo: [
        {
          id: "belabo_area_1",
          name: "Belabo Area 1",
          lat: 23.897,
          lng: 90.647,
        },
        {
          id: "belabo_area_2",
          name: "Belabo Area 2",
          lat: 23.907,
          lng: 90.647,
        },
        {
          id: "belabo_area_3",
          name: "Belabo Area 3",
          lat: 23.917,
          lng: 90.647,
        },
        {
          id: "belabo_area_4",
          name: "Belabo Area 4",
          lat: 23.927,
          lng: 90.647,
        },
        { id: "others_belabo", name: "Others", lat: 23.9167, lng: 90.6667 },
      ],
      monohardi: [
        {
          id: "monohardi_area_1",
          name: "Monohardi Area 1",
          lat: 23.947,
          lng: 90.647,
        },
        {
          id: "monohardi_area_2",
          name: "Monohardi Area 2",
          lat: 23.957,
          lng: 90.647,
        },
        {
          id: "monohardi_area_3",
          name: "Monohardi Area 3",
          lat: 23.967,
          lng: 90.647,
        },
        {
          id: "monohardi_area_4",
          name: "Monohardi Area 4",
          lat: 23.977,
          lng: 90.647,
        },
        { id: "others_monohardi", name: "Others", lat: 23.9667, lng: 90.6667 },
      ],
      palash: [
        {
          id: "palash_area_1",
          name: "Palash Area 1",
          lat: 23.847,
          lng: 90.697,
        },
        {
          id: "palash_area_2",
          name: "Palash Area 2",
          lat: 23.857,
          lng: 90.697,
        },
        {
          id: "palash_area_3",
          name: "Palash Area 3",
          lat: 23.867,
          lng: 90.697,
        },
        {
          id: "palash_area_4",
          name: "Palash Area 4",
          lat: 23.877,
          lng: 90.697,
        },
        { id: "others_palash", name: "Others", lat: 23.8667, lng: 90.7167 },
      ],
      raipura: [
        {
          id: "raipura_area_1",
          name: "Raipura Area 1",
          lat: 23.897,
          lng: 90.697,
        },
        {
          id: "raipura_area_2",
          name: "Raipura Area 2",
          lat: 23.907,
          lng: 90.697,
        },
        {
          id: "raipura_area_3",
          name: "Raipura Area 3",
          lat: 23.917,
          lng: 90.697,
        },
        {
          id: "raipura_area_4",
          name: "Raipura Area 4",
          lat: 23.927,
          lng: 90.697,
        },
        { id: "others_raipura", name: "Others", lat: 23.9167, lng: 90.7167 },
      ],
      shibpur: [
        {
          id: "shibpur_area_1",
          name: "Shibpur Area 1",
          lat: 23.947,
          lng: 90.697,
        },
        {
          id: "shibpur_area_2",
          name: "Shibpur Area 2",
          lat: 23.957,
          lng: 90.697,
        },
        {
          id: "shibpur_area_3",
          name: "Shibpur Area 3",
          lat: 23.967,
          lng: 90.697,
        },
        {
          id: "shibpur_area_4",
          name: "Shibpur Area 4",
          lat: 23.977,
          lng: 90.697,
        },
        { id: "others_shibpur", name: "Others", lat: 23.9667, lng: 90.7167 },
      ],
      manikganj_sadar: [
        {
          id: "manikganj_sadar_area_1",
          name: "Manikganj Sadar Area 1",
          lat: 23.797,
          lng: 89.93,
        },
        {
          id: "manikganj_sadar_area_2",
          name: "Manikganj Sadar Area 2",
          lat: 23.807,
          lng: 89.93,
        },
        {
          id: "manikganj_sadar_area_3",
          name: "Manikganj Sadar Area 3",
          lat: 23.817,
          lng: 89.93,
        },
        {
          id: "manikganj_sadar_area_4",
          name: "Manikganj Sadar Area 4",
          lat: 23.827,
          lng: 89.93,
        },
        {
          id: "others_manikganj_sadar",
          name: "Others",
          lat: 23.8167,
          lng: 89.95,
        },
      ],
      singair: [
        {
          id: "singair_area_1",
          name: "Singair Area 1",
          lat: 23.847,
          lng: 89.93,
        },
        {
          id: "singair_area_2",
          name: "Singair Area 2",
          lat: 23.857,
          lng: 89.93,
        },
        {
          id: "singair_area_3",
          name: "Singair Area 3",
          lat: 23.867,
          lng: 89.93,
        },
        {
          id: "singair_area_4",
          name: "Singair Area 4",
          lat: 23.877,
          lng: 89.93,
        },
        { id: "others_singair", name: "Others", lat: 23.8667, lng: 89.95 },
      ],
      saturia: [
        {
          id: "saturia_area_1",
          name: "Saturia Area 1",
          lat: 23.897,
          lng: 89.93,
        },
        {
          id: "saturia_area_2",
          name: "Saturia Area 2",
          lat: 23.907,
          lng: 89.93,
        },
        {
          id: "saturia_area_3",
          name: "Saturia Area 3",
          lat: 23.917,
          lng: 89.93,
        },
        {
          id: "saturia_area_4",
          name: "Saturia Area 4",
          lat: 23.927,
          lng: 89.93,
        },
        { id: "others_saturia", name: "Others", lat: 23.9167, lng: 89.95 },
      ],
      harirampur: [
        {
          id: "harirampur_area_1",
          name: "Harirampur Area 1",
          lat: 23.797,
          lng: 89.98,
        },
        {
          id: "harirampur_area_2",
          name: "Harirampur Area 2",
          lat: 23.807,
          lng: 89.98,
        },
        {
          id: "harirampur_area_3",
          name: "Harirampur Area 3",
          lat: 23.817,
          lng: 89.98,
        },
        {
          id: "harirampur_area_4",
          name: "Harirampur Area 4",
          lat: 23.827,
          lng: 89.98,
        },
        { id: "others_harirampur", name: "Others", lat: 23.8167, lng: 90.0 },
      ],
      ghior: [
        { id: "ghior_area_1", name: "Ghior Area 1", lat: 23.847, lng: 89.98 },
        { id: "ghior_area_2", name: "Ghior Area 2", lat: 23.857, lng: 89.98 },
        { id: "ghior_area_3", name: "Ghior Area 3", lat: 23.867, lng: 89.98 },
        { id: "ghior_area_4", name: "Ghior Area 4", lat: 23.877, lng: 89.98 },
        { id: "others_ghior", name: "Others", lat: 23.8667, lng: 90.0 },
      ],
      shibalaya: [
        {
          id: "shibalaya_area_1",
          name: "Shibalaya Area 1",
          lat: 23.897,
          lng: 89.98,
        },
        {
          id: "shibalaya_area_2",
          name: "Shibalaya Area 2",
          lat: 23.907,
          lng: 89.98,
        },
        {
          id: "shibalaya_area_3",
          name: "Shibalaya Area 3",
          lat: 23.917,
          lng: 89.98,
        },
        {
          id: "shibalaya_area_4",
          name: "Shibalaya Area 4",
          lat: 23.927,
          lng: 89.98,
        },
        { id: "others_shibalaya", name: "Others", lat: 23.9167, lng: 90.0 },
      ],
      munshiganj_sadar: [
        {
          id: "munshiganj_sadar_area_1",
          name: "Munshiganj Sadar Area 1",
          lat: 23.48,
          lng: 90.463,
        },
        {
          id: "munshiganj_sadar_area_2",
          name: "Munshiganj Sadar Area 2",
          lat: 23.49,
          lng: 90.463,
        },
        {
          id: "munshiganj_sadar_area_3",
          name: "Munshiganj Sadar Area 3",
          lat: 23.5,
          lng: 90.463,
        },
        {
          id: "munshiganj_sadar_area_4",
          name: "Munshiganj Sadar Area 4",
          lat: 23.51,
          lng: 90.463,
        },
        {
          id: "others_munshiganj_sadar",
          name: "Others",
          lat: 23.5,
          lng: 90.4833,
        },
      ],
      sreenagar: [
        {
          id: "sreenagar_area_1",
          name: "Sreenagar Area 1",
          lat: 23.53,
          lng: 90.463,
        },
        {
          id: "sreenagar_area_2",
          name: "Sreenagar Area 2",
          lat: 23.54,
          lng: 90.463,
        },
        {
          id: "sreenagar_area_3",
          name: "Sreenagar Area 3",
          lat: 23.55,
          lng: 90.463,
        },
        {
          id: "sreenagar_area_4",
          name: "Sreenagar Area 4",
          lat: 23.56,
          lng: 90.463,
        },
        { id: "others_sreenagar", name: "Others", lat: 23.55, lng: 90.4833 },
      ],
      sirajdikhan: [
        {
          id: "sirajdikhan_area_1",
          name: "Sirajdikhan Area 1",
          lat: 23.58,
          lng: 90.463,
        },
        {
          id: "sirajdikhan_area_2",
          name: "Sirajdikhan Area 2",
          lat: 23.59,
          lng: 90.463,
        },
        {
          id: "sirajdikhan_area_3",
          name: "Sirajdikhan Area 3",
          lat: 23.6,
          lng: 90.463,
        },
        {
          id: "sirajdikhan_area_4",
          name: "Sirajdikhan Area 4",
          lat: 23.61,
          lng: 90.463,
        },
        { id: "others_sirajdikhan", name: "Others", lat: 23.6, lng: 90.4833 },
      ],
      louhajang: [
        {
          id: "louhajang_area_1",
          name: "Louhajang Area 1",
          lat: 23.48,
          lng: 90.513,
        },
        {
          id: "louhajang_area_2",
          name: "Louhajang Area 2",
          lat: 23.49,
          lng: 90.513,
        },
        {
          id: "louhajang_area_3",
          name: "Louhajang Area 3",
          lat: 23.5,
          lng: 90.513,
        },
        {
          id: "louhajang_area_4",
          name: "Louhajang Area 4",
          lat: 23.51,
          lng: 90.513,
        },
        { id: "others_louhajang", name: "Others", lat: 23.5, lng: 90.5333 },
      ],
      gazaria: [
        {
          id: "gazaria_area_1",
          name: "Gazaria Area 1",
          lat: 23.53,
          lng: 90.513,
        },
        {
          id: "gazaria_area_2",
          name: "Gazaria Area 2",
          lat: 23.54,
          lng: 90.513,
        },
        {
          id: "gazaria_area_3",
          name: "Gazaria Area 3",
          lat: 23.55,
          lng: 90.513,
        },
        {
          id: "gazaria_area_4",
          name: "Gazaria Area 4",
          lat: 23.56,
          lng: 90.513,
        },
        { id: "others_gazaria", name: "Others", lat: 23.55, lng: 90.5333 },
      ],
      tongibari: [
        {
          id: "tongibari_area_1",
          name: "Tongibari Area 1",
          lat: 23.58,
          lng: 90.513,
        },
        {
          id: "tongibari_area_2",
          name: "Tongibari Area 2",
          lat: 23.59,
          lng: 90.513,
        },
        {
          id: "tongibari_area_3",
          name: "Tongibari Area 3",
          lat: 23.6,
          lng: 90.513,
        },
        {
          id: "tongibari_area_4",
          name: "Tongibari Area 4",
          lat: 23.61,
          lng: 90.513,
        },
        { id: "others_tongibari", name: "Others", lat: 23.6, lng: 90.5333 },
      ],
      tangail_sadar: [
        {
          id: "tangail_sadar_area_1",
          name: "Tangail Sadar Area 1",
          lat: 24.18,
          lng: 89.847,
        },
        {
          id: "tangail_sadar_area_2",
          name: "Tangail Sadar Area 2",
          lat: 24.19,
          lng: 89.847,
        },
        {
          id: "tangail_sadar_area_3",
          name: "Tangail Sadar Area 3",
          lat: 24.2,
          lng: 89.847,
        },
        {
          id: "tangail_sadar_area_4",
          name: "Tangail Sadar Area 4",
          lat: 24.21,
          lng: 89.847,
        },
        { id: "others_tangail_sadar", name: "Others", lat: 24.2, lng: 89.8667 },
      ],
      basail: [
        { id: "basail_area_1", name: "Basail Area 1", lat: 24.23, lng: 89.847 },
        { id: "basail_area_2", name: "Basail Area 2", lat: 24.24, lng: 89.847 },
        { id: "basail_area_3", name: "Basail Area 3", lat: 24.25, lng: 89.847 },
        { id: "basail_area_4", name: "Basail Area 4", lat: 24.26, lng: 89.847 },
        { id: "others_basail", name: "Others", lat: 24.25, lng: 89.8667 },
      ],
      bhuapur: [
        {
          id: "bhuapur_area_1",
          name: "Bhuapur Area 1",
          lat: 24.28,
          lng: 89.847,
        },
        {
          id: "bhuapur_area_2",
          name: "Bhuapur Area 2",
          lat: 24.29,
          lng: 89.847,
        },
        {
          id: "bhuapur_area_3",
          name: "Bhuapur Area 3",
          lat: 24.3,
          lng: 89.847,
        },
        {
          id: "bhuapur_area_4",
          name: "Bhuapur Area 4",
          lat: 24.31,
          lng: 89.847,
        },
        { id: "others_bhuapur", name: "Others", lat: 24.3, lng: 89.8667 },
      ],
      delduar: [
        {
          id: "delduar_area_1",
          name: "Delduar Area 1",
          lat: 24.18,
          lng: 89.897,
        },
        {
          id: "delduar_area_2",
          name: "Delduar Area 2",
          lat: 24.19,
          lng: 89.897,
        },
        {
          id: "delduar_area_3",
          name: "Delduar Area 3",
          lat: 24.2,
          lng: 89.897,
        },
        {
          id: "delduar_area_4",
          name: "Delduar Area 4",
          lat: 24.21,
          lng: 89.897,
        },
        { id: "others_delduar", name: "Others", lat: 24.2, lng: 89.9167 },
      ],
      ghatail: [
        {
          id: "ghatail_area_1",
          name: "Ghatail Area 1",
          lat: 24.23,
          lng: 89.897,
        },
        {
          id: "ghatail_area_2",
          name: "Ghatail Area 2",
          lat: 24.24,
          lng: 89.897,
        },
        {
          id: "ghatail_area_3",
          name: "Ghatail Area 3",
          lat: 24.25,
          lng: 89.897,
        },
        {
          id: "ghatail_area_4",
          name: "Ghatail Area 4",
          lat: 24.26,
          lng: 89.897,
        },
        { id: "others_ghatail", name: "Others", lat: 24.25, lng: 89.9167 },
      ],
      kalihati: [
        {
          id: "kalihati_area_1",
          name: "Kalihati Area 1",
          lat: 24.28,
          lng: 89.897,
        },
        {
          id: "kalihati_area_2",
          name: "Kalihati Area 2",
          lat: 24.29,
          lng: 89.897,
        },
        {
          id: "kalihati_area_3",
          name: "Kalihati Area 3",
          lat: 24.3,
          lng: 89.897,
        },
        {
          id: "kalihati_area_4",
          name: "Kalihati Area 4",
          lat: 24.31,
          lng: 89.897,
        },
        { id: "others_kalihati", name: "Others", lat: 24.3, lng: 89.9167 },
      ],
      madhupur: [
        {
          id: "madhupur_area_1",
          name: "Madhupur Area 1",
          lat: 24.18,
          lng: 89.947,
        },
        {
          id: "madhupur_area_2",
          name: "Madhupur Area 2",
          lat: 24.19,
          lng: 89.947,
        },
        {
          id: "madhupur_area_3",
          name: "Madhupur Area 3",
          lat: 24.2,
          lng: 89.947,
        },
        {
          id: "madhupur_area_4",
          name: "Madhupur Area 4",
          lat: 24.21,
          lng: 89.947,
        },
        { id: "others_madhupur", name: "Others", lat: 24.2, lng: 89.9667 },
      ],
      mirzapur: [
        {
          id: "mirzapur_area_1",
          name: "Mirzapur Area 1",
          lat: 24.23,
          lng: 89.947,
        },
        {
          id: "mirzapur_area_2",
          name: "Mirzapur Area 2",
          lat: 24.24,
          lng: 89.947,
        },
        {
          id: "mirzapur_area_3",
          name: "Mirzapur Area 3",
          lat: 24.25,
          lng: 89.947,
        },
        {
          id: "mirzapur_area_4",
          name: "Mirzapur Area 4",
          lat: 24.26,
          lng: 89.947,
        },
        { id: "others_mirzapur", name: "Others", lat: 24.25, lng: 89.9667 },
      ],
      kishoreganj_sadar: [
        {
          id: "kishoreganj_sadar_area_1",
          name: "Kishoreganj Sadar Area 1",
          lat: 24.363,
          lng: 90.713,
        },
        {
          id: "kishoreganj_sadar_area_2",
          name: "Kishoreganj Sadar Area 2",
          lat: 24.373,
          lng: 90.713,
        },
        {
          id: "kishoreganj_sadar_area_3",
          name: "Kishoreganj Sadar Area 3",
          lat: 24.383,
          lng: 90.713,
        },
        {
          id: "kishoreganj_sadar_area_4",
          name: "Kishoreganj Sadar Area 4",
          lat: 24.393,
          lng: 90.713,
        },
        {
          id: "others_kishoreganj_sadar",
          name: "Others",
          lat: 24.3833,
          lng: 90.7333,
        },
      ],
      bajitpur: [
        {
          id: "bajitpur_area_1",
          name: "Bajitpur Area 1",
          lat: 24.413,
          lng: 90.713,
        },
        {
          id: "bajitpur_area_2",
          name: "Bajitpur Area 2",
          lat: 24.423,
          lng: 90.713,
        },
        {
          id: "bajitpur_area_3",
          name: "Bajitpur Area 3",
          lat: 24.433,
          lng: 90.713,
        },
        {
          id: "bajitpur_area_4",
          name: "Bajitpur Area 4",
          lat: 24.443,
          lng: 90.713,
        },
        { id: "others_bajitpur", name: "Others", lat: 24.4333, lng: 90.7333 },
      ],
      bhairab: [
        {
          id: "bhairab_area_1",
          name: "Bhairab Area 1",
          lat: 24.463,
          lng: 90.713,
        },
        {
          id: "bhairab_area_2",
          name: "Bhairab Area 2",
          lat: 24.473,
          lng: 90.713,
        },
        {
          id: "bhairab_area_3",
          name: "Bhairab Area 3",
          lat: 24.483,
          lng: 90.713,
        },
        {
          id: "bhairab_area_4",
          name: "Bhairab Area 4",
          lat: 24.493,
          lng: 90.713,
        },
        { id: "others_bhairab", name: "Others", lat: 24.4833, lng: 90.7333 },
      ],
      hossainpur: [
        {
          id: "hossainpur_area_1",
          name: "Hossainpur Area 1",
          lat: 24.363,
          lng: 90.763,
        },
        {
          id: "hossainpur_area_2",
          name: "Hossainpur Area 2",
          lat: 24.373,
          lng: 90.763,
        },
        {
          id: "hossainpur_area_3",
          name: "Hossainpur Area 3",
          lat: 24.383,
          lng: 90.763,
        },
        {
          id: "hossainpur_area_4",
          name: "Hossainpur Area 4",
          lat: 24.393,
          lng: 90.763,
        },
        { id: "others_hossainpur", name: "Others", lat: 24.3833, lng: 90.7833 },
      ],
      itna: [
        { id: "itna_area_1", name: "Itna Area 1", lat: 24.413, lng: 90.763 },
        { id: "itna_area_2", name: "Itna Area 2", lat: 24.423, lng: 90.763 },
        { id: "itna_area_3", name: "Itna Area 3", lat: 24.433, lng: 90.763 },
        { id: "itna_area_4", name: "Itna Area 4", lat: 24.443, lng: 90.763 },
        { id: "others_itna", name: "Others", lat: 24.4333, lng: 90.7833 },
      ],
      karimganj: [
        {
          id: "karimganj_area_1",
          name: "Karimganj Area 1",
          lat: 24.463,
          lng: 90.763,
        },
        {
          id: "karimganj_area_2",
          name: "Karimganj Area 2",
          lat: 24.473,
          lng: 90.763,
        },
        {
          id: "karimganj_area_3",
          name: "Karimganj Area 3",
          lat: 24.483,
          lng: 90.763,
        },
        {
          id: "karimganj_area_4",
          name: "Karimganj Area 4",
          lat: 24.493,
          lng: 90.763,
        },
        { id: "others_karimganj", name: "Others", lat: 24.4833, lng: 90.7833 },
      ],
      katiadi: [
        {
          id: "katiadi_area_1",
          name: "Katiadi Area 1",
          lat: 24.363,
          lng: 90.813,
        },
        {
          id: "katiadi_area_2",
          name: "Katiadi Area 2",
          lat: 24.373,
          lng: 90.813,
        },
        {
          id: "katiadi_area_3",
          name: "Katiadi Area 3",
          lat: 24.383,
          lng: 90.813,
        },
        {
          id: "katiadi_area_4",
          name: "Katiadi Area 4",
          lat: 24.393,
          lng: 90.813,
        },
        { id: "others_katiadi", name: "Others", lat: 24.3833, lng: 90.8333 },
      ],
      nikli: [
        { id: "nikli_area_1", name: "Nikli Area 1", lat: 24.413, lng: 90.813 },
        { id: "nikli_area_2", name: "Nikli Area 2", lat: 24.423, lng: 90.813 },
        { id: "nikli_area_3", name: "Nikli Area 3", lat: 24.433, lng: 90.813 },
        { id: "nikli_area_4", name: "Nikli Area 4", lat: 24.443, lng: 90.813 },
        { id: "others_nikli", name: "Others", lat: 24.4333, lng: 90.8333 },
      ],
      faridpur_sadar: [
        {
          id: "faridpur_sadar_area_1",
          name: "Faridpur Sadar Area 1",
          lat: 23.53,
          lng: 89.763,
        },
        {
          id: "faridpur_sadar_area_2",
          name: "Faridpur Sadar Area 2",
          lat: 23.54,
          lng: 89.763,
        },
        {
          id: "faridpur_sadar_area_3",
          name: "Faridpur Sadar Area 3",
          lat: 23.55,
          lng: 89.763,
        },
        {
          id: "faridpur_sadar_area_4",
          name: "Faridpur Sadar Area 4",
          lat: 23.56,
          lng: 89.763,
        },
        {
          id: "others_faridpur_sadar",
          name: "Others",
          lat: 23.55,
          lng: 89.7833,
        },
      ],
      alfadanga: [
        {
          id: "alfadanga_area_1",
          name: "Alfadanga Area 1",
          lat: 23.58,
          lng: 89.763,
        },
        {
          id: "alfadanga_area_2",
          name: "Alfadanga Area 2",
          lat: 23.59,
          lng: 89.763,
        },
        {
          id: "alfadanga_area_3",
          name: "Alfadanga Area 3",
          lat: 23.6,
          lng: 89.763,
        },
        {
          id: "alfadanga_area_4",
          name: "Alfadanga Area 4",
          lat: 23.61,
          lng: 89.763,
        },
        { id: "others_alfadanga", name: "Others", lat: 23.6, lng: 89.7833 },
      ],
      boalmari: [
        {
          id: "boalmari_area_1",
          name: "Boalmari Area 1",
          lat: 23.63,
          lng: 89.763,
        },
        {
          id: "boalmari_area_2",
          name: "Boalmari Area 2",
          lat: 23.64,
          lng: 89.763,
        },
        {
          id: "boalmari_area_3",
          name: "Boalmari Area 3",
          lat: 23.65,
          lng: 89.763,
        },
        {
          id: "boalmari_area_4",
          name: "Boalmari Area 4",
          lat: 23.66,
          lng: 89.763,
        },
        { id: "others_boalmari", name: "Others", lat: 23.65, lng: 89.7833 },
      ],
      madhukhali: [
        {
          id: "madhukhali_area_1",
          name: "Madhukhali Area 1",
          lat: 23.53,
          lng: 89.813,
        },
        {
          id: "madhukhali_area_2",
          name: "Madhukhali Area 2",
          lat: 23.54,
          lng: 89.813,
        },
        {
          id: "madhukhali_area_3",
          name: "Madhukhali Area 3",
          lat: 23.55,
          lng: 89.813,
        },
        {
          id: "madhukhali_area_4",
          name: "Madhukhali Area 4",
          lat: 23.56,
          lng: 89.813,
        },
        { id: "others_madhukhali", name: "Others", lat: 23.55, lng: 89.8333 },
      ],
      bhanga: [
        { id: "bhanga_area_1", name: "Bhanga Area 1", lat: 23.58, lng: 89.813 },
        { id: "bhanga_area_2", name: "Bhanga Area 2", lat: 23.59, lng: 89.813 },
        { id: "bhanga_area_3", name: "Bhanga Area 3", lat: 23.6, lng: 89.813 },
        { id: "bhanga_area_4", name: "Bhanga Area 4", lat: 23.61, lng: 89.813 },
        { id: "others_bhanga", name: "Others", lat: 23.6, lng: 89.8333 },
      ],
      nagarkanda: [
        {
          id: "nagarkanda_area_1",
          name: "Nagarkanda Area 1",
          lat: 23.63,
          lng: 89.813,
        },
        {
          id: "nagarkanda_area_2",
          name: "Nagarkanda Area 2",
          lat: 23.64,
          lng: 89.813,
        },
        {
          id: "nagarkanda_area_3",
          name: "Nagarkanda Area 3",
          lat: 23.65,
          lng: 89.813,
        },
        {
          id: "nagarkanda_area_4",
          name: "Nagarkanda Area 4",
          lat: 23.66,
          lng: 89.813,
        },
        { id: "others_nagarkanda", name: "Others", lat: 23.65, lng: 89.8333 },
      ],
      sadarpur: [
        {
          id: "sadarpur_area_1",
          name: "Sadarpur Area 1",
          lat: 23.53,
          lng: 89.863,
        },
        {
          id: "sadarpur_area_2",
          name: "Sadarpur Area 2",
          lat: 23.54,
          lng: 89.863,
        },
        {
          id: "sadarpur_area_3",
          name: "Sadarpur Area 3",
          lat: 23.55,
          lng: 89.863,
        },
        {
          id: "sadarpur_area_4",
          name: "Sadarpur Area 4",
          lat: 23.56,
          lng: 89.863,
        },
        { id: "others_sadarpur", name: "Others", lat: 23.55, lng: 89.8833 },
      ],
      rajbari_sadar: [
        {
          id: "rajbari_sadar_area_1",
          name: "Rajbari Sadar Area 1",
          lat: 23.68,
          lng: 89.58,
        },
        {
          id: "rajbari_sadar_area_2",
          name: "Rajbari Sadar Area 2",
          lat: 23.69,
          lng: 89.58,
        },
        {
          id: "rajbari_sadar_area_3",
          name: "Rajbari Sadar Area 3",
          lat: 23.7,
          lng: 89.58,
        },
        {
          id: "rajbari_sadar_area_4",
          name: "Rajbari Sadar Area 4",
          lat: 23.71,
          lng: 89.58,
        },
        { id: "others_rajbari_sadar", name: "Others", lat: 23.7, lng: 89.6 },
      ],
      goalanda: [
        {
          id: "goalanda_area_1",
          name: "Goalanda Area 1",
          lat: 23.73,
          lng: 89.58,
        },
        {
          id: "goalanda_area_2",
          name: "Goalanda Area 2",
          lat: 23.74,
          lng: 89.58,
        },
        {
          id: "goalanda_area_3",
          name: "Goalanda Area 3",
          lat: 23.75,
          lng: 89.58,
        },
        {
          id: "goalanda_area_4",
          name: "Goalanda Area 4",
          lat: 23.76,
          lng: 89.58,
        },
        { id: "others_goalanda", name: "Others", lat: 23.75, lng: 89.6 },
      ],
      pangsha: [
        {
          id: "pangsha_area_1",
          name: "Pangsha Area 1",
          lat: 23.78,
          lng: 89.58,
        },
        {
          id: "pangsha_area_2",
          name: "Pangsha Area 2",
          lat: 23.79,
          lng: 89.58,
        },
        { id: "pangsha_area_3", name: "Pangsha Area 3", lat: 23.8, lng: 89.58 },
        {
          id: "pangsha_area_4",
          name: "Pangsha Area 4",
          lat: 23.81,
          lng: 89.58,
        },
        { id: "others_pangsha", name: "Others", lat: 23.8, lng: 89.6 },
      ],
      baliakandi: [
        {
          id: "baliakandi_area_1",
          name: "Baliakandi Area 1",
          lat: 23.68,
          lng: 89.63,
        },
        {
          id: "baliakandi_area_2",
          name: "Baliakandi Area 2",
          lat: 23.69,
          lng: 89.63,
        },
        {
          id: "baliakandi_area_3",
          name: "Baliakandi Area 3",
          lat: 23.7,
          lng: 89.63,
        },
        {
          id: "baliakandi_area_4",
          name: "Baliakandi Area 4",
          lat: 23.71,
          lng: 89.63,
        },
        { id: "others_baliakandi", name: "Others", lat: 23.7, lng: 89.65 },
      ],
      kalukhali: [
        {
          id: "kalukhali_area_1",
          name: "Kalukhali Area 1",
          lat: 23.73,
          lng: 89.63,
        },
        {
          id: "kalukhali_area_2",
          name: "Kalukhali Area 2",
          lat: 23.74,
          lng: 89.63,
        },
        {
          id: "kalukhali_area_3",
          name: "Kalukhali Area 3",
          lat: 23.75,
          lng: 89.63,
        },
        {
          id: "kalukhali_area_4",
          name: "Kalukhali Area 4",
          lat: 23.76,
          lng: 89.63,
        },
        { id: "others_kalukhali", name: "Others", lat: 23.75, lng: 89.65 },
      ],
      gopalganj_sadar: [
        {
          id: "gopalganj_sadar_area_1",
          name: "Gopalganj Sadar Area 1",
          lat: 22.947,
          lng: 89.747,
        },
        {
          id: "gopalganj_sadar_area_2",
          name: "Gopalganj Sadar Area 2",
          lat: 22.957,
          lng: 89.747,
        },
        {
          id: "gopalganj_sadar_area_3",
          name: "Gopalganj Sadar Area 3",
          lat: 22.967,
          lng: 89.747,
        },
        {
          id: "gopalganj_sadar_area_4",
          name: "Gopalganj Sadar Area 4",
          lat: 22.977,
          lng: 89.747,
        },
        {
          id: "others_gopalganj_sadar",
          name: "Others",
          lat: 22.9667,
          lng: 89.7667,
        },
      ],
      kashiani: [
        {
          id: "kashiani_area_1",
          name: "Kashiani Area 1",
          lat: 22.997,
          lng: 89.747,
        },
        {
          id: "kashiani_area_2",
          name: "Kashiani Area 2",
          lat: 23.007,
          lng: 89.747,
        },
        {
          id: "kashiani_area_3",
          name: "Kashiani Area 3",
          lat: 23.017,
          lng: 89.747,
        },
        {
          id: "kashiani_area_4",
          name: "Kashiani Area 4",
          lat: 23.027,
          lng: 89.747,
        },
        { id: "others_kashiani", name: "Others", lat: 23.0167, lng: 89.7667 },
      ],
      tungipara: [
        {
          id: "tungipara_area_1",
          name: "Tungipara Area 1",
          lat: 23.047,
          lng: 89.747,
        },
        {
          id: "tungipara_area_2",
          name: "Tungipara Area 2",
          lat: 23.057,
          lng: 89.747,
        },
        {
          id: "tungipara_area_3",
          name: "Tungipara Area 3",
          lat: 23.067,
          lng: 89.747,
        },
        {
          id: "tungipara_area_4",
          name: "Tungipara Area 4",
          lat: 23.077,
          lng: 89.747,
        },
        { id: "others_tungipara", name: "Others", lat: 23.0667, lng: 89.7667 },
      ],
      kotalipara: [
        {
          id: "kotalipara_area_1",
          name: "Kotalipara Area 1",
          lat: 22.947,
          lng: 89.797,
        },
        {
          id: "kotalipara_area_2",
          name: "Kotalipara Area 2",
          lat: 22.957,
          lng: 89.797,
        },
        {
          id: "kotalipara_area_3",
          name: "Kotalipara Area 3",
          lat: 22.967,
          lng: 89.797,
        },
        {
          id: "kotalipara_area_4",
          name: "Kotalipara Area 4",
          lat: 22.977,
          lng: 89.797,
        },
        { id: "others_kotalipara", name: "Others", lat: 22.9667, lng: 89.8167 },
      ],
      muksudpur: [
        {
          id: "muksudpur_area_1",
          name: "Muksudpur Area 1",
          lat: 22.997,
          lng: 89.797,
        },
        {
          id: "muksudpur_area_2",
          name: "Muksudpur Area 2",
          lat: 23.007,
          lng: 89.797,
        },
        {
          id: "muksudpur_area_3",
          name: "Muksudpur Area 3",
          lat: 23.017,
          lng: 89.797,
        },
        {
          id: "muksudpur_area_4",
          name: "Muksudpur Area 4",
          lat: 23.027,
          lng: 89.797,
        },
        { id: "others_muksudpur", name: "Others", lat: 23.0167, lng: 89.8167 },
      ],
      madaripur_sadar: [
        {
          id: "madaripur_sadar_area_1",
          name: "Madaripur Sadar Area 1",
          lat: 23.097,
          lng: 90.113,
        },
        {
          id: "madaripur_sadar_area_2",
          name: "Madaripur Sadar Area 2",
          lat: 23.107,
          lng: 90.113,
        },
        {
          id: "madaripur_sadar_area_3",
          name: "Madaripur Sadar Area 3",
          lat: 23.117,
          lng: 90.113,
        },
        {
          id: "madaripur_sadar_area_4",
          name: "Madaripur Sadar Area 4",
          lat: 23.127,
          lng: 90.113,
        },
        {
          id: "others_madaripur_sadar",
          name: "Others",
          lat: 23.1167,
          lng: 90.1333,
        },
      ],
      rajoir: [
        {
          id: "rajoir_area_1",
          name: "Rajoir Area 1",
          lat: 23.147,
          lng: 90.113,
        },
        {
          id: "rajoir_area_2",
          name: "Rajoir Area 2",
          lat: 23.157,
          lng: 90.113,
        },
        {
          id: "rajoir_area_3",
          name: "Rajoir Area 3",
          lat: 23.167,
          lng: 90.113,
        },
        {
          id: "rajoir_area_4",
          name: "Rajoir Area 4",
          lat: 23.177,
          lng: 90.113,
        },
        { id: "others_rajoir", name: "Others", lat: 23.1667, lng: 90.1333 },
      ],
      kalkini: [
        {
          id: "kalkini_area_1",
          name: "Kalkini Area 1",
          lat: 23.197,
          lng: 90.113,
        },
        {
          id: "kalkini_area_2",
          name: "Kalkini Area 2",
          lat: 23.207,
          lng: 90.113,
        },
        {
          id: "kalkini_area_3",
          name: "Kalkini Area 3",
          lat: 23.217,
          lng: 90.113,
        },
        {
          id: "kalkini_area_4",
          name: "Kalkini Area 4",
          lat: 23.227,
          lng: 90.113,
        },
        { id: "others_kalkini", name: "Others", lat: 23.2167, lng: 90.1333 },
      ],
      shibchar: [
        {
          id: "shibchar_area_1",
          name: "Shibchar Area 1",
          lat: 23.097,
          lng: 90.163,
        },
        {
          id: "shibchar_area_2",
          name: "Shibchar Area 2",
          lat: 23.107,
          lng: 90.163,
        },
        {
          id: "shibchar_area_3",
          name: "Shibchar Area 3",
          lat: 23.117,
          lng: 90.163,
        },
        {
          id: "shibchar_area_4",
          name: "Shibchar Area 4",
          lat: 23.127,
          lng: 90.163,
        },
        { id: "others_shibchar", name: "Others", lat: 23.1167, lng: 90.1833 },
      ],
      shariatpur_sadar: [
        {
          id: "shariatpur_sadar_area_1",
          name: "Shariatpur Sadar Area 1",
          lat: 23.13,
          lng: 90.28,
        },
        {
          id: "shariatpur_sadar_area_2",
          name: "Shariatpur Sadar Area 2",
          lat: 23.14,
          lng: 90.28,
        },
        {
          id: "shariatpur_sadar_area_3",
          name: "Shariatpur Sadar Area 3",
          lat: 23.15,
          lng: 90.28,
        },
        {
          id: "shariatpur_sadar_area_4",
          name: "Shariatpur Sadar Area 4",
          lat: 23.16,
          lng: 90.28,
        },
        {
          id: "others_shariatpur_sadar",
          name: "Others",
          lat: 23.15,
          lng: 90.3,
        },
      ],
      naria: [
        { id: "naria_area_1", name: "Naria Area 1", lat: 23.18, lng: 90.28 },
        { id: "naria_area_2", name: "Naria Area 2", lat: 23.19, lng: 90.28 },
        { id: "naria_area_3", name: "Naria Area 3", lat: 23.2, lng: 90.28 },
        { id: "naria_area_4", name: "Naria Area 4", lat: 23.21, lng: 90.28 },
        { id: "others_naria", name: "Others", lat: 23.2, lng: 90.3 },
      ],
      zajira: [
        { id: "zajira_area_1", name: "Zajira Area 1", lat: 23.23, lng: 90.28 },
        { id: "zajira_area_2", name: "Zajira Area 2", lat: 23.24, lng: 90.28 },
        { id: "zajira_area_3", name: "Zajira Area 3", lat: 23.25, lng: 90.28 },
        { id: "zajira_area_4", name: "Zajira Area 4", lat: 23.26, lng: 90.28 },
        { id: "others_zajira", name: "Others", lat: 23.25, lng: 90.3 },
      ],
      gosairhat: [
        {
          id: "gosairhat_area_1",
          name: "Gosairhat Area 1",
          lat: 23.13,
          lng: 90.33,
        },
        {
          id: "gosairhat_area_2",
          name: "Gosairhat Area 2",
          lat: 23.14,
          lng: 90.33,
        },
        {
          id: "gosairhat_area_3",
          name: "Gosairhat Area 3",
          lat: 23.15,
          lng: 90.33,
        },
        {
          id: "gosairhat_area_4",
          name: "Gosairhat Area 4",
          lat: 23.16,
          lng: 90.33,
        },
        { id: "others_gosairhat", name: "Others", lat: 23.15, lng: 90.35 },
      ],
      bhedarganj: [
        {
          id: "bhedarganj_area_1",
          name: "Bhedarganj Area 1",
          lat: 23.18,
          lng: 90.33,
        },
        {
          id: "bhedarganj_area_2",
          name: "Bhedarganj Area 2",
          lat: 23.19,
          lng: 90.33,
        },
        {
          id: "bhedarganj_area_3",
          name: "Bhedarganj Area 3",
          lat: 23.2,
          lng: 90.33,
        },
        {
          id: "bhedarganj_area_4",
          name: "Bhedarganj Area 4",
          lat: 23.21,
          lng: 90.33,
        },
        { id: "others_bhedarganj", name: "Others", lat: 23.2, lng: 90.35 },
      ],
      damudya: [
        {
          id: "damudya_area_1",
          name: "Damudya Area 1",
          lat: 23.23,
          lng: 90.33,
        },
        {
          id: "damudya_area_2",
          name: "Damudya Area 2",
          lat: 23.24,
          lng: 90.33,
        },
        {
          id: "damudya_area_3",
          name: "Damudya Area 3",
          lat: 23.25,
          lng: 90.33,
        },
        {
          id: "damudya_area_4",
          name: "Damudya Area 4",
          lat: 23.26,
          lng: 90.33,
        },
        { id: "others_damudya", name: "Others", lat: 23.25, lng: 90.35 },
      ],
      chattogram_sadar: [
        {
          id: "chattogram_sadar_area_1",
          name: "Chattogram Sadar Area 1",
          lat: 22.287,
          lng: 91.713,
        },
        {
          id: "chattogram_sadar_area_2",
          name: "Chattogram Sadar Area 2",
          lat: 22.297,
          lng: 91.713,
        },
        {
          id: "chattogram_sadar_area_3",
          name: "Chattogram Sadar Area 3",
          lat: 22.307,
          lng: 91.713,
        },
        {
          id: "chattogram_sadar_area_4",
          name: "Chattogram Sadar Area 4",
          lat: 22.317,
          lng: 91.713,
        },
        {
          id: "others_chattogram_sadar",
          name: "Others",
          lat: 22.3069,
          lng: 91.7332,
        },
      ],
      hathazari: [
        {
          id: "hathazari_area_1",
          name: "Hathazari Area 1",
          lat: 22.337,
          lng: 91.713,
        },
        {
          id: "hathazari_area_2",
          name: "Hathazari Area 2",
          lat: 22.347,
          lng: 91.713,
        },
        {
          id: "hathazari_area_3",
          name: "Hathazari Area 3",
          lat: 22.357,
          lng: 91.713,
        },
        {
          id: "hathazari_area_4",
          name: "Hathazari Area 4",
          lat: 22.367,
          lng: 91.713,
        },
        { id: "others_hathazari", name: "Others", lat: 22.3569, lng: 91.7332 },
      ],
      patiya: [
        {
          id: "patiya_area_1",
          name: "Patiya Area 1",
          lat: 22.387,
          lng: 91.713,
        },
        {
          id: "patiya_area_2",
          name: "Patiya Area 2",
          lat: 22.397,
          lng: 91.713,
        },
        {
          id: "patiya_area_3",
          name: "Patiya Area 3",
          lat: 22.407,
          lng: 91.713,
        },
        {
          id: "patiya_area_4",
          name: "Patiya Area 4",
          lat: 22.417,
          lng: 91.713,
        },
        { id: "others_patiya", name: "Others", lat: 22.4069, lng: 91.7332 },
      ],
      sitakunda: [
        {
          id: "sitakunda_area_1",
          name: "Sitakunda Area 1",
          lat: 22.287,
          lng: 91.763,
        },
        {
          id: "sitakunda_area_2",
          name: "Sitakunda Area 2",
          lat: 22.297,
          lng: 91.763,
        },
        {
          id: "sitakunda_area_3",
          name: "Sitakunda Area 3",
          lat: 22.307,
          lng: 91.763,
        },
        {
          id: "sitakunda_area_4",
          name: "Sitakunda Area 4",
          lat: 22.317,
          lng: 91.763,
        },
        { id: "others_sitakunda", name: "Others", lat: 22.3069, lng: 91.7832 },
      ],
      mirsharai: [
        {
          id: "mirsharai_area_1",
          name: "Mirsharai Area 1",
          lat: 22.337,
          lng: 91.763,
        },
        {
          id: "mirsharai_area_2",
          name: "Mirsharai Area 2",
          lat: 22.347,
          lng: 91.763,
        },
        {
          id: "mirsharai_area_3",
          name: "Mirsharai Area 3",
          lat: 22.357,
          lng: 91.763,
        },
        {
          id: "mirsharai_area_4",
          name: "Mirsharai Area 4",
          lat: 22.367,
          lng: 91.763,
        },
        { id: "others_mirsharai", name: "Others", lat: 22.3569, lng: 91.7832 },
      ],
      rangunia: [
        {
          id: "rangunia_area_1",
          name: "Rangunia Area 1",
          lat: 22.387,
          lng: 91.763,
        },
        {
          id: "rangunia_area_2",
          name: "Rangunia Area 2",
          lat: 22.397,
          lng: 91.763,
        },
        {
          id: "rangunia_area_3",
          name: "Rangunia Area 3",
          lat: 22.407,
          lng: 91.763,
        },
        {
          id: "rangunia_area_4",
          name: "Rangunia Area 4",
          lat: 22.417,
          lng: 91.763,
        },
        { id: "others_rangunia", name: "Others", lat: 22.4069, lng: 91.7832 },
      ],
      raozan: [
        {
          id: "raozan_area_1",
          name: "Raozan Area 1",
          lat: 22.287,
          lng: 91.813,
        },
        {
          id: "raozan_area_2",
          name: "Raozan Area 2",
          lat: 22.297,
          lng: 91.813,
        },
        {
          id: "raozan_area_3",
          name: "Raozan Area 3",
          lat: 22.307,
          lng: 91.813,
        },
        {
          id: "raozan_area_4",
          name: "Raozan Area 4",
          lat: 22.317,
          lng: 91.813,
        },
        { id: "others_raozan", name: "Others", lat: 22.3069, lng: 91.8332 },
      ],
      anwara: [
        {
          id: "anwara_area_1",
          name: "Anwara Area 1",
          lat: 22.337,
          lng: 91.813,
        },
        {
          id: "anwara_area_2",
          name: "Anwara Area 2",
          lat: 22.347,
          lng: 91.813,
        },
        {
          id: "anwara_area_3",
          name: "Anwara Area 3",
          lat: 22.357,
          lng: 91.813,
        },
        {
          id: "anwara_area_4",
          name: "Anwara Area 4",
          lat: 22.367,
          lng: 91.813,
        },
        { id: "others_anwara", name: "Others", lat: 22.3569, lng: 91.8332 },
      ],
      boalkhali: [
        {
          id: "boalkhali_area_1",
          name: "Boalkhali Area 1",
          lat: 22.387,
          lng: 91.813,
        },
        {
          id: "boalkhali_area_2",
          name: "Boalkhali Area 2",
          lat: 22.397,
          lng: 91.813,
        },
        {
          id: "boalkhali_area_3",
          name: "Boalkhali Area 3",
          lat: 22.407,
          lng: 91.813,
        },
        {
          id: "boalkhali_area_4",
          name: "Boalkhali Area 4",
          lat: 22.417,
          lng: 91.813,
        },
        { id: "others_boalkhali", name: "Others", lat: 22.4069, lng: 91.8332 },
      ],
      cox_sadar: [
        {
          id: "cox_sadar_area_1",
          name: "Cox Sadar Area 1",
          lat: 21.357,
          lng: 91.935,
        },
        {
          id: "cox_sadar_area_2",
          name: "Cox Sadar Area 2",
          lat: 21.367,
          lng: 91.935,
        },
        {
          id: "cox_sadar_area_3",
          name: "Cox Sadar Area 3",
          lat: 21.377,
          lng: 91.935,
        },
        {
          id: "cox_sadar_area_4",
          name: "Cox Sadar Area 4",
          lat: 21.387,
          lng: 91.935,
        },
        { id: "others_cox_sadar", name: "Others", lat: 21.3772, lng: 91.955 },
      ],
      ukhiya: [
        {
          id: "ukhiya_area_1",
          name: "Ukhiya Area 1",
          lat: 21.407,
          lng: 91.935,
        },
        {
          id: "ukhiya_area_2",
          name: "Ukhiya Area 2",
          lat: 21.417,
          lng: 91.935,
        },
        {
          id: "ukhiya_area_3",
          name: "Ukhiya Area 3",
          lat: 21.427,
          lng: 91.935,
        },
        {
          id: "ukhiya_area_4",
          name: "Ukhiya Area 4",
          lat: 21.437,
          lng: 91.935,
        },
        { id: "others_ukhiya", name: "Others", lat: 21.4272, lng: 91.955 },
      ],
      teknaf: [
        {
          id: "teknaf_area_1",
          name: "Teknaf Area 1",
          lat: 21.457,
          lng: 91.935,
        },
        {
          id: "teknaf_area_2",
          name: "Teknaf Area 2",
          lat: 21.467,
          lng: 91.935,
        },
        {
          id: "teknaf_area_3",
          name: "Teknaf Area 3",
          lat: 21.477,
          lng: 91.935,
        },
        {
          id: "teknaf_area_4",
          name: "Teknaf Area 4",
          lat: 21.487,
          lng: 91.935,
        },
        { id: "others_teknaf", name: "Others", lat: 21.4772, lng: 91.955 },
      ],
      ramu: [
        { id: "ramu_area_1", name: "Ramu Area 1", lat: 21.357, lng: 91.985 },
        { id: "ramu_area_2", name: "Ramu Area 2", lat: 21.367, lng: 91.985 },
        { id: "ramu_area_3", name: "Ramu Area 3", lat: 21.377, lng: 91.985 },
        { id: "ramu_area_4", name: "Ramu Area 4", lat: 21.387, lng: 91.985 },
        { id: "others_ramu", name: "Others", lat: 21.3772, lng: 92.005 },
      ],
      chakaria: [
        {
          id: "chakaria_area_1",
          name: "Chakaria Area 1",
          lat: 21.407,
          lng: 91.985,
        },
        {
          id: "chakaria_area_2",
          name: "Chakaria Area 2",
          lat: 21.417,
          lng: 91.985,
        },
        {
          id: "chakaria_area_3",
          name: "Chakaria Area 3",
          lat: 21.427,
          lng: 91.985,
        },
        {
          id: "chakaria_area_4",
          name: "Chakaria Area 4",
          lat: 21.437,
          lng: 91.985,
        },
        { id: "others_chakaria", name: "Others", lat: 21.4272, lng: 92.005 },
      ],
      moheshkhali: [
        {
          id: "moheshkhali_area_1",
          name: "Moheshkhali Area 1",
          lat: 21.457,
          lng: 91.985,
        },
        {
          id: "moheshkhali_area_2",
          name: "Moheshkhali Area 2",
          lat: 21.467,
          lng: 91.985,
        },
        {
          id: "moheshkhali_area_3",
          name: "Moheshkhali Area 3",
          lat: 21.477,
          lng: 91.985,
        },
        {
          id: "moheshkhali_area_4",
          name: "Moheshkhali Area 4",
          lat: 21.487,
          lng: 91.985,
        },
        { id: "others_moheshkhali", name: "Others", lat: 21.4772, lng: 92.005 },
      ],
      pekua: [
        { id: "pekua_area_1", name: "Pekua Area 1", lat: 21.357, lng: 92.035 },
        { id: "pekua_area_2", name: "Pekua Area 2", lat: 21.367, lng: 92.035 },
        { id: "pekua_area_3", name: "Pekua Area 3", lat: 21.377, lng: 92.035 },
        { id: "pekua_area_4", name: "Pekua Area 4", lat: 21.387, lng: 92.035 },
        { id: "others_pekua", name: "Others", lat: 21.3772, lng: 92.055 },
      ],
      rangamati_sadar: [
        {
          id: "rangamati_sadar_area_1",
          name: "Rangamati Sadar Area 1",
          lat: 22.563,
          lng: 92.13,
        },
        {
          id: "rangamati_sadar_area_2",
          name: "Rangamati Sadar Area 2",
          lat: 22.573,
          lng: 92.13,
        },
        {
          id: "rangamati_sadar_area_3",
          name: "Rangamati Sadar Area 3",
          lat: 22.583,
          lng: 92.13,
        },
        {
          id: "rangamati_sadar_area_4",
          name: "Rangamati Sadar Area 4",
          lat: 22.593,
          lng: 92.13,
        },
        {
          id: "others_rangamati_sadar",
          name: "Others",
          lat: 22.5833,
          lng: 92.15,
        },
      ],
      kawkhali: [
        {
          id: "kawkhali_area_1",
          name: "Kawkhali Area 1",
          lat: 22.613,
          lng: 92.13,
        },
        {
          id: "kawkhali_area_2",
          name: "Kawkhali Area 2",
          lat: 22.623,
          lng: 92.13,
        },
        {
          id: "kawkhali_area_3",
          name: "Kawkhali Area 3",
          lat: 22.633,
          lng: 92.13,
        },
        {
          id: "kawkhali_area_4",
          name: "Kawkhali Area 4",
          lat: 22.643,
          lng: 92.13,
        },
        { id: "others_kawkhali", name: "Others", lat: 22.6333, lng: 92.15 },
      ],
      kaptai: [
        { id: "kaptai_area_1", name: "Kaptai Area 1", lat: 22.663, lng: 92.13 },
        { id: "kaptai_area_2", name: "Kaptai Area 2", lat: 22.673, lng: 92.13 },
        { id: "kaptai_area_3", name: "Kaptai Area 3", lat: 22.683, lng: 92.13 },
        { id: "kaptai_area_4", name: "Kaptai Area 4", lat: 22.693, lng: 92.13 },
        { id: "others_kaptai", name: "Others", lat: 22.6833, lng: 92.15 },
      ],
      baghaichari: [
        {
          id: "baghaichari_area_1",
          name: "Baghaichari Area 1",
          lat: 22.563,
          lng: 92.18,
        },
        {
          id: "baghaichari_area_2",
          name: "Baghaichari Area 2",
          lat: 22.573,
          lng: 92.18,
        },
        {
          id: "baghaichari_area_3",
          name: "Baghaichari Area 3",
          lat: 22.583,
          lng: 92.18,
        },
        {
          id: "baghaichari_area_4",
          name: "Baghaichari Area 4",
          lat: 22.593,
          lng: 92.18,
        },
        { id: "others_baghaichari", name: "Others", lat: 22.5833, lng: 92.2 },
      ],
      barkal: [
        { id: "barkal_area_1", name: "Barkal Area 1", lat: 22.613, lng: 92.18 },
        { id: "barkal_area_2", name: "Barkal Area 2", lat: 22.623, lng: 92.18 },
        { id: "barkal_area_3", name: "Barkal Area 3", lat: 22.633, lng: 92.18 },
        { id: "barkal_area_4", name: "Barkal Area 4", lat: 22.643, lng: 92.18 },
        { id: "others_barkal", name: "Others", lat: 22.6333, lng: 92.2 },
      ],
      langadu: [
        {
          id: "langadu_area_1",
          name: "Langadu Area 1",
          lat: 22.663,
          lng: 92.18,
        },
        {
          id: "langadu_area_2",
          name: "Langadu Area 2",
          lat: 22.673,
          lng: 92.18,
        },
        {
          id: "langadu_area_3",
          name: "Langadu Area 3",
          lat: 22.683,
          lng: 92.18,
        },
        {
          id: "langadu_area_4",
          name: "Langadu Area 4",
          lat: 22.693,
          lng: 92.18,
        },
        { id: "others_langadu", name: "Others", lat: 22.6833, lng: 92.2 },
      ],
      rajasthali: [
        {
          id: "rajasthali_area_1",
          name: "Rajasthali Area 1",
          lat: 22.563,
          lng: 92.23,
        },
        {
          id: "rajasthali_area_2",
          name: "Rajasthali Area 2",
          lat: 22.573,
          lng: 92.23,
        },
        {
          id: "rajasthali_area_3",
          name: "Rajasthali Area 3",
          lat: 22.583,
          lng: 92.23,
        },
        {
          id: "rajasthali_area_4",
          name: "Rajasthali Area 4",
          lat: 22.593,
          lng: 92.23,
        },
        { id: "others_rajasthali", name: "Others", lat: 22.5833, lng: 92.25 },
      ],
      bandarban_sadar: [
        {
          id: "bandarban_sadar_area_1",
          name: "Bandarban Sadar Area 1",
          lat: 22.125,
          lng: 92.148,
        },
        {
          id: "bandarban_sadar_area_2",
          name: "Bandarban Sadar Area 2",
          lat: 22.135,
          lng: 92.148,
        },
        {
          id: "bandarban_sadar_area_3",
          name: "Bandarban Sadar Area 3",
          lat: 22.145,
          lng: 92.148,
        },
        {
          id: "bandarban_sadar_area_4",
          name: "Bandarban Sadar Area 4",
          lat: 22.155,
          lng: 92.148,
        },
        {
          id: "others_bandarban_sadar",
          name: "Others",
          lat: 22.1453,
          lng: 92.1684,
        },
      ],
      alikadam: [
        {
          id: "alikadam_area_1",
          name: "Alikadam Area 1",
          lat: 22.175,
          lng: 92.148,
        },
        {
          id: "alikadam_area_2",
          name: "Alikadam Area 2",
          lat: 22.185,
          lng: 92.148,
        },
        {
          id: "alikadam_area_3",
          name: "Alikadam Area 3",
          lat: 22.195,
          lng: 92.148,
        },
        {
          id: "alikadam_area_4",
          name: "Alikadam Area 4",
          lat: 22.205,
          lng: 92.148,
        },
        { id: "others_alikadam", name: "Others", lat: 22.1953, lng: 92.1684 },
      ],
      lama: [
        { id: "lama_area_1", name: "Lama Area 1", lat: 22.225, lng: 92.148 },
        { id: "lama_area_2", name: "Lama Area 2", lat: 22.235, lng: 92.148 },
        { id: "lama_area_3", name: "Lama Area 3", lat: 22.245, lng: 92.148 },
        { id: "lama_area_4", name: "Lama Area 4", lat: 22.255, lng: 92.148 },
        { id: "others_lama", name: "Others", lat: 22.2453, lng: 92.1684 },
      ],
      naikhongchhari: [
        {
          id: "naikhongchhari_area_1",
          name: "Naikhongchhari Area 1",
          lat: 22.125,
          lng: 92.198,
        },
        {
          id: "naikhongchhari_area_2",
          name: "Naikhongchhari Area 2",
          lat: 22.135,
          lng: 92.198,
        },
        {
          id: "naikhongchhari_area_3",
          name: "Naikhongchhari Area 3",
          lat: 22.145,
          lng: 92.198,
        },
        {
          id: "naikhongchhari_area_4",
          name: "Naikhongchhari Area 4",
          lat: 22.155,
          lng: 92.198,
        },
        {
          id: "others_naikhongchhari",
          name: "Others",
          lat: 22.1453,
          lng: 92.2184,
        },
      ],
      rowangchhari: [
        {
          id: "rowangchhari_area_1",
          name: "Rowangchhari Area 1",
          lat: 22.175,
          lng: 92.198,
        },
        {
          id: "rowangchhari_area_2",
          name: "Rowangchhari Area 2",
          lat: 22.185,
          lng: 92.198,
        },
        {
          id: "rowangchhari_area_3",
          name: "Rowangchhari Area 3",
          lat: 22.195,
          lng: 92.198,
        },
        {
          id: "rowangchhari_area_4",
          name: "Rowangchhari Area 4",
          lat: 22.205,
          lng: 92.198,
        },
        {
          id: "others_rowangchhari",
          name: "Others",
          lat: 22.1953,
          lng: 92.2184,
        },
      ],
      ruma: [
        { id: "ruma_area_1", name: "Ruma Area 1", lat: 22.225, lng: 92.198 },
        { id: "ruma_area_2", name: "Ruma Area 2", lat: 22.235, lng: 92.198 },
        { id: "ruma_area_3", name: "Ruma Area 3", lat: 22.245, lng: 92.198 },
        { id: "ruma_area_4", name: "Ruma Area 4", lat: 22.255, lng: 92.198 },
        { id: "others_ruma", name: "Others", lat: 22.2453, lng: 92.2184 },
      ],
      thanchi: [
        {
          id: "thanchi_area_1",
          name: "Thanchi Area 1",
          lat: 22.125,
          lng: 92.248,
        },
        {
          id: "thanchi_area_2",
          name: "Thanchi Area 2",
          lat: 22.135,
          lng: 92.248,
        },
        {
          id: "thanchi_area_3",
          name: "Thanchi Area 3",
          lat: 22.145,
          lng: 92.248,
        },
        {
          id: "thanchi_area_4",
          name: "Thanchi Area 4",
          lat: 22.155,
          lng: 92.248,
        },
        { id: "others_thanchi", name: "Others", lat: 22.1453, lng: 92.2684 },
      ],
      khagrachari_sadar: [
        {
          id: "khagrachari_sadar_area_1",
          name: "Khagrachari Sadar Area 1",
          lat: 23.03,
          lng: 91.913,
        },
        {
          id: "khagrachari_sadar_area_2",
          name: "Khagrachari Sadar Area 2",
          lat: 23.04,
          lng: 91.913,
        },
        {
          id: "khagrachari_sadar_area_3",
          name: "Khagrachari Sadar Area 3",
          lat: 23.05,
          lng: 91.913,
        },
        {
          id: "khagrachari_sadar_area_4",
          name: "Khagrachari Sadar Area 4",
          lat: 23.06,
          lng: 91.913,
        },
        {
          id: "others_khagrachari_sadar",
          name: "Others",
          lat: 23.05,
          lng: 91.9333,
        },
      ],
      dighinala: [
        {
          id: "dighinala_area_1",
          name: "Dighinala Area 1",
          lat: 23.08,
          lng: 91.913,
        },
        {
          id: "dighinala_area_2",
          name: "Dighinala Area 2",
          lat: 23.09,
          lng: 91.913,
        },
        {
          id: "dighinala_area_3",
          name: "Dighinala Area 3",
          lat: 23.1,
          lng: 91.913,
        },
        {
          id: "dighinala_area_4",
          name: "Dighinala Area 4",
          lat: 23.11,
          lng: 91.913,
        },
        { id: "others_dighinala", name: "Others", lat: 23.1, lng: 91.9333 },
      ],
      lakshmichhari: [
        {
          id: "lakshmichhari_area_1",
          name: "Lakshmichhari Area 1",
          lat: 23.13,
          lng: 91.913,
        },
        {
          id: "lakshmichhari_area_2",
          name: "Lakshmichhari Area 2",
          lat: 23.14,
          lng: 91.913,
        },
        {
          id: "lakshmichhari_area_3",
          name: "Lakshmichhari Area 3",
          lat: 23.15,
          lng: 91.913,
        },
        {
          id: "lakshmichhari_area_4",
          name: "Lakshmichhari Area 4",
          lat: 23.16,
          lng: 91.913,
        },
        {
          id: "others_lakshmichhari",
          name: "Others",
          lat: 23.15,
          lng: 91.9333,
        },
      ],
      mahalchhari: [
        {
          id: "mahalchhari_area_1",
          name: "Mahalchhari Area 1",
          lat: 23.03,
          lng: 91.963,
        },
        {
          id: "mahalchhari_area_2",
          name: "Mahalchhari Area 2",
          lat: 23.04,
          lng: 91.963,
        },
        {
          id: "mahalchhari_area_3",
          name: "Mahalchhari Area 3",
          lat: 23.05,
          lng: 91.963,
        },
        {
          id: "mahalchhari_area_4",
          name: "Mahalchhari Area 4",
          lat: 23.06,
          lng: 91.963,
        },
        { id: "others_mahalchhari", name: "Others", lat: 23.05, lng: 91.9833 },
      ],
      manikchhari: [
        {
          id: "manikchhari_area_1",
          name: "Manikchhari Area 1",
          lat: 23.08,
          lng: 91.963,
        },
        {
          id: "manikchhari_area_2",
          name: "Manikchhari Area 2",
          lat: 23.09,
          lng: 91.963,
        },
        {
          id: "manikchhari_area_3",
          name: "Manikchhari Area 3",
          lat: 23.1,
          lng: 91.963,
        },
        {
          id: "manikchhari_area_4",
          name: "Manikchhari Area 4",
          lat: 23.11,
          lng: 91.963,
        },
        { id: "others_manikchhari", name: "Others", lat: 23.1, lng: 91.9833 },
      ],
      matiranga: [
        {
          id: "matiranga_area_1",
          name: "Matiranga Area 1",
          lat: 23.13,
          lng: 91.963,
        },
        {
          id: "matiranga_area_2",
          name: "Matiranga Area 2",
          lat: 23.14,
          lng: 91.963,
        },
        {
          id: "matiranga_area_3",
          name: "Matiranga Area 3",
          lat: 23.15,
          lng: 91.963,
        },
        {
          id: "matiranga_area_4",
          name: "Matiranga Area 4",
          lat: 23.16,
          lng: 91.963,
        },
        { id: "others_matiranga", name: "Others", lat: 23.15, lng: 91.9833 },
      ],
      panchhari: [
        {
          id: "panchhari_area_1",
          name: "Panchhari Area 1",
          lat: 23.03,
          lng: 92.013,
        },
        {
          id: "panchhari_area_2",
          name: "Panchhari Area 2",
          lat: 23.04,
          lng: 92.013,
        },
        {
          id: "panchhari_area_3",
          name: "Panchhari Area 3",
          lat: 23.05,
          lng: 92.013,
        },
        {
          id: "panchhari_area_4",
          name: "Panchhari Area 4",
          lat: 23.06,
          lng: 92.013,
        },
        { id: "others_panchhari", name: "Others", lat: 23.05, lng: 92.0333 },
      ],
      ramgarh: [
        {
          id: "ramgarh_area_1",
          name: "Ramgarh Area 1",
          lat: 23.08,
          lng: 92.013,
        },
        {
          id: "ramgarh_area_2",
          name: "Ramgarh Area 2",
          lat: 23.09,
          lng: 92.013,
        },
        {
          id: "ramgarh_area_3",
          name: "Ramgarh Area 3",
          lat: 23.1,
          lng: 92.013,
        },
        {
          id: "ramgarh_area_4",
          name: "Ramgarh Area 4",
          lat: 23.11,
          lng: 92.013,
        },
        { id: "others_ramgarh", name: "Others", lat: 23.1, lng: 92.0333 },
      ],
      feni_sadar: [
        {
          id: "feni_sadar_area_1",
          name: "Feni Sadar Area 1",
          lat: 22.946,
          lng: 91.328,
        },
        {
          id: "feni_sadar_area_2",
          name: "Feni Sadar Area 2",
          lat: 22.956,
          lng: 91.328,
        },
        {
          id: "feni_sadar_area_3",
          name: "Feni Sadar Area 3",
          lat: 22.966,
          lng: 91.328,
        },
        {
          id: "feni_sadar_area_4",
          name: "Feni Sadar Area 4",
          lat: 22.976,
          lng: 91.328,
        },
        { id: "others_feni_sadar", name: "Others", lat: 22.9659, lng: 91.3476 },
      ],
      chhagalnaiya: [
        {
          id: "chhagalnaiya_area_1",
          name: "Chhagalnaiya Area 1",
          lat: 22.996,
          lng: 91.328,
        },
        {
          id: "chhagalnaiya_area_2",
          name: "Chhagalnaiya Area 2",
          lat: 23.006,
          lng: 91.328,
        },
        {
          id: "chhagalnaiya_area_3",
          name: "Chhagalnaiya Area 3",
          lat: 23.016,
          lng: 91.328,
        },
        {
          id: "chhagalnaiya_area_4",
          name: "Chhagalnaiya Area 4",
          lat: 23.026,
          lng: 91.328,
        },
        {
          id: "others_chhagalnaiya",
          name: "Others",
          lat: 23.0159,
          lng: 91.3476,
        },
      ],
      daganbhuiyan: [
        {
          id: "daganbhuiyan_area_1",
          name: "Daganbhuiyan Area 1",
          lat: 23.046,
          lng: 91.328,
        },
        {
          id: "daganbhuiyan_area_2",
          name: "Daganbhuiyan Area 2",
          lat: 23.056,
          lng: 91.328,
        },
        {
          id: "daganbhuiyan_area_3",
          name: "Daganbhuiyan Area 3",
          lat: 23.066,
          lng: 91.328,
        },
        {
          id: "daganbhuiyan_area_4",
          name: "Daganbhuiyan Area 4",
          lat: 23.076,
          lng: 91.328,
        },
        {
          id: "others_daganbhuiyan",
          name: "Others",
          lat: 23.0659,
          lng: 91.3476,
        },
      ],
      fulgazi: [
        {
          id: "fulgazi_area_1",
          name: "Fulgazi Area 1",
          lat: 22.946,
          lng: 91.378,
        },
        {
          id: "fulgazi_area_2",
          name: "Fulgazi Area 2",
          lat: 22.956,
          lng: 91.378,
        },
        {
          id: "fulgazi_area_3",
          name: "Fulgazi Area 3",
          lat: 22.966,
          lng: 91.378,
        },
        {
          id: "fulgazi_area_4",
          name: "Fulgazi Area 4",
          lat: 22.976,
          lng: 91.378,
        },
        { id: "others_fulgazi", name: "Others", lat: 22.9659, lng: 91.3976 },
      ],
      parshuram: [
        {
          id: "parshuram_area_1",
          name: "Parshuram Area 1",
          lat: 22.996,
          lng: 91.378,
        },
        {
          id: "parshuram_area_2",
          name: "Parshuram Area 2",
          lat: 23.006,
          lng: 91.378,
        },
        {
          id: "parshuram_area_3",
          name: "Parshuram Area 3",
          lat: 23.016,
          lng: 91.378,
        },
        {
          id: "parshuram_area_4",
          name: "Parshuram Area 4",
          lat: 23.026,
          lng: 91.378,
        },
        { id: "others_parshuram", name: "Others", lat: 23.0159, lng: 91.3976 },
      ],
      sonagazi: [
        {
          id: "sonagazi_area_1",
          name: "Sonagazi Area 1",
          lat: 23.046,
          lng: 91.378,
        },
        {
          id: "sonagazi_area_2",
          name: "Sonagazi Area 2",
          lat: 23.056,
          lng: 91.378,
        },
        {
          id: "sonagazi_area_3",
          name: "Sonagazi Area 3",
          lat: 23.066,
          lng: 91.378,
        },
        {
          id: "sonagazi_area_4",
          name: "Sonagazi Area 4",
          lat: 23.076,
          lng: 91.378,
        },
        { id: "others_sonagazi", name: "Others", lat: 23.0659, lng: 91.3976 },
      ],
      lakshmipur_sadar: [
        {
          id: "lakshmipur_sadar_area_1",
          name: "Lakshmipur Sadar Area 1",
          lat: 22.876,
          lng: 90.758,
        },
        {
          id: "lakshmipur_sadar_area_2",
          name: "Lakshmipur Sadar Area 2",
          lat: 22.886,
          lng: 90.758,
        },
        {
          id: "lakshmipur_sadar_area_3",
          name: "Lakshmipur Sadar Area 3",
          lat: 22.896,
          lng: 90.758,
        },
        {
          id: "lakshmipur_sadar_area_4",
          name: "Lakshmipur Sadar Area 4",
          lat: 22.906,
          lng: 90.758,
        },
        {
          id: "others_lakshmipur_sadar",
          name: "Others",
          lat: 22.8958,
          lng: 90.7783,
        },
      ],
      raipur: [
        {
          id: "raipur_area_1",
          name: "Raipur Area 1",
          lat: 22.926,
          lng: 90.758,
        },
        {
          id: "raipur_area_2",
          name: "Raipur Area 2",
          lat: 22.936,
          lng: 90.758,
        },
        {
          id: "raipur_area_3",
          name: "Raipur Area 3",
          lat: 22.946,
          lng: 90.758,
        },
        {
          id: "raipur_area_4",
          name: "Raipur Area 4",
          lat: 22.956,
          lng: 90.758,
        },
        { id: "others_raipur", name: "Others", lat: 22.9458, lng: 90.7783 },
      ],
      ramganj: [
        {
          id: "ramganj_area_1",
          name: "Ramganj Area 1",
          lat: 22.976,
          lng: 90.758,
        },
        {
          id: "ramganj_area_2",
          name: "Ramganj Area 2",
          lat: 22.986,
          lng: 90.758,
        },
        {
          id: "ramganj_area_3",
          name: "Ramganj Area 3",
          lat: 22.996,
          lng: 90.758,
        },
        {
          id: "ramganj_area_4",
          name: "Ramganj Area 4",
          lat: 23.006,
          lng: 90.758,
        },
        { id: "others_ramganj", name: "Others", lat: 22.9958, lng: 90.7783 },
      ],
      ramgati: [
        {
          id: "ramgati_area_1",
          name: "Ramgati Area 1",
          lat: 22.876,
          lng: 90.808,
        },
        {
          id: "ramgati_area_2",
          name: "Ramgati Area 2",
          lat: 22.886,
          lng: 90.808,
        },
        {
          id: "ramgati_area_3",
          name: "Ramgati Area 3",
          lat: 22.896,
          lng: 90.808,
        },
        {
          id: "ramgati_area_4",
          name: "Ramgati Area 4",
          lat: 22.906,
          lng: 90.808,
        },
        { id: "others_ramgati", name: "Others", lat: 22.8958, lng: 90.8283 },
      ],
      kamalnagar: [
        {
          id: "kamalnagar_area_1",
          name: "Kamalnagar Area 1",
          lat: 22.926,
          lng: 90.808,
        },
        {
          id: "kamalnagar_area_2",
          name: "Kamalnagar Area 2",
          lat: 22.936,
          lng: 90.808,
        },
        {
          id: "kamalnagar_area_3",
          name: "Kamalnagar Area 3",
          lat: 22.946,
          lng: 90.808,
        },
        {
          id: "kamalnagar_area_4",
          name: "Kamalnagar Area 4",
          lat: 22.956,
          lng: 90.808,
        },
        { id: "others_kamalnagar", name: "Others", lat: 22.9458, lng: 90.8283 },
      ],
      noakhali_sadar: [
        {
          id: "noakhali_sadar_area_1",
          name: "Noakhali Sadar Area 1",
          lat: 22.797,
          lng: 91.03,
        },
        {
          id: "noakhali_sadar_area_2",
          name: "Noakhali Sadar Area 2",
          lat: 22.807,
          lng: 91.03,
        },
        {
          id: "noakhali_sadar_area_3",
          name: "Noakhali Sadar Area 3",
          lat: 22.817,
          lng: 91.03,
        },
        {
          id: "noakhali_sadar_area_4",
          name: "Noakhali Sadar Area 4",
          lat: 22.827,
          lng: 91.03,
        },
        {
          id: "others_noakhali_sadar",
          name: "Others",
          lat: 22.8167,
          lng: 91.05,
        },
      ],
      begumganj: [
        {
          id: "begumganj_area_1",
          name: "Begumganj Area 1",
          lat: 22.847,
          lng: 91.03,
        },
        {
          id: "begumganj_area_2",
          name: "Begumganj Area 2",
          lat: 22.857,
          lng: 91.03,
        },
        {
          id: "begumganj_area_3",
          name: "Begumganj Area 3",
          lat: 22.867,
          lng: 91.03,
        },
        {
          id: "begumganj_area_4",
          name: "Begumganj Area 4",
          lat: 22.877,
          lng: 91.03,
        },
        { id: "others_begumganj", name: "Others", lat: 22.8667, lng: 91.05 },
      ],
      chatkhil: [
        {
          id: "chatkhil_area_1",
          name: "Chatkhil Area 1",
          lat: 22.897,
          lng: 91.03,
        },
        {
          id: "chatkhil_area_2",
          name: "Chatkhil Area 2",
          lat: 22.907,
          lng: 91.03,
        },
        {
          id: "chatkhil_area_3",
          name: "Chatkhil Area 3",
          lat: 22.917,
          lng: 91.03,
        },
        {
          id: "chatkhil_area_4",
          name: "Chatkhil Area 4",
          lat: 22.927,
          lng: 91.03,
        },
        { id: "others_chatkhil", name: "Others", lat: 22.9167, lng: 91.05 },
      ],
      companiganj_noakhali: [
        {
          id: "companiganj_noakhali_area_1",
          name: "Companiganj Noakhali Area 1",
          lat: 22.797,
          lng: 91.08,
        },
        {
          id: "companiganj_noakhali_area_2",
          name: "Companiganj Noakhali Area 2",
          lat: 22.807,
          lng: 91.08,
        },
        {
          id: "companiganj_noakhali_area_3",
          name: "Companiganj Noakhali Area 3",
          lat: 22.817,
          lng: 91.08,
        },
        {
          id: "companiganj_noakhali_area_4",
          name: "Companiganj Noakhali Area 4",
          lat: 22.827,
          lng: 91.08,
        },
        {
          id: "others_companiganj_noakhali",
          name: "Others",
          lat: 22.8167,
          lng: 91.1,
        },
      ],
      hatiya: [
        { id: "hatiya_area_1", name: "Hatiya Area 1", lat: 22.847, lng: 91.08 },
        { id: "hatiya_area_2", name: "Hatiya Area 2", lat: 22.857, lng: 91.08 },
        { id: "hatiya_area_3", name: "Hatiya Area 3", lat: 22.867, lng: 91.08 },
        { id: "hatiya_area_4", name: "Hatiya Area 4", lat: 22.877, lng: 91.08 },
        { id: "others_hatiya", name: "Others", lat: 22.8667, lng: 91.1 },
      ],
      kabirhat: [
        {
          id: "kabirhat_area_1",
          name: "Kabirhat Area 1",
          lat: 22.897,
          lng: 91.08,
        },
        {
          id: "kabirhat_area_2",
          name: "Kabirhat Area 2",
          lat: 22.907,
          lng: 91.08,
        },
        {
          id: "kabirhat_area_3",
          name: "Kabirhat Area 3",
          lat: 22.917,
          lng: 91.08,
        },
        {
          id: "kabirhat_area_4",
          name: "Kabirhat Area 4",
          lat: 22.927,
          lng: 91.08,
        },
        { id: "others_kabirhat", name: "Others", lat: 22.9167, lng: 91.1 },
      ],
      senbagh: [
        {
          id: "senbagh_area_1",
          name: "Senbagh Area 1",
          lat: 22.797,
          lng: 91.13,
        },
        {
          id: "senbagh_area_2",
          name: "Senbagh Area 2",
          lat: 22.807,
          lng: 91.13,
        },
        {
          id: "senbagh_area_3",
          name: "Senbagh Area 3",
          lat: 22.817,
          lng: 91.13,
        },
        {
          id: "senbagh_area_4",
          name: "Senbagh Area 4",
          lat: 22.827,
          lng: 91.13,
        },
        { id: "others_senbagh", name: "Others", lat: 22.8167, lng: 91.15 },
      ],
      sonaimuri: [
        {
          id: "sonaimuri_area_1",
          name: "Sonaimuri Area 1",
          lat: 22.847,
          lng: 91.13,
        },
        {
          id: "sonaimuri_area_2",
          name: "Sonaimuri Area 2",
          lat: 22.857,
          lng: 91.13,
        },
        {
          id: "sonaimuri_area_3",
          name: "Sonaimuri Area 3",
          lat: 22.867,
          lng: 91.13,
        },
        {
          id: "sonaimuri_area_4",
          name: "Sonaimuri Area 4",
          lat: 22.877,
          lng: 91.13,
        },
        { id: "others_sonaimuri", name: "Others", lat: 22.8667, lng: 91.15 },
      ],
      chandpur_sadar: [
        {
          id: "chandpur_sadar_area_1",
          name: "Chandpur Sadar Area 1",
          lat: 23.163,
          lng: 90.58,
        },
        {
          id: "chandpur_sadar_area_2",
          name: "Chandpur Sadar Area 2",
          lat: 23.173,
          lng: 90.58,
        },
        {
          id: "chandpur_sadar_area_3",
          name: "Chandpur Sadar Area 3",
          lat: 23.183,
          lng: 90.58,
        },
        {
          id: "chandpur_sadar_area_4",
          name: "Chandpur Sadar Area 4",
          lat: 23.193,
          lng: 90.58,
        },
        {
          id: "others_chandpur_sadar",
          name: "Others",
          lat: 23.1833,
          lng: 90.6,
        },
      ],
      faridganj: [
        {
          id: "faridganj_area_1",
          name: "Faridganj Area 1",
          lat: 23.213,
          lng: 90.58,
        },
        {
          id: "faridganj_area_2",
          name: "Faridganj Area 2",
          lat: 23.223,
          lng: 90.58,
        },
        {
          id: "faridganj_area_3",
          name: "Faridganj Area 3",
          lat: 23.233,
          lng: 90.58,
        },
        {
          id: "faridganj_area_4",
          name: "Faridganj Area 4",
          lat: 23.243,
          lng: 90.58,
        },
        { id: "others_faridganj", name: "Others", lat: 23.2333, lng: 90.6 },
      ],
      haimchar: [
        {
          id: "haimchar_area_1",
          name: "Haimchar Area 1",
          lat: 23.263,
          lng: 90.58,
        },
        {
          id: "haimchar_area_2",
          name: "Haimchar Area 2",
          lat: 23.273,
          lng: 90.58,
        },
        {
          id: "haimchar_area_3",
          name: "Haimchar Area 3",
          lat: 23.283,
          lng: 90.58,
        },
        {
          id: "haimchar_area_4",
          name: "Haimchar Area 4",
          lat: 23.293,
          lng: 90.58,
        },
        { id: "others_haimchar", name: "Others", lat: 23.2833, lng: 90.6 },
      ],
      hajiganj: [
        {
          id: "hajiganj_area_1",
          name: "Hajiganj Area 1",
          lat: 23.163,
          lng: 90.63,
        },
        {
          id: "hajiganj_area_2",
          name: "Hajiganj Area 2",
          lat: 23.173,
          lng: 90.63,
        },
        {
          id: "hajiganj_area_3",
          name: "Hajiganj Area 3",
          lat: 23.183,
          lng: 90.63,
        },
        {
          id: "hajiganj_area_4",
          name: "Hajiganj Area 4",
          lat: 23.193,
          lng: 90.63,
        },
        { id: "others_hajiganj", name: "Others", lat: 23.1833, lng: 90.65 },
      ],
      kachua: [
        { id: "kachua_area_1", name: "Kachua Area 1", lat: 23.213, lng: 90.63 },
        { id: "kachua_area_2", name: "Kachua Area 2", lat: 23.223, lng: 90.63 },
        { id: "kachua_area_3", name: "Kachua Area 3", lat: 23.233, lng: 90.63 },
        { id: "kachua_area_4", name: "Kachua Area 4", lat: 23.243, lng: 90.63 },
        { id: "others_kachua", name: "Others", lat: 23.2333, lng: 90.65 },
      ],
      matlab_dakshin: [
        {
          id: "matlab_dakshin_area_1",
          name: "Matlab Dakshin Area 1",
          lat: 23.263,
          lng: 90.63,
        },
        {
          id: "matlab_dakshin_area_2",
          name: "Matlab Dakshin Area 2",
          lat: 23.273,
          lng: 90.63,
        },
        {
          id: "matlab_dakshin_area_3",
          name: "Matlab Dakshin Area 3",
          lat: 23.283,
          lng: 90.63,
        },
        {
          id: "matlab_dakshin_area_4",
          name: "Matlab Dakshin Area 4",
          lat: 23.293,
          lng: 90.63,
        },
        {
          id: "others_matlab_dakshin",
          name: "Others",
          lat: 23.2833,
          lng: 90.65,
        },
      ],
      shahrasti: [
        {
          id: "shahrasti_area_1",
          name: "Shahrasti Area 1",
          lat: 23.163,
          lng: 90.68,
        },
        {
          id: "shahrasti_area_2",
          name: "Shahrasti Area 2",
          lat: 23.173,
          lng: 90.68,
        },
        {
          id: "shahrasti_area_3",
          name: "Shahrasti Area 3",
          lat: 23.183,
          lng: 90.68,
        },
        {
          id: "shahrasti_area_4",
          name: "Shahrasti Area 4",
          lat: 23.193,
          lng: 90.68,
        },
        { id: "others_shahrasti", name: "Others", lat: 23.1833, lng: 90.7 },
      ],
      brahmanbaria_sadar: [
        {
          id: "brahmanbaria_sadar_area_1",
          name: "Brahmanbaria Sadar Area 1",
          lat: 23.897,
          lng: 91.03,
        },
        {
          id: "brahmanbaria_sadar_area_2",
          name: "Brahmanbaria Sadar Area 2",
          lat: 23.907,
          lng: 91.03,
        },
        {
          id: "brahmanbaria_sadar_area_3",
          name: "Brahmanbaria Sadar Area 3",
          lat: 23.917,
          lng: 91.03,
        },
        {
          id: "brahmanbaria_sadar_area_4",
          name: "Brahmanbaria Sadar Area 4",
          lat: 23.927,
          lng: 91.03,
        },
        {
          id: "others_brahmanbaria_sadar",
          name: "Others",
          lat: 23.9167,
          lng: 91.05,
        },
      ],
      akhaura: [
        {
          id: "akhaura_area_1",
          name: "Akhaura Area 1",
          lat: 23.947,
          lng: 91.03,
        },
        {
          id: "akhaura_area_2",
          name: "Akhaura Area 2",
          lat: 23.957,
          lng: 91.03,
        },
        {
          id: "akhaura_area_3",
          name: "Akhaura Area 3",
          lat: 23.967,
          lng: 91.03,
        },
        {
          id: "akhaura_area_4",
          name: "Akhaura Area 4",
          lat: 23.977,
          lng: 91.03,
        },
        { id: "others_akhaura", name: "Others", lat: 23.9667, lng: 91.05 },
      ],
      ashuganj: [
        {
          id: "ashuganj_area_1",
          name: "Ashuganj Area 1",
          lat: 23.997,
          lng: 91.03,
        },
        {
          id: "ashuganj_area_2",
          name: "Ashuganj Area 2",
          lat: 24.007,
          lng: 91.03,
        },
        {
          id: "ashuganj_area_3",
          name: "Ashuganj Area 3",
          lat: 24.017,
          lng: 91.03,
        },
        {
          id: "ashuganj_area_4",
          name: "Ashuganj Area 4",
          lat: 24.027,
          lng: 91.03,
        },
        { id: "others_ashuganj", name: "Others", lat: 24.0167, lng: 91.05 },
      ],
      bancharampur: [
        {
          id: "bancharampur_area_1",
          name: "Bancharampur Area 1",
          lat: 23.897,
          lng: 91.08,
        },
        {
          id: "bancharampur_area_2",
          name: "Bancharampur Area 2",
          lat: 23.907,
          lng: 91.08,
        },
        {
          id: "bancharampur_area_3",
          name: "Bancharampur Area 3",
          lat: 23.917,
          lng: 91.08,
        },
        {
          id: "bancharampur_area_4",
          name: "Bancharampur Area 4",
          lat: 23.927,
          lng: 91.08,
        },
        { id: "others_bancharampur", name: "Others", lat: 23.9167, lng: 91.1 },
      ],
      kasba: [
        { id: "kasba_area_1", name: "Kasba Area 1", lat: 23.947, lng: 91.08 },
        { id: "kasba_area_2", name: "Kasba Area 2", lat: 23.957, lng: 91.08 },
        { id: "kasba_area_3", name: "Kasba Area 3", lat: 23.967, lng: 91.08 },
        { id: "kasba_area_4", name: "Kasba Area 4", lat: 23.977, lng: 91.08 },
        { id: "others_kasba", name: "Others", lat: 23.9667, lng: 91.1 },
      ],
      nabinagar: [
        {
          id: "nabinagar_area_1",
          name: "Nabinagar Area 1",
          lat: 23.997,
          lng: 91.08,
        },
        {
          id: "nabinagar_area_2",
          name: "Nabinagar Area 2",
          lat: 24.007,
          lng: 91.08,
        },
        {
          id: "nabinagar_area_3",
          name: "Nabinagar Area 3",
          lat: 24.017,
          lng: 91.08,
        },
        {
          id: "nabinagar_area_4",
          name: "Nabinagar Area 4",
          lat: 24.027,
          lng: 91.08,
        },
        { id: "others_nabinagar", name: "Others", lat: 24.0167, lng: 91.1 },
      ],
      nasirnagar: [
        {
          id: "nasirnagar_area_1",
          name: "Nasirnagar Area 1",
          lat: 23.897,
          lng: 91.13,
        },
        {
          id: "nasirnagar_area_2",
          name: "Nasirnagar Area 2",
          lat: 23.907,
          lng: 91.13,
        },
        {
          id: "nasirnagar_area_3",
          name: "Nasirnagar Area 3",
          lat: 23.917,
          lng: 91.13,
        },
        {
          id: "nasirnagar_area_4",
          name: "Nasirnagar Area 4",
          lat: 23.927,
          lng: 91.13,
        },
        { id: "others_nasirnagar", name: "Others", lat: 23.9167, lng: 91.15 },
      ],
      sarail: [
        { id: "sarail_area_1", name: "Sarail Area 1", lat: 23.947, lng: 91.13 },
        { id: "sarail_area_2", name: "Sarail Area 2", lat: 23.957, lng: 91.13 },
        { id: "sarail_area_3", name: "Sarail Area 3", lat: 23.967, lng: 91.13 },
        { id: "sarail_area_4", name: "Sarail Area 4", lat: 23.977, lng: 91.13 },
        { id: "others_sarail", name: "Others", lat: 23.9667, lng: 91.15 },
      ],
      comilla_sadar: [
        {
          id: "comilla_sadar_area_1",
          name: "Comilla Sadar Area 1",
          lat: 23.397,
          lng: 91.113,
        },
        {
          id: "comilla_sadar_area_2",
          name: "Comilla Sadar Area 2",
          lat: 23.407,
          lng: 91.113,
        },
        {
          id: "comilla_sadar_area_3",
          name: "Comilla Sadar Area 3",
          lat: 23.417,
          lng: 91.113,
        },
        {
          id: "comilla_sadar_area_4",
          name: "Comilla Sadar Area 4",
          lat: 23.427,
          lng: 91.113,
        },
        {
          id: "others_comilla_sadar",
          name: "Others",
          lat: 23.4167,
          lng: 91.1333,
        },
      ],
      barura: [
        {
          id: "barura_area_1",
          name: "Barura Area 1",
          lat: 23.447,
          lng: 91.113,
        },
        {
          id: "barura_area_2",
          name: "Barura Area 2",
          lat: 23.457,
          lng: 91.113,
        },
        {
          id: "barura_area_3",
          name: "Barura Area 3",
          lat: 23.467,
          lng: 91.113,
        },
        {
          id: "barura_area_4",
          name: "Barura Area 4",
          lat: 23.477,
          lng: 91.113,
        },
        { id: "others_barura", name: "Others", lat: 23.4667, lng: 91.1333 },
      ],
      brahmanpara: [
        {
          id: "brahmanpara_area_1",
          name: "Brahmanpara Area 1",
          lat: 23.497,
          lng: 91.113,
        },
        {
          id: "brahmanpara_area_2",
          name: "Brahmanpara Area 2",
          lat: 23.507,
          lng: 91.113,
        },
        {
          id: "brahmanpara_area_3",
          name: "Brahmanpara Area 3",
          lat: 23.517,
          lng: 91.113,
        },
        {
          id: "brahmanpara_area_4",
          name: "Brahmanpara Area 4",
          lat: 23.527,
          lng: 91.113,
        },
        {
          id: "others_brahmanpara",
          name: "Others",
          lat: 23.5167,
          lng: 91.1333,
        },
      ],
      burichang: [
        {
          id: "burichang_area_1",
          name: "Burichang Area 1",
          lat: 23.397,
          lng: 91.163,
        },
        {
          id: "burichang_area_2",
          name: "Burichang Area 2",
          lat: 23.407,
          lng: 91.163,
        },
        {
          id: "burichang_area_3",
          name: "Burichang Area 3",
          lat: 23.417,
          lng: 91.163,
        },
        {
          id: "burichang_area_4",
          name: "Burichang Area 4",
          lat: 23.427,
          lng: 91.163,
        },
        { id: "others_burichang", name: "Others", lat: 23.4167, lng: 91.1833 },
      ],
      chandina: [
        {
          id: "chandina_area_1",
          name: "Chandina Area 1",
          lat: 23.447,
          lng: 91.163,
        },
        {
          id: "chandina_area_2",
          name: "Chandina Area 2",
          lat: 23.457,
          lng: 91.163,
        },
        {
          id: "chandina_area_3",
          name: "Chandina Area 3",
          lat: 23.467,
          lng: 91.163,
        },
        {
          id: "chandina_area_4",
          name: "Chandina Area 4",
          lat: 23.477,
          lng: 91.163,
        },
        { id: "others_chandina", name: "Others", lat: 23.4667, lng: 91.1833 },
      ],
      chauddagram: [
        {
          id: "chauddagram_area_1",
          name: "Chauddagram Area 1",
          lat: 23.497,
          lng: 91.163,
        },
        {
          id: "chauddagram_area_2",
          name: "Chauddagram Area 2",
          lat: 23.507,
          lng: 91.163,
        },
        {
          id: "chauddagram_area_3",
          name: "Chauddagram Area 3",
          lat: 23.517,
          lng: 91.163,
        },
        {
          id: "chauddagram_area_4",
          name: "Chauddagram Area 4",
          lat: 23.527,
          lng: 91.163,
        },
        {
          id: "others_chauddagram",
          name: "Others",
          lat: 23.5167,
          lng: 91.1833,
        },
      ],
      daudkandi: [
        {
          id: "daudkandi_area_1",
          name: "Daudkandi Area 1",
          lat: 23.397,
          lng: 91.213,
        },
        {
          id: "daudkandi_area_2",
          name: "Daudkandi Area 2",
          lat: 23.407,
          lng: 91.213,
        },
        {
          id: "daudkandi_area_3",
          name: "Daudkandi Area 3",
          lat: 23.417,
          lng: 91.213,
        },
        {
          id: "daudkandi_area_4",
          name: "Daudkandi Area 4",
          lat: 23.427,
          lng: 91.213,
        },
        { id: "others_daudkandi", name: "Others", lat: 23.4167, lng: 91.2333 },
      ],
      debidwar: [
        {
          id: "debidwar_area_1",
          name: "Debidwar Area 1",
          lat: 23.447,
          lng: 91.213,
        },
        {
          id: "debidwar_area_2",
          name: "Debidwar Area 2",
          lat: 23.457,
          lng: 91.213,
        },
        {
          id: "debidwar_area_3",
          name: "Debidwar Area 3",
          lat: 23.467,
          lng: 91.213,
        },
        {
          id: "debidwar_area_4",
          name: "Debidwar Area 4",
          lat: 23.477,
          lng: 91.213,
        },
        { id: "others_debidwar", name: "Others", lat: 23.4667, lng: 91.2333 },
      ],
      homna: [
        { id: "homna_area_1", name: "Homna Area 1", lat: 23.497, lng: 91.213 },
        { id: "homna_area_2", name: "Homna Area 2", lat: 23.507, lng: 91.213 },
        { id: "homna_area_3", name: "Homna Area 3", lat: 23.517, lng: 91.213 },
        { id: "homna_area_4", name: "Homna Area 4", lat: 23.527, lng: 91.213 },
        { id: "others_homna", name: "Others", lat: 23.5167, lng: 91.2333 },
      ],
      laksam: [
        {
          id: "laksam_area_1",
          name: "Laksam Area 1",
          lat: 23.397,
          lng: 91.113,
        },
        {
          id: "laksam_area_2",
          name: "Laksam Area 2",
          lat: 23.407,
          lng: 91.113,
        },
        {
          id: "laksam_area_3",
          name: "Laksam Area 3",
          lat: 23.417,
          lng: 91.113,
        },
        {
          id: "laksam_area_4",
          name: "Laksam Area 4",
          lat: 23.427,
          lng: 91.113,
        },
        { id: "others_laksam", name: "Others", lat: 23.4167, lng: 91.1333 },
      ],
      sylhet_sadar: [
        {
          id: "sylhet_sadar_area_1",
          name: "Sylhet Sadar Area 1",
          lat: 24.821,
          lng: 91.801,
        },
        {
          id: "sylhet_sadar_area_2",
          name: "Sylhet Sadar Area 2",
          lat: 24.831,
          lng: 91.801,
        },
        {
          id: "sylhet_sadar_area_3",
          name: "Sylhet Sadar Area 3",
          lat: 24.841,
          lng: 91.801,
        },
        { id: "others_sylhet_sadar", name: "Others", lat: 24.841, lng: 91.821 },
      ],
      beanibazar: [
        {
          id: "beanibazar_area_1",
          name: "Beanibazar Area 1",
          lat: 24.871,
          lng: 91.801,
        },
        {
          id: "beanibazar_area_2",
          name: "Beanibazar Area 2",
          lat: 24.881,
          lng: 91.801,
        },
        {
          id: "beanibazar_area_3",
          name: "Beanibazar Area 3",
          lat: 24.891,
          lng: 91.801,
        },
        { id: "others_beanibazar", name: "Others", lat: 24.891, lng: 91.821 },
      ],
      golapganj: [
        {
          id: "golapganj_area_1",
          name: "Golapganj Area 1",
          lat: 24.921,
          lng: 91.801,
        },
        {
          id: "golapganj_area_2",
          name: "Golapganj Area 2",
          lat: 24.931,
          lng: 91.801,
        },
        {
          id: "golapganj_area_3",
          name: "Golapganj Area 3",
          lat: 24.941,
          lng: 91.801,
        },
        { id: "others_golapganj", name: "Others", lat: 24.941, lng: 91.821 },
      ],
      kanaighat: [
        {
          id: "kanaighat_area_1",
          name: "Kanaighat Area 1",
          lat: 24.821,
          lng: 91.851,
        },
        {
          id: "kanaighat_area_2",
          name: "Kanaighat Area 2",
          lat: 24.831,
          lng: 91.851,
        },
        {
          id: "kanaighat_area_3",
          name: "Kanaighat Area 3",
          lat: 24.841,
          lng: 91.851,
        },
        { id: "others_kanaighat", name: "Others", lat: 24.841, lng: 91.871 },
      ],
      bishwanath: [
        {
          id: "bishwanath_area_1",
          name: "Bishwanath Area 1",
          lat: 24.871,
          lng: 91.851,
        },
        {
          id: "bishwanath_area_2",
          name: "Bishwanath Area 2",
          lat: 24.881,
          lng: 91.851,
        },
        {
          id: "bishwanath_area_3",
          name: "Bishwanath Area 3",
          lat: 24.891,
          lng: 91.851,
        },
        { id: "others_bishwanath", name: "Others", lat: 24.891, lng: 91.871 },
      ],
      fenchuganj: [
        {
          id: "fenchuganj_area_1",
          name: "Fenchuganj Area 1",
          lat: 24.921,
          lng: 91.851,
        },
        {
          id: "fenchuganj_area_2",
          name: "Fenchuganj Area 2",
          lat: 24.931,
          lng: 91.851,
        },
        {
          id: "fenchuganj_area_3",
          name: "Fenchuganj Area 3",
          lat: 24.941,
          lng: 91.851,
        },
        { id: "others_fenchuganj", name: "Others", lat: 24.941, lng: 91.871 },
      ],
      gowainghat: [
        {
          id: "gowainghat_area_1",
          name: "Gowainghat Area 1",
          lat: 24.821,
          lng: 91.901,
        },
        {
          id: "gowainghat_area_2",
          name: "Gowainghat Area 2",
          lat: 24.831,
          lng: 91.901,
        },
        {
          id: "gowainghat_area_3",
          name: "Gowainghat Area 3",
          lat: 24.841,
          lng: 91.901,
        },
        { id: "others_gowainghat", name: "Others", lat: 24.841, lng: 91.921 },
      ],
      jaintiapur: [
        {
          id: "jaintiapur_area_1",
          name: "Jaintiapur Area 1",
          lat: 24.871,
          lng: 91.901,
        },
        {
          id: "jaintiapur_area_2",
          name: "Jaintiapur Area 2",
          lat: 24.881,
          lng: 91.901,
        },
        {
          id: "jaintiapur_area_3",
          name: "Jaintiapur Area 3",
          lat: 24.891,
          lng: 91.901,
        },
        { id: "others_jaintiapur", name: "Others", lat: 24.891, lng: 91.921 },
      ],
      zakiganj: [
        {
          id: "zakiganj_area_1",
          name: "Zakiganj Area 1",
          lat: 24.921,
          lng: 91.901,
        },
        {
          id: "zakiganj_area_2",
          name: "Zakiganj Area 2",
          lat: 24.931,
          lng: 91.901,
        },
        {
          id: "zakiganj_area_3",
          name: "Zakiganj Area 3",
          lat: 24.941,
          lng: 91.901,
        },
        { id: "others_zakiganj", name: "Others", lat: 24.941, lng: 91.921 },
      ],
      balaganj: [
        {
          id: "balaganj_area_1",
          name: "Balaganj Area 1",
          lat: 24.821,
          lng: 91.801,
        },
        {
          id: "balaganj_area_2",
          name: "Balaganj Area 2",
          lat: 24.831,
          lng: 91.801,
        },
        {
          id: "balaganj_area_3",
          name: "Balaganj Area 3",
          lat: 24.841,
          lng: 91.801,
        },
        { id: "others_balaganj", name: "Others", lat: 24.841, lng: 91.821 },
      ],
      osmaninagar: [
        {
          id: "osmaninagar_area_1",
          name: "Osmaninagar Area 1",
          lat: 24.871,
          lng: 91.801,
        },
        {
          id: "osmaninagar_area_2",
          name: "Osmaninagar Area 2",
          lat: 24.881,
          lng: 91.801,
        },
        {
          id: "osmaninagar_area_3",
          name: "Osmaninagar Area 3",
          lat: 24.891,
          lng: 91.801,
        },
        { id: "others_osmaninagar", name: "Others", lat: 24.891, lng: 91.821 },
      ],
      companiganj_sylhet: [
        {
          id: "companiganj_sylhet_area_1",
          name: "Companiganj Sylhet Area 1",
          lat: 24.921,
          lng: 91.801,
        },
        {
          id: "companiganj_sylhet_area_2",
          name: "Companiganj Sylhet Area 2",
          lat: 24.931,
          lng: 91.801,
        },
        {
          id: "companiganj_sylhet_area_3",
          name: "Companiganj Sylhet Area 3",
          lat: 24.941,
          lng: 91.801,
        },
        {
          id: "others_companiganj_sylhet",
          name: "Others",
          lat: 24.941,
          lng: 91.821,
        },
      ],
      moulvibazar_sadar: [
        {
          id: "moulvibazar_sadar_area_1",
          name: "Moulvibazar Sadar Area 1",
          lat: 24.413,
          lng: 91.697,
        },
        {
          id: "moulvibazar_sadar_area_2",
          name: "Moulvibazar Sadar Area 2",
          lat: 24.423,
          lng: 91.697,
        },
        {
          id: "moulvibazar_sadar_area_3",
          name: "Moulvibazar Sadar Area 3",
          lat: 24.433,
          lng: 91.697,
        },
        {
          id: "moulvibazar_sadar_area_4",
          name: "Moulvibazar Sadar Area 4",
          lat: 24.443,
          lng: 91.697,
        },
        {
          id: "others_moulvibazar_sadar",
          name: "Others",
          lat: 24.4333,
          lng: 91.7167,
        },
      ],
      kamalganj: [
        {
          id: "kamalganj_area_1",
          name: "Kamalganj Area 1",
          lat: 24.463,
          lng: 91.697,
        },
        {
          id: "kamalganj_area_2",
          name: "Kamalganj Area 2",
          lat: 24.473,
          lng: 91.697,
        },
        {
          id: "kamalganj_area_3",
          name: "Kamalganj Area 3",
          lat: 24.483,
          lng: 91.697,
        },
        {
          id: "kamalganj_area_4",
          name: "Kamalganj Area 4",
          lat: 24.493,
          lng: 91.697,
        },
        { id: "others_kamalganj", name: "Others", lat: 24.4833, lng: 91.7167 },
      ],
      kulaura: [
        {
          id: "kulaura_area_1",
          name: "Kulaura Area 1",
          lat: 24.513,
          lng: 91.697,
        },
        {
          id: "kulaura_area_2",
          name: "Kulaura Area 2",
          lat: 24.523,
          lng: 91.697,
        },
        {
          id: "kulaura_area_3",
          name: "Kulaura Area 3",
          lat: 24.533,
          lng: 91.697,
        },
        {
          id: "kulaura_area_4",
          name: "Kulaura Area 4",
          lat: 24.543,
          lng: 91.697,
        },
        { id: "others_kulaura", name: "Others", lat: 24.5333, lng: 91.7167 },
      ],
      rajnagar: [
        {
          id: "rajnagar_area_1",
          name: "Rajnagar Area 1",
          lat: 24.413,
          lng: 91.747,
        },
        {
          id: "rajnagar_area_2",
          name: "Rajnagar Area 2",
          lat: 24.423,
          lng: 91.747,
        },
        {
          id: "rajnagar_area_3",
          name: "Rajnagar Area 3",
          lat: 24.433,
          lng: 91.747,
        },
        {
          id: "rajnagar_area_4",
          name: "Rajnagar Area 4",
          lat: 24.443,
          lng: 91.747,
        },
        { id: "others_rajnagar", name: "Others", lat: 24.4333, lng: 91.7667 },
      ],
      sreemangal: [
        {
          id: "sreemangal_area_1",
          name: "Sreemangal Area 1",
          lat: 24.463,
          lng: 91.747,
        },
        {
          id: "sreemangal_area_2",
          name: "Sreemangal Area 2",
          lat: 24.473,
          lng: 91.747,
        },
        {
          id: "sreemangal_area_3",
          name: "Sreemangal Area 3",
          lat: 24.483,
          lng: 91.747,
        },
        {
          id: "sreemangal_area_4",
          name: "Sreemangal Area 4",
          lat: 24.493,
          lng: 91.747,
        },
        { id: "others_sreemangal", name: "Others", lat: 24.4833, lng: 91.7667 },
      ],
      juri: [
        { id: "juri_area_1", name: "Juri Area 1", lat: 24.513, lng: 91.747 },
        { id: "juri_area_2", name: "Juri Area 2", lat: 24.523, lng: 91.747 },
        { id: "juri_area_3", name: "Juri Area 3", lat: 24.533, lng: 91.747 },
        { id: "juri_area_4", name: "Juri Area 4", lat: 24.543, lng: 91.747 },
        { id: "others_juri", name: "Others", lat: 24.5333, lng: 91.7667 },
      ],
      barlekha: [
        {
          id: "barlekha_area_1",
          name: "Barlekha Area 1",
          lat: 24.413,
          lng: 91.797,
        },
        {
          id: "barlekha_area_2",
          name: "Barlekha Area 2",
          lat: 24.423,
          lng: 91.797,
        },
        {
          id: "barlekha_area_3",
          name: "Barlekha Area 3",
          lat: 24.433,
          lng: 91.797,
        },
        {
          id: "barlekha_area_4",
          name: "Barlekha Area 4",
          lat: 24.443,
          lng: 91.797,
        },
        { id: "others_barlekha", name: "Others", lat: 24.4333, lng: 91.8167 },
      ],
      habiganj_sadar: [
        {
          id: "habiganj_sadar_area_1",
          name: "Habiganj Sadar Area 1",
          lat: 24.305,
          lng: 91.345,
        },
        {
          id: "habiganj_sadar_area_2",
          name: "Habiganj Sadar Area 2",
          lat: 24.315,
          lng: 91.345,
        },
        {
          id: "habiganj_sadar_area_3",
          name: "Habiganj Sadar Area 3",
          lat: 24.325,
          lng: 91.345,
        },
        {
          id: "habiganj_sadar_area_4",
          name: "Habiganj Sadar Area 4",
          lat: 24.335,
          lng: 91.345,
        },
        {
          id: "others_habiganj_sadar",
          name: "Others",
          lat: 24.3247,
          lng: 91.365,
        },
      ],
      bahubal: [
        {
          id: "bahubal_area_1",
          name: "Bahubal Area 1",
          lat: 24.355,
          lng: 91.345,
        },
        {
          id: "bahubal_area_2",
          name: "Bahubal Area 2",
          lat: 24.365,
          lng: 91.345,
        },
        {
          id: "bahubal_area_3",
          name: "Bahubal Area 3",
          lat: 24.375,
          lng: 91.345,
        },
        {
          id: "bahubal_area_4",
          name: "Bahubal Area 4",
          lat: 24.385,
          lng: 91.345,
        },
        { id: "others_bahubal", name: "Others", lat: 24.3747, lng: 91.365 },
      ],
      chunarughat: [
        {
          id: "chunarughat_area_1",
          name: "Chunarughat Area 1",
          lat: 24.405,
          lng: 91.345,
        },
        {
          id: "chunarughat_area_2",
          name: "Chunarughat Area 2",
          lat: 24.415,
          lng: 91.345,
        },
        {
          id: "chunarughat_area_3",
          name: "Chunarughat Area 3",
          lat: 24.425,
          lng: 91.345,
        },
        {
          id: "chunarughat_area_4",
          name: "Chunarughat Area 4",
          lat: 24.435,
          lng: 91.345,
        },
        { id: "others_chunarughat", name: "Others", lat: 24.4247, lng: 91.365 },
      ],
      madhabpur: [
        {
          id: "madhabpur_area_1",
          name: "Madhabpur Area 1",
          lat: 24.305,
          lng: 91.395,
        },
        {
          id: "madhabpur_area_2",
          name: "Madhabpur Area 2",
          lat: 24.315,
          lng: 91.395,
        },
        {
          id: "madhabpur_area_3",
          name: "Madhabpur Area 3",
          lat: 24.325,
          lng: 91.395,
        },
        {
          id: "madhabpur_area_4",
          name: "Madhabpur Area 4",
          lat: 24.335,
          lng: 91.395,
        },
        { id: "others_madhabpur", name: "Others", lat: 24.3247, lng: 91.415 },
      ],
      nabiganj: [
        {
          id: "nabiganj_area_1",
          name: "Nabiganj Area 1",
          lat: 24.355,
          lng: 91.395,
        },
        {
          id: "nabiganj_area_2",
          name: "Nabiganj Area 2",
          lat: 24.365,
          lng: 91.395,
        },
        {
          id: "nabiganj_area_3",
          name: "Nabiganj Area 3",
          lat: 24.375,
          lng: 91.395,
        },
        {
          id: "nabiganj_area_4",
          name: "Nabiganj Area 4",
          lat: 24.385,
          lng: 91.395,
        },
        { id: "others_nabiganj", name: "Others", lat: 24.3747, lng: 91.415 },
      ],
      lakhai: [
        {
          id: "lakhai_area_1",
          name: "Lakhai Area 1",
          lat: 24.405,
          lng: 91.395,
        },
        {
          id: "lakhai_area_2",
          name: "Lakhai Area 2",
          lat: 24.415,
          lng: 91.395,
        },
        {
          id: "lakhai_area_3",
          name: "Lakhai Area 3",
          lat: 24.425,
          lng: 91.395,
        },
        {
          id: "lakhai_area_4",
          name: "Lakhai Area 4",
          lat: 24.435,
          lng: 91.395,
        },
        { id: "others_lakhai", name: "Others", lat: 24.4247, lng: 91.415 },
      ],
      ajmiriganj: [
        {
          id: "ajmiriganj_area_1",
          name: "Ajmiriganj Area 1",
          lat: 24.305,
          lng: 91.445,
        },
        {
          id: "ajmiriganj_area_2",
          name: "Ajmiriganj Area 2",
          lat: 24.315,
          lng: 91.445,
        },
        {
          id: "ajmiriganj_area_3",
          name: "Ajmiriganj Area 3",
          lat: 24.325,
          lng: 91.445,
        },
        {
          id: "ajmiriganj_area_4",
          name: "Ajmiriganj Area 4",
          lat: 24.335,
          lng: 91.445,
        },
        { id: "others_ajmiriganj", name: "Others", lat: 24.3247, lng: 91.465 },
      ],
      baniachong: [
        {
          id: "baniachong_area_1",
          name: "Baniachong Area 1",
          lat: 24.355,
          lng: 91.445,
        },
        {
          id: "baniachong_area_2",
          name: "Baniachong Area 2",
          lat: 24.365,
          lng: 91.445,
        },
        {
          id: "baniachong_area_3",
          name: "Baniachong Area 3",
          lat: 24.375,
          lng: 91.445,
        },
        {
          id: "baniachong_area_4",
          name: "Baniachong Area 4",
          lat: 24.385,
          lng: 91.445,
        },
        { id: "others_baniachong", name: "Others", lat: 24.3747, lng: 91.465 },
      ],
      sunamganj_sadar: [
        {
          id: "sunamganj_sadar_area_1",
          name: "Sunamganj Sadar Area 1",
          lat: 24.997,
          lng: 91.33,
        },
        {
          id: "sunamganj_sadar_area_2",
          name: "Sunamganj Sadar Area 2",
          lat: 25.007,
          lng: 91.33,
        },
        {
          id: "sunamganj_sadar_area_3",
          name: "Sunamganj Sadar Area 3",
          lat: 25.017,
          lng: 91.33,
        },
        {
          id: "others_sunamganj_sadar",
          name: "Others",
          lat: 25.0167,
          lng: 91.35,
        },
      ],
      chhatak: [
        {
          id: "chhatak_area_1",
          name: "Chhatak Area 1",
          lat: 25.047,
          lng: 91.33,
        },
        {
          id: "chhatak_area_2",
          name: "Chhatak Area 2",
          lat: 25.057,
          lng: 91.33,
        },
        {
          id: "chhatak_area_3",
          name: "Chhatak Area 3",
          lat: 25.067,
          lng: 91.33,
        },
        { id: "others_chhatak", name: "Others", lat: 25.0667, lng: 91.35 },
      ],
      derai: [
        { id: "derai_area_1", name: "Derai Area 1", lat: 25.097, lng: 91.33 },
        { id: "derai_area_2", name: "Derai Area 2", lat: 25.107, lng: 91.33 },
        { id: "derai_area_3", name: "Derai Area 3", lat: 25.117, lng: 91.33 },
        { id: "others_derai", name: "Others", lat: 25.1167, lng: 91.35 },
      ],
      dharamapasha: [
        {
          id: "dharamapasha_area_1",
          name: "Dharamapasha Area 1",
          lat: 24.997,
          lng: 91.38,
        },
        {
          id: "dharamapasha_area_2",
          name: "Dharamapasha Area 2",
          lat: 25.007,
          lng: 91.38,
        },
        {
          id: "dharamapasha_area_3",
          name: "Dharamapasha Area 3",
          lat: 25.017,
          lng: 91.38,
        },
        { id: "others_dharamapasha", name: "Others", lat: 25.0167, lng: 91.4 },
      ],
      bishwambarpur: [
        {
          id: "bishwambarpur_area_1",
          name: "Bishwambarpur Area 1",
          lat: 25.047,
          lng: 91.38,
        },
        {
          id: "bishwambarpur_area_2",
          name: "Bishwambarpur Area 2",
          lat: 25.057,
          lng: 91.38,
        },
        {
          id: "bishwambarpur_area_3",
          name: "Bishwambarpur Area 3",
          lat: 25.067,
          lng: 91.38,
        },
        { id: "others_bishwambarpur", name: "Others", lat: 25.0667, lng: 91.4 },
      ],
      dowarabazar: [
        {
          id: "dowarabazar_area_1",
          name: "Dowarabazar Area 1",
          lat: 25.097,
          lng: 91.38,
        },
        {
          id: "dowarabazar_area_2",
          name: "Dowarabazar Area 2",
          lat: 25.107,
          lng: 91.38,
        },
        {
          id: "dowarabazar_area_3",
          name: "Dowarabazar Area 3",
          lat: 25.117,
          lng: 91.38,
        },
        { id: "others_dowarabazar", name: "Others", lat: 25.1167, lng: 91.4 },
      ],
      jagannathpur: [
        {
          id: "jagannathpur_area_1",
          name: "Jagannathpur Area 1",
          lat: 24.997,
          lng: 91.43,
        },
        {
          id: "jagannathpur_area_2",
          name: "Jagannathpur Area 2",
          lat: 25.007,
          lng: 91.43,
        },
        {
          id: "jagannathpur_area_3",
          name: "Jagannathpur Area 3",
          lat: 25.017,
          lng: 91.43,
        },
        { id: "others_jagannathpur", name: "Others", lat: 25.0167, lng: 91.45 },
      ],
      jamalganj: [
        {
          id: "jamalganj_area_1",
          name: "Jamalganj Area 1",
          lat: 25.047,
          lng: 91.43,
        },
        {
          id: "jamalganj_area_2",
          name: "Jamalganj Area 2",
          lat: 25.057,
          lng: 91.43,
        },
        {
          id: "jamalganj_area_3",
          name: "Jamalganj Area 3",
          lat: 25.067,
          lng: 91.43,
        },
        { id: "others_jamalganj", name: "Others", lat: 25.0667, lng: 91.45 },
      ],
      sulla: [
        { id: "sulla_area_1", name: "Sulla Area 1", lat: 25.097, lng: 91.43 },
        { id: "sulla_area_2", name: "Sulla Area 2", lat: 25.107, lng: 91.43 },
        { id: "sulla_area_3", name: "Sulla Area 3", lat: 25.117, lng: 91.43 },
        { id: "others_sulla", name: "Others", lat: 25.1167, lng: 91.45 },
      ],
      shanthiganj: [
        {
          id: "shanthiganj_area_1",
          name: "Shanthiganj Area 1",
          lat: 24.997,
          lng: 91.33,
        },
        {
          id: "shanthiganj_area_2",
          name: "Shanthiganj Area 2",
          lat: 25.007,
          lng: 91.33,
        },
        {
          id: "shanthiganj_area_3",
          name: "Shanthiganj Area 3",
          lat: 25.017,
          lng: 91.33,
        },
        { id: "others_shanthiganj", name: "Others", lat: 25.0167, lng: 91.35 },
      ],
      tahirpur: [
        {
          id: "tahirpur_area_1",
          name: "Tahirpur Area 1",
          lat: 25.047,
          lng: 91.33,
        },
        {
          id: "tahirpur_area_2",
          name: "Tahirpur Area 2",
          lat: 25.057,
          lng: 91.33,
        },
        {
          id: "tahirpur_area_3",
          name: "Tahirpur Area 3",
          lat: 25.067,
          lng: 91.33,
        },
        { id: "others_tahirpur", name: "Others", lat: 25.0667, lng: 91.35 },
      ],
      rajshahi_sadar: [
        {
          id: "rajshahi_sadar_area_1",
          name: "Rajshahi Sadar Area 1",
          lat: 24.305,
          lng: 88.534,
        },
        {
          id: "rajshahi_sadar_area_2",
          name: "Rajshahi Sadar Area 2",
          lat: 24.314,
          lng: 88.534,
        },
        {
          id: "rajshahi_sadar_area_3",
          name: "Rajshahi Sadar Area 3",
          lat: 24.325,
          lng: 88.534,
        },
        {
          id: "rajshahi_sadar_area_4",
          name: "Rajshahi Sadar Area 4",
          lat: 24.335,
          lng: 88.534,
        },
        {
          id: "others_rajshahi_sadar",
          name: "Others",
          lat: 24.3245,
          lng: 88.5542,
        },
      ],
      paba: [
        { id: "paba_area_1", name: "Paba Area 1", lat: 24.355, lng: 88.534 },
        { id: "paba_area_2", name: "Paba Area 2", lat: 24.364, lng: 88.534 },
        { id: "paba_area_3", name: "Paba Area 3", lat: 24.375, lng: 88.534 },
        { id: "paba_area_4", name: "Paba Area 4", lat: 24.385, lng: 88.534 },
        { id: "others_paba", name: "Others", lat: 24.3745, lng: 88.5542 },
      ],
      durgapur: [
        {
          id: "durgapur_area_1",
          name: "Durgapur Area 1",
          lat: 24.404,
          lng: 88.534,
        },
        {
          id: "durgapur_area_2",
          name: "Durgapur Area 2",
          lat: 24.414,
          lng: 88.534,
        },
        {
          id: "durgapur_area_3",
          name: "Durgapur Area 3",
          lat: 24.424,
          lng: 88.534,
        },
        {
          id: "durgapur_area_4",
          name: "Durgapur Area 4",
          lat: 24.434,
          lng: 88.534,
        },
        { id: "others_durgapur", name: "Others", lat: 24.4245, lng: 88.5542 },
      ],
      mohanpur: [
        {
          id: "mohanpur_area_1",
          name: "Mohanpur Area 1",
          lat: 24.305,
          lng: 88.584,
        },
        {
          id: "mohanpur_area_2",
          name: "Mohanpur Area 2",
          lat: 24.314,
          lng: 88.584,
        },
        {
          id: "mohanpur_area_3",
          name: "Mohanpur Area 3",
          lat: 24.325,
          lng: 88.584,
        },
        {
          id: "mohanpur_area_4",
          name: "Mohanpur Area 4",
          lat: 24.335,
          lng: 88.584,
        },
        { id: "others_mohanpur", name: "Others", lat: 24.3245, lng: 88.6042 },
      ],
      charghat: [
        {
          id: "charghat_area_1",
          name: "Charghat Area 1",
          lat: 24.355,
          lng: 88.584,
        },
        {
          id: "charghat_area_2",
          name: "Charghat Area 2",
          lat: 24.364,
          lng: 88.584,
        },
        {
          id: "charghat_area_3",
          name: "Charghat Area 3",
          lat: 24.375,
          lng: 88.584,
        },
        {
          id: "charghat_area_4",
          name: "Charghat Area 4",
          lat: 24.385,
          lng: 88.584,
        },
        { id: "others_charghat", name: "Others", lat: 24.3745, lng: 88.6042 },
      ],
      puthia: [
        {
          id: "puthia_area_1",
          name: "Puthia Area 1",
          lat: 24.404,
          lng: 88.584,
        },
        {
          id: "puthia_area_2",
          name: "Puthia Area 2",
          lat: 24.414,
          lng: 88.584,
        },
        {
          id: "puthia_area_3",
          name: "Puthia Area 3",
          lat: 24.424,
          lng: 88.584,
        },
        {
          id: "puthia_area_4",
          name: "Puthia Area 4",
          lat: 24.434,
          lng: 88.584,
        },
        { id: "others_puthia", name: "Others", lat: 24.4245, lng: 88.6042 },
      ],
      bagha: [
        { id: "bagha_area_1", name: "Bagha Area 1", lat: 24.305, lng: 88.634 },
        { id: "bagha_area_2", name: "Bagha Area 2", lat: 24.314, lng: 88.634 },
        { id: "bagha_area_3", name: "Bagha Area 3", lat: 24.325, lng: 88.634 },
        { id: "bagha_area_4", name: "Bagha Area 4", lat: 24.335, lng: 88.634 },
        { id: "others_bagha", name: "Others", lat: 24.3245, lng: 88.6542 },
      ],
      godagari: [
        {
          id: "godagari_area_1",
          name: "Godagari Area 1",
          lat: 24.355,
          lng: 88.634,
        },
        {
          id: "godagari_area_2",
          name: "Godagari Area 2",
          lat: 24.364,
          lng: 88.634,
        },
        {
          id: "godagari_area_3",
          name: "Godagari Area 3",
          lat: 24.375,
          lng: 88.634,
        },
        {
          id: "godagari_area_4",
          name: "Godagari Area 4",
          lat: 24.385,
          lng: 88.634,
        },
        { id: "others_godagari", name: "Others", lat: 24.3745, lng: 88.6542 },
      ],
      tanore: [
        {
          id: "tanore_area_1",
          name: "Tanore Area 1",
          lat: 24.404,
          lng: 88.634,
        },
        {
          id: "tanore_area_2",
          name: "Tanore Area 2",
          lat: 24.414,
          lng: 88.634,
        },
        {
          id: "tanore_area_3",
          name: "Tanore Area 3",
          lat: 24.424,
          lng: 88.634,
        },
        {
          id: "tanore_area_4",
          name: "Tanore Area 4",
          lat: 24.434,
          lng: 88.634,
        },
        { id: "others_tanore", name: "Others", lat: 24.4245, lng: 88.6542 },
      ],
      natore_sadar: [
        {
          id: "natore_sadar_area_1",
          name: "Natore Sadar Area 1",
          lat: 24.347,
          lng: 88.897,
        },
        {
          id: "natore_sadar_area_2",
          name: "Natore Sadar Area 2",
          lat: 24.357,
          lng: 88.897,
        },
        {
          id: "natore_sadar_area_3",
          name: "Natore Sadar Area 3",
          lat: 24.367,
          lng: 88.897,
        },
        {
          id: "natore_sadar_area_4",
          name: "Natore Sadar Area 4",
          lat: 24.377,
          lng: 88.897,
        },
        {
          id: "others_natore_sadar",
          name: "Others",
          lat: 24.3667,
          lng: 88.9167,
        },
      ],
      bagatipara: [
        {
          id: "bagatipara_area_1",
          name: "Bagatipara Area 1",
          lat: 24.397,
          lng: 88.897,
        },
        {
          id: "bagatipara_area_2",
          name: "Bagatipara Area 2",
          lat: 24.407,
          lng: 88.897,
        },
        {
          id: "bagatipara_area_3",
          name: "Bagatipara Area 3",
          lat: 24.417,
          lng: 88.897,
        },
        {
          id: "bagatipara_area_4",
          name: "Bagatipara Area 4",
          lat: 24.427,
          lng: 88.897,
        },
        { id: "others_bagatipara", name: "Others", lat: 24.4167, lng: 88.9167 },
      ],
      baraigram: [
        {
          id: "baraigram_area_1",
          name: "Baraigram Area 1",
          lat: 24.447,
          lng: 88.897,
        },
        {
          id: "baraigram_area_2",
          name: "Baraigram Area 2",
          lat: 24.457,
          lng: 88.897,
        },
        {
          id: "baraigram_area_3",
          name: "Baraigram Area 3",
          lat: 24.467,
          lng: 88.897,
        },
        {
          id: "baraigram_area_4",
          name: "Baraigram Area 4",
          lat: 24.477,
          lng: 88.897,
        },
        { id: "others_baraigram", name: "Others", lat: 24.4667, lng: 88.9167 },
      ],
      gurudaspur: [
        {
          id: "gurudaspur_area_1",
          name: "Gurudaspur Area 1",
          lat: 24.347,
          lng: 88.947,
        },
        {
          id: "gurudaspur_area_2",
          name: "Gurudaspur Area 2",
          lat: 24.357,
          lng: 88.947,
        },
        {
          id: "gurudaspur_area_3",
          name: "Gurudaspur Area 3",
          lat: 24.367,
          lng: 88.947,
        },
        {
          id: "gurudaspur_area_4",
          name: "Gurudaspur Area 4",
          lat: 24.377,
          lng: 88.947,
        },
        { id: "others_gurudaspur", name: "Others", lat: 24.3667, lng: 88.9667 },
      ],
      lalpur: [
        {
          id: "lalpur_area_1",
          name: "Lalpur Area 1",
          lat: 24.397,
          lng: 88.947,
        },
        {
          id: "lalpur_area_2",
          name: "Lalpur Area 2",
          lat: 24.407,
          lng: 88.947,
        },
        {
          id: "lalpur_area_3",
          name: "Lalpur Area 3",
          lat: 24.417,
          lng: 88.947,
        },
        {
          id: "lalpur_area_4",
          name: "Lalpur Area 4",
          lat: 24.427,
          lng: 88.947,
        },
        { id: "others_lalpur", name: "Others", lat: 24.4167, lng: 88.9667 },
      ],
      singra: [
        {
          id: "singra_area_1",
          name: "Singra Area 1",
          lat: 24.447,
          lng: 88.947,
        },
        {
          id: "singra_area_2",
          name: "Singra Area 2",
          lat: 24.457,
          lng: 88.947,
        },
        {
          id: "singra_area_3",
          name: "Singra Area 3",
          lat: 24.467,
          lng: 88.947,
        },
        {
          id: "singra_area_4",
          name: "Singra Area 4",
          lat: 24.477,
          lng: 88.947,
        },
        { id: "others_singra", name: "Others", lat: 24.4667, lng: 88.9667 },
      ],
      naogaon_sadar: [
        {
          id: "naogaon_sadar_area_1",
          name: "Naogaon Sadar Area 1",
          lat: 24.73,
          lng: 88.863,
        },
        {
          id: "naogaon_sadar_area_2",
          name: "Naogaon Sadar Area 2",
          lat: 24.74,
          lng: 88.863,
        },
        {
          id: "naogaon_sadar_area_3",
          name: "Naogaon Sadar Area 3",
          lat: 24.75,
          lng: 88.863,
        },
        {
          id: "others_naogaon_sadar",
          name: "Others",
          lat: 24.75,
          lng: 88.8833,
        },
      ],
      atrai: [
        { id: "atrai_area_1", name: "Atrai Area 1", lat: 24.78, lng: 88.863 },
        { id: "atrai_area_2", name: "Atrai Area 2", lat: 24.79, lng: 88.863 },
        { id: "atrai_area_3", name: "Atrai Area 3", lat: 24.8, lng: 88.863 },
        { id: "others_atrai", name: "Others", lat: 24.8, lng: 88.8833 },
      ],
      badalgachhi: [
        {
          id: "badalgachhi_area_1",
          name: "Badalgachhi Area 1",
          lat: 24.83,
          lng: 88.863,
        },
        {
          id: "badalgachhi_area_2",
          name: "Badalgachhi Area 2",
          lat: 24.84,
          lng: 88.863,
        },
        {
          id: "badalgachhi_area_3",
          name: "Badalgachhi Area 3",
          lat: 24.85,
          lng: 88.863,
        },
        { id: "others_badalgachhi", name: "Others", lat: 24.85, lng: 88.8833 },
      ],
      dhamoirhat: [
        {
          id: "dhamoirhat_area_1",
          name: "Dhamoirhat Area 1",
          lat: 24.73,
          lng: 88.913,
        },
        {
          id: "dhamoirhat_area_2",
          name: "Dhamoirhat Area 2",
          lat: 24.74,
          lng: 88.913,
        },
        {
          id: "dhamoirhat_area_3",
          name: "Dhamoirhat Area 3",
          lat: 24.75,
          lng: 88.913,
        },
        { id: "others_dhamoirhat", name: "Others", lat: 24.75, lng: 88.9333 },
      ],
      manda: [
        { id: "manda_area_1", name: "Manda Area 1", lat: 24.78, lng: 88.913 },
        { id: "manda_area_2", name: "Manda Area 2", lat: 24.79, lng: 88.913 },
        { id: "manda_area_3", name: "Manda Area 3", lat: 24.8, lng: 88.913 },
        { id: "others_manda", name: "Others", lat: 24.8, lng: 88.9333 },
      ],
      mohadevpur: [
        {
          id: "mohadevpur_area_1",
          name: "Mohadevpur Area 1",
          lat: 24.83,
          lng: 88.913,
        },
        {
          id: "mohadevpur_area_2",
          name: "Mohadevpur Area 2",
          lat: 24.84,
          lng: 88.913,
        },
        {
          id: "mohadevpur_area_3",
          name: "Mohadevpur Area 3",
          lat: 24.85,
          lng: 88.913,
        },
        { id: "others_mohadevpur", name: "Others", lat: 24.85, lng: 88.9333 },
      ],
      niamatpur: [
        {
          id: "niamatpur_area_1",
          name: "Niamatpur Area 1",
          lat: 24.73,
          lng: 88.963,
        },
        {
          id: "niamatpur_area_2",
          name: "Niamatpur Area 2",
          lat: 24.74,
          lng: 88.963,
        },
        {
          id: "niamatpur_area_3",
          name: "Niamatpur Area 3",
          lat: 24.75,
          lng: 88.963,
        },
        { id: "others_niamatpur", name: "Others", lat: 24.75, lng: 88.9833 },
      ],
      patnitala: [
        {
          id: "patnitala_area_1",
          name: "Patnitala Area 1",
          lat: 24.78,
          lng: 88.963,
        },
        {
          id: "patnitala_area_2",
          name: "Patnitala Area 2",
          lat: 24.79,
          lng: 88.963,
        },
        {
          id: "patnitala_area_3",
          name: "Patnitala Area 3",
          lat: 24.8,
          lng: 88.963,
        },
        { id: "others_patnitala", name: "Others", lat: 24.8, lng: 88.9833 },
      ],
      porsha: [
        { id: "porsha_area_1", name: "Porsha Area 1", lat: 24.83, lng: 88.963 },
        { id: "porsha_area_2", name: "Porsha Area 2", lat: 24.84, lng: 88.963 },
        { id: "porsha_area_3", name: "Porsha Area 3", lat: 24.85, lng: 88.963 },
        { id: "others_porsha", name: "Others", lat: 24.85, lng: 88.9833 },
      ],
      raninagar: [
        {
          id: "raninagar_area_1",
          name: "Raninagar Area 1",
          lat: 24.73,
          lng: 88.863,
        },
        {
          id: "raninagar_area_2",
          name: "Raninagar Area 2",
          lat: 24.74,
          lng: 88.863,
        },
        {
          id: "raninagar_area_3",
          name: "Raninagar Area 3",
          lat: 24.75,
          lng: 88.863,
        },
        { id: "others_raninagar", name: "Others", lat: 24.75, lng: 88.8833 },
      ],
      sapahar: [
        {
          id: "sapahar_area_1",
          name: "Sapahar Area 1",
          lat: 24.78,
          lng: 88.863,
        },
        {
          id: "sapahar_area_2",
          name: "Sapahar Area 2",
          lat: 24.79,
          lng: 88.863,
        },
        {
          id: "sapahar_area_3",
          name: "Sapahar Area 3",
          lat: 24.8,
          lng: 88.863,
        },
        { id: "others_sapahar", name: "Others", lat: 24.8, lng: 88.8833 },
      ],
      chapainawabganj_sadar: [
        {
          id: "chapainawabganj_sadar_area_1",
          name: "Chapainawabganj Sadar Area 1",
          lat: 24.53,
          lng: 88.197,
        },
        {
          id: "chapainawabganj_sadar_area_2",
          name: "Chapainawabganj Sadar Area 2",
          lat: 24.54,
          lng: 88.197,
        },
        {
          id: "chapainawabganj_sadar_area_3",
          name: "Chapainawabganj Sadar Area 3",
          lat: 24.55,
          lng: 88.197,
        },
        {
          id: "chapainawabganj_sadar_area_4",
          name: "Chapainawabganj Sadar Area 4",
          lat: 24.56,
          lng: 88.197,
        },
        {
          id: "others_chapainawabganj_sadar",
          name: "Others",
          lat: 24.55,
          lng: 88.2167,
        },
      ],
      bholahat: [
        {
          id: "bholahat_area_1",
          name: "Bholahat Area 1",
          lat: 24.58,
          lng: 88.197,
        },
        {
          id: "bholahat_area_2",
          name: "Bholahat Area 2",
          lat: 24.59,
          lng: 88.197,
        },
        {
          id: "bholahat_area_3",
          name: "Bholahat Area 3",
          lat: 24.6,
          lng: 88.197,
        },
        {
          id: "bholahat_area_4",
          name: "Bholahat Area 4",
          lat: 24.61,
          lng: 88.197,
        },
        { id: "others_bholahat", name: "Others", lat: 24.6, lng: 88.2167 },
      ],
      gomastapur: [
        {
          id: "gomastapur_area_1",
          name: "Gomastapur Area 1",
          lat: 24.63,
          lng: 88.197,
        },
        {
          id: "gomastapur_area_2",
          name: "Gomastapur Area 2",
          lat: 24.64,
          lng: 88.197,
        },
        {
          id: "gomastapur_area_3",
          name: "Gomastapur Area 3",
          lat: 24.65,
          lng: 88.197,
        },
        {
          id: "gomastapur_area_4",
          name: "Gomastapur Area 4",
          lat: 24.66,
          lng: 88.197,
        },
        { id: "others_gomastapur", name: "Others", lat: 24.65, lng: 88.2167 },
      ],
      nachole: [
        {
          id: "nachole_area_1",
          name: "Nachole Area 1",
          lat: 24.53,
          lng: 88.247,
        },
        {
          id: "nachole_area_2",
          name: "Nachole Area 2",
          lat: 24.54,
          lng: 88.247,
        },
        {
          id: "nachole_area_3",
          name: "Nachole Area 3",
          lat: 24.55,
          lng: 88.247,
        },
        {
          id: "nachole_area_4",
          name: "Nachole Area 4",
          lat: 24.56,
          lng: 88.247,
        },
        { id: "others_nachole", name: "Others", lat: 24.55, lng: 88.2667 },
      ],
      shibganj_chapai: [
        {
          id: "shibganj_chapai_area_1",
          name: "Shibganj Chapai Area 1",
          lat: 24.58,
          lng: 88.247,
        },
        {
          id: "shibganj_chapai_area_2",
          name: "Shibganj Chapai Area 2",
          lat: 24.59,
          lng: 88.247,
        },
        {
          id: "shibganj_chapai_area_3",
          name: "Shibganj Chapai Area 3",
          lat: 24.6,
          lng: 88.247,
        },
        {
          id: "shibganj_chapai_area_4",
          name: "Shibganj Chapai Area 4",
          lat: 24.61,
          lng: 88.247,
        },
        {
          id: "others_shibganj_chapai",
          name: "Others",
          lat: 24.6,
          lng: 88.2667,
        },
      ],
      pabna_sadar: [
        {
          id: "pabna_sadar_area_1",
          name: "Pabna Sadar Area 1",
          lat: 23.93,
          lng: 89.18,
        },
        {
          id: "pabna_sadar_area_2",
          name: "Pabna Sadar Area 2",
          lat: 23.94,
          lng: 89.18,
        },
        {
          id: "pabna_sadar_area_3",
          name: "Pabna Sadar Area 3",
          lat: 23.95,
          lng: 89.18,
        },
        {
          id: "pabna_sadar_area_4",
          name: "Pabna Sadar Area 4",
          lat: 23.96,
          lng: 89.18,
        },
        { id: "others_pabna_sadar", name: "Others", lat: 23.95, lng: 89.2 },
      ],
      atgharia: [
        {
          id: "atgharia_area_1",
          name: "Atgharia Area 1",
          lat: 23.98,
          lng: 89.18,
        },
        {
          id: "atgharia_area_2",
          name: "Atgharia Area 2",
          lat: 23.99,
          lng: 89.18,
        },
        {
          id: "atgharia_area_3",
          name: "Atgharia Area 3",
          lat: 24.0,
          lng: 89.18,
        },
        {
          id: "atgharia_area_4",
          name: "Atgharia Area 4",
          lat: 24.01,
          lng: 89.18,
        },
        { id: "others_atgharia", name: "Others", lat: 24.0, lng: 89.2 },
      ],
      bera: [
        { id: "bera_area_1", name: "Bera Area 1", lat: 24.03, lng: 89.18 },
        { id: "bera_area_2", name: "Bera Area 2", lat: 24.04, lng: 89.18 },
        { id: "bera_area_3", name: "Bera Area 3", lat: 24.05, lng: 89.18 },
        { id: "bera_area_4", name: "Bera Area 4", lat: 24.06, lng: 89.18 },
        { id: "others_bera", name: "Others", lat: 24.05, lng: 89.2 },
      ],
      bhangura: [
        {
          id: "bhangura_area_1",
          name: "Bhangura Area 1",
          lat: 23.93,
          lng: 89.23,
        },
        {
          id: "bhangura_area_2",
          name: "Bhangura Area 2",
          lat: 23.94,
          lng: 89.23,
        },
        {
          id: "bhangura_area_3",
          name: "Bhangura Area 3",
          lat: 23.95,
          lng: 89.23,
        },
        {
          id: "bhangura_area_4",
          name: "Bhangura Area 4",
          lat: 23.96,
          lng: 89.23,
        },
        { id: "others_bhangura", name: "Others", lat: 23.95, lng: 89.25 },
      ],
      chatmohar: [
        {
          id: "chatmohar_area_1",
          name: "Chatmohar Area 1",
          lat: 23.98,
          lng: 89.23,
        },
        {
          id: "chatmohar_area_2",
          name: "Chatmohar Area 2",
          lat: 23.99,
          lng: 89.23,
        },
        {
          id: "chatmohar_area_3",
          name: "Chatmohar Area 3",
          lat: 24.0,
          lng: 89.23,
        },
        {
          id: "chatmohar_area_4",
          name: "Chatmohar Area 4",
          lat: 24.01,
          lng: 89.23,
        },
        { id: "others_chatmohar", name: "Others", lat: 24.0, lng: 89.25 },
      ],
      ishwardi: [
        {
          id: "ishwardi_area_1",
          name: "Ishwardi Area 1",
          lat: 24.03,
          lng: 89.23,
        },
        {
          id: "ishwardi_area_2",
          name: "Ishwardi Area 2",
          lat: 24.04,
          lng: 89.23,
        },
        {
          id: "ishwardi_area_3",
          name: "Ishwardi Area 3",
          lat: 24.05,
          lng: 89.23,
        },
        {
          id: "ishwardi_area_4",
          name: "Ishwardi Area 4",
          lat: 24.06,
          lng: 89.23,
        },
        { id: "others_ishwardi", name: "Others", lat: 24.05, lng: 89.25 },
      ],
      santhia: [
        {
          id: "santhia_area_1",
          name: "Santhia Area 1",
          lat: 23.93,
          lng: 89.28,
        },
        {
          id: "santhia_area_2",
          name: "Santhia Area 2",
          lat: 23.94,
          lng: 89.28,
        },
        {
          id: "santhia_area_3",
          name: "Santhia Area 3",
          lat: 23.95,
          lng: 89.28,
        },
        {
          id: "santhia_area_4",
          name: "Santhia Area 4",
          lat: 23.96,
          lng: 89.28,
        },
        { id: "others_santhia", name: "Others", lat: 23.95, lng: 89.3 },
      ],
      sujanagar: [
        {
          id: "sujanagar_area_1",
          name: "Sujanagar Area 1",
          lat: 23.98,
          lng: 89.28,
        },
        {
          id: "sujanagar_area_2",
          name: "Sujanagar Area 2",
          lat: 23.99,
          lng: 89.28,
        },
        {
          id: "sujanagar_area_3",
          name: "Sujanagar Area 3",
          lat: 24.0,
          lng: 89.28,
        },
        {
          id: "sujanagar_area_4",
          name: "Sujanagar Area 4",
          lat: 24.01,
          lng: 89.28,
        },
        { id: "others_sujanagar", name: "Others", lat: 24.0, lng: 89.3 },
      ],
      sirajganj_sadar: [
        {
          id: "sirajganj_sadar_area_1",
          name: "Sirajganj Sadar Area 1",
          lat: 24.38,
          lng: 89.647,
        },
        {
          id: "sirajganj_sadar_area_2",
          name: "Sirajganj Sadar Area 2",
          lat: 24.39,
          lng: 89.647,
        },
        {
          id: "sirajganj_sadar_area_3",
          name: "Sirajganj Sadar Area 3",
          lat: 24.4,
          lng: 89.647,
        },
        {
          id: "sirajganj_sadar_area_4",
          name: "Sirajganj Sadar Area 4",
          lat: 24.41,
          lng: 89.647,
        },
        {
          id: "others_sirajganj_sadar",
          name: "Others",
          lat: 24.4,
          lng: 89.6667,
        },
      ],
      belkuchi: [
        {
          id: "belkuchi_area_1",
          name: "Belkuchi Area 1",
          lat: 24.43,
          lng: 89.647,
        },
        {
          id: "belkuchi_area_2",
          name: "Belkuchi Area 2",
          lat: 24.44,
          lng: 89.647,
        },
        {
          id: "belkuchi_area_3",
          name: "Belkuchi Area 3",
          lat: 24.45,
          lng: 89.647,
        },
        {
          id: "belkuchi_area_4",
          name: "Belkuchi Area 4",
          lat: 24.46,
          lng: 89.647,
        },
        { id: "others_belkuchi", name: "Others", lat: 24.45, lng: 89.6667 },
      ],
      chauhali: [
        {
          id: "chauhali_area_1",
          name: "Chauhali Area 1",
          lat: 24.48,
          lng: 89.647,
        },
        {
          id: "chauhali_area_2",
          name: "Chauhali Area 2",
          lat: 24.49,
          lng: 89.647,
        },
        {
          id: "chauhali_area_3",
          name: "Chauhali Area 3",
          lat: 24.5,
          lng: 89.647,
        },
        {
          id: "chauhali_area_4",
          name: "Chauhali Area 4",
          lat: 24.51,
          lng: 89.647,
        },
        { id: "others_chauhali", name: "Others", lat: 24.5, lng: 89.6667 },
      ],
      kamarkhanda: [
        {
          id: "kamarkhanda_area_1",
          name: "Kamarkhanda Area 1",
          lat: 24.38,
          lng: 89.697,
        },
        {
          id: "kamarkhanda_area_2",
          name: "Kamarkhanda Area 2",
          lat: 24.39,
          lng: 89.697,
        },
        {
          id: "kamarkhanda_area_3",
          name: "Kamarkhanda Area 3",
          lat: 24.4,
          lng: 89.697,
        },
        {
          id: "kamarkhanda_area_4",
          name: "Kamarkhanda Area 4",
          lat: 24.41,
          lng: 89.697,
        },
        { id: "others_kamarkhanda", name: "Others", lat: 24.4, lng: 89.7167 },
      ],
      kazipur: [
        {
          id: "kazipur_area_1",
          name: "Kazipur Area 1",
          lat: 24.43,
          lng: 89.697,
        },
        {
          id: "kazipur_area_2",
          name: "Kazipur Area 2",
          lat: 24.44,
          lng: 89.697,
        },
        {
          id: "kazipur_area_3",
          name: "Kazipur Area 3",
          lat: 24.45,
          lng: 89.697,
        },
        {
          id: "kazipur_area_4",
          name: "Kazipur Area 4",
          lat: 24.46,
          lng: 89.697,
        },
        { id: "others_kazipur", name: "Others", lat: 24.45, lng: 89.7167 },
      ],
      raiganj: [
        {
          id: "raiganj_area_1",
          name: "Raiganj Area 1",
          lat: 24.48,
          lng: 89.697,
        },
        {
          id: "raiganj_area_2",
          name: "Raiganj Area 2",
          lat: 24.49,
          lng: 89.697,
        },
        {
          id: "raiganj_area_3",
          name: "Raiganj Area 3",
          lat: 24.5,
          lng: 89.697,
        },
        {
          id: "raiganj_area_4",
          name: "Raiganj Area 4",
          lat: 24.51,
          lng: 89.697,
        },
        { id: "others_raiganj", name: "Others", lat: 24.5, lng: 89.7167 },
      ],
      shahjadpur: [
        {
          id: "shahjadpur_area_1",
          name: "Shahjadpur Area 1",
          lat: 24.38,
          lng: 89.747,
        },
        {
          id: "shahjadpur_area_2",
          name: "Shahjadpur Area 2",
          lat: 24.39,
          lng: 89.747,
        },
        {
          id: "shahjadpur_area_3",
          name: "Shahjadpur Area 3",
          lat: 24.4,
          lng: 89.747,
        },
        {
          id: "shahjadpur_area_4",
          name: "Shahjadpur Area 4",
          lat: 24.41,
          lng: 89.747,
        },
        { id: "others_shahjadpur", name: "Others", lat: 24.4, lng: 89.7667 },
      ],
      tarash: [
        { id: "tarash_area_1", name: "Tarash Area 1", lat: 24.43, lng: 89.747 },
        { id: "tarash_area_2", name: "Tarash Area 2", lat: 24.44, lng: 89.747 },
        { id: "tarash_area_3", name: "Tarash Area 3", lat: 24.45, lng: 89.747 },
        { id: "tarash_area_4", name: "Tarash Area 4", lat: 24.46, lng: 89.747 },
        { id: "others_tarash", name: "Others", lat: 24.45, lng: 89.7667 },
      ],
      ullahpara: [
        {
          id: "ullahpara_area_1",
          name: "Ullahpara Area 1",
          lat: 24.48,
          lng: 89.747,
        },
        {
          id: "ullahpara_area_2",
          name: "Ullahpara Area 2",
          lat: 24.49,
          lng: 89.747,
        },
        {
          id: "ullahpara_area_3",
          name: "Ullahpara Area 3",
          lat: 24.5,
          lng: 89.747,
        },
        {
          id: "ullahpara_area_4",
          name: "Ullahpara Area 4",
          lat: 24.51,
          lng: 89.747,
        },
        { id: "others_ullahpara", name: "Others", lat: 24.5, lng: 89.7667 },
      ],
      bogra_sadar: [
        {
          id: "bogra_sadar_area_1",
          name: "Bogra Sadar Area 1",
          lat: 24.78,
          lng: 89.297,
        },
        {
          id: "bogra_sadar_area_2",
          name: "Bogra Sadar Area 2",
          lat: 24.79,
          lng: 89.297,
        },
        {
          id: "bogra_sadar_area_3",
          name: "Bogra Sadar Area 3",
          lat: 24.8,
          lng: 89.297,
        },
        {
          id: "bogra_sadar_area_4",
          name: "Bogra Sadar Area 4",
          lat: 24.81,
          lng: 89.297,
        },
        { id: "others_bogra_sadar", name: "Others", lat: 24.8, lng: 89.3167 },
      ],
      adamdighi: [
        {
          id: "adamdighi_area_1",
          name: "Adamdighi Area 1",
          lat: 24.83,
          lng: 89.297,
        },
        {
          id: "adamdighi_area_2",
          name: "Adamdighi Area 2",
          lat: 24.84,
          lng: 89.297,
        },
        {
          id: "adamdighi_area_3",
          name: "Adamdighi Area 3",
          lat: 24.85,
          lng: 89.297,
        },
        {
          id: "adamdighi_area_4",
          name: "Adamdighi Area 4",
          lat: 24.86,
          lng: 89.297,
        },
        { id: "others_adamdighi", name: "Others", lat: 24.85, lng: 89.3167 },
      ],
      dhunat: [
        { id: "dhunat_area_1", name: "Dhunat Area 1", lat: 24.88, lng: 89.297 },
        { id: "dhunat_area_2", name: "Dhunat Area 2", lat: 24.89, lng: 89.297 },
        { id: "dhunat_area_3", name: "Dhunat Area 3", lat: 24.9, lng: 89.297 },
        { id: "dhunat_area_4", name: "Dhunat Area 4", lat: 24.91, lng: 89.297 },
        { id: "others_dhunat", name: "Others", lat: 24.9, lng: 89.3167 },
      ],
      dhupchanchia: [
        {
          id: "dhupchanchia_area_1",
          name: "Dhupchanchia Area 1",
          lat: 24.78,
          lng: 89.347,
        },
        {
          id: "dhupchanchia_area_2",
          name: "Dhupchanchia Area 2",
          lat: 24.79,
          lng: 89.347,
        },
        {
          id: "dhupchanchia_area_3",
          name: "Dhupchanchia Area 3",
          lat: 24.8,
          lng: 89.347,
        },
        {
          id: "dhupchanchia_area_4",
          name: "Dhupchanchia Area 4",
          lat: 24.81,
          lng: 89.347,
        },
        { id: "others_dhupchanchia", name: "Others", lat: 24.8, lng: 89.3667 },
      ],
      gabtali: [
        {
          id: "gabtali_area_1",
          name: "Gabtali Area 1",
          lat: 24.83,
          lng: 89.347,
        },
        {
          id: "gabtali_area_2",
          name: "Gabtali Area 2",
          lat: 24.84,
          lng: 89.347,
        },
        {
          id: "gabtali_area_3",
          name: "Gabtali Area 3",
          lat: 24.85,
          lng: 89.347,
        },
        {
          id: "gabtali_area_4",
          name: "Gabtali Area 4",
          lat: 24.86,
          lng: 89.347,
        },
        { id: "others_gabtali", name: "Others", lat: 24.85, lng: 89.3667 },
      ],
      kahaloo: [
        {
          id: "kahaloo_area_1",
          name: "Kahaloo Area 1",
          lat: 24.88,
          lng: 89.347,
        },
        {
          id: "kahaloo_area_2",
          name: "Kahaloo Area 2",
          lat: 24.89,
          lng: 89.347,
        },
        {
          id: "kahaloo_area_3",
          name: "Kahaloo Area 3",
          lat: 24.9,
          lng: 89.347,
        },
        {
          id: "kahaloo_area_4",
          name: "Kahaloo Area 4",
          lat: 24.91,
          lng: 89.347,
        },
        { id: "others_kahaloo", name: "Others", lat: 24.9, lng: 89.3667 },
      ],
      sariakandi: [
        {
          id: "sariakandi_area_1",
          name: "Sariakandi Area 1",
          lat: 24.78,
          lng: 89.397,
        },
        {
          id: "sariakandi_area_2",
          name: "Sariakandi Area 2",
          lat: 24.79,
          lng: 89.397,
        },
        {
          id: "sariakandi_area_3",
          name: "Sariakandi Area 3",
          lat: 24.8,
          lng: 89.397,
        },
        {
          id: "sariakandi_area_4",
          name: "Sariakandi Area 4",
          lat: 24.81,
          lng: 89.397,
        },
        { id: "others_sariakandi", name: "Others", lat: 24.8, lng: 89.4167 },
      ],
      shibganj_bogra: [
        {
          id: "shibganj_bogra_area_1",
          name: "Shibganj Bogra Area 1",
          lat: 24.83,
          lng: 89.397,
        },
        {
          id: "shibganj_bogra_area_2",
          name: "Shibganj Bogra Area 2",
          lat: 24.84,
          lng: 89.397,
        },
        {
          id: "shibganj_bogra_area_3",
          name: "Shibganj Bogra Area 3",
          lat: 24.85,
          lng: 89.397,
        },
        {
          id: "shibganj_bogra_area_4",
          name: "Shibganj Bogra Area 4",
          lat: 24.86,
          lng: 89.397,
        },
        {
          id: "others_shibganj_bogra",
          name: "Others",
          lat: 24.85,
          lng: 89.4167,
        },
      ],
      sonatala: [
        {
          id: "sonatala_area_1",
          name: "Sonatala Area 1",
          lat: 24.88,
          lng: 89.397,
        },
        {
          id: "sonatala_area_2",
          name: "Sonatala Area 2",
          lat: 24.89,
          lng: 89.397,
        },
        {
          id: "sonatala_area_3",
          name: "Sonatala Area 3",
          lat: 24.9,
          lng: 89.397,
        },
        {
          id: "sonatala_area_4",
          name: "Sonatala Area 4",
          lat: 24.91,
          lng: 89.397,
        },
        { id: "others_sonatala", name: "Others", lat: 24.9, lng: 89.4167 },
      ],
      joypurhat_sadar: [
        {
          id: "joypurhat_sadar_area_1",
          name: "Joypurhat Sadar Area 1",
          lat: 25.03,
          lng: 88.947,
        },
        {
          id: "joypurhat_sadar_area_2",
          name: "Joypurhat Sadar Area 2",
          lat: 25.04,
          lng: 88.947,
        },
        {
          id: "joypurhat_sadar_area_3",
          name: "Joypurhat Sadar Area 3",
          lat: 25.05,
          lng: 88.947,
        },
        {
          id: "joypurhat_sadar_area_4",
          name: "Joypurhat Sadar Area 4",
          lat: 25.06,
          lng: 88.947,
        },
        {
          id: "others_joypurhat_sadar",
          name: "Others",
          lat: 25.05,
          lng: 88.9667,
        },
      ],
      akkelpur: [
        {
          id: "akkelpur_area_1",
          name: "Akkelpur Area 1",
          lat: 25.08,
          lng: 88.947,
        },
        {
          id: "akkelpur_area_2",
          name: "Akkelpur Area 2",
          lat: 25.09,
          lng: 88.947,
        },
        {
          id: "akkelpur_area_3",
          name: "Akkelpur Area 3",
          lat: 25.1,
          lng: 88.947,
        },
        {
          id: "akkelpur_area_4",
          name: "Akkelpur Area 4",
          lat: 25.11,
          lng: 88.947,
        },
        { id: "others_akkelpur", name: "Others", lat: 25.1, lng: 88.9667 },
      ],
      kalai: [
        { id: "kalai_area_1", name: "Kalai Area 1", lat: 25.13, lng: 88.947 },
        { id: "kalai_area_2", name: "Kalai Area 2", lat: 25.14, lng: 88.947 },
        { id: "kalai_area_3", name: "Kalai Area 3", lat: 25.15, lng: 88.947 },
        { id: "kalai_area_4", name: "Kalai Area 4", lat: 25.16, lng: 88.947 },
        { id: "others_kalai", name: "Others", lat: 25.15, lng: 88.9667 },
      ],
      khetlal: [
        {
          id: "khetlal_area_1",
          name: "Khetlal Area 1",
          lat: 25.03,
          lng: 88.997,
        },
        {
          id: "khetlal_area_2",
          name: "Khetlal Area 2",
          lat: 25.04,
          lng: 88.997,
        },
        {
          id: "khetlal_area_3",
          name: "Khetlal Area 3",
          lat: 25.05,
          lng: 88.997,
        },
        {
          id: "khetlal_area_4",
          name: "Khetlal Area 4",
          lat: 25.06,
          lng: 88.997,
        },
        { id: "others_khetlal", name: "Others", lat: 25.05, lng: 89.0167 },
      ],
      panchbibi: [
        {
          id: "panchbibi_area_1",
          name: "Panchbibi Area 1",
          lat: 25.08,
          lng: 88.997,
        },
        {
          id: "panchbibi_area_2",
          name: "Panchbibi Area 2",
          lat: 25.09,
          lng: 88.997,
        },
        {
          id: "panchbibi_area_3",
          name: "Panchbibi Area 3",
          lat: 25.1,
          lng: 88.997,
        },
        {
          id: "panchbibi_area_4",
          name: "Panchbibi Area 4",
          lat: 25.11,
          lng: 88.997,
        },
        { id: "others_panchbibi", name: "Others", lat: 25.1, lng: 89.0167 },
      ],
      khulna_sadar: [
        {
          id: "khulna_sadar_area_1",
          name: "Khulna Sadar Area 1",
          lat: 22.776,
          lng: 89.47,
        },
        {
          id: "khulna_sadar_area_2",
          name: "Khulna Sadar Area 2",
          lat: 22.786,
          lng: 89.47,
        },
        {
          id: "khulna_sadar_area_3",
          name: "Khulna Sadar Area 3",
          lat: 22.796,
          lng: 89.47,
        },
        {
          id: "khulna_sadar_area_4",
          name: "Khulna Sadar Area 4",
          lat: 22.806,
          lng: 89.47,
        },
        {
          id: "others_khulna_sadar",
          name: "Others",
          lat: 22.7956,
          lng: 89.4903,
        },
      ],
      batiaghata: [
        {
          id: "batiaghata_area_1",
          name: "Batiaghata Area 1",
          lat: 22.826,
          lng: 89.47,
        },
        {
          id: "batiaghata_area_2",
          name: "Batiaghata Area 2",
          lat: 22.836,
          lng: 89.47,
        },
        {
          id: "batiaghata_area_3",
          name: "Batiaghata Area 3",
          lat: 22.846,
          lng: 89.47,
        },
        {
          id: "batiaghata_area_4",
          name: "Batiaghata Area 4",
          lat: 22.856,
          lng: 89.47,
        },
        { id: "others_batiaghata", name: "Others", lat: 22.8456, lng: 89.4903 },
      ],
      dacope: [
        { id: "dacope_area_1", name: "Dacope Area 1", lat: 22.876, lng: 89.47 },
        { id: "dacope_area_2", name: "Dacope Area 2", lat: 22.886, lng: 89.47 },
        { id: "dacope_area_3", name: "Dacope Area 3", lat: 22.896, lng: 89.47 },
        { id: "dacope_area_4", name: "Dacope Area 4", lat: 22.906, lng: 89.47 },
        { id: "others_dacope", name: "Others", lat: 22.8956, lng: 89.4903 },
      ],
      daulatpur_khulna: [
        {
          id: "daulatpur_khulna_area_1",
          name: "Daulatpur Khulna Area 1",
          lat: 22.776,
          lng: 89.52,
        },
        {
          id: "daulatpur_khulna_area_2",
          name: "Daulatpur Khulna Area 2",
          lat: 22.786,
          lng: 89.52,
        },
        {
          id: "daulatpur_khulna_area_3",
          name: "Daulatpur Khulna Area 3",
          lat: 22.796,
          lng: 89.52,
        },
        {
          id: "daulatpur_khulna_area_4",
          name: "Daulatpur Khulna Area 4",
          lat: 22.806,
          lng: 89.52,
        },
        {
          id: "others_daulatpur_khulna",
          name: "Others",
          lat: 22.7956,
          lng: 89.5403,
        },
      ],
      dighalia: [
        {
          id: "dighalia_area_1",
          name: "Dighalia Area 1",
          lat: 22.826,
          lng: 89.52,
        },
        {
          id: "dighalia_area_2",
          name: "Dighalia Area 2",
          lat: 22.836,
          lng: 89.52,
        },
        {
          id: "dighalia_area_3",
          name: "Dighalia Area 3",
          lat: 22.846,
          lng: 89.52,
        },
        {
          id: "dighalia_area_4",
          name: "Dighalia Area 4",
          lat: 22.856,
          lng: 89.52,
        },
        { id: "others_dighalia", name: "Others", lat: 22.8456, lng: 89.5403 },
      ],
      dumuria: [
        {
          id: "dumuria_area_1",
          name: "Dumuria Area 1",
          lat: 22.876,
          lng: 89.52,
        },
        {
          id: "dumuria_area_2",
          name: "Dumuria Area 2",
          lat: 22.886,
          lng: 89.52,
        },
        {
          id: "dumuria_area_3",
          name: "Dumuria Area 3",
          lat: 22.896,
          lng: 89.52,
        },
        {
          id: "dumuria_area_4",
          name: "Dumuria Area 4",
          lat: 22.906,
          lng: 89.52,
        },
        { id: "others_dumuria", name: "Others", lat: 22.8956, lng: 89.5403 },
      ],
      paikgachha: [
        {
          id: "paikgachha_area_1",
          name: "Paikgachha Area 1",
          lat: 22.776,
          lng: 89.57,
        },
        {
          id: "paikgachha_area_2",
          name: "Paikgachha Area 2",
          lat: 22.786,
          lng: 89.57,
        },
        {
          id: "paikgachha_area_3",
          name: "Paikgachha Area 3",
          lat: 22.796,
          lng: 89.57,
        },
        {
          id: "paikgachha_area_4",
          name: "Paikgachha Area 4",
          lat: 22.806,
          lng: 89.57,
        },
        { id: "others_paikgachha", name: "Others", lat: 22.7956, lng: 89.5903 },
      ],
      phultala: [
        {
          id: "phultala_area_1",
          name: "Phultala Area 1",
          lat: 22.826,
          lng: 89.57,
        },
        {
          id: "phultala_area_2",
          name: "Phultala Area 2",
          lat: 22.836,
          lng: 89.57,
        },
        {
          id: "phultala_area_3",
          name: "Phultala Area 3",
          lat: 22.846,
          lng: 89.57,
        },
        {
          id: "phultala_area_4",
          name: "Phultala Area 4",
          lat: 22.856,
          lng: 89.57,
        },
        { id: "others_phultala", name: "Others", lat: 22.8456, lng: 89.5903 },
      ],
      rupsa: [
        { id: "rupsa_area_1", name: "Rupsa Area 1", lat: 22.876, lng: 89.57 },
        { id: "rupsa_area_2", name: "Rupsa Area 2", lat: 22.886, lng: 89.57 },
        { id: "rupsa_area_3", name: "Rupsa Area 3", lat: 22.896, lng: 89.57 },
        { id: "rupsa_area_4", name: "Rupsa Area 4", lat: 22.906, lng: 89.57 },
        { id: "others_rupsa", name: "Others", lat: 22.8956, lng: 89.5903 },
      ],
      terokhada: [
        {
          id: "terokhada_area_1",
          name: "Terokhada Area 1",
          lat: 22.776,
          lng: 89.47,
        },
        {
          id: "terokhada_area_2",
          name: "Terokhada Area 2",
          lat: 22.786,
          lng: 89.47,
        },
        {
          id: "terokhada_area_3",
          name: "Terokhada Area 3",
          lat: 22.796,
          lng: 89.47,
        },
        {
          id: "terokhada_area_4",
          name: "Terokhada Area 4",
          lat: 22.806,
          lng: 89.47,
        },
        { id: "others_terokhada", name: "Others", lat: 22.7956, lng: 89.4903 },
      ],
      bagerhat_sadar: [
        {
          id: "bagerhat_sadar_area_1",
          name: "Bagerhat Sadar Area 1",
          lat: 22.597,
          lng: 89.713,
        },
        {
          id: "bagerhat_sadar_area_2",
          name: "Bagerhat Sadar Area 2",
          lat: 22.607,
          lng: 89.713,
        },
        {
          id: "bagerhat_sadar_area_3",
          name: "Bagerhat Sadar Area 3",
          lat: 22.617,
          lng: 89.713,
        },
        {
          id: "bagerhat_sadar_area_4",
          name: "Bagerhat Sadar Area 4",
          lat: 22.627,
          lng: 89.713,
        },
        {
          id: "others_bagerhat_sadar",
          name: "Others",
          lat: 22.6167,
          lng: 89.7333,
        },
      ],
      chitalmari: [
        {
          id: "chitalmari_area_1",
          name: "Chitalmari Area 1",
          lat: 22.647,
          lng: 89.713,
        },
        {
          id: "chitalmari_area_2",
          name: "Chitalmari Area 2",
          lat: 22.657,
          lng: 89.713,
        },
        {
          id: "chitalmari_area_3",
          name: "Chitalmari Area 3",
          lat: 22.667,
          lng: 89.713,
        },
        {
          id: "chitalmari_area_4",
          name: "Chitalmari Area 4",
          lat: 22.677,
          lng: 89.713,
        },
        { id: "others_chitalmari", name: "Others", lat: 22.6667, lng: 89.7333 },
      ],
      fakirhat: [
        {
          id: "fakirhat_area_1",
          name: "Fakirhat Area 1",
          lat: 22.697,
          lng: 89.713,
        },
        {
          id: "fakirhat_area_2",
          name: "Fakirhat Area 2",
          lat: 22.707,
          lng: 89.713,
        },
        {
          id: "fakirhat_area_3",
          name: "Fakirhat Area 3",
          lat: 22.717,
          lng: 89.713,
        },
        {
          id: "fakirhat_area_4",
          name: "Fakirhat Area 4",
          lat: 22.727,
          lng: 89.713,
        },
        { id: "others_fakirhat", name: "Others", lat: 22.7167, lng: 89.7333 },
      ],
      kachua_bagerhat: [
        {
          id: "kachua_bagerhat_area_1",
          name: "Kachua Bagerhat Area 1",
          lat: 22.597,
          lng: 89.763,
        },
        {
          id: "kachua_bagerhat_area_2",
          name: "Kachua Bagerhat Area 2",
          lat: 22.607,
          lng: 89.763,
        },
        {
          id: "kachua_bagerhat_area_3",
          name: "Kachua Bagerhat Area 3",
          lat: 22.617,
          lng: 89.763,
        },
        {
          id: "kachua_bagerhat_area_4",
          name: "Kachua Bagerhat Area 4",
          lat: 22.627,
          lng: 89.763,
        },
        {
          id: "others_kachua_bagerhat",
          name: "Others",
          lat: 22.6167,
          lng: 89.7833,
        },
      ],
      mollahat: [
        {
          id: "mollahat_area_1",
          name: "Mollahat Area 1",
          lat: 22.647,
          lng: 89.763,
        },
        {
          id: "mollahat_area_2",
          name: "Mollahat Area 2",
          lat: 22.657,
          lng: 89.763,
        },
        {
          id: "mollahat_area_3",
          name: "Mollahat Area 3",
          lat: 22.667,
          lng: 89.763,
        },
        {
          id: "mollahat_area_4",
          name: "Mollahat Area 4",
          lat: 22.677,
          lng: 89.763,
        },
        { id: "others_mollahat", name: "Others", lat: 22.6667, lng: 89.7833 },
      ],
      mongla: [
        {
          id: "mongla_area_1",
          name: "Mongla Area 1",
          lat: 22.697,
          lng: 89.763,
        },
        {
          id: "mongla_area_2",
          name: "Mongla Area 2",
          lat: 22.707,
          lng: 89.763,
        },
        {
          id: "mongla_area_3",
          name: "Mongla Area 3",
          lat: 22.717,
          lng: 89.763,
        },
        {
          id: "mongla_area_4",
          name: "Mongla Area 4",
          lat: 22.727,
          lng: 89.763,
        },
        { id: "others_mongla", name: "Others", lat: 22.7167, lng: 89.7833 },
      ],
      morrelganj: [
        {
          id: "morrelganj_area_1",
          name: "Morrelganj Area 1",
          lat: 22.597,
          lng: 89.813,
        },
        {
          id: "morrelganj_area_2",
          name: "Morrelganj Area 2",
          lat: 22.607,
          lng: 89.813,
        },
        {
          id: "morrelganj_area_3",
          name: "Morrelganj Area 3",
          lat: 22.617,
          lng: 89.813,
        },
        {
          id: "morrelganj_area_4",
          name: "Morrelganj Area 4",
          lat: 22.627,
          lng: 89.813,
        },
        { id: "others_morrelganj", name: "Others", lat: 22.6167, lng: 89.8333 },
      ],
      rampal: [
        {
          id: "rampal_area_1",
          name: "Rampal Area 1",
          lat: 22.647,
          lng: 89.813,
        },
        {
          id: "rampal_area_2",
          name: "Rampal Area 2",
          lat: 22.657,
          lng: 89.813,
        },
        {
          id: "rampal_area_3",
          name: "Rampal Area 3",
          lat: 22.667,
          lng: 89.813,
        },
        {
          id: "rampal_area_4",
          name: "Rampal Area 4",
          lat: 22.677,
          lng: 89.813,
        },
        { id: "others_rampal", name: "Others", lat: 22.6667, lng: 89.8333 },
      ],
      sarankhola: [
        {
          id: "sarankhola_area_1",
          name: "Sarankhola Area 1",
          lat: 22.697,
          lng: 89.813,
        },
        {
          id: "sarankhola_area_2",
          name: "Sarankhola Area 2",
          lat: 22.707,
          lng: 89.813,
        },
        {
          id: "sarankhola_area_3",
          name: "Sarankhola Area 3",
          lat: 22.717,
          lng: 89.813,
        },
        {
          id: "sarankhola_area_4",
          name: "Sarankhola Area 4",
          lat: 22.727,
          lng: 89.813,
        },
        { id: "others_sarankhola", name: "Others", lat: 22.7167, lng: 89.8333 },
      ],
      satkhira_sadar: [
        {
          id: "satkhira_sadar_area_1",
          name: "Satkhira Sadar Area 1",
          lat: 22.647,
          lng: 88.997,
        },
        {
          id: "satkhira_sadar_area_2",
          name: "Satkhira Sadar Area 2",
          lat: 22.657,
          lng: 88.997,
        },
        {
          id: "satkhira_sadar_area_3",
          name: "Satkhira Sadar Area 3",
          lat: 22.667,
          lng: 88.997,
        },
        {
          id: "satkhira_sadar_area_4",
          name: "Satkhira Sadar Area 4",
          lat: 22.677,
          lng: 88.997,
        },
        {
          id: "others_satkhira_sadar",
          name: "Others",
          lat: 22.6667,
          lng: 89.0167,
        },
      ],
      assasuni: [
        {
          id: "assasuni_area_1",
          name: "Assasuni Area 1",
          lat: 22.697,
          lng: 88.997,
        },
        {
          id: "assasuni_area_2",
          name: "Assasuni Area 2",
          lat: 22.707,
          lng: 88.997,
        },
        {
          id: "assasuni_area_3",
          name: "Assasuni Area 3",
          lat: 22.717,
          lng: 88.997,
        },
        {
          id: "assasuni_area_4",
          name: "Assasuni Area 4",
          lat: 22.727,
          lng: 88.997,
        },
        { id: "others_assasuni", name: "Others", lat: 22.7167, lng: 89.0167 },
      ],
      debhata: [
        {
          id: "debhata_area_1",
          name: "Debhata Area 1",
          lat: 22.747,
          lng: 88.997,
        },
        {
          id: "debhata_area_2",
          name: "Debhata Area 2",
          lat: 22.757,
          lng: 88.997,
        },
        {
          id: "debhata_area_3",
          name: "Debhata Area 3",
          lat: 22.767,
          lng: 88.997,
        },
        {
          id: "debhata_area_4",
          name: "Debhata Area 4",
          lat: 22.777,
          lng: 88.997,
        },
        { id: "others_debhata", name: "Others", lat: 22.7667, lng: 89.0167 },
      ],
      kalaroa: [
        {
          id: "kalaroa_area_1",
          name: "Kalaroa Area 1",
          lat: 22.647,
          lng: 89.047,
        },
        {
          id: "kalaroa_area_2",
          name: "Kalaroa Area 2",
          lat: 22.657,
          lng: 89.047,
        },
        {
          id: "kalaroa_area_3",
          name: "Kalaroa Area 3",
          lat: 22.667,
          lng: 89.047,
        },
        {
          id: "kalaroa_area_4",
          name: "Kalaroa Area 4",
          lat: 22.677,
          lng: 89.047,
        },
        { id: "others_kalaroa", name: "Others", lat: 22.6667, lng: 89.0667 },
      ],
      kaliganj_satkhira: [
        {
          id: "kaliganj_satkhira_area_1",
          name: "Kaliganj Satkhira Area 1",
          lat: 22.697,
          lng: 89.047,
        },
        {
          id: "kaliganj_satkhira_area_2",
          name: "Kaliganj Satkhira Area 2",
          lat: 22.707,
          lng: 89.047,
        },
        {
          id: "kaliganj_satkhira_area_3",
          name: "Kaliganj Satkhira Area 3",
          lat: 22.717,
          lng: 89.047,
        },
        {
          id: "kaliganj_satkhira_area_4",
          name: "Kaliganj Satkhira Area 4",
          lat: 22.727,
          lng: 89.047,
        },
        {
          id: "others_kaliganj_satkhira",
          name: "Others",
          lat: 22.7167,
          lng: 89.0667,
        },
      ],
      shyamnagar: [
        {
          id: "shyamnagar_area_1",
          name: "Shyamnagar Area 1",
          lat: 22.747,
          lng: 89.047,
        },
        {
          id: "shyamnagar_area_2",
          name: "Shyamnagar Area 2",
          lat: 22.757,
          lng: 89.047,
        },
        {
          id: "shyamnagar_area_3",
          name: "Shyamnagar Area 3",
          lat: 22.767,
          lng: 89.047,
        },
        {
          id: "shyamnagar_area_4",
          name: "Shyamnagar Area 4",
          lat: 22.777,
          lng: 89.047,
        },
        { id: "others_shyamnagar", name: "Others", lat: 22.7667, lng: 89.0667 },
      ],
      tala: [
        { id: "tala_area_1", name: "Tala Area 1", lat: 22.647, lng: 89.097 },
        { id: "tala_area_2", name: "Tala Area 2", lat: 22.657, lng: 89.097 },
        { id: "tala_area_3", name: "Tala Area 3", lat: 22.667, lng: 89.097 },
        { id: "tala_area_4", name: "Tala Area 4", lat: 22.677, lng: 89.097 },
        { id: "others_tala", name: "Others", lat: 22.6667, lng: 89.1167 },
      ],
      jessore_sadar: [
        {
          id: "jessore_sadar_area_1",
          name: "Jessore Sadar Area 1",
          lat: 23.097,
          lng: 89.147,
        },
        {
          id: "jessore_sadar_area_2",
          name: "Jessore Sadar Area 2",
          lat: 23.107,
          lng: 89.147,
        },
        {
          id: "jessore_sadar_area_3",
          name: "Jessore Sadar Area 3",
          lat: 23.117,
          lng: 89.147,
        },
        {
          id: "jessore_sadar_area_4",
          name: "Jessore Sadar Area 4",
          lat: 23.127,
          lng: 89.147,
        },
        {
          id: "others_jessore_sadar",
          name: "Others",
          lat: 23.1167,
          lng: 89.1667,
        },
      ],
      abhaynagar: [
        {
          id: "abhaynagar_area_1",
          name: "Abhaynagar Area 1",
          lat: 23.147,
          lng: 89.147,
        },
        {
          id: "abhaynagar_area_2",
          name: "Abhaynagar Area 2",
          lat: 23.157,
          lng: 89.147,
        },
        {
          id: "abhaynagar_area_3",
          name: "Abhaynagar Area 3",
          lat: 23.167,
          lng: 89.147,
        },
        {
          id: "abhaynagar_area_4",
          name: "Abhaynagar Area 4",
          lat: 23.177,
          lng: 89.147,
        },
        { id: "others_abhaynagar", name: "Others", lat: 23.1667, lng: 89.1667 },
      ],
      bagherpara: [
        {
          id: "bagherpara_area_1",
          name: "Bagherpara Area 1",
          lat: 23.197,
          lng: 89.147,
        },
        {
          id: "bagherpara_area_2",
          name: "Bagherpara Area 2",
          lat: 23.207,
          lng: 89.147,
        },
        {
          id: "bagherpara_area_3",
          name: "Bagherpara Area 3",
          lat: 23.217,
          lng: 89.147,
        },
        {
          id: "bagherpara_area_4",
          name: "Bagherpara Area 4",
          lat: 23.227,
          lng: 89.147,
        },
        { id: "others_bagherpara", name: "Others", lat: 23.2167, lng: 89.1667 },
      ],
      chougachha: [
        {
          id: "chougachha_area_1",
          name: "Chougachha Area 1",
          lat: 23.097,
          lng: 89.197,
        },
        {
          id: "chougachha_area_2",
          name: "Chougachha Area 2",
          lat: 23.107,
          lng: 89.197,
        },
        {
          id: "chougachha_area_3",
          name: "Chougachha Area 3",
          lat: 23.117,
          lng: 89.197,
        },
        {
          id: "chougachha_area_4",
          name: "Chougachha Area 4",
          lat: 23.127,
          lng: 89.197,
        },
        { id: "others_chougachha", name: "Others", lat: 23.1167, lng: 89.2167 },
      ],
      jhikargachha: [
        {
          id: "jhikargachha_area_1",
          name: "Jhikargachha Area 1",
          lat: 23.147,
          lng: 89.197,
        },
        {
          id: "jhikargachha_area_2",
          name: "Jhikargachha Area 2",
          lat: 23.157,
          lng: 89.197,
        },
        {
          id: "jhikargachha_area_3",
          name: "Jhikargachha Area 3",
          lat: 23.167,
          lng: 89.197,
        },
        {
          id: "jhikargachha_area_4",
          name: "Jhikargachha Area 4",
          lat: 23.177,
          lng: 89.197,
        },
        {
          id: "others_jhikargachha",
          name: "Others",
          lat: 23.1667,
          lng: 89.2167,
        },
      ],
      keshabpur: [
        {
          id: "keshabpur_area_1",
          name: "Keshabpur Area 1",
          lat: 23.197,
          lng: 89.197,
        },
        {
          id: "keshabpur_area_2",
          name: "Keshabpur Area 2",
          lat: 23.207,
          lng: 89.197,
        },
        {
          id: "keshabpur_area_3",
          name: "Keshabpur Area 3",
          lat: 23.217,
          lng: 89.197,
        },
        {
          id: "keshabpur_area_4",
          name: "Keshabpur Area 4",
          lat: 23.227,
          lng: 89.197,
        },
        { id: "others_keshabpur", name: "Others", lat: 23.2167, lng: 89.2167 },
      ],
      manirampur: [
        {
          id: "manirampur_area_1",
          name: "Manirampur Area 1",
          lat: 23.097,
          lng: 89.247,
        },
        {
          id: "manirampur_area_2",
          name: "Manirampur Area 2",
          lat: 23.107,
          lng: 89.247,
        },
        {
          id: "manirampur_area_3",
          name: "Manirampur Area 3",
          lat: 23.117,
          lng: 89.247,
        },
        {
          id: "manirampur_area_4",
          name: "Manirampur Area 4",
          lat: 23.127,
          lng: 89.247,
        },
        { id: "others_manirampur", name: "Others", lat: 23.1167, lng: 89.2667 },
      ],
      sharsha: [
        {
          id: "sharsha_area_1",
          name: "Sharsha Area 1",
          lat: 23.147,
          lng: 89.247,
        },
        {
          id: "sharsha_area_2",
          name: "Sharsha Area 2",
          lat: 23.157,
          lng: 89.247,
        },
        {
          id: "sharsha_area_3",
          name: "Sharsha Area 3",
          lat: 23.167,
          lng: 89.247,
        },
        {
          id: "sharsha_area_4",
          name: "Sharsha Area 4",
          lat: 23.177,
          lng: 89.247,
        },
        { id: "others_sharsha", name: "Others", lat: 23.1667, lng: 89.2667 },
      ],
      jhenaidah_sadar: [
        {
          id: "jhenaidah_sadar_area_1",
          name: "Jhenaidah Sadar Area 1",
          lat: 23.463,
          lng: 88.947,
        },
        {
          id: "jhenaidah_sadar_area_2",
          name: "Jhenaidah Sadar Area 2",
          lat: 23.473,
          lng: 88.947,
        },
        {
          id: "jhenaidah_sadar_area_3",
          name: "Jhenaidah Sadar Area 3",
          lat: 23.483,
          lng: 88.947,
        },
        {
          id: "jhenaidah_sadar_area_4",
          name: "Jhenaidah Sadar Area 4",
          lat: 23.493,
          lng: 88.947,
        },
        {
          id: "others_jhenaidah_sadar",
          name: "Others",
          lat: 23.4833,
          lng: 88.9667,
        },
      ],
      harinakunda: [
        {
          id: "harinakunda_area_1",
          name: "Harinakunda Area 1",
          lat: 23.513,
          lng: 88.947,
        },
        {
          id: "harinakunda_area_2",
          name: "Harinakunda Area 2",
          lat: 23.523,
          lng: 88.947,
        },
        {
          id: "harinakunda_area_3",
          name: "Harinakunda Area 3",
          lat: 23.533,
          lng: 88.947,
        },
        {
          id: "harinakunda_area_4",
          name: "Harinakunda Area 4",
          lat: 23.543,
          lng: 88.947,
        },
        {
          id: "others_harinakunda",
          name: "Others",
          lat: 23.5333,
          lng: 88.9667,
        },
      ],
      kaliganj_jhenaidah: [
        {
          id: "kaliganj_jhenaidah_area_1",
          name: "Kaliganj Jhenaidah Area 1",
          lat: 23.563,
          lng: 88.947,
        },
        {
          id: "kaliganj_jhenaidah_area_2",
          name: "Kaliganj Jhenaidah Area 2",
          lat: 23.573,
          lng: 88.947,
        },
        {
          id: "kaliganj_jhenaidah_area_3",
          name: "Kaliganj Jhenaidah Area 3",
          lat: 23.583,
          lng: 88.947,
        },
        {
          id: "kaliganj_jhenaidah_area_4",
          name: "Kaliganj Jhenaidah Area 4",
          lat: 23.593,
          lng: 88.947,
        },
        {
          id: "others_kaliganj_jhenaidah",
          name: "Others",
          lat: 23.5833,
          lng: 88.9667,
        },
      ],
      kotchandpur: [
        {
          id: "kotchandpur_area_1",
          name: "Kotchandpur Area 1",
          lat: 23.463,
          lng: 88.997,
        },
        {
          id: "kotchandpur_area_2",
          name: "Kotchandpur Area 2",
          lat: 23.473,
          lng: 88.997,
        },
        {
          id: "kotchandpur_area_3",
          name: "Kotchandpur Area 3",
          lat: 23.483,
          lng: 88.997,
        },
        {
          id: "kotchandpur_area_4",
          name: "Kotchandpur Area 4",
          lat: 23.493,
          lng: 88.997,
        },
        {
          id: "others_kotchandpur",
          name: "Others",
          lat: 23.4833,
          lng: 89.0167,
        },
      ],
      maheshpur: [
        {
          id: "maheshpur_area_1",
          name: "Maheshpur Area 1",
          lat: 23.513,
          lng: 88.997,
        },
        {
          id: "maheshpur_area_2",
          name: "Maheshpur Area 2",
          lat: 23.523,
          lng: 88.997,
        },
        {
          id: "maheshpur_area_3",
          name: "Maheshpur Area 3",
          lat: 23.533,
          lng: 88.997,
        },
        {
          id: "maheshpur_area_4",
          name: "Maheshpur Area 4",
          lat: 23.543,
          lng: 88.997,
        },
        { id: "others_maheshpur", name: "Others", lat: 23.5333, lng: 89.0167 },
      ],
      shailkupa: [
        {
          id: "shailkupa_area_1",
          name: "Shailkupa Area 1",
          lat: 23.563,
          lng: 88.997,
        },
        {
          id: "shailkupa_area_2",
          name: "Shailkupa Area 2",
          lat: 23.573,
          lng: 88.997,
        },
        {
          id: "shailkupa_area_3",
          name: "Shailkupa Area 3",
          lat: 23.583,
          lng: 88.997,
        },
        {
          id: "shailkupa_area_4",
          name: "Shailkupa Area 4",
          lat: 23.593,
          lng: 88.997,
        },
        { id: "others_shailkupa", name: "Others", lat: 23.5833, lng: 89.0167 },
      ],
      magura_sadar: [
        {
          id: "magura_sadar_area_1",
          name: "Magura Sadar Area 1",
          lat: 23.413,
          lng: 89.347,
        },
        {
          id: "magura_sadar_area_2",
          name: "Magura Sadar Area 2",
          lat: 23.423,
          lng: 89.347,
        },
        {
          id: "magura_sadar_area_3",
          name: "Magura Sadar Area 3",
          lat: 23.433,
          lng: 89.347,
        },
        {
          id: "magura_sadar_area_4",
          name: "Magura Sadar Area 4",
          lat: 23.443,
          lng: 89.347,
        },
        {
          id: "others_magura_sadar",
          name: "Others",
          lat: 23.4333,
          lng: 89.3667,
        },
      ],
      mohammadpur_magura: [
        {
          id: "mohammadpur_magura_area_1",
          name: "Mohammadpur Magura Area 1",
          lat: 23.463,
          lng: 89.347,
        },
        {
          id: "mohammadpur_magura_area_2",
          name: "Mohammadpur Magura Area 2",
          lat: 23.473,
          lng: 89.347,
        },
        {
          id: "mohammadpur_magura_area_3",
          name: "Mohammadpur Magura Area 3",
          lat: 23.483,
          lng: 89.347,
        },
        {
          id: "mohammadpur_magura_area_4",
          name: "Mohammadpur Magura Area 4",
          lat: 23.493,
          lng: 89.347,
        },
        {
          id: "others_mohammadpur_magura",
          name: "Others",
          lat: 23.4833,
          lng: 89.3667,
        },
      ],
      shalikha: [
        {
          id: "shalikha_area_1",
          name: "Shalikha Area 1",
          lat: 23.513,
          lng: 89.347,
        },
        {
          id: "shalikha_area_2",
          name: "Shalikha Area 2",
          lat: 23.523,
          lng: 89.347,
        },
        {
          id: "shalikha_area_3",
          name: "Shalikha Area 3",
          lat: 23.533,
          lng: 89.347,
        },
        {
          id: "shalikha_area_4",
          name: "Shalikha Area 4",
          lat: 23.543,
          lng: 89.347,
        },
        { id: "others_shalikha", name: "Others", lat: 23.5333, lng: 89.3667 },
      ],
      sreepur_magura: [
        {
          id: "sreepur_magura_area_1",
          name: "Sreepur Magura Area 1",
          lat: 23.413,
          lng: 89.397,
        },
        {
          id: "sreepur_magura_area_2",
          name: "Sreepur Magura Area 2",
          lat: 23.423,
          lng: 89.397,
        },
        {
          id: "sreepur_magura_area_3",
          name: "Sreepur Magura Area 3",
          lat: 23.433,
          lng: 89.397,
        },
        {
          id: "sreepur_magura_area_4",
          name: "Sreepur Magura Area 4",
          lat: 23.443,
          lng: 89.397,
        },
        {
          id: "others_sreepur_magura",
          name: "Others",
          lat: 23.4333,
          lng: 89.4167,
        },
      ],
      narail_sadar: [
        {
          id: "narail_sadar_area_1",
          name: "Narail Sadar Area 1",
          lat: 23.097,
          lng: 89.43,
        },
        {
          id: "narail_sadar_area_2",
          name: "Narail Sadar Area 2",
          lat: 23.107,
          lng: 89.43,
        },
        {
          id: "narail_sadar_area_3",
          name: "Narail Sadar Area 3",
          lat: 23.117,
          lng: 89.43,
        },
        {
          id: "narail_sadar_area_4",
          name: "Narail Sadar Area 4",
          lat: 23.127,
          lng: 89.43,
        },
        { id: "others_narail_sadar", name: "Others", lat: 23.1167, lng: 89.45 },
      ],
      kalia: [
        { id: "kalia_area_1", name: "Kalia Area 1", lat: 23.147, lng: 89.43 },
        { id: "kalia_area_2", name: "Kalia Area 2", lat: 23.157, lng: 89.43 },
        { id: "kalia_area_3", name: "Kalia Area 3", lat: 23.167, lng: 89.43 },
        { id: "kalia_area_4", name: "Kalia Area 4", lat: 23.177, lng: 89.43 },
        { id: "others_kalia", name: "Others", lat: 23.1667, lng: 89.45 },
      ],
      lohagara_narail: [
        {
          id: "lohagara_narail_area_1",
          name: "Lohagara Narail Area 1",
          lat: 23.197,
          lng: 89.43,
        },
        {
          id: "lohagara_narail_area_2",
          name: "Lohagara Narail Area 2",
          lat: 23.207,
          lng: 89.43,
        },
        {
          id: "lohagara_narail_area_3",
          name: "Lohagara Narail Area 3",
          lat: 23.217,
          lng: 89.43,
        },
        {
          id: "lohagara_narail_area_4",
          name: "Lohagara Narail Area 4",
          lat: 23.227,
          lng: 89.43,
        },
        {
          id: "others_lohagara_narail",
          name: "Others",
          lat: 23.2167,
          lng: 89.45,
        },
      ],
      kushtia_sadar: [
        {
          id: "kushtia_sadar_area_1",
          name: "Kushtia Sadar Area 1",
          lat: 23.83,
          lng: 89.063,
        },
        {
          id: "kushtia_sadar_area_2",
          name: "Kushtia Sadar Area 2",
          lat: 23.84,
          lng: 89.063,
        },
        {
          id: "kushtia_sadar_area_3",
          name: "Kushtia Sadar Area 3",
          lat: 23.85,
          lng: 89.063,
        },
        {
          id: "kushtia_sadar_area_4",
          name: "Kushtia Sadar Area 4",
          lat: 23.86,
          lng: 89.063,
        },
        {
          id: "others_kushtia_sadar",
          name: "Others",
          lat: 23.85,
          lng: 89.0833,
        },
      ],
      bheramara: [
        {
          id: "bheramara_area_1",
          name: "Bheramara Area 1",
          lat: 23.88,
          lng: 89.063,
        },
        {
          id: "bheramara_area_2",
          name: "Bheramara Area 2",
          lat: 23.89,
          lng: 89.063,
        },
        {
          id: "bheramara_area_3",
          name: "Bheramara Area 3",
          lat: 23.9,
          lng: 89.063,
        },
        {
          id: "bheramara_area_4",
          name: "Bheramara Area 4",
          lat: 23.91,
          lng: 89.063,
        },
        { id: "others_bheramara", name: "Others", lat: 23.9, lng: 89.0833 },
      ],
      daulatpur_kushtia: [
        {
          id: "daulatpur_kushtia_area_1",
          name: "Daulatpur Kushtia Area 1",
          lat: 23.93,
          lng: 89.063,
        },
        {
          id: "daulatpur_kushtia_area_2",
          name: "Daulatpur Kushtia Area 2",
          lat: 23.94,
          lng: 89.063,
        },
        {
          id: "daulatpur_kushtia_area_3",
          name: "Daulatpur Kushtia Area 3",
          lat: 23.95,
          lng: 89.063,
        },
        {
          id: "daulatpur_kushtia_area_4",
          name: "Daulatpur Kushtia Area 4",
          lat: 23.96,
          lng: 89.063,
        },
        {
          id: "others_daulatpur_kushtia",
          name: "Others",
          lat: 23.95,
          lng: 89.0833,
        },
      ],
      khoksa: [
        { id: "khoksa_area_1", name: "Khoksa Area 1", lat: 23.83, lng: 89.113 },
        { id: "khoksa_area_2", name: "Khoksa Area 2", lat: 23.84, lng: 89.113 },
        { id: "khoksa_area_3", name: "Khoksa Area 3", lat: 23.85, lng: 89.113 },
        { id: "khoksa_area_4", name: "Khoksa Area 4", lat: 23.86, lng: 89.113 },
        { id: "others_khoksa", name: "Others", lat: 23.85, lng: 89.1333 },
      ],
      kumarkhali: [
        {
          id: "kumarkhali_area_1",
          name: "Kumarkhali Area 1",
          lat: 23.88,
          lng: 89.113,
        },
        {
          id: "kumarkhali_area_2",
          name: "Kumarkhali Area 2",
          lat: 23.89,
          lng: 89.113,
        },
        {
          id: "kumarkhali_area_3",
          name: "Kumarkhali Area 3",
          lat: 23.9,
          lng: 89.113,
        },
        {
          id: "kumarkhali_area_4",
          name: "Kumarkhali Area 4",
          lat: 23.91,
          lng: 89.113,
        },
        { id: "others_kumarkhali", name: "Others", lat: 23.9, lng: 89.1333 },
      ],
      mirpur_kushtia: [
        {
          id: "mirpur_kushtia_area_1",
          name: "Mirpur Kushtia Area 1",
          lat: 23.93,
          lng: 89.113,
        },
        {
          id: "mirpur_kushtia_area_2",
          name: "Mirpur Kushtia Area 2",
          lat: 23.94,
          lng: 89.113,
        },
        {
          id: "mirpur_kushtia_area_3",
          name: "Mirpur Kushtia Area 3",
          lat: 23.95,
          lng: 89.113,
        },
        {
          id: "mirpur_kushtia_area_4",
          name: "Mirpur Kushtia Area 4",
          lat: 23.96,
          lng: 89.113,
        },
        {
          id: "others_mirpur_kushtia",
          name: "Others",
          lat: 23.95,
          lng: 89.1333,
        },
      ],
      meherpur_sadar: [
        {
          id: "meherpur_sadar_area_1",
          name: "Meherpur Sadar Area 1",
          lat: 23.697,
          lng: 88.563,
        },
        {
          id: "meherpur_sadar_area_2",
          name: "Meherpur Sadar Area 2",
          lat: 23.707,
          lng: 88.563,
        },
        {
          id: "meherpur_sadar_area_3",
          name: "Meherpur Sadar Area 3",
          lat: 23.717,
          lng: 88.563,
        },
        {
          id: "meherpur_sadar_area_4",
          name: "Meherpur Sadar Area 4",
          lat: 23.727,
          lng: 88.563,
        },
        {
          id: "others_meherpur_sadar",
          name: "Others",
          lat: 23.7167,
          lng: 88.5833,
        },
      ],
      gangni: [
        {
          id: "gangni_area_1",
          name: "Gangni Area 1",
          lat: 23.747,
          lng: 88.563,
        },
        {
          id: "gangni_area_2",
          name: "Gangni Area 2",
          lat: 23.757,
          lng: 88.563,
        },
        {
          id: "gangni_area_3",
          name: "Gangni Area 3",
          lat: 23.767,
          lng: 88.563,
        },
        {
          id: "gangni_area_4",
          name: "Gangni Area 4",
          lat: 23.777,
          lng: 88.563,
        },
        { id: "others_gangni", name: "Others", lat: 23.7667, lng: 88.5833 },
      ],
      mujibnagar: [
        {
          id: "mujibnagar_area_1",
          name: "Mujibnagar Area 1",
          lat: 23.797,
          lng: 88.563,
        },
        {
          id: "mujibnagar_area_2",
          name: "Mujibnagar Area 2",
          lat: 23.807,
          lng: 88.563,
        },
        {
          id: "mujibnagar_area_3",
          name: "Mujibnagar Area 3",
          lat: 23.817,
          lng: 88.563,
        },
        {
          id: "mujibnagar_area_4",
          name: "Mujibnagar Area 4",
          lat: 23.827,
          lng: 88.563,
        },
        { id: "others_mujibnagar", name: "Others", lat: 23.8167, lng: 88.5833 },
      ],
      chuadanga_sadar: [
        {
          id: "chuadanga_sadar_area_1",
          name: "Chuadanga Sadar Area 1",
          lat: 23.563,
          lng: 88.763,
        },
        {
          id: "chuadanga_sadar_area_2",
          name: "Chuadanga Sadar Area 2",
          lat: 23.573,
          lng: 88.763,
        },
        {
          id: "chuadanga_sadar_area_3",
          name: "Chuadanga Sadar Area 3",
          lat: 23.583,
          lng: 88.763,
        },
        {
          id: "chuadanga_sadar_area_4",
          name: "Chuadanga Sadar Area 4",
          lat: 23.593,
          lng: 88.763,
        },
        {
          id: "others_chuadanga_sadar",
          name: "Others",
          lat: 23.5833,
          lng: 88.7833,
        },
      ],
      alamdanga: [
        {
          id: "alamdanga_area_1",
          name: "Alamdanga Area 1",
          lat: 23.613,
          lng: 88.763,
        },
        {
          id: "alamdanga_area_2",
          name: "Alamdanga Area 2",
          lat: 23.623,
          lng: 88.763,
        },
        {
          id: "alamdanga_area_3",
          name: "Alamdanga Area 3",
          lat: 23.633,
          lng: 88.763,
        },
        {
          id: "alamdanga_area_4",
          name: "Alamdanga Area 4",
          lat: 23.643,
          lng: 88.763,
        },
        { id: "others_alamdanga", name: "Others", lat: 23.6333, lng: 88.7833 },
      ],
      damurhuda: [
        {
          id: "damurhuda_area_1",
          name: "Damurhuda Area 1",
          lat: 23.663,
          lng: 88.763,
        },
        {
          id: "damurhuda_area_2",
          name: "Damurhuda Area 2",
          lat: 23.673,
          lng: 88.763,
        },
        {
          id: "damurhuda_area_3",
          name: "Damurhuda Area 3",
          lat: 23.683,
          lng: 88.763,
        },
        {
          id: "damurhuda_area_4",
          name: "Damurhuda Area 4",
          lat: 23.693,
          lng: 88.763,
        },
        { id: "others_damurhuda", name: "Others", lat: 23.6833, lng: 88.7833 },
      ],
      jibannagar: [
        {
          id: "jibannagar_area_1",
          name: "Jibannagar Area 1",
          lat: 23.563,
          lng: 88.813,
        },
        {
          id: "jibannagar_area_2",
          name: "Jibannagar Area 2",
          lat: 23.573,
          lng: 88.813,
        },
        {
          id: "jibannagar_area_3",
          name: "Jibannagar Area 3",
          lat: 23.583,
          lng: 88.813,
        },
        {
          id: "jibannagar_area_4",
          name: "Jibannagar Area 4",
          lat: 23.593,
          lng: 88.813,
        },
        { id: "others_jibannagar", name: "Others", lat: 23.5833, lng: 88.8333 },
      ],
      barishal_sadar: [
        {
          id: "barishal_sadar_area_1",
          name: "Barishal Sadar Area 1",
          lat: 22.631,
          lng: 90.284,
        },
        {
          id: "barishal_sadar_area_2",
          name: "Barishal Sadar Area 2",
          lat: 22.641,
          lng: 90.284,
        },
        {
          id: "barishal_sadar_area_3",
          name: "Barishal Sadar Area 3",
          lat: 22.651,
          lng: 90.284,
        },
        {
          id: "barishal_sadar_area_4",
          name: "Barishal Sadar Area 4",
          lat: 22.661,
          lng: 90.284,
        },
        {
          id: "others_barishal_sadar",
          name: "Others",
          lat: 22.651,
          lng: 90.3035,
        },
      ],
      agailjhara: [
        {
          id: "agailjhara_area_1",
          name: "Agailjhara Area 1",
          lat: 22.681,
          lng: 90.284,
        },
        {
          id: "agailjhara_area_2",
          name: "Agailjhara Area 2",
          lat: 22.691,
          lng: 90.284,
        },
        {
          id: "agailjhara_area_3",
          name: "Agailjhara Area 3",
          lat: 22.701,
          lng: 90.284,
        },
        {
          id: "agailjhara_area_4",
          name: "Agailjhara Area 4",
          lat: 22.711,
          lng: 90.284,
        },
        { id: "others_agailjhara", name: "Others", lat: 22.701, lng: 90.3035 },
      ],
      babuganj: [
        {
          id: "babuganj_area_1",
          name: "Babuganj Area 1",
          lat: 22.731,
          lng: 90.284,
        },
        {
          id: "babuganj_area_2",
          name: "Babuganj Area 2",
          lat: 22.741,
          lng: 90.284,
        },
        {
          id: "babuganj_area_3",
          name: "Babuganj Area 3",
          lat: 22.751,
          lng: 90.284,
        },
        {
          id: "babuganj_area_4",
          name: "Babuganj Area 4",
          lat: 22.761,
          lng: 90.284,
        },
        { id: "others_babuganj", name: "Others", lat: 22.751, lng: 90.3035 },
      ],
      bakerganj: [
        {
          id: "bakerganj_area_1",
          name: "Bakerganj Area 1",
          lat: 22.631,
          lng: 90.334,
        },
        {
          id: "bakerganj_area_2",
          name: "Bakerganj Area 2",
          lat: 22.641,
          lng: 90.334,
        },
        {
          id: "bakerganj_area_3",
          name: "Bakerganj Area 3",
          lat: 22.651,
          lng: 90.334,
        },
        {
          id: "bakerganj_area_4",
          name: "Bakerganj Area 4",
          lat: 22.661,
          lng: 90.334,
        },
        { id: "others_bakerganj", name: "Others", lat: 22.651, lng: 90.3535 },
      ],
      banaripara: [
        {
          id: "banaripara_area_1",
          name: "Banaripara Area 1",
          lat: 22.681,
          lng: 90.334,
        },
        {
          id: "banaripara_area_2",
          name: "Banaripara Area 2",
          lat: 22.691,
          lng: 90.334,
        },
        {
          id: "banaripara_area_3",
          name: "Banaripara Area 3",
          lat: 22.701,
          lng: 90.334,
        },
        {
          id: "banaripara_area_4",
          name: "Banaripara Area 4",
          lat: 22.711,
          lng: 90.334,
        },
        { id: "others_banaripara", name: "Others", lat: 22.701, lng: 90.3535 },
      ],
      gaurnadi: [
        {
          id: "gaurnadi_area_1",
          name: "Gaurnadi Area 1",
          lat: 22.731,
          lng: 90.334,
        },
        {
          id: "gaurnadi_area_2",
          name: "Gaurnadi Area 2",
          lat: 22.741,
          lng: 90.334,
        },
        {
          id: "gaurnadi_area_3",
          name: "Gaurnadi Area 3",
          lat: 22.751,
          lng: 90.334,
        },
        {
          id: "gaurnadi_area_4",
          name: "Gaurnadi Area 4",
          lat: 22.761,
          lng: 90.334,
        },
        { id: "others_gaurnadi", name: "Others", lat: 22.751, lng: 90.3535 },
      ],
      hizla: [
        { id: "hizla_area_1", name: "Hizla Area 1", lat: 22.631, lng: 90.383 },
        { id: "hizla_area_2", name: "Hizla Area 2", lat: 22.641, lng: 90.383 },
        { id: "hizla_area_3", name: "Hizla Area 3", lat: 22.651, lng: 90.383 },
        { id: "hizla_area_4", name: "Hizla Area 4", lat: 22.661, lng: 90.383 },
        { id: "others_hizla", name: "Others", lat: 22.651, lng: 90.4035 },
      ],
      mehendiganj: [
        {
          id: "mehendiganj_area_1",
          name: "Mehendiganj Area 1",
          lat: 22.681,
          lng: 90.383,
        },
        {
          id: "mehendiganj_area_2",
          name: "Mehendiganj Area 2",
          lat: 22.691,
          lng: 90.383,
        },
        {
          id: "mehendiganj_area_3",
          name: "Mehendiganj Area 3",
          lat: 22.701,
          lng: 90.383,
        },
        {
          id: "mehendiganj_area_4",
          name: "Mehendiganj Area 4",
          lat: 22.711,
          lng: 90.383,
        },
        { id: "others_mehendiganj", name: "Others", lat: 22.701, lng: 90.4035 },
      ],
      muladi: [
        {
          id: "muladi_area_1",
          name: "Muladi Area 1",
          lat: 22.731,
          lng: 90.383,
        },
        {
          id: "muladi_area_2",
          name: "Muladi Area 2",
          lat: 22.741,
          lng: 90.383,
        },
        {
          id: "muladi_area_3",
          name: "Muladi Area 3",
          lat: 22.751,
          lng: 90.383,
        },
        {
          id: "muladi_area_4",
          name: "Muladi Area 4",
          lat: 22.761,
          lng: 90.383,
        },
        { id: "others_muladi", name: "Others", lat: 22.751, lng: 90.4035 },
      ],
      wazirpur: [
        {
          id: "wazirpur_area_1",
          name: "Wazirpur Area 1",
          lat: 22.631,
          lng: 90.284,
        },
        {
          id: "wazirpur_area_2",
          name: "Wazirpur Area 2",
          lat: 22.641,
          lng: 90.284,
        },
        {
          id: "wazirpur_area_3",
          name: "Wazirpur Area 3",
          lat: 22.651,
          lng: 90.284,
        },
        {
          id: "wazirpur_area_4",
          name: "Wazirpur Area 4",
          lat: 22.661,
          lng: 90.284,
        },
        { id: "others_wazirpur", name: "Others", lat: 22.651, lng: 90.3035 },
      ],
      bhola_sadar: [
        {
          id: "bhola_sadar_area_1",
          name: "Bhola Sadar Area 1",
          lat: 22.613,
          lng: 90.58,
        },
        {
          id: "bhola_sadar_area_2",
          name: "Bhola Sadar Area 2",
          lat: 22.623,
          lng: 90.58,
        },
        {
          id: "bhola_sadar_area_3",
          name: "Bhola Sadar Area 3",
          lat: 22.633,
          lng: 90.58,
        },
        {
          id: "bhola_sadar_area_4",
          name: "Bhola Sadar Area 4",
          lat: 22.643,
          lng: 90.58,
        },
        { id: "others_bhola_sadar", name: "Others", lat: 22.6333, lng: 90.6 },
      ],
      burhanuddin: [
        {
          id: "burhanuddin_area_1",
          name: "Burhanuddin Area 1",
          lat: 22.663,
          lng: 90.58,
        },
        {
          id: "burhanuddin_area_2",
          name: "Burhanuddin Area 2",
          lat: 22.673,
          lng: 90.58,
        },
        {
          id: "burhanuddin_area_3",
          name: "Burhanuddin Area 3",
          lat: 22.683,
          lng: 90.58,
        },
        {
          id: "burhanuddin_area_4",
          name: "Burhanuddin Area 4",
          lat: 22.693,
          lng: 90.58,
        },
        { id: "others_burhanuddin", name: "Others", lat: 22.6833, lng: 90.6 },
      ],
      char_fasson: [
        {
          id: "char_fasson_area_1",
          name: "Char Fasson Area 1",
          lat: 22.713,
          lng: 90.58,
        },
        {
          id: "char_fasson_area_2",
          name: "Char Fasson Area 2",
          lat: 22.723,
          lng: 90.58,
        },
        {
          id: "char_fasson_area_3",
          name: "Char Fasson Area 3",
          lat: 22.733,
          lng: 90.58,
        },
        {
          id: "char_fasson_area_4",
          name: "Char Fasson Area 4",
          lat: 22.743,
          lng: 90.58,
        },
        { id: "others_char_fasson", name: "Others", lat: 22.7333, lng: 90.6 },
      ],
      daulatkhan: [
        {
          id: "daulatkhan_area_1",
          name: "Daulatkhan Area 1",
          lat: 22.613,
          lng: 90.63,
        },
        {
          id: "daulatkhan_area_2",
          name: "Daulatkhan Area 2",
          lat: 22.623,
          lng: 90.63,
        },
        {
          id: "daulatkhan_area_3",
          name: "Daulatkhan Area 3",
          lat: 22.633,
          lng: 90.63,
        },
        {
          id: "daulatkhan_area_4",
          name: "Daulatkhan Area 4",
          lat: 22.643,
          lng: 90.63,
        },
        { id: "others_daulatkhan", name: "Others", lat: 22.6333, lng: 90.65 },
      ],
      lalmohan: [
        {
          id: "lalmohan_area_1",
          name: "Lalmohan Area 1",
          lat: 22.663,
          lng: 90.63,
        },
        {
          id: "lalmohan_area_2",
          name: "Lalmohan Area 2",
          lat: 22.673,
          lng: 90.63,
        },
        {
          id: "lalmohan_area_3",
          name: "Lalmohan Area 3",
          lat: 22.683,
          lng: 90.63,
        },
        {
          id: "lalmohan_area_4",
          name: "Lalmohan Area 4",
          lat: 22.693,
          lng: 90.63,
        },
        { id: "others_lalmohan", name: "Others", lat: 22.6833, lng: 90.65 },
      ],
      manpura: [
        {
          id: "manpura_area_1",
          name: "Manpura Area 1",
          lat: 22.713,
          lng: 90.63,
        },
        {
          id: "manpura_area_2",
          name: "Manpura Area 2",
          lat: 22.723,
          lng: 90.63,
        },
        {
          id: "manpura_area_3",
          name: "Manpura Area 3",
          lat: 22.733,
          lng: 90.63,
        },
        {
          id: "manpura_area_4",
          name: "Manpura Area 4",
          lat: 22.743,
          lng: 90.63,
        },
        { id: "others_manpura", name: "Others", lat: 22.7333, lng: 90.65 },
      ],
      tazumuddin: [
        {
          id: "tazumuddin_area_1",
          name: "Tazumuddin Area 1",
          lat: 22.613,
          lng: 90.68,
        },
        {
          id: "tazumuddin_area_2",
          name: "Tazumuddin Area 2",
          lat: 22.623,
          lng: 90.68,
        },
        {
          id: "tazumuddin_area_3",
          name: "Tazumuddin Area 3",
          lat: 22.633,
          lng: 90.68,
        },
        {
          id: "tazumuddin_area_4",
          name: "Tazumuddin Area 4",
          lat: 22.643,
          lng: 90.68,
        },
        { id: "others_tazumuddin", name: "Others", lat: 22.6333, lng: 90.7 },
      ],
      patuakhali_sadar: [
        {
          id: "patuakhali_sadar_area_1",
          name: "Patuakhali Sadar Area 1",
          lat: 22.28,
          lng: 90.247,
        },
        {
          id: "patuakhali_sadar_area_2",
          name: "Patuakhali Sadar Area 2",
          lat: 22.29,
          lng: 90.247,
        },
        {
          id: "patuakhali_sadar_area_3",
          name: "Patuakhali Sadar Area 3",
          lat: 22.3,
          lng: 90.247,
        },
        {
          id: "patuakhali_sadar_area_4",
          name: "Patuakhali Sadar Area 4",
          lat: 22.31,
          lng: 90.247,
        },
        {
          id: "others_patuakhali_sadar",
          name: "Others",
          lat: 22.3,
          lng: 90.2667,
        },
      ],
      bauphal: [
        {
          id: "bauphal_area_1",
          name: "Bauphal Area 1",
          lat: 22.33,
          lng: 90.247,
        },
        {
          id: "bauphal_area_2",
          name: "Bauphal Area 2",
          lat: 22.34,
          lng: 90.247,
        },
        {
          id: "bauphal_area_3",
          name: "Bauphal Area 3",
          lat: 22.35,
          lng: 90.247,
        },
        {
          id: "bauphal_area_4",
          name: "Bauphal Area 4",
          lat: 22.36,
          lng: 90.247,
        },
        { id: "others_bauphal", name: "Others", lat: 22.35, lng: 90.2667 },
      ],
      dashmina: [
        {
          id: "dashmina_area_1",
          name: "Dashmina Area 1",
          lat: 22.38,
          lng: 90.247,
        },
        {
          id: "dashmina_area_2",
          name: "Dashmina Area 2",
          lat: 22.39,
          lng: 90.247,
        },
        {
          id: "dashmina_area_3",
          name: "Dashmina Area 3",
          lat: 22.4,
          lng: 90.247,
        },
        {
          id: "dashmina_area_4",
          name: "Dashmina Area 4",
          lat: 22.41,
          lng: 90.247,
        },
        { id: "others_dashmina", name: "Others", lat: 22.4, lng: 90.2667 },
      ],
      dumki: [
        { id: "dumki_area_1", name: "Dumki Area 1", lat: 22.28, lng: 90.297 },
        { id: "dumki_area_2", name: "Dumki Area 2", lat: 22.29, lng: 90.297 },
        { id: "dumki_area_3", name: "Dumki Area 3", lat: 22.3, lng: 90.297 },
        { id: "dumki_area_4", name: "Dumki Area 4", lat: 22.31, lng: 90.297 },
        { id: "others_dumki", name: "Others", lat: 22.3, lng: 90.3167 },
      ],
      galachipa: [
        {
          id: "galachipa_area_1",
          name: "Galachipa Area 1",
          lat: 22.33,
          lng: 90.297,
        },
        {
          id: "galachipa_area_2",
          name: "Galachipa Area 2",
          lat: 22.34,
          lng: 90.297,
        },
        {
          id: "galachipa_area_3",
          name: "Galachipa Area 3",
          lat: 22.35,
          lng: 90.297,
        },
        {
          id: "galachipa_area_4",
          name: "Galachipa Area 4",
          lat: 22.36,
          lng: 90.297,
        },
        { id: "others_galachipa", name: "Others", lat: 22.35, lng: 90.3167 },
      ],
      kalapara: [
        {
          id: "kalapara_area_1",
          name: "Kalapara Area 1",
          lat: 22.38,
          lng: 90.297,
        },
        {
          id: "kalapara_area_2",
          name: "Kalapara Area 2",
          lat: 22.39,
          lng: 90.297,
        },
        {
          id: "kalapara_area_3",
          name: "Kalapara Area 3",
          lat: 22.4,
          lng: 90.297,
        },
        {
          id: "kalapara_area_4",
          name: "Kalapara Area 4",
          lat: 22.41,
          lng: 90.297,
        },
        { id: "others_kalapara", name: "Others", lat: 22.4, lng: 90.3167 },
      ],
      mirzaganj: [
        {
          id: "mirzaganj_area_1",
          name: "Mirzaganj Area 1",
          lat: 22.28,
          lng: 90.347,
        },
        {
          id: "mirzaganj_area_2",
          name: "Mirzaganj Area 2",
          lat: 22.29,
          lng: 90.347,
        },
        {
          id: "mirzaganj_area_3",
          name: "Mirzaganj Area 3",
          lat: 22.3,
          lng: 90.347,
        },
        {
          id: "mirzaganj_area_4",
          name: "Mirzaganj Area 4",
          lat: 22.31,
          lng: 90.347,
        },
        { id: "others_mirzaganj", name: "Others", lat: 22.3, lng: 90.3667 },
      ],
      rangabali: [
        {
          id: "rangabali_area_1",
          name: "Rangabali Area 1",
          lat: 22.33,
          lng: 90.347,
        },
        {
          id: "rangabali_area_2",
          name: "Rangabali Area 2",
          lat: 22.34,
          lng: 90.347,
        },
        {
          id: "rangabali_area_3",
          name: "Rangabali Area 3",
          lat: 22.35,
          lng: 90.347,
        },
        {
          id: "rangabali_area_4",
          name: "Rangabali Area 4",
          lat: 22.36,
          lng: 90.347,
        },
        { id: "others_rangabali", name: "Others", lat: 22.35, lng: 90.3667 },
      ],
      barguna_sadar: [
        {
          id: "barguna_sadar_area_1",
          name: "Barguna Sadar Area 1",
          lat: 22.08,
          lng: 90.047,
        },
        {
          id: "barguna_sadar_area_2",
          name: "Barguna Sadar Area 2",
          lat: 22.09,
          lng: 90.047,
        },
        {
          id: "barguna_sadar_area_3",
          name: "Barguna Sadar Area 3",
          lat: 22.1,
          lng: 90.047,
        },
        {
          id: "barguna_sadar_area_4",
          name: "Barguna Sadar Area 4",
          lat: 22.11,
          lng: 90.047,
        },
        { id: "others_barguna_sadar", name: "Others", lat: 22.1, lng: 90.0667 },
      ],
      amtali: [
        { id: "amtali_area_1", name: "Amtali Area 1", lat: 22.13, lng: 90.047 },
        { id: "amtali_area_2", name: "Amtali Area 2", lat: 22.14, lng: 90.047 },
        { id: "amtali_area_3", name: "Amtali Area 3", lat: 22.15, lng: 90.047 },
        { id: "amtali_area_4", name: "Amtali Area 4", lat: 22.16, lng: 90.047 },
        { id: "others_amtali", name: "Others", lat: 22.15, lng: 90.0667 },
      ],
      bamna: [
        { id: "bamna_area_1", name: "Bamna Area 1", lat: 22.18, lng: 90.047 },
        { id: "bamna_area_2", name: "Bamna Area 2", lat: 22.19, lng: 90.047 },
        { id: "bamna_area_3", name: "Bamna Area 3", lat: 22.2, lng: 90.047 },
        { id: "bamna_area_4", name: "Bamna Area 4", lat: 22.21, lng: 90.047 },
        { id: "others_bamna", name: "Others", lat: 22.2, lng: 90.0667 },
      ],
      betagi: [
        { id: "betagi_area_1", name: "Betagi Area 1", lat: 22.08, lng: 90.097 },
        { id: "betagi_area_2", name: "Betagi Area 2", lat: 22.09, lng: 90.097 },
        { id: "betagi_area_3", name: "Betagi Area 3", lat: 22.1, lng: 90.097 },
        { id: "betagi_area_4", name: "Betagi Area 4", lat: 22.11, lng: 90.097 },
        { id: "others_betagi", name: "Others", lat: 22.1, lng: 90.1167 },
      ],
      patharghata: [
        {
          id: "patharghata_area_1",
          name: "Patharghata Area 1",
          lat: 22.13,
          lng: 90.097,
        },
        {
          id: "patharghata_area_2",
          name: "Patharghata Area 2",
          lat: 22.14,
          lng: 90.097,
        },
        {
          id: "patharghata_area_3",
          name: "Patharghata Area 3",
          lat: 22.15,
          lng: 90.097,
        },
        {
          id: "patharghata_area_4",
          name: "Patharghata Area 4",
          lat: 22.16,
          lng: 90.097,
        },
        { id: "others_patharghata", name: "Others", lat: 22.15, lng: 90.1167 },
      ],
      taltali: [
        {
          id: "taltali_area_1",
          name: "Taltali Area 1",
          lat: 22.18,
          lng: 90.097,
        },
        {
          id: "taltali_area_2",
          name: "Taltali Area 2",
          lat: 22.19,
          lng: 90.097,
        },
        {
          id: "taltali_area_3",
          name: "Taltali Area 3",
          lat: 22.2,
          lng: 90.097,
        },
        {
          id: "taltali_area_4",
          name: "Taltali Area 4",
          lat: 22.21,
          lng: 90.097,
        },
        { id: "others_taltali", name: "Others", lat: 22.2, lng: 90.1167 },
      ],
      jhalokati_sadar: [
        {
          id: "jhalokati_sadar_area_1",
          name: "Jhalokati Sadar Area 1",
          lat: 22.563,
          lng: 90.13,
        },
        {
          id: "jhalokati_sadar_area_2",
          name: "Jhalokati Sadar Area 2",
          lat: 22.573,
          lng: 90.13,
        },
        {
          id: "jhalokati_sadar_area_3",
          name: "Jhalokati Sadar Area 3",
          lat: 22.583,
          lng: 90.13,
        },
        {
          id: "jhalokati_sadar_area_4",
          name: "Jhalokati Sadar Area 4",
          lat: 22.593,
          lng: 90.13,
        },
        {
          id: "others_jhalokati_sadar",
          name: "Others",
          lat: 22.5833,
          lng: 90.15,
        },
      ],
      kathalia: [
        {
          id: "kathalia_area_1",
          name: "Kathalia Area 1",
          lat: 22.613,
          lng: 90.13,
        },
        {
          id: "kathalia_area_2",
          name: "Kathalia Area 2",
          lat: 22.623,
          lng: 90.13,
        },
        {
          id: "kathalia_area_3",
          name: "Kathalia Area 3",
          lat: 22.633,
          lng: 90.13,
        },
        {
          id: "kathalia_area_4",
          name: "Kathalia Area 4",
          lat: 22.643,
          lng: 90.13,
        },
        { id: "others_kathalia", name: "Others", lat: 22.6333, lng: 90.15 },
      ],
      nalchity: [
        {
          id: "nalchity_area_1",
          name: "Nalchity Area 1",
          lat: 22.663,
          lng: 90.13,
        },
        {
          id: "nalchity_area_2",
          name: "Nalchity Area 2",
          lat: 22.673,
          lng: 90.13,
        },
        {
          id: "nalchity_area_3",
          name: "Nalchity Area 3",
          lat: 22.683,
          lng: 90.13,
        },
        {
          id: "nalchity_area_4",
          name: "Nalchity Area 4",
          lat: 22.693,
          lng: 90.13,
        },
        { id: "others_nalchity", name: "Others", lat: 22.6833, lng: 90.15 },
      ],
      rajapur: [
        {
          id: "rajapur_area_1",
          name: "Rajapur Area 1",
          lat: 22.563,
          lng: 90.18,
        },
        {
          id: "rajapur_area_2",
          name: "Rajapur Area 2",
          lat: 22.573,
          lng: 90.18,
        },
        {
          id: "rajapur_area_3",
          name: "Rajapur Area 3",
          lat: 22.583,
          lng: 90.18,
        },
        {
          id: "rajapur_area_4",
          name: "Rajapur Area 4",
          lat: 22.593,
          lng: 90.18,
        },
        { id: "others_rajapur", name: "Others", lat: 22.5833, lng: 90.2 },
      ],
      pirojpur_sadar: [
        {
          id: "pirojpur_sadar_area_1",
          name: "Pirojpur Sadar Area 1",
          lat: 22.513,
          lng: 89.897,
        },
        {
          id: "pirojpur_sadar_area_2",
          name: "Pirojpur Sadar Area 2",
          lat: 22.523,
          lng: 89.897,
        },
        {
          id: "pirojpur_sadar_area_3",
          name: "Pirojpur Sadar Area 3",
          lat: 22.533,
          lng: 89.897,
        },
        {
          id: "pirojpur_sadar_area_4",
          name: "Pirojpur Sadar Area 4",
          lat: 22.543,
          lng: 89.897,
        },
        {
          id: "others_pirojpur_sadar",
          name: "Others",
          lat: 22.5333,
          lng: 89.9167,
        },
      ],
      bhandaria: [
        {
          id: "bhandaria_area_1",
          name: "Bhandaria Area 1",
          lat: 22.563,
          lng: 89.897,
        },
        {
          id: "bhandaria_area_2",
          name: "Bhandaria Area 2",
          lat: 22.573,
          lng: 89.897,
        },
        {
          id: "bhandaria_area_3",
          name: "Bhandaria Area 3",
          lat: 22.583,
          lng: 89.897,
        },
        {
          id: "bhandaria_area_4",
          name: "Bhandaria Area 4",
          lat: 22.593,
          lng: 89.897,
        },
        { id: "others_bhandaria", name: "Others", lat: 22.5833, lng: 89.9167 },
      ],
      kawkhali_pirojpur: [
        {
          id: "kawkhali_pirojpur_area_1",
          name: "Kawkhali Pirojpur Area 1",
          lat: 22.613,
          lng: 89.897,
        },
        {
          id: "kawkhali_pirojpur_area_2",
          name: "Kawkhali Pirojpur Area 2",
          lat: 22.623,
          lng: 89.897,
        },
        {
          id: "kawkhali_pirojpur_area_3",
          name: "Kawkhali Pirojpur Area 3",
          lat: 22.633,
          lng: 89.897,
        },
        {
          id: "kawkhali_pirojpur_area_4",
          name: "Kawkhali Pirojpur Area 4",
          lat: 22.643,
          lng: 89.897,
        },
        {
          id: "others_kawkhali_pirojpur",
          name: "Others",
          lat: 22.6333,
          lng: 89.9167,
        },
      ],
      mathbaria: [
        {
          id: "mathbaria_area_1",
          name: "Mathbaria Area 1",
          lat: 22.513,
          lng: 89.947,
        },
        {
          id: "mathbaria_area_2",
          name: "Mathbaria Area 2",
          lat: 22.523,
          lng: 89.947,
        },
        {
          id: "mathbaria_area_3",
          name: "Mathbaria Area 3",
          lat: 22.533,
          lng: 89.947,
        },
        {
          id: "mathbaria_area_4",
          name: "Mathbaria Area 4",
          lat: 22.543,
          lng: 89.947,
        },
        { id: "others_mathbaria", name: "Others", lat: 22.5333, lng: 89.9667 },
      ],
      nazirpur: [
        {
          id: "nazirpur_area_1",
          name: "Nazirpur Area 1",
          lat: 22.563,
          lng: 89.947,
        },
        {
          id: "nazirpur_area_2",
          name: "Nazirpur Area 2",
          lat: 22.573,
          lng: 89.947,
        },
        {
          id: "nazirpur_area_3",
          name: "Nazirpur Area 3",
          lat: 22.583,
          lng: 89.947,
        },
        {
          id: "nazirpur_area_4",
          name: "Nazirpur Area 4",
          lat: 22.593,
          lng: 89.947,
        },
        { id: "others_nazirpur", name: "Others", lat: 22.5833, lng: 89.9667 },
      ],
      nesarabad: [
        {
          id: "nesarabad_area_1",
          name: "Nesarabad Area 1",
          lat: 22.613,
          lng: 89.947,
        },
        {
          id: "nesarabad_area_2",
          name: "Nesarabad Area 2",
          lat: 22.623,
          lng: 89.947,
        },
        {
          id: "nesarabad_area_3",
          name: "Nesarabad Area 3",
          lat: 22.633,
          lng: 89.947,
        },
        {
          id: "nesarabad_area_4",
          name: "Nesarabad Area 4",
          lat: 22.643,
          lng: 89.947,
        },
        { id: "others_nesarabad", name: "Others", lat: 22.6333, lng: 89.9667 },
      ],
      rangpur_sadar: [
        {
          id: "rangpur_sadar_area_1",
          name: "Rangpur Sadar Area 1",
          lat: 25.674,
          lng: 89.205,
        },
        {
          id: "rangpur_sadar_area_2",
          name: "Rangpur Sadar Area 2",
          lat: 25.684,
          lng: 89.205,
        },
        {
          id: "rangpur_sadar_area_3",
          name: "Rangpur Sadar Area 3",
          lat: 25.694,
          lng: 89.205,
        },
        {
          id: "rangpur_sadar_area_4",
          name: "Rangpur Sadar Area 4",
          lat: 25.704,
          lng: 89.205,
        },
        {
          id: "others_rangpur_sadar",
          name: "Others",
          lat: 25.6939,
          lng: 89.2252,
        },
      ],
      badarganj: [
        {
          id: "badarganj_area_1",
          name: "Badarganj Area 1",
          lat: 25.724,
          lng: 89.205,
        },
        {
          id: "badarganj_area_2",
          name: "Badarganj Area 2",
          lat: 25.734,
          lng: 89.205,
        },
        {
          id: "badarganj_area_3",
          name: "Badarganj Area 3",
          lat: 25.744,
          lng: 89.205,
        },
        {
          id: "badarganj_area_4",
          name: "Badarganj Area 4",
          lat: 25.754,
          lng: 89.205,
        },
        { id: "others_badarganj", name: "Others", lat: 25.7439, lng: 89.2252 },
      ],
      gangachara: [
        {
          id: "gangachara_area_1",
          name: "Gangachara Area 1",
          lat: 25.774,
          lng: 89.205,
        },
        {
          id: "gangachara_area_2",
          name: "Gangachara Area 2",
          lat: 25.784,
          lng: 89.205,
        },
        {
          id: "gangachara_area_3",
          name: "Gangachara Area 3",
          lat: 25.794,
          lng: 89.205,
        },
        {
          id: "gangachara_area_4",
          name: "Gangachara Area 4",
          lat: 25.804,
          lng: 89.205,
        },
        { id: "others_gangachara", name: "Others", lat: 25.7939, lng: 89.2252 },
      ],
      kaunia: [
        {
          id: "kaunia_area_1",
          name: "Kaunia Area 1",
          lat: 25.674,
          lng: 89.255,
        },
        {
          id: "kaunia_area_2",
          name: "Kaunia Area 2",
          lat: 25.684,
          lng: 89.255,
        },
        {
          id: "kaunia_area_3",
          name: "Kaunia Area 3",
          lat: 25.694,
          lng: 89.255,
        },
        {
          id: "kaunia_area_4",
          name: "Kaunia Area 4",
          lat: 25.704,
          lng: 89.255,
        },
        { id: "others_kaunia", name: "Others", lat: 25.6939, lng: 89.2752 },
      ],
      mithapukur: [
        {
          id: "mithapukur_area_1",
          name: "Mithapukur Area 1",
          lat: 25.724,
          lng: 89.255,
        },
        {
          id: "mithapukur_area_2",
          name: "Mithapukur Area 2",
          lat: 25.734,
          lng: 89.255,
        },
        {
          id: "mithapukur_area_3",
          name: "Mithapukur Area 3",
          lat: 25.744,
          lng: 89.255,
        },
        {
          id: "mithapukur_area_4",
          name: "Mithapukur Area 4",
          lat: 25.754,
          lng: 89.255,
        },
        { id: "others_mithapukur", name: "Others", lat: 25.7439, lng: 89.2752 },
      ],
      pirgachha: [
        {
          id: "pirgachha_area_1",
          name: "Pirgachha Area 1",
          lat: 25.774,
          lng: 89.255,
        },
        {
          id: "pirgachha_area_2",
          name: "Pirgachha Area 2",
          lat: 25.784,
          lng: 89.255,
        },
        {
          id: "pirgachha_area_3",
          name: "Pirgachha Area 3",
          lat: 25.794,
          lng: 89.255,
        },
        {
          id: "pirgachha_area_4",
          name: "Pirgachha Area 4",
          lat: 25.804,
          lng: 89.255,
        },
        { id: "others_pirgachha", name: "Others", lat: 25.7939, lng: 89.2752 },
      ],
      pirganj: [
        {
          id: "pirganj_area_1",
          name: "Pirganj Area 1",
          lat: 25.674,
          lng: 89.305,
        },
        {
          id: "pirganj_area_2",
          name: "Pirganj Area 2",
          lat: 25.684,
          lng: 89.305,
        },
        {
          id: "pirganj_area_3",
          name: "Pirganj Area 3",
          lat: 25.694,
          lng: 89.305,
        },
        {
          id: "pirganj_area_4",
          name: "Pirganj Area 4",
          lat: 25.704,
          lng: 89.305,
        },
        { id: "others_pirganj", name: "Others", lat: 25.6939, lng: 89.3252 },
      ],
      taraganj: [
        {
          id: "taraganj_area_1",
          name: "Taraganj Area 1",
          lat: 25.724,
          lng: 89.305,
        },
        {
          id: "taraganj_area_2",
          name: "Taraganj Area 2",
          lat: 25.734,
          lng: 89.305,
        },
        {
          id: "taraganj_area_3",
          name: "Taraganj Area 3",
          lat: 25.744,
          lng: 89.305,
        },
        {
          id: "taraganj_area_4",
          name: "Taraganj Area 4",
          lat: 25.754,
          lng: 89.305,
        },
        { id: "others_taraganj", name: "Others", lat: 25.7439, lng: 89.3252 },
      ],
      dinajpur_sadar: [
        {
          id: "dinajpur_sadar_area_1",
          name: "Dinajpur Sadar Area 1",
          lat: 25.563,
          lng: 88.563,
        },
        {
          id: "dinajpur_sadar_area_2",
          name: "Dinajpur Sadar Area 2",
          lat: 25.573,
          lng: 88.563,
        },
        {
          id: "dinajpur_sadar_area_3",
          name: "Dinajpur Sadar Area 3",
          lat: 25.583,
          lng: 88.563,
        },
        {
          id: "others_dinajpur_sadar",
          name: "Others",
          lat: 25.5833,
          lng: 88.5833,
        },
      ],
      birampur: [
        {
          id: "birampur_area_1",
          name: "Birampur Area 1",
          lat: 25.613,
          lng: 88.563,
        },
        {
          id: "birampur_area_2",
          name: "Birampur Area 2",
          lat: 25.623,
          lng: 88.563,
        },
        {
          id: "birampur_area_3",
          name: "Birampur Area 3",
          lat: 25.633,
          lng: 88.563,
        },
        { id: "others_birampur", name: "Others", lat: 25.6333, lng: 88.5833 },
      ],
      birganj: [
        {
          id: "birganj_area_1",
          name: "Birganj Area 1",
          lat: 25.663,
          lng: 88.563,
        },
        {
          id: "birganj_area_2",
          name: "Birganj Area 2",
          lat: 25.673,
          lng: 88.563,
        },
        {
          id: "birganj_area_3",
          name: "Birganj Area 3",
          lat: 25.683,
          lng: 88.563,
        },
        { id: "others_birganj", name: "Others", lat: 25.6833, lng: 88.5833 },
      ],
      biral: [
        { id: "biral_area_1", name: "Biral Area 1", lat: 25.563, lng: 88.613 },
        { id: "biral_area_2", name: "Biral Area 2", lat: 25.573, lng: 88.613 },
        { id: "biral_area_3", name: "Biral Area 3", lat: 25.583, lng: 88.613 },
        { id: "others_biral", name: "Others", lat: 25.5833, lng: 88.6333 },
      ],
      bochaganj: [
        {
          id: "bochaganj_area_1",
          name: "Bochaganj Area 1",
          lat: 25.613,
          lng: 88.613,
        },
        {
          id: "bochaganj_area_2",
          name: "Bochaganj Area 2",
          lat: 25.623,
          lng: 88.613,
        },
        {
          id: "bochaganj_area_3",
          name: "Bochaganj Area 3",
          lat: 25.633,
          lng: 88.613,
        },
        { id: "others_bochaganj", name: "Others", lat: 25.6333, lng: 88.6333 },
      ],
      chirirbandar: [
        {
          id: "chirirbandar_area_1",
          name: "Chirirbandar Area 1",
          lat: 25.663,
          lng: 88.613,
        },
        {
          id: "chirirbandar_area_2",
          name: "Chirirbandar Area 2",
          lat: 25.673,
          lng: 88.613,
        },
        {
          id: "chirirbandar_area_3",
          name: "Chirirbandar Area 3",
          lat: 25.683,
          lng: 88.613,
        },
        {
          id: "others_chirirbandar",
          name: "Others",
          lat: 25.6833,
          lng: 88.6333,
        },
      ],
      fulbari_dinajpur: [
        {
          id: "fulbari_dinajpur_area_1",
          name: "Fulbari Dinajpur Area 1",
          lat: 25.563,
          lng: 88.663,
        },
        {
          id: "fulbari_dinajpur_area_2",
          name: "Fulbari Dinajpur Area 2",
          lat: 25.573,
          lng: 88.663,
        },
        {
          id: "fulbari_dinajpur_area_3",
          name: "Fulbari Dinajpur Area 3",
          lat: 25.583,
          lng: 88.663,
        },
        {
          id: "others_fulbari_dinajpur",
          name: "Others",
          lat: 25.5833,
          lng: 88.6833,
        },
      ],
      ghoraghat: [
        {
          id: "ghoraghat_area_1",
          name: "Ghoraghat Area 1",
          lat: 25.613,
          lng: 88.663,
        },
        {
          id: "ghoraghat_area_2",
          name: "Ghoraghat Area 2",
          lat: 25.623,
          lng: 88.663,
        },
        {
          id: "ghoraghat_area_3",
          name: "Ghoraghat Area 3",
          lat: 25.633,
          lng: 88.663,
        },
        { id: "others_ghoraghat", name: "Others", lat: 25.6333, lng: 88.6833 },
      ],
      hakimpur: [
        {
          id: "hakimpur_area_1",
          name: "Hakimpur Area 1",
          lat: 25.663,
          lng: 88.663,
        },
        {
          id: "hakimpur_area_2",
          name: "Hakimpur Area 2",
          lat: 25.673,
          lng: 88.663,
        },
        {
          id: "hakimpur_area_3",
          name: "Hakimpur Area 3",
          lat: 25.683,
          lng: 88.663,
        },
        { id: "others_hakimpur", name: "Others", lat: 25.6833, lng: 88.6833 },
      ],
      kaharole: [
        {
          id: "kaharole_area_1",
          name: "Kaharole Area 1",
          lat: 25.563,
          lng: 88.563,
        },
        {
          id: "kaharole_area_2",
          name: "Kaharole Area 2",
          lat: 25.573,
          lng: 88.563,
        },
        {
          id: "kaharole_area_3",
          name: "Kaharole Area 3",
          lat: 25.583,
          lng: 88.563,
        },
        { id: "others_kaharole", name: "Others", lat: 25.5833, lng: 88.5833 },
      ],
      khansama: [
        {
          id: "khansama_area_1",
          name: "Khansama Area 1",
          lat: 25.613,
          lng: 88.563,
        },
        {
          id: "khansama_area_2",
          name: "Khansama Area 2",
          lat: 25.623,
          lng: 88.563,
        },
        {
          id: "khansama_area_3",
          name: "Khansama Area 3",
          lat: 25.633,
          lng: 88.563,
        },
        { id: "others_khansama", name: "Others", lat: 25.6333, lng: 88.5833 },
      ],
      parbatipur: [
        {
          id: "parbatipur_area_1",
          name: "Parbatipur Area 1",
          lat: 25.663,
          lng: 88.563,
        },
        {
          id: "parbatipur_area_2",
          name: "Parbatipur Area 2",
          lat: 25.673,
          lng: 88.563,
        },
        {
          id: "parbatipur_area_3",
          name: "Parbatipur Area 3",
          lat: 25.683,
          lng: 88.563,
        },
        { id: "others_parbatipur", name: "Others", lat: 25.6833, lng: 88.5833 },
      ],
      gaibandha_sadar: [
        {
          id: "gaibandha_sadar_area_1",
          name: "Gaibandha Sadar Area 1",
          lat: 25.258,
          lng: 89.48,
        },
        {
          id: "gaibandha_sadar_area_2",
          name: "Gaibandha Sadar Area 2",
          lat: 25.268,
          lng: 89.48,
        },
        {
          id: "gaibandha_sadar_area_3",
          name: "Gaibandha Sadar Area 3",
          lat: 25.278,
          lng: 89.48,
        },
        {
          id: "gaibandha_sadar_area_4",
          name: "Gaibandha Sadar Area 4",
          lat: 25.288,
          lng: 89.48,
        },
        {
          id: "others_gaibandha_sadar",
          name: "Others",
          lat: 25.278,
          lng: 89.5,
        },
      ],
      fulchhari: [
        {
          id: "fulchhari_area_1",
          name: "Fulchhari Area 1",
          lat: 25.308,
          lng: 89.48,
        },
        {
          id: "fulchhari_area_2",
          name: "Fulchhari Area 2",
          lat: 25.318,
          lng: 89.48,
        },
        {
          id: "fulchhari_area_3",
          name: "Fulchhari Area 3",
          lat: 25.328,
          lng: 89.48,
        },
        {
          id: "fulchhari_area_4",
          name: "Fulchhari Area 4",
          lat: 25.338,
          lng: 89.48,
        },
        { id: "others_fulchhari", name: "Others", lat: 25.328, lng: 89.5 },
      ],
      gobindaganj: [
        {
          id: "gobindaganj_area_1",
          name: "Gobindaganj Area 1",
          lat: 25.358,
          lng: 89.48,
        },
        {
          id: "gobindaganj_area_2",
          name: "Gobindaganj Area 2",
          lat: 25.368,
          lng: 89.48,
        },
        {
          id: "gobindaganj_area_3",
          name: "Gobindaganj Area 3",
          lat: 25.378,
          lng: 89.48,
        },
        {
          id: "gobindaganj_area_4",
          name: "Gobindaganj Area 4",
          lat: 25.388,
          lng: 89.48,
        },
        { id: "others_gobindaganj", name: "Others", lat: 25.378, lng: 89.5 },
      ],
      palashbari: [
        {
          id: "palashbari_area_1",
          name: "Palashbari Area 1",
          lat: 25.258,
          lng: 89.53,
        },
        {
          id: "palashbari_area_2",
          name: "Palashbari Area 2",
          lat: 25.268,
          lng: 89.53,
        },
        {
          id: "palashbari_area_3",
          name: "Palashbari Area 3",
          lat: 25.278,
          lng: 89.53,
        },
        {
          id: "palashbari_area_4",
          name: "Palashbari Area 4",
          lat: 25.288,
          lng: 89.53,
        },
        { id: "others_palashbari", name: "Others", lat: 25.278, lng: 89.55 },
      ],
      sadullapur: [
        {
          id: "sadullapur_area_1",
          name: "Sadullapur Area 1",
          lat: 25.308,
          lng: 89.53,
        },
        {
          id: "sadullapur_area_2",
          name: "Sadullapur Area 2",
          lat: 25.318,
          lng: 89.53,
        },
        {
          id: "sadullapur_area_3",
          name: "Sadullapur Area 3",
          lat: 25.328,
          lng: 89.53,
        },
        {
          id: "sadullapur_area_4",
          name: "Sadullapur Area 4",
          lat: 25.338,
          lng: 89.53,
        },
        { id: "others_sadullapur", name: "Others", lat: 25.328, lng: 89.55 },
      ],
      saghata: [
        {
          id: "saghata_area_1",
          name: "Saghata Area 1",
          lat: 25.358,
          lng: 89.53,
        },
        {
          id: "saghata_area_2",
          name: "Saghata Area 2",
          lat: 25.368,
          lng: 89.53,
        },
        {
          id: "saghata_area_3",
          name: "Saghata Area 3",
          lat: 25.378,
          lng: 89.53,
        },
        {
          id: "saghata_area_4",
          name: "Saghata Area 4",
          lat: 25.388,
          lng: 89.53,
        },
        { id: "others_saghata", name: "Others", lat: 25.378, lng: 89.55 },
      ],
      sundarganj: [
        {
          id: "sundarganj_area_1",
          name: "Sundarganj Area 1",
          lat: 25.258,
          lng: 89.58,
        },
        {
          id: "sundarganj_area_2",
          name: "Sundarganj Area 2",
          lat: 25.268,
          lng: 89.58,
        },
        {
          id: "sundarganj_area_3",
          name: "Sundarganj Area 3",
          lat: 25.278,
          lng: 89.58,
        },
        {
          id: "sundarganj_area_4",
          name: "Sundarganj Area 4",
          lat: 25.288,
          lng: 89.58,
        },
        { id: "others_sundarganj", name: "Others", lat: 25.278, lng: 89.6 },
      ],
      kurigram_sadar: [
        {
          id: "kurigram_sadar_area_1",
          name: "Kurigram Sadar Area 1",
          lat: 25.735,
          lng: 89.566,
        },
        {
          id: "kurigram_sadar_area_2",
          name: "Kurigram Sadar Area 2",
          lat: 25.745,
          lng: 89.566,
        },
        {
          id: "kurigram_sadar_area_3",
          name: "Kurigram Sadar Area 3",
          lat: 25.755,
          lng: 89.566,
        },
        {
          id: "kurigram_sadar_area_4",
          name: "Kurigram Sadar Area 4",
          lat: 25.765,
          lng: 89.566,
        },
        {
          id: "others_kurigram_sadar",
          name: "Others",
          lat: 25.7554,
          lng: 89.5862,
        },
      ],
      bhurungamari: [
        {
          id: "bhurungamari_area_1",
          name: "Bhurungamari Area 1",
          lat: 25.785,
          lng: 89.566,
        },
        {
          id: "bhurungamari_area_2",
          name: "Bhurungamari Area 2",
          lat: 25.795,
          lng: 89.566,
        },
        {
          id: "bhurungamari_area_3",
          name: "Bhurungamari Area 3",
          lat: 25.805,
          lng: 89.566,
        },
        {
          id: "bhurungamari_area_4",
          name: "Bhurungamari Area 4",
          lat: 25.815,
          lng: 89.566,
        },
        {
          id: "others_bhurungamari",
          name: "Others",
          lat: 25.8054,
          lng: 89.5862,
        },
      ],
      char_rajibpur: [
        {
          id: "char_rajibpur_area_1",
          name: "Char Rajibpur Area 1",
          lat: 25.835,
          lng: 89.566,
        },
        {
          id: "char_rajibpur_area_2",
          name: "Char Rajibpur Area 2",
          lat: 25.845,
          lng: 89.566,
        },
        {
          id: "char_rajibpur_area_3",
          name: "Char Rajibpur Area 3",
          lat: 25.855,
          lng: 89.566,
        },
        {
          id: "char_rajibpur_area_4",
          name: "Char Rajibpur Area 4",
          lat: 25.865,
          lng: 89.566,
        },
        {
          id: "others_char_rajibpur",
          name: "Others",
          lat: 25.8554,
          lng: 89.5862,
        },
      ],
      chilmari: [
        {
          id: "chilmari_area_1",
          name: "Chilmari Area 1",
          lat: 25.735,
          lng: 89.616,
        },
        {
          id: "chilmari_area_2",
          name: "Chilmari Area 2",
          lat: 25.745,
          lng: 89.616,
        },
        {
          id: "chilmari_area_3",
          name: "Chilmari Area 3",
          lat: 25.755,
          lng: 89.616,
        },
        {
          id: "chilmari_area_4",
          name: "Chilmari Area 4",
          lat: 25.765,
          lng: 89.616,
        },
        { id: "others_chilmari", name: "Others", lat: 25.7554, lng: 89.6362 },
      ],
      nageshwari: [
        {
          id: "nageshwari_area_1",
          name: "Nageshwari Area 1",
          lat: 25.785,
          lng: 89.616,
        },
        {
          id: "nageshwari_area_2",
          name: "Nageshwari Area 2",
          lat: 25.795,
          lng: 89.616,
        },
        {
          id: "nageshwari_area_3",
          name: "Nageshwari Area 3",
          lat: 25.805,
          lng: 89.616,
        },
        {
          id: "nageshwari_area_4",
          name: "Nageshwari Area 4",
          lat: 25.815,
          lng: 89.616,
        },
        { id: "others_nageshwari", name: "Others", lat: 25.8054, lng: 89.6362 },
      ],
      phulbari_kurigram: [
        {
          id: "phulbari_kurigram_area_1",
          name: "Phulbari Kurigram Area 1",
          lat: 25.835,
          lng: 89.616,
        },
        {
          id: "phulbari_kurigram_area_2",
          name: "Phulbari Kurigram Area 2",
          lat: 25.845,
          lng: 89.616,
        },
        {
          id: "phulbari_kurigram_area_3",
          name: "Phulbari Kurigram Area 3",
          lat: 25.855,
          lng: 89.616,
        },
        {
          id: "phulbari_kurigram_area_4",
          name: "Phulbari Kurigram Area 4",
          lat: 25.865,
          lng: 89.616,
        },
        {
          id: "others_phulbari_kurigram",
          name: "Others",
          lat: 25.8554,
          lng: 89.6362,
        },
      ],
      rajarhat: [
        {
          id: "rajarhat_area_1",
          name: "Rajarhat Area 1",
          lat: 25.735,
          lng: 89.666,
        },
        {
          id: "rajarhat_area_2",
          name: "Rajarhat Area 2",
          lat: 25.745,
          lng: 89.666,
        },
        {
          id: "rajarhat_area_3",
          name: "Rajarhat Area 3",
          lat: 25.755,
          lng: 89.666,
        },
        {
          id: "rajarhat_area_4",
          name: "Rajarhat Area 4",
          lat: 25.765,
          lng: 89.666,
        },
        { id: "others_rajarhat", name: "Others", lat: 25.7554, lng: 89.6862 },
      ],
      roumari: [
        {
          id: "roumari_area_1",
          name: "Roumari Area 1",
          lat: 25.785,
          lng: 89.666,
        },
        {
          id: "roumari_area_2",
          name: "Roumari Area 2",
          lat: 25.795,
          lng: 89.666,
        },
        {
          id: "roumari_area_3",
          name: "Roumari Area 3",
          lat: 25.805,
          lng: 89.666,
        },
        {
          id: "roumari_area_4",
          name: "Roumari Area 4",
          lat: 25.815,
          lng: 89.666,
        },
        { id: "others_roumari", name: "Others", lat: 25.8054, lng: 89.6862 },
      ],
      ulipur: [
        {
          id: "ulipur_area_1",
          name: "Ulipur Area 1",
          lat: 25.835,
          lng: 89.666,
        },
        {
          id: "ulipur_area_2",
          name: "Ulipur Area 2",
          lat: 25.845,
          lng: 89.666,
        },
        {
          id: "ulipur_area_3",
          name: "Ulipur Area 3",
          lat: 25.855,
          lng: 89.666,
        },
        {
          id: "ulipur_area_4",
          name: "Ulipur Area 4",
          lat: 25.865,
          lng: 89.666,
        },
        { id: "others_ulipur", name: "Others", lat: 25.8554, lng: 89.6862 },
      ],
      lalmonirhat_sadar: [
        {
          id: "lalmonirhat_sadar_area_1",
          name: "Lalmonirhat Sadar Area 1",
          lat: 25.847,
          lng: 89.38,
        },
        {
          id: "lalmonirhat_sadar_area_2",
          name: "Lalmonirhat Sadar Area 2",
          lat: 25.857,
          lng: 89.38,
        },
        {
          id: "lalmonirhat_sadar_area_3",
          name: "Lalmonirhat Sadar Area 3",
          lat: 25.867,
          lng: 89.38,
        },
        {
          id: "lalmonirhat_sadar_area_4",
          name: "Lalmonirhat Sadar Area 4",
          lat: 25.877,
          lng: 89.38,
        },
        {
          id: "others_lalmonirhat_sadar",
          name: "Others",
          lat: 25.8667,
          lng: 89.4,
        },
      ],
      aditmari: [
        {
          id: "aditmari_area_1",
          name: "Aditmari Area 1",
          lat: 25.897,
          lng: 89.38,
        },
        {
          id: "aditmari_area_2",
          name: "Aditmari Area 2",
          lat: 25.907,
          lng: 89.38,
        },
        {
          id: "aditmari_area_3",
          name: "Aditmari Area 3",
          lat: 25.917,
          lng: 89.38,
        },
        {
          id: "aditmari_area_4",
          name: "Aditmari Area 4",
          lat: 25.927,
          lng: 89.38,
        },
        { id: "others_aditmari", name: "Others", lat: 25.9167, lng: 89.4 },
      ],
      hatibandha: [
        {
          id: "hatibandha_area_1",
          name: "Hatibandha Area 1",
          lat: 25.947,
          lng: 89.38,
        },
        {
          id: "hatibandha_area_2",
          name: "Hatibandha Area 2",
          lat: 25.957,
          lng: 89.38,
        },
        {
          id: "hatibandha_area_3",
          name: "Hatibandha Area 3",
          lat: 25.967,
          lng: 89.38,
        },
        {
          id: "hatibandha_area_4",
          name: "Hatibandha Area 4",
          lat: 25.977,
          lng: 89.38,
        },
        { id: "others_hatibandha", name: "Others", lat: 25.9667, lng: 89.4 },
      ],
      kaliganj_lalmonirhat: [
        {
          id: "kaliganj_lalmonirhat_area_1",
          name: "Kaliganj Lalmonirhat Area 1",
          lat: 25.847,
          lng: 89.43,
        },
        {
          id: "kaliganj_lalmonirhat_area_2",
          name: "Kaliganj Lalmonirhat Area 2",
          lat: 25.857,
          lng: 89.43,
        },
        {
          id: "kaliganj_lalmonirhat_area_3",
          name: "Kaliganj Lalmonirhat Area 3",
          lat: 25.867,
          lng: 89.43,
        },
        {
          id: "kaliganj_lalmonirhat_area_4",
          name: "Kaliganj Lalmonirhat Area 4",
          lat: 25.877,
          lng: 89.43,
        },
        {
          id: "others_kaliganj_lalmonirhat",
          name: "Others",
          lat: 25.8667,
          lng: 89.45,
        },
      ],
      patgram: [
        {
          id: "patgram_area_1",
          name: "Patgram Area 1",
          lat: 25.897,
          lng: 89.43,
        },
        {
          id: "patgram_area_2",
          name: "Patgram Area 2",
          lat: 25.907,
          lng: 89.43,
        },
        {
          id: "patgram_area_3",
          name: "Patgram Area 3",
          lat: 25.917,
          lng: 89.43,
        },
        {
          id: "patgram_area_4",
          name: "Patgram Area 4",
          lat: 25.927,
          lng: 89.43,
        },
        { id: "others_patgram", name: "Others", lat: 25.9167, lng: 89.45 },
      ],
      nilphamari_sadar: [
        {
          id: "nilphamari_sadar_area_1",
          name: "Nilphamari Sadar Area 1",
          lat: 25.863,
          lng: 88.78,
        },
        {
          id: "nilphamari_sadar_area_2",
          name: "Nilphamari Sadar Area 2",
          lat: 25.873,
          lng: 88.78,
        },
        {
          id: "nilphamari_sadar_area_3",
          name: "Nilphamari Sadar Area 3",
          lat: 25.883,
          lng: 88.78,
        },
        {
          id: "nilphamari_sadar_area_4",
          name: "Nilphamari Sadar Area 4",
          lat: 25.893,
          lng: 88.78,
        },
        {
          id: "others_nilphamari_sadar",
          name: "Others",
          lat: 25.8833,
          lng: 88.8,
        },
      ],
      domar: [
        { id: "domar_area_1", name: "Domar Area 1", lat: 25.913, lng: 88.78 },
        { id: "domar_area_2", name: "Domar Area 2", lat: 25.923, lng: 88.78 },
        { id: "domar_area_3", name: "Domar Area 3", lat: 25.933, lng: 88.78 },
        { id: "domar_area_4", name: "Domar Area 4", lat: 25.943, lng: 88.78 },
        { id: "others_domar", name: "Others", lat: 25.9333, lng: 88.8 },
      ],
      dimla: [
        { id: "dimla_area_1", name: "Dimla Area 1", lat: 25.963, lng: 88.78 },
        { id: "dimla_area_2", name: "Dimla Area 2", lat: 25.973, lng: 88.78 },
        { id: "dimla_area_3", name: "Dimla Area 3", lat: 25.983, lng: 88.78 },
        { id: "dimla_area_4", name: "Dimla Area 4", lat: 25.993, lng: 88.78 },
        { id: "others_dimla", name: "Others", lat: 25.9833, lng: 88.8 },
      ],
      jaldhaka: [
        {
          id: "jaldhaka_area_1",
          name: "Jaldhaka Area 1",
          lat: 25.863,
          lng: 88.83,
        },
        {
          id: "jaldhaka_area_2",
          name: "Jaldhaka Area 2",
          lat: 25.873,
          lng: 88.83,
        },
        {
          id: "jaldhaka_area_3",
          name: "Jaldhaka Area 3",
          lat: 25.883,
          lng: 88.83,
        },
        {
          id: "jaldhaka_area_4",
          name: "Jaldhaka Area 4",
          lat: 25.893,
          lng: 88.83,
        },
        { id: "others_jaldhaka", name: "Others", lat: 25.8833, lng: 88.85 },
      ],
      kishoreganj_nilphamari: [
        {
          id: "kishoreganj_nilphamari_area_1",
          name: "Kishoreganj Nilphamari Area 1",
          lat: 25.913,
          lng: 88.83,
        },
        {
          id: "kishoreganj_nilphamari_area_2",
          name: "Kishoreganj Nilphamari Area 2",
          lat: 25.923,
          lng: 88.83,
        },
        {
          id: "kishoreganj_nilphamari_area_3",
          name: "Kishoreganj Nilphamari Area 3",
          lat: 25.933,
          lng: 88.83,
        },
        {
          id: "kishoreganj_nilphamari_area_4",
          name: "Kishoreganj Nilphamari Area 4",
          lat: 25.943,
          lng: 88.83,
        },
        {
          id: "others_kishoreganj_nilphamari",
          name: "Others",
          lat: 25.9333,
          lng: 88.85,
        },
      ],
      saidpur: [
        {
          id: "saidpur_area_1",
          name: "Saidpur Area 1",
          lat: 25.963,
          lng: 88.83,
        },
        {
          id: "saidpur_area_2",
          name: "Saidpur Area 2",
          lat: 25.973,
          lng: 88.83,
        },
        {
          id: "saidpur_area_3",
          name: "Saidpur Area 3",
          lat: 25.983,
          lng: 88.83,
        },
        {
          id: "saidpur_area_4",
          name: "Saidpur Area 4",
          lat: 25.993,
          lng: 88.83,
        },
        { id: "others_saidpur", name: "Others", lat: 25.9833, lng: 88.85 },
      ],
      panchagarh_sadar: [
        {
          id: "panchagarh_sadar_area_1",
          name: "Panchagarh Sadar Area 1",
          lat: 26.263,
          lng: 88.48,
        },
        {
          id: "panchagarh_sadar_area_2",
          name: "Panchagarh Sadar Area 2",
          lat: 26.273,
          lng: 88.48,
        },
        {
          id: "panchagarh_sadar_area_3",
          name: "Panchagarh Sadar Area 3",
          lat: 26.283,
          lng: 88.48,
        },
        {
          id: "panchagarh_sadar_area_4",
          name: "Panchagarh Sadar Area 4",
          lat: 26.293,
          lng: 88.48,
        },
        {
          id: "others_panchagarh_sadar",
          name: "Others",
          lat: 26.2833,
          lng: 88.5,
        },
      ],
      atwari: [
        { id: "atwari_area_1", name: "Atwari Area 1", lat: 26.313, lng: 88.48 },
        { id: "atwari_area_2", name: "Atwari Area 2", lat: 26.323, lng: 88.48 },
        { id: "atwari_area_3", name: "Atwari Area 3", lat: 26.333, lng: 88.48 },
        { id: "atwari_area_4", name: "Atwari Area 4", lat: 26.343, lng: 88.48 },
        { id: "others_atwari", name: "Others", lat: 26.3333, lng: 88.5 },
      ],
      boda: [
        { id: "boda_area_1", name: "Boda Area 1", lat: 26.363, lng: 88.48 },
        { id: "boda_area_2", name: "Boda Area 2", lat: 26.373, lng: 88.48 },
        { id: "boda_area_3", name: "Boda Area 3", lat: 26.383, lng: 88.48 },
        { id: "boda_area_4", name: "Boda Area 4", lat: 26.393, lng: 88.48 },
        { id: "others_boda", name: "Others", lat: 26.3833, lng: 88.5 },
      ],
      debiganj: [
        {
          id: "debiganj_area_1",
          name: "Debiganj Area 1",
          lat: 26.263,
          lng: 88.53,
        },
        {
          id: "debiganj_area_2",
          name: "Debiganj Area 2",
          lat: 26.273,
          lng: 88.53,
        },
        {
          id: "debiganj_area_3",
          name: "Debiganj Area 3",
          lat: 26.283,
          lng: 88.53,
        },
        {
          id: "debiganj_area_4",
          name: "Debiganj Area 4",
          lat: 26.293,
          lng: 88.53,
        },
        { id: "others_debiganj", name: "Others", lat: 26.2833, lng: 88.55 },
      ],
      tetulia: [
        {
          id: "tetulia_area_1",
          name: "Tetulia Area 1",
          lat: 26.313,
          lng: 88.53,
        },
        {
          id: "tetulia_area_2",
          name: "Tetulia Area 2",
          lat: 26.323,
          lng: 88.53,
        },
        {
          id: "tetulia_area_3",
          name: "Tetulia Area 3",
          lat: 26.333,
          lng: 88.53,
        },
        {
          id: "tetulia_area_4",
          name: "Tetulia Area 4",
          lat: 26.343,
          lng: 88.53,
        },
        { id: "others_tetulia", name: "Others", lat: 26.3333, lng: 88.55 },
      ],
      thakurgaon_sadar: [
        {
          id: "thakurgaon_sadar_area_1",
          name: "Thakurgaon Sadar Area 1",
          lat: 25.963,
          lng: 88.397,
        },
        {
          id: "thakurgaon_sadar_area_2",
          name: "Thakurgaon Sadar Area 2",
          lat: 25.973,
          lng: 88.397,
        },
        {
          id: "thakurgaon_sadar_area_3",
          name: "Thakurgaon Sadar Area 3",
          lat: 25.983,
          lng: 88.397,
        },
        {
          id: "thakurgaon_sadar_area_4",
          name: "Thakurgaon Sadar Area 4",
          lat: 25.993,
          lng: 88.397,
        },
        {
          id: "others_thakurgaon_sadar",
          name: "Others",
          lat: 25.9833,
          lng: 88.4167,
        },
      ],
      baliadangi: [
        {
          id: "baliadangi_area_1",
          name: "Baliadangi Area 1",
          lat: 26.013,
          lng: 88.397,
        },
        {
          id: "baliadangi_area_2",
          name: "Baliadangi Area 2",
          lat: 26.023,
          lng: 88.397,
        },
        {
          id: "baliadangi_area_3",
          name: "Baliadangi Area 3",
          lat: 26.033,
          lng: 88.397,
        },
        {
          id: "baliadangi_area_4",
          name: "Baliadangi Area 4",
          lat: 26.043,
          lng: 88.397,
        },
        { id: "others_baliadangi", name: "Others", lat: 26.0333, lng: 88.4167 },
      ],
      haripur: [
        {
          id: "haripur_area_1",
          name: "Haripur Area 1",
          lat: 26.063,
          lng: 88.397,
        },
        {
          id: "haripur_area_2",
          name: "Haripur Area 2",
          lat: 26.073,
          lng: 88.397,
        },
        {
          id: "haripur_area_3",
          name: "Haripur Area 3",
          lat: 26.083,
          lng: 88.397,
        },
        {
          id: "haripur_area_4",
          name: "Haripur Area 4",
          lat: 26.093,
          lng: 88.397,
        },
        { id: "others_haripur", name: "Others", lat: 26.0833, lng: 88.4167 },
      ],
      pirganj_thakurgaon: [
        {
          id: "pirganj_thakurgaon_area_1",
          name: "Pirganj Thakurgaon Area 1",
          lat: 25.963,
          lng: 88.447,
        },
        {
          id: "pirganj_thakurgaon_area_2",
          name: "Pirganj Thakurgaon Area 2",
          lat: 25.973,
          lng: 88.447,
        },
        {
          id: "pirganj_thakurgaon_area_3",
          name: "Pirganj Thakurgaon Area 3",
          lat: 25.983,
          lng: 88.447,
        },
        {
          id: "pirganj_thakurgaon_area_4",
          name: "Pirganj Thakurgaon Area 4",
          lat: 25.993,
          lng: 88.447,
        },
        {
          id: "others_pirganj_thakurgaon",
          name: "Others",
          lat: 25.9833,
          lng: 88.4667,
        },
      ],
      ranisankail: [
        {
          id: "ranisankail_area_1",
          name: "Ranisankail Area 1",
          lat: 26.013,
          lng: 88.447,
        },
        {
          id: "ranisankail_area_2",
          name: "Ranisankail Area 2",
          lat: 26.023,
          lng: 88.447,
        },
        {
          id: "ranisankail_area_3",
          name: "Ranisankail Area 3",
          lat: 26.033,
          lng: 88.447,
        },
        {
          id: "ranisankail_area_4",
          name: "Ranisankail Area 4",
          lat: 26.043,
          lng: 88.447,
        },
        {
          id: "others_ranisankail",
          name: "Others",
          lat: 26.0333,
          lng: 88.4667,
        },
      ],
      mymensingh_sadar: [
        {
          id: "mymensingh_sadar_area_1",
          name: "Mymensingh Sadar Area 1",
          lat: 24.677,
          lng: 90.35,
        },
        {
          id: "mymensingh_sadar_area_2",
          name: "Mymensingh Sadar Area 2",
          lat: 24.687,
          lng: 90.35,
        },
        {
          id: "mymensingh_sadar_area_3",
          name: "Mymensingh Sadar Area 3",
          lat: 24.697,
          lng: 90.35,
        },
        {
          id: "others_mymensingh_sadar",
          name: "Others",
          lat: 24.6971,
          lng: 90.3703,
        },
      ],
      bhaluka: [
        {
          id: "bhaluka_area_1",
          name: "Bhaluka Area 1",
          lat: 24.727,
          lng: 90.35,
        },
        {
          id: "bhaluka_area_2",
          name: "Bhaluka Area 2",
          lat: 24.737,
          lng: 90.35,
        },
        {
          id: "bhaluka_area_3",
          name: "Bhaluka Area 3",
          lat: 24.747,
          lng: 90.35,
        },
        { id: "others_bhaluka", name: "Others", lat: 24.7471, lng: 90.3703 },
      ],
      dhobaura: [
        {
          id: "dhobaura_area_1",
          name: "Dhobaura Area 1",
          lat: 24.777,
          lng: 90.35,
        },
        {
          id: "dhobaura_area_2",
          name: "Dhobaura Area 2",
          lat: 24.787,
          lng: 90.35,
        },
        {
          id: "dhobaura_area_3",
          name: "Dhobaura Area 3",
          lat: 24.797,
          lng: 90.35,
        },
        { id: "others_dhobaura", name: "Others", lat: 24.7971, lng: 90.3703 },
      ],
      fulbaria: [
        {
          id: "fulbaria_area_1",
          name: "Fulbaria Area 1",
          lat: 24.677,
          lng: 90.4,
        },
        {
          id: "fulbaria_area_2",
          name: "Fulbaria Area 2",
          lat: 24.687,
          lng: 90.4,
        },
        {
          id: "fulbaria_area_3",
          name: "Fulbaria Area 3",
          lat: 24.697,
          lng: 90.4,
        },
        { id: "others_fulbaria", name: "Others", lat: 24.6971, lng: 90.4203 },
      ],
      gafargaon: [
        {
          id: "gafargaon_area_1",
          name: "Gafargaon Area 1",
          lat: 24.727,
          lng: 90.4,
        },
        {
          id: "gafargaon_area_2",
          name: "Gafargaon Area 2",
          lat: 24.737,
          lng: 90.4,
        },
        {
          id: "gafargaon_area_3",
          name: "Gafargaon Area 3",
          lat: 24.747,
          lng: 90.4,
        },
        { id: "others_gafargaon", name: "Others", lat: 24.7471, lng: 90.4203 },
      ],
      gauripur: [
        {
          id: "gauripur_area_1",
          name: "Gauripur Area 1",
          lat: 24.777,
          lng: 90.4,
        },
        {
          id: "gauripur_area_2",
          name: "Gauripur Area 2",
          lat: 24.787,
          lng: 90.4,
        },
        {
          id: "gauripur_area_3",
          name: "Gauripur Area 3",
          lat: 24.797,
          lng: 90.4,
        },
        { id: "others_gauripur", name: "Others", lat: 24.7971, lng: 90.4203 },
      ],
      haluaghat: [
        {
          id: "haluaghat_area_1",
          name: "Haluaghat Area 1",
          lat: 24.677,
          lng: 90.45,
        },
        {
          id: "haluaghat_area_2",
          name: "Haluaghat Area 2",
          lat: 24.687,
          lng: 90.45,
        },
        {
          id: "haluaghat_area_3",
          name: "Haluaghat Area 3",
          lat: 24.697,
          lng: 90.45,
        },
        { id: "others_haluaghat", name: "Others", lat: 24.6971, lng: 90.4703 },
      ],
      ishwarganj: [
        {
          id: "ishwarganj_area_1",
          name: "Ishwarganj Area 1",
          lat: 24.727,
          lng: 90.45,
        },
        {
          id: "ishwarganj_area_2",
          name: "Ishwarganj Area 2",
          lat: 24.737,
          lng: 90.45,
        },
        {
          id: "ishwarganj_area_3",
          name: "Ishwarganj Area 3",
          lat: 24.747,
          lng: 90.45,
        },
        { id: "others_ishwarganj", name: "Others", lat: 24.7471, lng: 90.4703 },
      ],
      muktagachha: [
        {
          id: "muktagachha_area_1",
          name: "Muktagachha Area 1",
          lat: 24.777,
          lng: 90.45,
        },
        {
          id: "muktagachha_area_2",
          name: "Muktagachha Area 2",
          lat: 24.787,
          lng: 90.45,
        },
        {
          id: "muktagachha_area_3",
          name: "Muktagachha Area 3",
          lat: 24.797,
          lng: 90.45,
        },
        {
          id: "others_muktagachha",
          name: "Others",
          lat: 24.7971,
          lng: 90.4703,
        },
      ],
      nandail: [
        {
          id: "nandail_area_1",
          name: "Nandail Area 1",
          lat: 24.677,
          lng: 90.35,
        },
        {
          id: "nandail_area_2",
          name: "Nandail Area 2",
          lat: 24.687,
          lng: 90.35,
        },
        {
          id: "nandail_area_3",
          name: "Nandail Area 3",
          lat: 24.697,
          lng: 90.35,
        },
        { id: "others_nandail", name: "Others", lat: 24.6971, lng: 90.3703 },
      ],
      phulpur: [
        {
          id: "phulpur_area_1",
          name: "Phulpur Area 1",
          lat: 24.727,
          lng: 90.35,
        },
        {
          id: "phulpur_area_2",
          name: "Phulpur Area 2",
          lat: 24.737,
          lng: 90.35,
        },
        {
          id: "phulpur_area_3",
          name: "Phulpur Area 3",
          lat: 24.747,
          lng: 90.35,
        },
        { id: "others_phulpur", name: "Others", lat: 24.7471, lng: 90.3703 },
      ],
      trishal: [
        {
          id: "trishal_area_1",
          name: "Trishal Area 1",
          lat: 24.777,
          lng: 90.35,
        },
        {
          id: "trishal_area_2",
          name: "Trishal Area 2",
          lat: 24.787,
          lng: 90.35,
        },
        {
          id: "trishal_area_3",
          name: "Trishal Area 3",
          lat: 24.797,
          lng: 90.35,
        },
        { id: "others_trishal", name: "Others", lat: 24.7971, lng: 90.3703 },
      ],
      jamalpur_sadar: [
        {
          id: "jamalpur_sadar_area_1",
          name: "Jamalpur Sadar Area 1",
          lat: 24.867,
          lng: 89.868,
        },
        {
          id: "jamalpur_sadar_area_2",
          name: "Jamalpur Sadar Area 2",
          lat: 24.877,
          lng: 89.868,
        },
        {
          id: "jamalpur_sadar_area_3",
          name: "Jamalpur Sadar Area 3",
          lat: 24.887,
          lng: 89.868,
        },
        {
          id: "jamalpur_sadar_area_4",
          name: "Jamalpur Sadar Area 4",
          lat: 24.898,
          lng: 89.868,
        },
        {
          id: "others_jamalpur_sadar",
          name: "Others",
          lat: 24.8875,
          lng: 89.8875,
        },
      ],
      bakshiganj: [
        {
          id: "bakshiganj_area_1",
          name: "Bakshiganj Area 1",
          lat: 24.918,
          lng: 89.868,
        },
        {
          id: "bakshiganj_area_2",
          name: "Bakshiganj Area 2",
          lat: 24.927,
          lng: 89.868,
        },
        {
          id: "bakshiganj_area_3",
          name: "Bakshiganj Area 3",
          lat: 24.938,
          lng: 89.868,
        },
        {
          id: "bakshiganj_area_4",
          name: "Bakshiganj Area 4",
          lat: 24.948,
          lng: 89.868,
        },
        { id: "others_bakshiganj", name: "Others", lat: 24.9375, lng: 89.8875 },
      ],
      dewanganj: [
        {
          id: "dewanganj_area_1",
          name: "Dewanganj Area 1",
          lat: 24.968,
          lng: 89.868,
        },
        {
          id: "dewanganj_area_2",
          name: "Dewanganj Area 2",
          lat: 24.977,
          lng: 89.868,
        },
        {
          id: "dewanganj_area_3",
          name: "Dewanganj Area 3",
          lat: 24.988,
          lng: 89.868,
        },
        {
          id: "dewanganj_area_4",
          name: "Dewanganj Area 4",
          lat: 24.998,
          lng: 89.868,
        },
        { id: "others_dewanganj", name: "Others", lat: 24.9875, lng: 89.8875 },
      ],
      islampur_jamalpur: [
        {
          id: "islampur_jamalpur_area_1",
          name: "Islampur Jamalpur Area 1",
          lat: 24.867,
          lng: 89.918,
        },
        {
          id: "islampur_jamalpur_area_2",
          name: "Islampur Jamalpur Area 2",
          lat: 24.877,
          lng: 89.918,
        },
        {
          id: "islampur_jamalpur_area_3",
          name: "Islampur Jamalpur Area 3",
          lat: 24.887,
          lng: 89.918,
        },
        {
          id: "islampur_jamalpur_area_4",
          name: "Islampur Jamalpur Area 4",
          lat: 24.898,
          lng: 89.918,
        },
        {
          id: "others_islampur_jamalpur",
          name: "Others",
          lat: 24.8875,
          lng: 89.9375,
        },
      ],
      madarganj: [
        {
          id: "madarganj_area_1",
          name: "Madarganj Area 1",
          lat: 24.918,
          lng: 89.918,
        },
        {
          id: "madarganj_area_2",
          name: "Madarganj Area 2",
          lat: 24.927,
          lng: 89.918,
        },
        {
          id: "madarganj_area_3",
          name: "Madarganj Area 3",
          lat: 24.938,
          lng: 89.918,
        },
        {
          id: "madarganj_area_4",
          name: "Madarganj Area 4",
          lat: 24.948,
          lng: 89.918,
        },
        { id: "others_madarganj", name: "Others", lat: 24.9375, lng: 89.9375 },
      ],
      melandaha: [
        {
          id: "melandaha_area_1",
          name: "Melandaha Area 1",
          lat: 24.968,
          lng: 89.918,
        },
        {
          id: "melandaha_area_2",
          name: "Melandaha Area 2",
          lat: 24.977,
          lng: 89.918,
        },
        {
          id: "melandaha_area_3",
          name: "Melandaha Area 3",
          lat: 24.988,
          lng: 89.918,
        },
        {
          id: "melandaha_area_4",
          name: "Melandaha Area 4",
          lat: 24.998,
          lng: 89.918,
        },
        { id: "others_melandaha", name: "Others", lat: 24.9875, lng: 89.9375 },
      ],
      sarishabari: [
        {
          id: "sarishabari_area_1",
          name: "Sarishabari Area 1",
          lat: 24.867,
          lng: 89.968,
        },
        {
          id: "sarishabari_area_2",
          name: "Sarishabari Area 2",
          lat: 24.877,
          lng: 89.968,
        },
        {
          id: "sarishabari_area_3",
          name: "Sarishabari Area 3",
          lat: 24.887,
          lng: 89.968,
        },
        {
          id: "sarishabari_area_4",
          name: "Sarishabari Area 4",
          lat: 24.898,
          lng: 89.968,
        },
        {
          id: "others_sarishabari",
          name: "Others",
          lat: 24.8875,
          lng: 89.9875,
        },
      ],
      netrokona_sadar: [
        {
          id: "netrokona_sadar_area_1",
          name: "Netrokona Sadar Area 1",
          lat: 24.813,
          lng: 90.663,
        },
        {
          id: "netrokona_sadar_area_2",
          name: "Netrokona Sadar Area 2",
          lat: 24.823,
          lng: 90.663,
        },
        {
          id: "netrokona_sadar_area_3",
          name: "Netrokona Sadar Area 3",
          lat: 24.833,
          lng: 90.663,
        },
        {
          id: "netrokona_sadar_area_4",
          name: "Netrokona Sadar Area 4",
          lat: 24.843,
          lng: 90.663,
        },
        {
          id: "others_netrokona_sadar",
          name: "Others",
          lat: 24.8333,
          lng: 90.6833,
        },
      ],
      atpara: [
        {
          id: "atpara_area_1",
          name: "Atpara Area 1",
          lat: 24.863,
          lng: 90.663,
        },
        {
          id: "atpara_area_2",
          name: "Atpara Area 2",
          lat: 24.873,
          lng: 90.663,
        },
        {
          id: "atpara_area_3",
          name: "Atpara Area 3",
          lat: 24.883,
          lng: 90.663,
        },
        {
          id: "atpara_area_4",
          name: "Atpara Area 4",
          lat: 24.893,
          lng: 90.663,
        },
        { id: "others_atpara", name: "Others", lat: 24.8833, lng: 90.6833 },
      ],
      barhatta: [
        {
          id: "barhatta_area_1",
          name: "Barhatta Area 1",
          lat: 24.913,
          lng: 90.663,
        },
        {
          id: "barhatta_area_2",
          name: "Barhatta Area 2",
          lat: 24.923,
          lng: 90.663,
        },
        {
          id: "barhatta_area_3",
          name: "Barhatta Area 3",
          lat: 24.933,
          lng: 90.663,
        },
        {
          id: "barhatta_area_4",
          name: "Barhatta Area 4",
          lat: 24.943,
          lng: 90.663,
        },
        { id: "others_barhatta", name: "Others", lat: 24.9333, lng: 90.6833 },
      ],
      durgapur_netrokona: [
        {
          id: "durgapur_netrokona_area_1",
          name: "Durgapur Netrokona Area 1",
          lat: 24.813,
          lng: 90.713,
        },
        {
          id: "durgapur_netrokona_area_2",
          name: "Durgapur Netrokona Area 2",
          lat: 24.823,
          lng: 90.713,
        },
        {
          id: "durgapur_netrokona_area_3",
          name: "Durgapur Netrokona Area 3",
          lat: 24.833,
          lng: 90.713,
        },
        {
          id: "durgapur_netrokona_area_4",
          name: "Durgapur Netrokona Area 4",
          lat: 24.843,
          lng: 90.713,
        },
        {
          id: "others_durgapur_netrokona",
          name: "Others",
          lat: 24.8333,
          lng: 90.7333,
        },
      ],
      kalmakanda: [
        {
          id: "kalmakanda_area_1",
          name: "Kalmakanda Area 1",
          lat: 24.863,
          lng: 90.713,
        },
        {
          id: "kalmakanda_area_2",
          name: "Kalmakanda Area 2",
          lat: 24.873,
          lng: 90.713,
        },
        {
          id: "kalmakanda_area_3",
          name: "Kalmakanda Area 3",
          lat: 24.883,
          lng: 90.713,
        },
        {
          id: "kalmakanda_area_4",
          name: "Kalmakanda Area 4",
          lat: 24.893,
          lng: 90.713,
        },
        { id: "others_kalmakanda", name: "Others", lat: 24.8833, lng: 90.7333 },
      ],
      kendua: [
        {
          id: "kendua_area_1",
          name: "Kendua Area 1",
          lat: 24.913,
          lng: 90.713,
        },
        {
          id: "kendua_area_2",
          name: "Kendua Area 2",
          lat: 24.923,
          lng: 90.713,
        },
        {
          id: "kendua_area_3",
          name: "Kendua Area 3",
          lat: 24.933,
          lng: 90.713,
        },
        {
          id: "kendua_area_4",
          name: "Kendua Area 4",
          lat: 24.943,
          lng: 90.713,
        },
        { id: "others_kendua", name: "Others", lat: 24.9333, lng: 90.7333 },
      ],
      khaliajuri: [
        {
          id: "khaliajuri_area_1",
          name: "Khaliajuri Area 1",
          lat: 24.813,
          lng: 90.763,
        },
        {
          id: "khaliajuri_area_2",
          name: "Khaliajuri Area 2",
          lat: 24.823,
          lng: 90.763,
        },
        {
          id: "khaliajuri_area_3",
          name: "Khaliajuri Area 3",
          lat: 24.833,
          lng: 90.763,
        },
        {
          id: "khaliajuri_area_4",
          name: "Khaliajuri Area 4",
          lat: 24.843,
          lng: 90.763,
        },
        { id: "others_khaliajuri", name: "Others", lat: 24.8333, lng: 90.7833 },
      ],
      madan: [
        { id: "madan_area_1", name: "Madan Area 1", lat: 24.863, lng: 90.763 },
        { id: "madan_area_2", name: "Madan Area 2", lat: 24.873, lng: 90.763 },
        { id: "madan_area_3", name: "Madan Area 3", lat: 24.883, lng: 90.763 },
        { id: "madan_area_4", name: "Madan Area 4", lat: 24.893, lng: 90.763 },
        { id: "others_madan", name: "Others", lat: 24.8833, lng: 90.7833 },
      ],
      mohanganj: [
        {
          id: "mohanganj_area_1",
          name: "Mohanganj Area 1",
          lat: 24.913,
          lng: 90.763,
        },
        {
          id: "mohanganj_area_2",
          name: "Mohanganj Area 2",
          lat: 24.923,
          lng: 90.763,
        },
        {
          id: "mohanganj_area_3",
          name: "Mohanganj Area 3",
          lat: 24.933,
          lng: 90.763,
        },
        {
          id: "mohanganj_area_4",
          name: "Mohanganj Area 4",
          lat: 24.943,
          lng: 90.763,
        },
        { id: "others_mohanganj", name: "Others", lat: 24.9333, lng: 90.7833 },
      ],
      purbadhala: [
        {
          id: "purbadhala_area_1",
          name: "Purbadhala Area 1",
          lat: 24.813,
          lng: 90.663,
        },
        {
          id: "purbadhala_area_2",
          name: "Purbadhala Area 2",
          lat: 24.823,
          lng: 90.663,
        },
        {
          id: "purbadhala_area_3",
          name: "Purbadhala Area 3",
          lat: 24.833,
          lng: 90.663,
        },
        {
          id: "purbadhala_area_4",
          name: "Purbadhala Area 4",
          lat: 24.843,
          lng: 90.663,
        },
        { id: "others_purbadhala", name: "Others", lat: 24.8333, lng: 90.6833 },
      ],
      sherpur_sadar: [
        {
          id: "sherpur_sadar_area_1",
          name: "Sherpur Sadar Area 1",
          lat: 24.95,
          lng: 89.94,
        },
        {
          id: "sherpur_sadar_area_2",
          name: "Sherpur Sadar Area 2",
          lat: 24.96,
          lng: 89.94,
        },
        {
          id: "sherpur_sadar_area_3",
          name: "Sherpur Sadar Area 3",
          lat: 24.97,
          lng: 89.94,
        },
        {
          id: "sherpur_sadar_area_4",
          name: "Sherpur Sadar Area 4",
          lat: 24.98,
          lng: 89.94,
        },
        { id: "others_sherpur_sadar", name: "Others", lat: 24.97, lng: 89.96 },
      ],
      jhenaigati: [
        {
          id: "jhenaigati_area_1",
          name: "Jhenaigati Area 1",
          lat: 25.0,
          lng: 89.94,
        },
        {
          id: "jhenaigati_area_2",
          name: "Jhenaigati Area 2",
          lat: 25.01,
          lng: 89.94,
        },
        {
          id: "jhenaigati_area_3",
          name: "Jhenaigati Area 3",
          lat: 25.02,
          lng: 89.94,
        },
        {
          id: "jhenaigati_area_4",
          name: "Jhenaigati Area 4",
          lat: 25.03,
          lng: 89.94,
        },
        { id: "others_jhenaigati", name: "Others", lat: 25.02, lng: 89.96 },
      ],
      nakla: [
        { id: "nakla_area_1", name: "Nakla Area 1", lat: 25.05, lng: 89.94 },
        { id: "nakla_area_2", name: "Nakla Area 2", lat: 25.06, lng: 89.94 },
        { id: "nakla_area_3", name: "Nakla Area 3", lat: 25.07, lng: 89.94 },
        { id: "nakla_area_4", name: "Nakla Area 4", lat: 25.08, lng: 89.94 },
        { id: "others_nakla", name: "Others", lat: 25.07, lng: 89.96 },
      ],
      nalitabari: [
        {
          id: "nalitabari_area_1",
          name: "Nalitabari Area 1",
          lat: 24.95,
          lng: 89.99,
        },
        {
          id: "nalitabari_area_2",
          name: "Nalitabari Area 2",
          lat: 24.96,
          lng: 89.99,
        },
        {
          id: "nalitabari_area_3",
          name: "Nalitabari Area 3",
          lat: 24.97,
          lng: 89.99,
        },
        {
          id: "nalitabari_area_4",
          name: "Nalitabari Area 4",
          lat: 24.98,
          lng: 89.99,
        },
        { id: "others_nalitabari", name: "Others", lat: 24.97, lng: 90.01 },
      ],
      sreebardi: [
        {
          id: "sreebardi_area_1",
          name: "Sreebardi Area 1",
          lat: 25.0,
          lng: 89.99,
        },
        {
          id: "sreebardi_area_2",
          name: "Sreebardi Area 2",
          lat: 25.01,
          lng: 89.99,
        },
        {
          id: "sreebardi_area_3",
          name: "Sreebardi Area 3",
          lat: 25.02,
          lng: 89.99,
        },
        {
          id: "sreebardi_area_4",
          name: "Sreebardi Area 4",
          lat: 25.03,
          lng: 89.99,
        },
        { id: "others_sreebardi", name: "Others", lat: 25.02, lng: 90.01 },
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
