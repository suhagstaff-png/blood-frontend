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
      // DHAKA
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
        { id: "mohammadpur", name: "Mohammadpur" },
        { id: "tejgaon", name: "Tejgaon" },
        { id: "badda", name: "Badda" },
        { id: "khilgaon", name: "Khilgaon" },
        { id: "demra", name: "Demra" },
      ],
      // GAZIPUR
      gazipur: [
        { id: "gazipur_sadar", name: "Gazipur Sadar" },
        { id: "kaliakair", name: "Kaliakair" },
        { id: "kapasia", name: "Kapasia" },
        { id: "sreepur", name: "Sreepur" },
        { id: "tongi", name: "Tongi" },
      ],
      // NARAYANGANJ
      narayanganj: [
        { id: "narayanganj_sadar", name: "Narayanganj Sadar" },
        { id: "sonargaon", name: "Sonargaon" },
        { id: "bandar", name: "Bandar" },
        { id: "araihazar", name: "Araihazar" },
        { id: "rupganj", name: "Rupganj" },
      ],
      // NARSINGDI
      narsingdi: [
        { id: "narsingdi_sadar", name: "Narsingdi Sadar" },
        { id: "belabo", name: "Belabo" },
        { id: "monohardi", name: "Monohardi" },
        { id: "palash", name: "Palash" },
        { id: "raipura", name: "Raipura" },
        { id: "shibpur", name: "Shibpur" },
      ],
      // MANIKGANJ
      manikganj: [
        { id: "manikganj_sadar", name: "Manikganj Sadar" },
        { id: "singair", name: "Singair" },
        { id: "saturia", name: "Saturia" },
        { id: "harirampur", name: "Harirampur" },
        { id: "ghior", name: "Ghior" },
        { id: "shibalaya", name: "Shibalaya" },
        { id: "daulatpur_manikganj", name: "Daulatpur Manikganj" },
      ],
      // MUNSHIGANJ
      munshiganj: [
        { id: "munshiganj_sadar", name: "Munshiganj Sadar" },
        { id: "sreenagar", name: "Sreenagar" },
        { id: "sirajdikhan", name: "Sirajdikhan" },
        { id: "louhajang", name: "Louhajang" },
        { id: "gazaria", name: "Gazaria" },
        { id: "tongibari", name: "Tongibari" },
      ],
      // FARIDPUR
      faridpur: [
        { id: "faridpur_sadar", name: "Faridpur Sadar" },
        { id: "alfadanga", name: "Alfadanga" },
        { id: "boalmari", name: "Boalmari" },
        { id: "char_bhadrasan", name: "Char Bhadrasan" },
        { id: "madhukhali", name: "Madhukhali" },
        { id: "nagarkanda", name: "Nagarkanda" },
        { id: "sadarpur", name: "Sadarpur" },
        { id: "saltha", name: "Saltha" },
        { id: "bhanga", name: "Bhanga" },
      ],
      // RAJBARI
      rajbari: [
        { id: "rajbari_sadar", name: "Rajbari Sadar" },
        { id: "goalanda", name: "Goalanda" },
        { id: "pangsha", name: "Pangsha" },
        { id: "baliakandi", name: "Baliakandi" },
        { id: "kalukhali", name: "Kalukhali" },
      ],
      // GOPALGANJ
      gopalganj: [
        { id: "gopalganj_sadar", name: "Gopalganj Sadar" },
        { id: "kashiani", name: "Kashiani" },
        { id: "tungipara", name: "Tungipara" },
        { id: "kotalipara", name: "Kotalipara" },
        { id: "muksudpur", name: "Muksudpur" },
      ],
      // MADARIPUR
      madaripur: [
        { id: "madaripur_sadar", name: "Madaripur Sadar" },
        { id: "rajoir", name: "Rajoir" },
        { id: "kalkini", name: "Kalkini" },
        { id: "shibchar", name: "Shibchar" },
      ],
      // SHARIATPUR
      shariatpur: [
        { id: "shariatpur_sadar", name: "Shariatpur Sadar" },
        { id: "naria", name: "Naria" },
        { id: "zajira", name: "Zajira" },
        { id: "gosairhat", name: "Gosairhat" },
        { id: "bhedarganj", name: "Bhedarganj" },
        { id: "damudya", name: "Damudya" },
      ],
      // KISHOREGANJ
      kishoreganj: [
        { id: "kishoreganj_sadar", name: "Kishoreganj Sadar" },
        { id: "bajitpur", name: "Bajitpur" },
        { id: "bhairab", name: "Bhairab" },
        { id: "hossainpur", name: "Hossainpur" },
        { id: "itna", name: "Itna" },
        { id: "karimganj", name: "Karimganj" },
        { id: "katiadi", name: "Katiadi" },
        { id: "kuliarchar", name: "Kuliarchar" },
        { id: "mithamain", name: "Mithamain" },
        { id: "nikli", name: "Nikli" },
        { id: "pakundia", name: "Pakundia" },
        { id: "tarail", name: "Tarail" },
        { id: "austagram", name: "Austagram" },
      ],
      // TANGAIL
      tangail: [
        { id: "tangail_sadar", name: "Tangail Sadar" },
        { id: "basail", name: "Basail" },
        { id: "bhuapur", name: "Bhuapur" },
        { id: "delduar", name: "Delduar" },
        { id: "dhanbari", name: "Dhanbari" },
        { id: "ghatail", name: "Ghatail" },
        { id: "gopalpur", name: "Gopalpur" },
        { id: "kalihati", name: "Kalihati" },
        { id: "madhupur", name: "Madhupur" },
        { id: "mirzapur", name: "Mirzapur" },
        { id: "nagarpur", name: "Nagarpur" },
        { id: "sakhipur", name: "Sakhipur" },
      ],
      // CHATTOGRAM
      chattogram: [
        { id: "chattogram_sadar", name: "Chattogram Sadar" },
        { id: "hathazari", name: "Hathazari" },
        { id: "patiya", name: "Patiya" },
        { id: "sitakunda", name: "Sitakunda" },
        { id: "sandwip", name: "Sandwip" },
        { id: "mirsharai", name: "Mirsharai" },
        { id: "rangunia", name: "Rangunia" },
        { id: "raozan", name: "Raozan" },
        { id: "anwara", name: "Anwara" },
        { id: "banshkhali", name: "Banshkhali" },
        { id: "boalkhali", name: "Boalkhali" },
        { id: "chandanaish", name: "Chandanaish" },
        { id: "fatikchhari", name: "Fatikchhari" },
        { id: "lohagara", name: "Lohagara" },
        { id: "satkania", name: "Satkania" },
      ],
      // COXSBAZAR
      coxsbazar: [
        { id: "cox_sadar", name: "Cox Sadar" },
        { id: "ukhiya", name: "Ukhiya" },
        { id: "teknaf", name: "Teknaf" },
        { id: "ramu", name: "Ramu" },
        { id: "chakaria", name: "Chakaria" },
        { id: "kutubdia", name: "Kutubdia" },
        { id: "moheshkhali", name: "Moheshkhali" },
        { id: "pekua", name: "Pekua" },
      ],
      // RANGAMATI
      rangamati: [
        { id: "rangamati_sadar", name: "Rangamati Sadar" },
        { id: "kawkhali", name: "Kawkhali" },
        { id: "kaptai", name: "Kaptai" },
        { id: "baghaichari", name: "Baghaichari" },
        { id: "barkal", name: "Barkal" },
        { id: "belaichari", name: "Belaichari" },
        { id: "juraichari", name: "Juraichari" },
        { id: "langadu", name: "Langadu" },
        { id: "naniarchar", name: "Naniarchar" },
        { id: "rajasthali", name: "Rajasthali" },
      ],
      // BANDARBAN
      bandarban: [
        { id: "bandarban_sadar", name: "Bandarban Sadar" },
        { id: "alikadam", name: "Alikadam" },
        { id: "lama", name: "Lama" },
        { id: "naikhongchhari", name: "Naikhongchhari" },
        { id: "rowangchhari", name: "Rowangchhari" },
        { id: "ruma", name: "Ruma" },
        { id: "thanchi", name: "Thanchi" },
      ],
      // KHAGRACHARI
      khagrachari: [
        { id: "khagrachari_sadar", name: "Khagrachari Sadar" },
        { id: "dighinala", name: "Dighinala" },
        { id: "lakshmichhari", name: "Lakshmichhari" },
        { id: "mahalchhari", name: "Mahalchhari" },
        { id: "manikchhari", name: "Manikchhari" },
        { id: "matiranga", name: "Matiranga" },
        { id: "panchhari", name: "Panchhari" },
        { id: "ramgarh", name: "Ramgarh" },
        { id: "guimara", name: "Guimara" },
      ],
      // NOAKHALI
      noakhali: [
        { id: "noakhali_sadar", name: "Noakhali Sadar" },
        { id: "begumganj", name: "Begumganj" },
        { id: "chatkhil", name: "Chatkhil" },
        { id: "companiganj_noakhali", name: "Companiganj Noakhali" },
        { id: "hatiya", name: "Hatiya" },
        { id: "kabirhat", name: "Kabirhat" },
        { id: "senbagh", name: "Senbagh" },
        { id: "sonaimuri", name: "Sonaimuri" },
        { id: "subarnachar", name: "Subarnachar" },
      ],
      // FENI
      feni: [
        { id: "feni_sadar", name: "Feni Sadar" },
        { id: "chhagalnaiya", name: "Chhagalnaiya" },
        { id: "daganbhuiyan", name: "Daganbhuiyan" },
        { id: "fulgazi", name: "Fulgazi" },
        { id: "parshuram", name: "Parshuram" },
        { id: "sonagazi", name: "Sonagazi" },
      ],
      // LAKSHMIPUR
      lakshmipur: [
        { id: "lakshmipur_sadar", name: "Lakshmipur Sadar" },
        { id: "raipur", name: "Raipur" },
        { id: "ramganj", name: "Ramganj" },
        { id: "ramgati", name: "Ramgati" },
        { id: "kamalnagar", name: "Kamalnagar" },
      ],
      // CHANDPUR
      chandpur: [
        { id: "chandpur_sadar", name: "Chandpur Sadar" },
        { id: "faridganj", name: "Faridganj" },
        { id: "haimchar", name: "Haimchar" },
        { id: "hajiganj", name: "Hajiganj" },
        { id: "kachua", name: "Kachua" },
        { id: "matlab_dakshin", name: "Matlab Dakshin" },
        { id: "matlab_uttar", name: "Matlab Uttar" },
        { id: "shahrasti", name: "Shahrasti" },
      ],
      // BRAHMANBARIA
      brahmanbaria: [
        { id: "brahmanbaria_sadar", name: "Brahmanbaria Sadar" },
        { id: "akhaura", name: "Akhaura" },
        { id: "ashuganj", name: "Ashuganj" },
        { id: "bancharampur", name: "Bancharampur" },
        { id: "bijoynagar", name: "Bijoynagar" },
        { id: "kasba", name: "Kasba" },
        { id: "nabinagar", name: "Nabinagar" },
        { id: "nasirnagar", name: "Nasirnagar" },
        { id: "sarail", name: "Sarail" },
      ],
      // COMILLA
      comilla: [
        { id: "comilla_sadar", name: "Comilla Sadar" },
        { id: "barura", name: "Barura" },
        { id: "brahmanpara", name: "Brahmanpara" },
        { id: "burichang", name: "Burichang" },
        { id: "chandina", name: "Chandina" },
        { id: "chauddagram", name: "Chauddagram" },
        { id: "daudkandi", name: "Daudkandi" },
        { id: "debidwar", name: "Debidwar" },
        { id: "homna", name: "Homna" },
        { id: "laksam", name: "Laksam" },
        { id: "muradnagar", name: "Muradnagar" },
        { id: "nangalkot", name: "Nangalkot" },
        { id: "meghna", name: "Meghna" },
        { id: "titas", name: "Titas" },
        { id: "monoharganj", name: "Monoharganj" },
      ],
      // RAJSHAHI
      rajshahi: [
        { id: "rajshahi_sadar", name: "Rajshahi Sadar" },
        { id: "paba", name: "Paba" },
        { id: "durgapur", name: "Durgapur" },
        { id: "mohanpur", name: "Mohanpur" },
        { id: "charghat", name: "Charghat" },
        { id: "puthia", name: "Puthia" },
        { id: "bagha", name: "Bagha" },
        { id: "godagari", name: "Godagari" },
        { id: "tanore", name: "Tanore" },
      ],
      // NATORE
      natore: [
        { id: "natore_sadar", name: "Natore Sadar" },
        { id: "bagatipara", name: "Bagatipara" },
        { id: "baraigram", name: "Baraigram" },
        { id: "gurudaspur", name: "Gurudaspur" },
        { id: "lalpur", name: "Lalpur" },
        { id: "singra", name: "Singra" },
      ],
      // CHAPAINAWABGANJ
      chapainawabganj: [
        { id: "chapainawabganj_sadar", name: "Chapainawabganj Sadar" },
        { id: "bholahat", name: "Bholahat" },
        { id: "gomastapur", name: "Gomastapur" },
        { id: "nachole", name: "Nachole" },
        { id: "shibganj_chapai", name: "Shibganj Chapai" },
      ],
      // NAOGAON
      naogaon: [
        { id: "naogaon_sadar", name: "Naogaon Sadar" },
        { id: "atrai", name: "Atrai" },
        { id: "badalgachhi", name: "Badalgachhi" },
        { id: "dhamoirhat", name: "Dhamoirhat" },
        { id: "manda", name: "Manda" },
        { id: "mohadevpur", name: "Mohadevpur" },
        { id: "niamatpur", name: "Niamatpur" },
        { id: "patnitala", name: "Patnitala" },
        { id: "porsha", name: "Porsha" },
        { id: "raninagar", name: "Raninagar" },
        { id: "sapahar", name: "Sapahar" },
      ],
      // PABNA
      pabna: [
        { id: "pabna_sadar", name: "Pabna Sadar" },
        { id: "atgharia", name: "Atgharia" },
        { id: "bera", name: "Bera" },
        { id: "bhangura", name: "Bhangura" },
        { id: "chatmohar", name: "Chatmohar" },
        { id: "faridpur_pabna", name: "Faridpur Pabna" },
        { id: "ishwardi", name: "Ishwardi" },
        { id: "santhia", name: "Santhia" },
        { id: "sujanagar", name: "Sujanagar" },
      ],
      // SIRAJGANJ
      sirajganj: [
        { id: "sirajganj_sadar", name: "Sirajganj Sadar" },
        { id: "belkuchi", name: "Belkuchi" },
        { id: "chauhali", name: "Chauhali" },
        { id: "kamarkhanda", name: "Kamarkhanda" },
        { id: "kazipur", name: "Kazipur" },
        { id: "raiganj", name: "Raiganj" },
        { id: "shahjadpur", name: "Shahjadpur" },
        { id: "tarash", name: "Tarash" },
        { id: "ullahpara", name: "Ullahpara" },
      ],
      // BOGRA
      bogra: [
        { id: "bogra_sadar", name: "Bogra Sadar" },
        { id: "adamdighi", name: "Adamdighi" },
        { id: "dhunat", name: "Dhunat" },
        { id: "dhupchanchia", name: "Dhupchanchia" },
        { id: "gabtali", name: "Gabtali" },
        { id: "kahaloo", name: "Kahaloo" },
        { id: "nandigram", name: "Nandigram" },
        { id: "sariakandi", name: "Sariakandi" },
        { id: "shajahanpur", name: "Shajahanpur" },
        { id: "sherpur_bogra", name: "Sherpur Bogra" },
        { id: "shibganj_bogra", name: "Shibganj Bogra" },
        { id: "sonatala", name: "Sonatala" },
      ],
      // JOYPURHAT
      joypurhat: [
        { id: "joypurhat_sadar", name: "Joypurhat Sadar" },
        { id: "akkelpur", name: "Akkelpur" },
        { id: "kalai", name: "Kalai" },
        { id: "khetlal", name: "Khetlal" },
        { id: "panchbibi", name: "Panchbibi" },
      ],
      // KHULNA
      khulna: [
        { id: "khulna_sadar", name: "Khulna Sadar" },
        { id: "batiaghata", name: "Batiaghata" },
        { id: "dacope", name: "Dacope" },
        { id: "daulatpur_khulna", name: "Daulatpur Khulna" },
        { id: "dighalia", name: "Dighalia" },
        { id: "dumuria", name: "Dumuria" },
        { id: "khalishpur", name: "Khalishpur" },
        { id: "koyra", name: "Koyra" },
        { id: "paikgachha", name: "Paikgachha" },
        { id: "phultala", name: "Phultala" },
        { id: "rupsa", name: "Rupsa" },
        { id: "sonadanga", name: "Sonadanga" },
        { id: "terokhada", name: "Terokhada" },
      ],
      // BAGERHAT
      bagerhat: [
        { id: "bagerhat_sadar", name: "Bagerhat Sadar" },
        { id: "chitalmari", name: "Chitalmari" },
        { id: "fakirhat", name: "Fakirhat" },
        { id: "kachua_bagerhat", name: "Kachua Bagerhat" },
        { id: "mollahat", name: "Mollahat" },
        { id: "mongla", name: "Mongla" },
        { id: "morrelganj", name: "Morrelganj" },
        { id: "rampal", name: "Rampal" },
        { id: "sarankhola", name: "Sarankhola" },
      ],
      // SATKHIRA
      satkhira: [
        { id: "satkhira_sadar", name: "Satkhira Sadar" },
        { id: "assasuni", name: "Assasuni" },
        { id: "debhata", name: "Debhata" },
        { id: "kalaroa", name: "Kalaroa" },
        { id: "kaliganj_satkhira", name: "Kaliganj Satkhira" },
        { id: "shyamnagar", name: "Shyamnagar" },
        { id: "tala", name: "Tala" },
      ],
      // JESSORE
      jessore: [
        { id: "jessore_sadar", name: "Jessore Sadar" },
        { id: "abhaynagar", name: "Abhaynagar" },
        { id: "bagherpara", name: "Bagherpara" },
        { id: "chougachha", name: "Chougachha" },
        { id: "jhikargachha", name: "Jhikargachha" },
        { id: "keshabpur", name: "Keshabpur" },
        { id: "manirampur", name: "Manirampur" },
        { id: "sharsha", name: "Sharsha" },
      ],
      // JHENAIDAH
      jhenaidah: [
        { id: "jhenaidah_sadar", name: "Jhenaidah Sadar" },
        { id: "harinakunda", name: "Harinakunda" },
        { id: "kaliganj_jhenaidah", name: "Kaliganj Jhenaidah" },
        { id: "kotchandpur", name: "Kotchandpur" },
        { id: "maheshpur", name: "Maheshpur" },
        { id: "shailkupa", name: "Shailkupa" },
      ],
      // MAGURA
      magura: [
        { id: "magura_sadar", name: "Magura Sadar" },
        { id: "mohammadpur_magura", name: "Mohammadpur Magura" },
        { id: "shalikha", name: "Shalikha" },
        { id: "sreepur_magura", name: "Sreepur Magura" },
      ],
      // NARAIL
      narail: [
        { id: "narail_sadar", name: "Narail Sadar" },
        { id: "kalia", name: "Kalia" },
        { id: "lohagara_narail", name: "Lohagara Narail" },
      ],
      // KUSHTIA
      kushtia: [
        { id: "kushtia_sadar", name: "Kushtia Sadar" },
        { id: "bheramara", name: "Bheramara" },
        { id: "daulatpur_kushtia", name: "Daulatpur Kushtia" },
        { id: "khoksa", name: "Khoksa" },
        { id: "kumarkhali", name: "Kumarkhali" },
        { id: "mirpur_kushtia", name: "Mirpur Kushtia" },
      ],
      // MEHERPUR
      meherpur: [
        { id: "meherpur_sadar", name: "Meherpur Sadar" },
        { id: "gangni", name: "Gangni" },
        { id: "mujibnagar", name: "Mujibnagar" },
      ],
      // CHUADANGA
      chuadanga: [
        { id: "chuadanga_sadar", name: "Chuadanga Sadar" },
        { id: "alamdanga", name: "Alamdanga" },
        { id: "damurhuda", name: "Damurhuda" },
        { id: "jibannagar", name: "Jibannagar" },
      ],
      // BARISHAL
      barishal: [
        { id: "barishal_sadar", name: "Barishal Sadar" },
        { id: "agailjhara", name: "Agailjhara" },
        { id: "babuganj", name: "Babuganj" },
        { id: "bakerganj", name: "Bakerganj" },
        { id: "banaripara", name: "Banaripara" },
        { id: "gaurnadi", name: "Gaurnadi" },
        { id: "hizla", name: "Hizla" },
        { id: "mehendiganj", name: "Mehendiganj" },
        { id: "muladi", name: "Muladi" },
        { id: "wazirpur", name: "Wazirpur" },
      ],
      // BHOLA
      bhola: [
        { id: "bhola_sadar", name: "Bhola Sadar" },
        { id: "burhanuddin", name: "Burhanuddin" },
        { id: "char_fasson", name: "Char Fasson" },
        { id: "daulatkhan", name: "Daulatkhan" },
        { id: "lalmohan", name: "Lalmohan" },
        { id: "manpura", name: "Manpura" },
        { id: "tazumuddin", name: "Tazumuddin" },
      ],
      // PATUAKHALI
      patuakhali: [
        { id: "patuakhali_sadar", name: "Patuakhali Sadar" },
        { id: "bauphal", name: "Bauphal" },
        { id: "dashmina", name: "Dashmina" },
        { id: "dumki", name: "Dumki" },
        { id: "galachipa", name: "Galachipa" },
        { id: "kalapara", name: "Kalapara" },
        { id: "mirzaganj", name: "Mirzaganj" },
        { id: "rangabali", name: "Rangabali" },
      ],
      // BARGUNA
      barguna: [
        { id: "barguna_sadar", name: "Barguna Sadar" },
        { id: "amtali", name: "Amtali" },
        { id: "bamna", name: "Bamna" },
        { id: "betagi", name: "Betagi" },
        { id: "patharghata", name: "Patharghata" },
        { id: "taltali", name: "Taltali" },
      ],
      // JHALOKATI
      jhalokati: [
        { id: "jhalokati_sadar", name: "Jhalokati Sadar" },
        { id: "kathalia", name: "Kathalia" },
        { id: "nalchity", name: "Nalchity" },
        { id: "rajapur", name: "Rajapur" },
      ],
      // PIROJPUR
      pirojpur: [
        { id: "pirojpur_sadar", name: "Pirojpur Sadar" },
        { id: "bhandaria", name: "Bhandaria" },
        { id: "kawkhali_pirojpur", name: "Kawkhali Pirojpur" },
        { id: "mathbaria", name: "Mathbaria" },
        { id: "nazirpur", name: "Nazirpur" },
        { id: "nesarabad", name: "Nesarabad" },
        { id: "zianagar", name: "Zianagar" },
      ],
      // SYLHET
      sylhet: [
        { id: "sylhet_sadar", name: "Sylhet Sadar" },
        { id: "beanibazar", name: "Beanibazar" },
        { id: "golapganj", name: "Golapganj" },
        { id: "kanaighat", name: "Kanaighat" },
        { id: "bishwanath", name: "Bishwanath" },
        { id: "fenchuganj", name: "Fenchuganj" },
        { id: "gowainghat", name: "Gowainghat" },
        { id: "jaintiapur", name: "Jaintiapur" },
        { id: "zakiganj", name: "Zakiganj" },
        { id: "balaganj", name: "Balaganj" },
        { id: "osmaninagar", name: "Osmaninagar" },
        { id: "companiganj_sylhet", name: "Companiganj Sylhet" },
      ],
      // MOULVIBAZAR
      moulvibazar: [
        { id: "moulvibazar_sadar", name: "Moulvibazar Sadar" },
        { id: "kamalganj", name: "Kamalganj" },
        { id: "kulaura", name: "Kulaura" },
        { id: "rajnagar", name: "Rajnagar" },
        { id: "sreemangal", name: "Sreemangal" },
        { id: "juri", name: "Juri" },
        { id: "barlekha", name: "Barlekha" },
      ],
      // HABIGANJ
      habiganj: [
        { id: "habiganj_sadar", name: "Habiganj Sadar" },
        { id: "bahubal", name: "Bahubal" },
        { id: "chunarughat", name: "Chunarughat" },
        { id: "madhabpur", name: "Madhabpur" },
        { id: "nabiganj", name: "Nabiganj" },
        { id: "lakhai", name: "Lakhai" },
        { id: "ajmiriganj", name: "Ajmiriganj" },
        { id: "baniachong", name: "Baniachong" },
      ],
      // SUNAMGANJ
      sunamganj: [
        { id: "sunamganj_sadar", name: "Sunamganj Sadar" },
        { id: "chhatak", name: "Chhatak" },
        { id: "derai", name: "Derai" },
        { id: "dharamapasha", name: "Dharamapasha" },
        { id: "bishwambarpur", name: "Bishwambarpur" },
        { id: "dowarabazar", name: "Dowarabazar" },
        { id: "jagannathpur", name: "Jagannathpur" },
        { id: "jamalganj", name: "Jamalganj" },
        { id: "sulla", name: "Sulla" },
        { id: "shanthiganj", name: "Shanthiganj" },
        { id: "tahirpur", name: "Tahirpur" },
      ],
      // RANGPUR
      rangpur: [
        { id: "rangpur_sadar", name: "Rangpur Sadar" },
        { id: "badarganj", name: "Badarganj" },
        { id: "gangachara", name: "Gangachara" },
        { id: "kaunia", name: "Kaunia" },
        { id: "mithapukur", name: "Mithapukur" },
        { id: "pirgachha", name: "Pirgachha" },
        { id: "pirganj", name: "Pirganj" },
        { id: "taraganj", name: "Taraganj" },
      ],
      // DINAJPUR
      dinajpur: [
        { id: "dinajpur_sadar", name: "Dinajpur Sadar" },
        { id: "birampur", name: "Birampur" },
        { id: "birganj", name: "Birganj" },
        { id: "biral", name: "Biral" },
        { id: "bochaganj", name: "Bochaganj" },
        { id: "chirirbandar", name: "Chirirbandar" },
        { id: "fulbari_dinajpur", name: "Fulbari Dinajpur" },
        { id: "ghoraghat", name: "Ghoraghat" },
        { id: "hakimpur", name: "Hakimpur" },
        { id: "kaharole", name: "Kaharole" },
        { id: "khansama", name: "Khansama" },
        { id: "nawabganj_dinajpur", name: "Nawabganj Dinajpur" },
        { id: "parbatipur", name: "Parbatipur" },
      ],
      // GAIBANDHA
      gaibandha: [
        { id: "gaibandha_sadar", name: "Gaibandha Sadar" },
        { id: "fulchhari", name: "Fulchhari" },
        { id: "gobindaganj", name: "Gobindaganj" },
        { id: "palashbari", name: "Palashbari" },
        { id: "sadullapur", name: "Sadullapur" },
        { id: "saghata", name: "Saghata" },
        { id: "sundarganj", name: "Sundarganj" },
      ],
      // KURIGRAM
      kurigram: [
        { id: "kurigram_sadar", name: "Kurigram Sadar" },
        { id: "bhurungamari", name: "Bhurungamari" },
        { id: "char_rajibpur", name: "Char Rajibpur" },
        { id: "chilmari", name: "Chilmari" },
        { id: "nageshwari", name: "Nageshwari" },
        { id: "phulbari_kurigram", name: "Phulbari Kurigram" },
        { id: "rajarhat", name: "Rajarhat" },
        { id: "roumari", name: "Roumari" },
        { id: "ulipur", name: "Ulipur" },
      ],
      // LALMONIRHAT
      lalmonirhat: [
        { id: "lalmonirhat_sadar", name: "Lalmonirhat Sadar" },
        { id: "aditmari", name: "Aditmari" },
        { id: "hatibandha", name: "Hatibandha" },
        { id: "kaliganj_lalmonirhat", name: "Kaliganj Lalmonirhat" },
        { id: "patgram", name: "Patgram" },
      ],
      // NILPHAMARI
      nilphamari: [
        { id: "nilphamari_sadar", name: "Nilphamari Sadar" },
        { id: "domar", name: "Domar" },
        { id: "dimla", name: "Dimla" },
        { id: "jaldhaka", name: "Jaldhaka" },
        { id: "kishoreganj_nilphamari", name: "Kishoreganj Nilphamari" },
        { id: "saidpur", name: "Saidpur" },
      ],
      // PANCHAGARH
      panchagarh: [
        { id: "panchagarh_sadar", name: "Panchagarh Sadar" },
        { id: "atwari", name: "Atwari" },
        { id: "boda", name: "Boda" },
        { id: "debiganj", name: "Debiganj" },
        { id: "tetulia", name: "Tetulia" },
      ],
      // THAKURGAON
      thakurgaon: [
        { id: "thakurgaon_sadar", name: "Thakurgaon Sadar" },
        { id: "baliadangi", name: "Baliadangi" },
        { id: "haripur", name: "Haripur" },
        { id: "pirganj_thakurgaon", name: "Pirganj Thakurgaon" },
        { id: "ranisankail", name: "Ranisankail" },
      ],
      // MYMENSINGH
      mymensingh: [
        { id: "mymensingh_sadar", name: "Mymensingh Sadar" },
        { id: "bhaluka", name: "Bhaluka" },
        { id: "dhobaura", name: "Dhobaura" },
        { id: "fulbaria", name: "Fulbaria" },
        { id: "gafargaon", name: "Gafargaon" },
        { id: "gauripur", name: "Gauripur" },
        { id: "haluaghat", name: "Haluaghat" },
        { id: "ishwarganj", name: "Ishwarganj" },
        { id: "muktagachha", name: "Muktagachha" },
        { id: "nandail", name: "Nandail" },
        { id: "phulpur", name: "Phulpur" },
        { id: "trishal", name: "Trishal" },
      ],
      // JAMALPUR
      jamalpur: [
        { id: "jamalpur_sadar", name: "Jamalpur Sadar" },
        { id: "bakshiganj", name: "Bakshiganj" },
        { id: "dewanganj", name: "Dewanganj" },
        { id: "islampur_jamalpur", name: "Islampur Jamalpur" },
        { id: "madarganj", name: "Madarganj" },
        { id: "melandaha", name: "Melandaha" },
        { id: "sarishabari", name: "Sarishabari" },
      ],
      // NETROKONA
      netrokona: [
        { id: "netrokona_sadar", name: "Netrokona Sadar" },
        { id: "atpara", name: "Atpara" },
        { id: "barhatta", name: "Barhatta" },
        { id: "durgapur_netrokona", name: "Durgapur Netrokona" },
        { id: "kalmakanda", name: "Kalmakanda" },
        { id: "kendua", name: "Kendua" },
        { id: "khaliajuri", name: "Khaliajuri" },
        { id: "madan", name: "Madan" },
        { id: "mohanganj", name: "Mohanganj" },
        { id: "purbadhala", name: "Purbadhala" },
      ],
      // SHERPUR
      sherpur: [
        { id: "sherpur_sadar", name: "Sherpur Sadar" },
        { id: "jhenaigati", name: "Jhenaigati" },
        { id: "nakla", name: "Nakla" },
        { id: "nalitabari", name: "Nalitabari" },
        { id: "sreebardi", name: "Sreebardi" },
      ],
    },

    areas: {
      dhanmondi: [
        { id: "dhanmondi_center", name: "Dhanmondi Center" },
        { id: "dhanmondi_bazar", name: "Dhanmondi Bazar" },
        { id: "dhanmondi_area1", name: "Area 1" },
        { id: "others_dhanmondi", name: "Others" },
      ],
      gulshan: [
        { id: "gulshan_center", name: "Gulshan Center" },
        { id: "gulshan_bazar", name: "Gulshan Bazar" },
        { id: "gulshan_area1", name: "Area 1" },
        { id: "others_gulshan", name: "Others" },
      ],
      banani: [
        { id: "banani_center", name: "Banani Center" },
        { id: "banani_bazar", name: "Banani Bazar" },
        { id: "banani_area1", name: "Area 1" },
        { id: "others_banani", name: "Others" },
      ],
      mirpur: [
        { id: "mirpur_center", name: "Mirpur Center" },
        { id: "mirpur_bazar", name: "Mirpur Bazar" },
        { id: "mirpur_area1", name: "Area 1" },
        { id: "others_mirpur", name: "Others" },
      ],
      uttara: [
        { id: "uttara_center", name: "Uttara Center" },
        { id: "uttara_bazar", name: "Uttara Bazar" },
        { id: "uttara_area1", name: "Area 1" },
        { id: "others_uttara", name: "Others" },
      ],
      motijheel: [
        { id: "motijheel_center", name: "Motijheel Center" },
        { id: "motijheel_bazar", name: "Motijheel Bazar" },
        { id: "motijheel_area1", name: "Area 1" },
        { id: "others_motijheel", name: "Others" },
      ],
      ramna: [
        { id: "ramna_center", name: "Ramna Center" },
        { id: "ramna_bazar", name: "Ramna Bazar" },
        { id: "ramna_area1", name: "Area 1" },
        { id: "others_ramna", name: "Others" },
      ],
      pallabi: [
        { id: "pallabi_center", name: "Pallabi Center" },
        { id: "pallabi_bazar", name: "Pallabi Bazar" },
        { id: "pallabi_area1", name: "Area 1" },
        { id: "others_pallabi", name: "Others" },
      ],
      kafrul: [
        { id: "kafrul_center", name: "Kafrul Center" },
        { id: "kafrul_bazar", name: "Kafrul Bazar" },
        { id: "kafrul_area1", name: "Area 1" },
        { id: "others_kafrul", name: "Others" },
      ],
      cantonment: [
        { id: "cantonment_center", name: "Cantonment Center" },
        { id: "cantonment_bazar", name: "Cantonment Bazar" },
        { id: "cantonment_area1", name: "Area 1" },
        { id: "others_cantonment", name: "Others" },
      ],
      mohammadpur: [
        { id: "mohammadpur_center", name: "Mohammadpur Center" },
        { id: "mohammadpur_bazar", name: "Mohammadpur Bazar" },
        { id: "mohammadpur_area1", name: "Area 1" },
        { id: "others_mohammadpur", name: "Others" },
      ],
      tejgaon: [
        { id: "tejgaon_center", name: "Tejgaon Center" },
        { id: "tejgaon_bazar", name: "Tejgaon Bazar" },
        { id: "tejgaon_area1", name: "Area 1" },
        { id: "others_tejgaon", name: "Others" },
      ],
      badda: [
        { id: "badda_center", name: "Badda Center" },
        { id: "badda_bazar", name: "Badda Bazar" },
        { id: "badda_area1", name: "Area 1" },
        { id: "others_badda", name: "Others" },
      ],
      khilgaon: [
        { id: "khilgaon_center", name: "Khilgaon Center" },
        { id: "khilgaon_bazar", name: "Khilgaon Bazar" },
        { id: "khilgaon_area1", name: "Area 1" },
        { id: "others_khilgaon", name: "Others" },
      ],
      demra: [
        { id: "demra_center", name: "Demra Center" },
        { id: "demra_bazar", name: "Demra Bazar" },
        { id: "demra_area1", name: "Area 1" },
        { id: "others_demra", name: "Others" },
      ],
      gazipur_sadar: [
        { id: "gazipur_sadar_center", name: "Gazipur Sadar Center" },
        { id: "gazipur_sadar_bazar", name: "Gazipur Sadar Bazar" },
        { id: "gazipur_sadar_area1", name: "Area 1" },
        { id: "others_gazipur_sadar", name: "Others" },
      ],
      kaliakair: [
        { id: "kaliakair_center", name: "Kaliakair Center" },
        { id: "kaliakair_bazar", name: "Kaliakair Bazar" },
        { id: "kaliakair_area1", name: "Area 1" },
        { id: "others_kaliakair", name: "Others" },
      ],
      kapasia: [
        { id: "kapasia_center", name: "Kapasia Center" },
        { id: "kapasia_bazar", name: "Kapasia Bazar" },
        { id: "kapasia_area1", name: "Area 1" },
        { id: "others_kapasia", name: "Others" },
      ],
      sreepur: [
        { id: "sreepur_center", name: "Sreepur Center" },
        { id: "sreepur_bazar", name: "Sreepur Bazar" },
        { id: "sreepur_area1", name: "Area 1" },
        { id: "others_sreepur", name: "Others" },
      ],
      tongi: [
        { id: "tongi_center", name: "Tongi Center" },
        { id: "tongi_bazar", name: "Tongi Bazar" },
        { id: "tongi_area1", name: "Area 1" },
        { id: "others_tongi", name: "Others" },
      ],
      narayanganj_sadar: [
        { id: "narayanganj_sadar_center", name: "Narayanganj Sadar Center" },
        { id: "narayanganj_sadar_bazar", name: "Narayanganj Sadar Bazar" },
        { id: "narayanganj_sadar_area1", name: "Area 1" },
        { id: "others_narayanganj_sadar", name: "Others" },
      ],
      sonargaon: [
        { id: "sonargaon_center", name: "Sonargaon Center" },
        { id: "sonargaon_bazar", name: "Sonargaon Bazar" },
        { id: "sonargaon_area1", name: "Area 1" },
        { id: "others_sonargaon", name: "Others" },
      ],
      bandar: [
        { id: "bandar_center", name: "Bandar Center" },
        { id: "bandar_bazar", name: "Bandar Bazar" },
        { id: "bandar_area1", name: "Area 1" },
        { id: "others_bandar", name: "Others" },
      ],
      araihazar: [
        { id: "araihazar_center", name: "Araihazar Center" },
        { id: "araihazar_bazar", name: "Araihazar Bazar" },
        { id: "araihazar_area1", name: "Area 1" },
        { id: "others_araihazar", name: "Others" },
      ],
      rupganj: [
        { id: "rupganj_center", name: "Rupganj Center" },
        { id: "rupganj_bazar", name: "Rupganj Bazar" },
        { id: "rupganj_area1", name: "Area 1" },
        { id: "others_rupganj", name: "Others" },
      ],
      narsingdi_sadar: [
        { id: "narsingdi_sadar_center", name: "Narsingdi Sadar Center" },
        { id: "narsingdi_sadar_bazar", name: "Narsingdi Sadar Bazar" },
        { id: "narsingdi_sadar_area1", name: "Area 1" },
        { id: "others_narsingdi_sadar", name: "Others" },
      ],
      belabo: [
        { id: "belabo_center", name: "Belabo Center" },
        { id: "belabo_bazar", name: "Belabo Bazar" },
        { id: "belabo_area1", name: "Area 1" },
        { id: "others_belabo", name: "Others" },
      ],
      monohardi: [
        { id: "monohardi_center", name: "Monohardi Center" },
        { id: "monohardi_bazar", name: "Monohardi Bazar" },
        { id: "monohardi_area1", name: "Area 1" },
        { id: "others_monohardi", name: "Others" },
      ],
      palash: [
        { id: "palash_center", name: "Palash Center" },
        { id: "palash_bazar", name: "Palash Bazar" },
        { id: "palash_area1", name: "Area 1" },
        { id: "others_palash", name: "Others" },
      ],
      raipura: [
        { id: "raipura_center", name: "Raipura Center" },
        { id: "raipura_bazar", name: "Raipura Bazar" },
        { id: "raipura_area1", name: "Area 1" },
        { id: "others_raipura", name: "Others" },
      ],
      shibpur: [
        { id: "shibpur_center", name: "Shibpur Center" },
        { id: "shibpur_bazar", name: "Shibpur Bazar" },
        { id: "shibpur_area1", name: "Area 1" },
        { id: "others_shibpur", name: "Others" },
      ],
      manikganj_sadar: [
        { id: "manikganj_sadar_center", name: "Manikganj Sadar Center" },
        { id: "manikganj_sadar_bazar", name: "Manikganj Sadar Bazar" },
        { id: "manikganj_sadar_area1", name: "Area 1" },
        { id: "others_manikganj_sadar", name: "Others" },
      ],
      singair: [
        { id: "singair_center", name: "Singair Center" },
        { id: "singair_bazar", name: "Singair Bazar" },
        { id: "singair_area1", name: "Area 1" },
        { id: "others_singair", name: "Others" },
      ],
      saturia: [
        { id: "saturia_center", name: "Saturia Center" },
        { id: "saturia_bazar", name: "Saturia Bazar" },
        { id: "saturia_area1", name: "Area 1" },
        { id: "others_saturia", name: "Others" },
      ],
      harirampur: [
        { id: "harirampur_center", name: "Harirampur Center" },
        { id: "harirampur_bazar", name: "Harirampur Bazar" },
        { id: "harirampur_area1", name: "Area 1" },
        { id: "others_harirampur", name: "Others" },
      ],
      ghior: [
        { id: "ghior_center", name: "Ghior Center" },
        { id: "ghior_bazar", name: "Ghior Bazar" },
        { id: "ghior_area1", name: "Area 1" },
        { id: "others_ghior", name: "Others" },
      ],
      shibalaya: [
        { id: "shibalaya_center", name: "Shibalaya Center" },
        { id: "shibalaya_bazar", name: "Shibalaya Bazar" },
        { id: "shibalaya_area1", name: "Area 1" },
        { id: "others_shibalaya", name: "Others" },
      ],
      daulatpur_manikganj: [
        {
          id: "daulatpur_manikganj_center",
          name: "Daulatpur Manikganj Center",
        },
        { id: "daulatpur_manikganj_bazar", name: "Daulatpur Manikganj Bazar" },
        { id: "daulatpur_manikganj_area1", name: "Area 1" },
        { id: "others_daulatpur_manikganj", name: "Others" },
      ],
      munshiganj_sadar: [
        { id: "munshiganj_sadar_center", name: "Munshiganj Sadar Center" },
        { id: "munshiganj_sadar_bazar", name: "Munshiganj Sadar Bazar" },
        { id: "munshiganj_sadar_area1", name: "Area 1" },
        { id: "others_munshiganj_sadar", name: "Others" },
      ],
      sreenagar: [
        { id: "sreenagar_center", name: "Sreenagar Center" },
        { id: "sreenagar_bazar", name: "Sreenagar Bazar" },
        { id: "sreenagar_area1", name: "Area 1" },
        { id: "others_sreenagar", name: "Others" },
      ],
      sirajdikhan: [
        { id: "sirajdikhan_center", name: "Sirajdikhan Center" },
        { id: "sirajdikhan_bazar", name: "Sirajdikhan Bazar" },
        { id: "sirajdikhan_area1", name: "Area 1" },
        { id: "others_sirajdikhan", name: "Others" },
      ],
      louhajang: [
        { id: "louhajang_center", name: "Louhajang Center" },
        { id: "louhajang_bazar", name: "Louhajang Bazar" },
        { id: "louhajang_area1", name: "Area 1" },
        { id: "others_louhajang", name: "Others" },
      ],
      gazaria: [
        { id: "gazaria_center", name: "Gazaria Center" },
        { id: "gazaria_bazar", name: "Gazaria Bazar" },
        { id: "gazaria_area1", name: "Area 1" },
        { id: "others_gazaria", name: "Others" },
      ],
      tongibari: [
        { id: "tongibari_center", name: "Tongibari Center" },
        { id: "tongibari_bazar", name: "Tongibari Bazar" },
        { id: "tongibari_area1", name: "Area 1" },
        { id: "others_tongibari", name: "Others" },
      ],
      faridpur_sadar: [
        { id: "faridpur_sadar_center", name: "Faridpur Sadar Center" },
        { id: "faridpur_sadar_bazar", name: "Faridpur Sadar Bazar" },
        { id: "faridpur_sadar_area1", name: "Area 1" },
        { id: "others_faridpur_sadar", name: "Others" },
      ],
      alfadanga: [
        { id: "alfadanga_center", name: "Alfadanga Center" },
        { id: "alfadanga_bazar", name: "Alfadanga Bazar" },
        { id: "alfadanga_area1", name: "Area 1" },
        { id: "others_alfadanga", name: "Others" },
      ],
      boalmari: [
        { id: "boalmari_center", name: "Boalmari Center" },
        { id: "boalmari_bazar", name: "Boalmari Bazar" },
        { id: "boalmari_area1", name: "Area 1" },
        { id: "others_boalmari", name: "Others" },
      ],
      char_bhadrasan: [
        { id: "char_bhadrasan_center", name: "Char Bhadrasan Center" },
        { id: "char_bhadrasan_bazar", name: "Char Bhadrasan Bazar" },
        { id: "char_bhadrasan_area1", name: "Area 1" },
        { id: "others_char_bhadrasan", name: "Others" },
      ],
      madhukhali: [
        { id: "madhukhali_center", name: "Madhukhali Center" },
        { id: "madhukhali_bazar", name: "Madhukhali Bazar" },
        { id: "madhukhali_area1", name: "Area 1" },
        { id: "others_madhukhali", name: "Others" },
      ],
      nagarkanda: [
        { id: "nagarkanda_center", name: "Nagarkanda Center" },
        { id: "nagarkanda_bazar", name: "Nagarkanda Bazar" },
        { id: "nagarkanda_area1", name: "Area 1" },
        { id: "others_nagarkanda", name: "Others" },
      ],
      sadarpur: [
        { id: "sadarpur_center", name: "Sadarpur Center" },
        { id: "sadarpur_bazar", name: "Sadarpur Bazar" },
        { id: "sadarpur_area1", name: "Area 1" },
        { id: "others_sadarpur", name: "Others" },
      ],
      saltha: [
        { id: "saltha_center", name: "Saltha Center" },
        { id: "saltha_bazar", name: "Saltha Bazar" },
        { id: "saltha_area1", name: "Area 1" },
        { id: "others_saltha", name: "Others" },
      ],
      bhanga: [
        { id: "bhanga_center", name: "Bhanga Center" },
        { id: "bhanga_bazar", name: "Bhanga Bazar" },
        { id: "bhanga_area1", name: "Area 1" },
        { id: "others_bhanga", name: "Others" },
      ],
      rajbari_sadar: [
        { id: "rajbari_sadar_center", name: "Rajbari Sadar Center" },
        { id: "rajbari_sadar_bazar", name: "Rajbari Sadar Bazar" },
        { id: "rajbari_sadar_area1", name: "Area 1" },
        { id: "others_rajbari_sadar", name: "Others" },
      ],
      goalanda: [
        { id: "goalanda_center", name: "Goalanda Center" },
        { id: "goalanda_bazar", name: "Goalanda Bazar" },
        { id: "goalanda_area1", name: "Area 1" },
        { id: "others_goalanda", name: "Others" },
      ],
      pangsha: [
        { id: "pangsha_center", name: "Pangsha Center" },
        { id: "pangsha_bazar", name: "Pangsha Bazar" },
        { id: "pangsha_area1", name: "Area 1" },
        { id: "others_pangsha", name: "Others" },
      ],
      baliakandi: [
        { id: "baliakandi_center", name: "Baliakandi Center" },
        { id: "baliakandi_bazar", name: "Baliakandi Bazar" },
        { id: "baliakandi_area1", name: "Area 1" },
        { id: "others_baliakandi", name: "Others" },
      ],
      kalukhali: [
        { id: "kalukhali_center", name: "Kalukhali Center" },
        { id: "kalukhali_bazar", name: "Kalukhali Bazar" },
        { id: "kalukhali_area1", name: "Area 1" },
        { id: "others_kalukhali", name: "Others" },
      ],
      gopalganj_sadar: [
        { id: "gopalganj_sadar_center", name: "Gopalganj Sadar Center" },
        { id: "gopalganj_sadar_bazar", name: "Gopalganj Sadar Bazar" },
        { id: "gopalganj_sadar_area1", name: "Area 1" },
        { id: "others_gopalganj_sadar", name: "Others" },
      ],
      kashiani: [
        { id: "kashiani_center", name: "Kashiani Center" },
        { id: "kashiani_bazar", name: "Kashiani Bazar" },
        { id: "kashiani_area1", name: "Area 1" },
        { id: "others_kashiani", name: "Others" },
      ],
      tungipara: [
        { id: "tungipara_center", name: "Tungipara Center" },
        { id: "tungipara_bazar", name: "Tungipara Bazar" },
        { id: "tungipara_area1", name: "Area 1" },
        { id: "others_tungipara", name: "Others" },
      ],
      kotalipara: [
        { id: "kotalipara_center", name: "Kotalipara Center" },
        { id: "kotalipara_bazar", name: "Kotalipara Bazar" },
        { id: "kotalipara_area1", name: "Area 1" },
        { id: "others_kotalipara", name: "Others" },
      ],
      muksudpur: [
        { id: "muksudpur_center", name: "Muksudpur Center" },
        { id: "muksudpur_bazar", name: "Muksudpur Bazar" },
        { id: "muksudpur_area1", name: "Area 1" },
        { id: "others_muksudpur", name: "Others" },
      ],
      madaripur_sadar: [
        { id: "madaripur_sadar_center", name: "Madaripur Sadar Center" },
        { id: "madaripur_sadar_bazar", name: "Madaripur Sadar Bazar" },
        { id: "madaripur_sadar_area1", name: "Area 1" },
        { id: "others_madaripur_sadar", name: "Others" },
      ],
      rajoir: [
        { id: "rajoir_center", name: "Rajoir Center" },
        { id: "rajoir_bazar", name: "Rajoir Bazar" },
        { id: "rajoir_area1", name: "Area 1" },
        { id: "others_rajoir", name: "Others" },
      ],
      kalkini: [
        { id: "kalkini_center", name: "Kalkini Center" },
        { id: "kalkini_bazar", name: "Kalkini Bazar" },
        { id: "kalkini_area1", name: "Area 1" },
        { id: "others_kalkini", name: "Others" },
      ],
      shibchar: [
        { id: "shibchar_center", name: "Shibchar Center" },
        { id: "shibchar_bazar", name: "Shibchar Bazar" },
        { id: "shibchar_area1", name: "Area 1" },
        { id: "others_shibchar", name: "Others" },
      ],
      shariatpur_sadar: [
        { id: "shariatpur_sadar_center", name: "Shariatpur Sadar Center" },
        { id: "shariatpur_sadar_bazar", name: "Shariatpur Sadar Bazar" },
        { id: "shariatpur_sadar_area1", name: "Area 1" },
        { id: "others_shariatpur_sadar", name: "Others" },
      ],
      naria: [
        { id: "naria_center", name: "Naria Center" },
        { id: "naria_bazar", name: "Naria Bazar" },
        { id: "naria_area1", name: "Area 1" },
        { id: "others_naria", name: "Others" },
      ],
      zajira: [
        { id: "zajira_center", name: "Zajira Center" },
        { id: "zajira_bazar", name: "Zajira Bazar" },
        { id: "zajira_area1", name: "Area 1" },
        { id: "others_zajira", name: "Others" },
      ],
      gosairhat: [
        { id: "gosairhat_center", name: "Gosairhat Center" },
        { id: "gosairhat_bazar", name: "Gosairhat Bazar" },
        { id: "gosairhat_area1", name: "Area 1" },
        { id: "others_gosairhat", name: "Others" },
      ],
      bhedarganj: [
        { id: "bhedarganj_center", name: "Bhedarganj Center" },
        { id: "bhedarganj_bazar", name: "Bhedarganj Bazar" },
        { id: "bhedarganj_area1", name: "Area 1" },
        { id: "others_bhedarganj", name: "Others" },
      ],
      damudya: [
        { id: "damudya_center", name: "Damudya Center" },
        { id: "damudya_bazar", name: "Damudya Bazar" },
        { id: "damudya_area1", name: "Area 1" },
        { id: "others_damudya", name: "Others" },
      ],
      kishoreganj_sadar: [
        { id: "kishoreganj_sadar_center", name: "Kishoreganj Sadar Center" },
        { id: "kishoreganj_sadar_bazar", name: "Kishoreganj Sadar Bazar" },
        { id: "kishoreganj_sadar_area1", name: "Area 1" },
        { id: "others_kishoreganj_sadar", name: "Others" },
      ],
      bajitpur: [
        { id: "bajitpur_center", name: "Bajitpur Center" },
        { id: "bajitpur_bazar", name: "Bajitpur Bazar" },
        { id: "bajitpur_area1", name: "Area 1" },
        { id: "others_bajitpur", name: "Others" },
      ],
      bhairab: [
        { id: "bhairab_center", name: "Bhairab Center" },
        { id: "bhairab_bazar", name: "Bhairab Bazar" },
        { id: "bhairab_area1", name: "Area 1" },
        { id: "others_bhairab", name: "Others" },
      ],
      hossainpur: [
        { id: "hossainpur_center", name: "Hossainpur Center" },
        { id: "hossainpur_bazar", name: "Hossainpur Bazar" },
        { id: "hossainpur_area1", name: "Area 1" },
        { id: "others_hossainpur", name: "Others" },
      ],
      itna: [
        { id: "itna_center", name: "Itna Center" },
        { id: "itna_bazar", name: "Itna Bazar" },
        { id: "itna_area1", name: "Area 1" },
        { id: "others_itna", name: "Others" },
      ],
      karimganj: [
        { id: "karimganj_center", name: "Karimganj Center" },
        { id: "karimganj_bazar", name: "Karimganj Bazar" },
        { id: "karimganj_area1", name: "Area 1" },
        { id: "others_karimganj", name: "Others" },
      ],
      katiadi: [
        { id: "katiadi_center", name: "Katiadi Center" },
        { id: "katiadi_bazar", name: "Katiadi Bazar" },
        { id: "katiadi_area1", name: "Area 1" },
        { id: "others_katiadi", name: "Others" },
      ],
      kuliarchar: [
        { id: "kuliarchar_center", name: "Kuliarchar Center" },
        { id: "kuliarchar_bazar", name: "Kuliarchar Bazar" },
        { id: "kuliarchar_area1", name: "Area 1" },
        { id: "others_kuliarchar", name: "Others" },
      ],
      mithamain: [
        { id: "mithamain_center", name: "Mithamain Center" },
        { id: "mithamain_bazar", name: "Mithamain Bazar" },
        { id: "mithamain_area1", name: "Area 1" },
        { id: "others_mithamain", name: "Others" },
      ],
      nikli: [
        { id: "nikli_center", name: "Nikli Center" },
        { id: "nikli_bazar", name: "Nikli Bazar" },
        { id: "nikli_area1", name: "Area 1" },
        { id: "others_nikli", name: "Others" },
      ],
      pakundia: [
        { id: "pakundia_center", name: "Pakundia Center" },
        { id: "pakundia_bazar", name: "Pakundia Bazar" },
        { id: "pakundia_area1", name: "Area 1" },
        { id: "others_pakundia", name: "Others" },
      ],
      tarail: [
        { id: "tarail_center", name: "Tarail Center" },
        { id: "tarail_bazar", name: "Tarail Bazar" },
        { id: "tarail_area1", name: "Area 1" },
        { id: "others_tarail", name: "Others" },
      ],
      austagram: [
        { id: "austagram_center", name: "Austagram Center" },
        { id: "austagram_bazar", name: "Austagram Bazar" },
        { id: "austagram_area1", name: "Area 1" },
        { id: "others_austagram", name: "Others" },
      ],
      tangail_sadar: [
        { id: "tangail_sadar_center", name: "Tangail Sadar Center" },
        { id: "tangail_sadar_bazar", name: "Tangail Sadar Bazar" },
        { id: "tangail_sadar_area1", name: "Area 1" },
        { id: "others_tangail_sadar", name: "Others" },
      ],
      basail: [
        { id: "basail_center", name: "Basail Center" },
        { id: "basail_bazar", name: "Basail Bazar" },
        { id: "basail_area1", name: "Area 1" },
        { id: "others_basail", name: "Others" },
      ],
      bhuapur: [
        { id: "bhuapur_center", name: "Bhuapur Center" },
        { id: "bhuapur_bazar", name: "Bhuapur Bazar" },
        { id: "bhuapur_area1", name: "Area 1" },
        { id: "others_bhuapur", name: "Others" },
      ],
      delduar: [
        { id: "delduar_center", name: "Delduar Center" },
        { id: "delduar_bazar", name: "Delduar Bazar" },
        { id: "delduar_area1", name: "Area 1" },
        { id: "others_delduar", name: "Others" },
      ],
      dhanbari: [
        { id: "dhanbari_center", name: "Dhanbari Center" },
        { id: "dhanbari_bazar", name: "Dhanbari Bazar" },
        { id: "dhanbari_area1", name: "Area 1" },
        { id: "others_dhanbari", name: "Others" },
      ],
      ghatail: [
        { id: "ghatail_center", name: "Ghatail Center" },
        { id: "ghatail_bazar", name: "Ghatail Bazar" },
        { id: "ghatail_area1", name: "Area 1" },
        { id: "others_ghatail", name: "Others" },
      ],
      gopalpur: [
        { id: "gopalpur_center", name: "Gopalpur Center" },
        { id: "gopalpur_bazar", name: "Gopalpur Bazar" },
        { id: "gopalpur_area1", name: "Area 1" },
        { id: "others_gopalpur", name: "Others" },
      ],
      kalihati: [
        { id: "kalihati_center", name: "Kalihati Center" },
        { id: "kalihati_bazar", name: "Kalihati Bazar" },
        { id: "kalihati_area1", name: "Area 1" },
        { id: "others_kalihati", name: "Others" },
      ],
      madhupur: [
        { id: "madhupur_center", name: "Madhupur Center" },
        { id: "madhupur_bazar", name: "Madhupur Bazar" },
        { id: "madhupur_area1", name: "Area 1" },
        { id: "others_madhupur", name: "Others" },
      ],
      mirzapur: [
        { id: "mirzapur_center", name: "Mirzapur Center" },
        { id: "mirzapur_bazar", name: "Mirzapur Bazar" },
        { id: "mirzapur_area1", name: "Area 1" },
        { id: "others_mirzapur", name: "Others" },
      ],
      nagarpur: [
        { id: "nagarpur_center", name: "Nagarpur Center" },
        { id: "nagarpur_bazar", name: "Nagarpur Bazar" },
        { id: "nagarpur_area1", name: "Area 1" },
        { id: "others_nagarpur", name: "Others" },
      ],
      sakhipur: [
        { id: "sakhipur_center", name: "Sakhipur Center" },
        { id: "sakhipur_bazar", name: "Sakhipur Bazar" },
        { id: "sakhipur_area1", name: "Area 1" },
        { id: "others_sakhipur", name: "Others" },
      ],
      chattogram_sadar: [
        { id: "chattogram_sadar_center", name: "Chattogram Sadar Center" },
        { id: "chattogram_sadar_bazar", name: "Chattogram Sadar Bazar" },
        { id: "chattogram_sadar_area1", name: "Area 1" },
        { id: "others_chattogram_sadar", name: "Others" },
      ],
      hathazari: [
        { id: "hathazari_center", name: "Hathazari Center" },
        { id: "hathazari_bazar", name: "Hathazari Bazar" },
        { id: "hathazari_area1", name: "Area 1" },
        { id: "others_hathazari", name: "Others" },
      ],
      patiya: [
        { id: "patiya_center", name: "Patiya Center" },
        { id: "patiya_bazar", name: "Patiya Bazar" },
        { id: "patiya_area1", name: "Area 1" },
        { id: "others_patiya", name: "Others" },
      ],
      sitakunda: [
        { id: "sitakunda_center", name: "Sitakunda Center" },
        { id: "sitakunda_bazar", name: "Sitakunda Bazar" },
        { id: "sitakunda_area1", name: "Area 1" },
        { id: "others_sitakunda", name: "Others" },
      ],
      sandwip: [
        { id: "sandwip_center", name: "Sandwip Center" },
        { id: "sandwip_bazar", name: "Sandwip Bazar" },
        { id: "sandwip_area1", name: "Area 1" },
        { id: "others_sandwip", name: "Others" },
      ],
      mirsharai: [
        { id: "mirsharai_center", name: "Mirsharai Center" },
        { id: "mirsharai_bazar", name: "Mirsharai Bazar" },
        { id: "mirsharai_area1", name: "Area 1" },
        { id: "others_mirsharai", name: "Others" },
      ],
      rangunia: [
        { id: "rangunia_center", name: "Rangunia Center" },
        { id: "rangunia_bazar", name: "Rangunia Bazar" },
        { id: "rangunia_area1", name: "Area 1" },
        { id: "others_rangunia", name: "Others" },
      ],
      raozan: [
        { id: "raozan_center", name: "Raozan Center" },
        { id: "raozan_bazar", name: "Raozan Bazar" },
        { id: "raozan_area1", name: "Area 1" },
        { id: "others_raozan", name: "Others" },
      ],
      anwara: [
        { id: "anwara_center", name: "Anwara Center" },
        { id: "anwara_bazar", name: "Anwara Bazar" },
        { id: "anwara_area1", name: "Area 1" },
        { id: "others_anwara", name: "Others" },
      ],
      banshkhali: [
        { id: "banshkhali_center", name: "Banshkhali Center" },
        { id: "banshkhali_bazar", name: "Banshkhali Bazar" },
        { id: "banshkhali_area1", name: "Area 1" },
        { id: "others_banshkhali", name: "Others" },
      ],
      boalkhali: [
        { id: "boalkhali_center", name: "Boalkhali Center" },
        { id: "boalkhali_bazar", name: "Boalkhali Bazar" },
        { id: "boalkhali_area1", name: "Area 1" },
        { id: "others_boalkhali", name: "Others" },
      ],
      chandanaish: [
        { id: "chandanaish_center", name: "Chandanaish Center" },
        { id: "chandanaish_bazar", name: "Chandanaish Bazar" },
        { id: "chandanaish_area1", name: "Area 1" },
        { id: "others_chandanaish", name: "Others" },
      ],
      fatikchhari: [
        { id: "fatikchhari_center", name: "Fatikchhari Center" },
        { id: "fatikchhari_bazar", name: "Fatikchhari Bazar" },
        { id: "fatikchhari_area1", name: "Area 1" },
        { id: "others_fatikchhari", name: "Others" },
      ],
      lohagara: [
        { id: "lohagara_center", name: "Lohagara Center" },
        { id: "lohagara_bazar", name: "Lohagara Bazar" },
        { id: "lohagara_area1", name: "Area 1" },
        { id: "others_lohagara", name: "Others" },
      ],
      satkania: [
        { id: "satkania_center", name: "Satkania Center" },
        { id: "satkania_bazar", name: "Satkania Bazar" },
        { id: "satkania_area1", name: "Area 1" },
        { id: "others_satkania", name: "Others" },
      ],
      cox_sadar: [
        { id: "cox_sadar_center", name: "Cox Sadar Center" },
        { id: "cox_sadar_bazar", name: "Cox Sadar Bazar" },
        { id: "cox_sadar_area1", name: "Area 1" },
        { id: "others_cox_sadar", name: "Others" },
      ],
      ukhiya: [
        { id: "ukhiya_center", name: "Ukhiya Center" },
        { id: "ukhiya_bazar", name: "Ukhiya Bazar" },
        { id: "ukhiya_area1", name: "Area 1" },
        { id: "others_ukhiya", name: "Others" },
      ],
      teknaf: [
        { id: "teknaf_center", name: "Teknaf Center" },
        { id: "teknaf_bazar", name: "Teknaf Bazar" },
        { id: "teknaf_area1", name: "Area 1" },
        { id: "others_teknaf", name: "Others" },
      ],
      ramu: [
        { id: "ramu_center", name: "Ramu Center" },
        { id: "ramu_bazar", name: "Ramu Bazar" },
        { id: "ramu_area1", name: "Area 1" },
        { id: "others_ramu", name: "Others" },
      ],
      chakaria: [
        { id: "chakaria_center", name: "Chakaria Center" },
        { id: "chakaria_bazar", name: "Chakaria Bazar" },
        { id: "chakaria_area1", name: "Area 1" },
        { id: "others_chakaria", name: "Others" },
      ],
      kutubdia: [
        { id: "kutubdia_center", name: "Kutubdia Center" },
        { id: "kutubdia_bazar", name: "Kutubdia Bazar" },
        { id: "kutubdia_area1", name: "Area 1" },
        { id: "others_kutubdia", name: "Others" },
      ],
      moheshkhali: [
        { id: "moheshkhali_center", name: "Moheshkhali Center" },
        { id: "moheshkhali_bazar", name: "Moheshkhali Bazar" },
        { id: "moheshkhali_area1", name: "Area 1" },
        { id: "others_moheshkhali", name: "Others" },
      ],
      pekua: [
        { id: "pekua_center", name: "Pekua Center" },
        { id: "pekua_bazar", name: "Pekua Bazar" },
        { id: "pekua_area1", name: "Area 1" },
        { id: "others_pekua", name: "Others" },
      ],
      rangamati_sadar: [
        { id: "rangamati_sadar_center", name: "Rangamati Sadar Center" },
        { id: "rangamati_sadar_bazar", name: "Rangamati Sadar Bazar" },
        { id: "rangamati_sadar_area1", name: "Area 1" },
        { id: "others_rangamati_sadar", name: "Others" },
      ],
      kawkhali: [
        { id: "kawkhali_center", name: "Kawkhali Center" },
        { id: "kawkhali_bazar", name: "Kawkhali Bazar" },
        { id: "kawkhali_area1", name: "Area 1" },
        { id: "others_kawkhali", name: "Others" },
      ],
      kaptai: [
        { id: "kaptai_center", name: "Kaptai Center" },
        { id: "kaptai_bazar", name: "Kaptai Bazar" },
        { id: "kaptai_area1", name: "Area 1" },
        { id: "others_kaptai", name: "Others" },
      ],
      baghaichari: [
        { id: "baghaichari_center", name: "Baghaichari Center" },
        { id: "baghaichari_bazar", name: "Baghaichari Bazar" },
        { id: "baghaichari_area1", name: "Area 1" },
        { id: "others_baghaichari", name: "Others" },
      ],
      barkal: [
        { id: "barkal_center", name: "Barkal Center" },
        { id: "barkal_bazar", name: "Barkal Bazar" },
        { id: "barkal_area1", name: "Area 1" },
        { id: "others_barkal", name: "Others" },
      ],
      belaichari: [
        { id: "belaichari_center", name: "Belaichari Center" },
        { id: "belaichari_bazar", name: "Belaichari Bazar" },
        { id: "belaichari_area1", name: "Area 1" },
        { id: "others_belaichari", name: "Others" },
      ],
      juraichari: [
        { id: "juraichari_center", name: "Juraichari Center" },
        { id: "juraichari_bazar", name: "Juraichari Bazar" },
        { id: "juraichari_area1", name: "Area 1" },
        { id: "others_juraichari", name: "Others" },
      ],
      langadu: [
        { id: "langadu_center", name: "Langadu Center" },
        { id: "langadu_bazar", name: "Langadu Bazar" },
        { id: "langadu_area1", name: "Area 1" },
        { id: "others_langadu", name: "Others" },
      ],
      naniarchar: [
        { id: "naniarchar_center", name: "Naniarchar Center" },
        { id: "naniarchar_bazar", name: "Naniarchar Bazar" },
        { id: "naniarchar_area1", name: "Area 1" },
        { id: "others_naniarchar", name: "Others" },
      ],
      rajasthali: [
        { id: "rajasthali_center", name: "Rajasthali Center" },
        { id: "rajasthali_bazar", name: "Rajasthali Bazar" },
        { id: "rajasthali_area1", name: "Area 1" },
        { id: "others_rajasthali", name: "Others" },
      ],
      bandarban_sadar: [
        { id: "bandarban_sadar_center", name: "Bandarban Sadar Center" },
        { id: "bandarban_sadar_bazar", name: "Bandarban Sadar Bazar" },
        { id: "bandarban_sadar_area1", name: "Area 1" },
        { id: "others_bandarban_sadar", name: "Others" },
      ],
      alikadam: [
        { id: "alikadam_center", name: "Alikadam Center" },
        { id: "alikadam_bazar", name: "Alikadam Bazar" },
        { id: "alikadam_area1", name: "Area 1" },
        { id: "others_alikadam", name: "Others" },
      ],
      lama: [
        { id: "lama_center", name: "Lama Center" },
        { id: "lama_bazar", name: "Lama Bazar" },
        { id: "lama_area1", name: "Area 1" },
        { id: "others_lama", name: "Others" },
      ],
      naikhongchhari: [
        { id: "naikhongchhari_center", name: "Naikhongchhari Center" },
        { id: "naikhongchhari_bazar", name: "Naikhongchhari Bazar" },
        { id: "naikhongchhari_area1", name: "Area 1" },
        { id: "others_naikhongchhari", name: "Others" },
      ],
      rowangchhari: [
        { id: "rowangchhari_center", name: "Rowangchhari Center" },
        { id: "rowangchhari_bazar", name: "Rowangchhari Bazar" },
        { id: "rowangchhari_area1", name: "Area 1" },
        { id: "others_rowangchhari", name: "Others" },
      ],
      ruma: [
        { id: "ruma_center", name: "Ruma Center" },
        { id: "ruma_bazar", name: "Ruma Bazar" },
        { id: "ruma_area1", name: "Area 1" },
        { id: "others_ruma", name: "Others" },
      ],
      thanchi: [
        { id: "thanchi_center", name: "Thanchi Center" },
        { id: "thanchi_bazar", name: "Thanchi Bazar" },
        { id: "thanchi_area1", name: "Area 1" },
        { id: "others_thanchi", name: "Others" },
      ],
      khagrachari_sadar: [
        { id: "khagrachari_sadar_center", name: "Khagrachari Sadar Center" },
        { id: "khagrachari_sadar_bazar", name: "Khagrachari Sadar Bazar" },
        { id: "khagrachari_sadar_area1", name: "Area 1" },
        { id: "others_khagrachari_sadar", name: "Others" },
      ],
      dighinala: [
        { id: "dighinala_center", name: "Dighinala Center" },
        { id: "dighinala_bazar", name: "Dighinala Bazar" },
        { id: "dighinala_area1", name: "Area 1" },
        { id: "others_dighinala", name: "Others" },
      ],
      lakshmichhari: [
        { id: "lakshmichhari_center", name: "Lakshmichhari Center" },
        { id: "lakshmichhari_bazar", name: "Lakshmichhari Bazar" },
        { id: "lakshmichhari_area1", name: "Area 1" },
        { id: "others_lakshmichhari", name: "Others" },
      ],
      mahalchhari: [
        { id: "mahalchhari_center", name: "Mahalchhari Center" },
        { id: "mahalchhari_bazar", name: "Mahalchhari Bazar" },
        { id: "mahalchhari_area1", name: "Area 1" },
        { id: "others_mahalchhari", name: "Others" },
      ],
      manikchhari: [
        { id: "manikchhari_center", name: "Manikchhari Center" },
        { id: "manikchhari_bazar", name: "Manikchhari Bazar" },
        { id: "manikchhari_area1", name: "Area 1" },
        { id: "others_manikchhari", name: "Others" },
      ],
      matiranga: [
        { id: "matiranga_center", name: "Matiranga Center" },
        { id: "matiranga_bazar", name: "Matiranga Bazar" },
        { id: "matiranga_area1", name: "Area 1" },
        { id: "others_matiranga", name: "Others" },
      ],
      panchhari: [
        { id: "panchhari_center", name: "Panchhari Center" },
        { id: "panchhari_bazar", name: "Panchhari Bazar" },
        { id: "panchhari_area1", name: "Area 1" },
        { id: "others_panchhari", name: "Others" },
      ],
      ramgarh: [
        { id: "ramgarh_center", name: "Ramgarh Center" },
        { id: "ramgarh_bazar", name: "Ramgarh Bazar" },
        { id: "ramgarh_area1", name: "Area 1" },
        { id: "others_ramgarh", name: "Others" },
      ],
      guimara: [
        { id: "guimara_center", name: "Guimara Center" },
        { id: "guimara_bazar", name: "Guimara Bazar" },
        { id: "guimara_area1", name: "Area 1" },
        { id: "others_guimara", name: "Others" },
      ],
      noakhali_sadar: [
        { id: "noakhali_sadar_center", name: "Noakhali Sadar Center" },
        { id: "noakhali_sadar_bazar", name: "Noakhali Sadar Bazar" },
        { id: "noakhali_sadar_area1", name: "Area 1" },
        { id: "others_noakhali_sadar", name: "Others" },
      ],
      begumganj: [
        { id: "begumganj_center", name: "Begumganj Center" },
        { id: "begumganj_bazar", name: "Begumganj Bazar" },
        { id: "begumganj_area1", name: "Area 1" },
        { id: "others_begumganj", name: "Others" },
      ],
      chatkhil: [
        { id: "chatkhil_center", name: "Chatkhil Center" },
        { id: "chatkhil_bazar", name: "Chatkhil Bazar" },
        { id: "chatkhil_area1", name: "Area 1" },
        { id: "others_chatkhil", name: "Others" },
      ],
      companiganj_noakhali: [
        {
          id: "companiganj_noakhali_center",
          name: "Companiganj Noakhali Center",
        },
        {
          id: "companiganj_noakhali_bazar",
          name: "Companiganj Noakhali Bazar",
        },
        { id: "companiganj_noakhali_area1", name: "Area 1" },
        { id: "others_companiganj_noakhali", name: "Others" },
      ],
      hatiya: [
        { id: "hatiya_center", name: "Hatiya Center" },
        { id: "hatiya_bazar", name: "Hatiya Bazar" },
        { id: "hatiya_area1", name: "Area 1" },
        { id: "others_hatiya", name: "Others" },
      ],
      kabirhat: [
        { id: "kabirhat_center", name: "Kabirhat Center" },
        { id: "kabirhat_bazar", name: "Kabirhat Bazar" },
        { id: "kabirhat_area1", name: "Area 1" },
        { id: "others_kabirhat", name: "Others" },
      ],
      senbagh: [
        { id: "senbagh_center", name: "Senbagh Center" },
        { id: "senbagh_bazar", name: "Senbagh Bazar" },
        { id: "senbagh_area1", name: "Area 1" },
        { id: "others_senbagh", name: "Others" },
      ],
      sonaimuri: [
        { id: "sonaimuri_center", name: "Sonaimuri Center" },
        { id: "sonaimuri_bazar", name: "Sonaimuri Bazar" },
        { id: "sonaimuri_area1", name: "Area 1" },
        { id: "others_sonaimuri", name: "Others" },
      ],
      subarnachar: [
        { id: "subarnachar_center", name: "Subarnachar Center" },
        { id: "subarnachar_bazar", name: "Subarnachar Bazar" },
        { id: "subarnachar_area1", name: "Area 1" },
        { id: "others_subarnachar", name: "Others" },
      ],
      feni_sadar: [
        { id: "feni_sadar_center", name: "Feni Sadar Center" },
        { id: "feni_sadar_bazar", name: "Feni Sadar Bazar" },
        { id: "feni_sadar_area1", name: "Area 1" },
        { id: "others_feni_sadar", name: "Others" },
      ],
      chhagalnaiya: [
        { id: "chhagalnaiya_center", name: "Chhagalnaiya Center" },
        { id: "chhagalnaiya_bazar", name: "Chhagalnaiya Bazar" },
        { id: "chhagalnaiya_area1", name: "Area 1" },
        { id: "others_chhagalnaiya", name: "Others" },
      ],
      daganbhuiyan: [
        { id: "daganbhuiyan_center", name: "Daganbhuiyan Center" },
        { id: "daganbhuiyan_bazar", name: "Daganbhuiyan Bazar" },
        { id: "daganbhuiyan_area1", name: "Area 1" },
        { id: "others_daganbhuiyan", name: "Others" },
      ],
      fulgazi: [
        { id: "fulgazi_center", name: "Fulgazi Center" },
        { id: "fulgazi_bazar", name: "Fulgazi Bazar" },
        { id: "fulgazi_area1", name: "Area 1" },
        { id: "others_fulgazi", name: "Others" },
      ],
      parshuram: [
        { id: "parshuram_center", name: "Parshuram Center" },
        { id: "parshuram_bazar", name: "Parshuram Bazar" },
        { id: "parshuram_area1", name: "Area 1" },
        { id: "others_parshuram", name: "Others" },
      ],
      sonagazi: [
        { id: "sonagazi_center", name: "Sonagazi Center" },
        { id: "sonagazi_bazar", name: "Sonagazi Bazar" },
        { id: "sonagazi_area1", name: "Area 1" },
        { id: "others_sonagazi", name: "Others" },
      ],
      lakshmipur_sadar: [
        { id: "lakshmipur_sadar_center", name: "Lakshmipur Sadar Center" },
        { id: "lakshmipur_sadar_bazar", name: "Lakshmipur Sadar Bazar" },
        { id: "lakshmipur_sadar_area1", name: "Area 1" },
        { id: "others_lakshmipur_sadar", name: "Others" },
      ],
      raipur: [
        { id: "raipur_center", name: "Raipur Center" },
        { id: "raipur_bazar", name: "Raipur Bazar" },
        { id: "raipur_area1", name: "Area 1" },
        { id: "others_raipur", name: "Others" },
      ],
      ramganj: [
        { id: "ramganj_center", name: "Ramganj Center" },
        { id: "ramganj_bazar", name: "Ramganj Bazar" },
        { id: "ramganj_area1", name: "Area 1" },
        { id: "others_ramganj", name: "Others" },
      ],
      ramgati: [
        { id: "ramgati_center", name: "Ramgati Center" },
        { id: "ramgati_bazar", name: "Ramgati Bazar" },
        { id: "ramgati_area1", name: "Area 1" },
        { id: "others_ramgati", name: "Others" },
      ],
      kamalnagar: [
        { id: "kamalnagar_center", name: "Kamalnagar Center" },
        { id: "kamalnagar_bazar", name: "Kamalnagar Bazar" },
        { id: "kamalnagar_area1", name: "Area 1" },
        { id: "others_kamalnagar", name: "Others" },
      ],
      chandpur_sadar: [
        { id: "chandpur_sadar_center", name: "Chandpur Sadar Center" },
        { id: "chandpur_sadar_bazar", name: "Chandpur Sadar Bazar" },
        { id: "chandpur_sadar_area1", name: "Area 1" },
        { id: "others_chandpur_sadar", name: "Others" },
      ],
      faridganj: [
        { id: "faridganj_center", name: "Faridganj Center" },
        { id: "faridganj_bazar", name: "Faridganj Bazar" },
        { id: "faridganj_area1", name: "Area 1" },
        { id: "others_faridganj", name: "Others" },
      ],
      haimchar: [
        { id: "haimchar_center", name: "Haimchar Center" },
        { id: "haimchar_bazar", name: "Haimchar Bazar" },
        { id: "haimchar_area1", name: "Area 1" },
        { id: "others_haimchar", name: "Others" },
      ],
      hajiganj: [
        { id: "hajiganj_center", name: "Hajiganj Center" },
        { id: "hajiganj_bazar", name: "Hajiganj Bazar" },
        { id: "hajiganj_area1", name: "Area 1" },
        { id: "others_hajiganj", name: "Others" },
      ],
      kachua: [
        { id: "kachua_center", name: "Kachua Center" },
        { id: "kachua_bazar", name: "Kachua Bazar" },
        { id: "kachua_area1", name: "Area 1" },
        { id: "others_kachua", name: "Others" },
      ],
      matlab_dakshin: [
        { id: "matlab_dakshin_center", name: "Matlab Dakshin Center" },
        { id: "matlab_dakshin_bazar", name: "Matlab Dakshin Bazar" },
        { id: "matlab_dakshin_area1", name: "Area 1" },
        { id: "others_matlab_dakshin", name: "Others" },
      ],
      matlab_uttar: [
        { id: "matlab_uttar_center", name: "Matlab Uttar Center" },
        { id: "matlab_uttar_bazar", name: "Matlab Uttar Bazar" },
        { id: "matlab_uttar_area1", name: "Area 1" },
        { id: "others_matlab_uttar", name: "Others" },
      ],
      shahrasti: [
        { id: "shahrasti_center", name: "Shahrasti Center" },
        { id: "shahrasti_bazar", name: "Shahrasti Bazar" },
        { id: "shahrasti_area1", name: "Area 1" },
        { id: "others_shahrasti", name: "Others" },
      ],
      brahmanbaria_sadar: [
        { id: "brahmanbaria_sadar_center", name: "Brahmanbaria Sadar Center" },
        { id: "brahmanbaria_sadar_bazar", name: "Brahmanbaria Sadar Bazar" },
        { id: "brahmanbaria_sadar_area1", name: "Area 1" },
        { id: "others_brahmanbaria_sadar", name: "Others" },
      ],
      akhaura: [
        { id: "akhaura_center", name: "Akhaura Center" },
        { id: "akhaura_bazar", name: "Akhaura Bazar" },
        { id: "akhaura_area1", name: "Area 1" },
        { id: "others_akhaura", name: "Others" },
      ],
      ashuganj: [
        { id: "ashuganj_center", name: "Ashuganj Center" },
        { id: "ashuganj_bazar", name: "Ashuganj Bazar" },
        { id: "ashuganj_area1", name: "Area 1" },
        { id: "others_ashuganj", name: "Others" },
      ],
      bancharampur: [
        { id: "bancharampur_center", name: "Bancharampur Center" },
        { id: "bancharampur_bazar", name: "Bancharampur Bazar" },
        { id: "bancharampur_area1", name: "Area 1" },
        { id: "others_bancharampur", name: "Others" },
      ],
      bijoynagar: [
        { id: "bijoynagar_center", name: "Bijoynagar Center" },
        { id: "bijoynagar_bazar", name: "Bijoynagar Bazar" },
        { id: "bijoynagar_area1", name: "Area 1" },
        { id: "others_bijoynagar", name: "Others" },
      ],
      kasba: [
        { id: "kasba_center", name: "Kasba Center" },
        { id: "kasba_bazar", name: "Kasba Bazar" },
        { id: "kasba_area1", name: "Area 1" },
        { id: "others_kasba", name: "Others" },
      ],
      nabinagar: [
        { id: "nabinagar_center", name: "Nabinagar Center" },
        { id: "nabinagar_bazar", name: "Nabinagar Bazar" },
        { id: "nabinagar_area1", name: "Area 1" },
        { id: "others_nabinagar", name: "Others" },
      ],
      nasirnagar: [
        { id: "nasirnagar_center", name: "Nasirnagar Center" },
        { id: "nasirnagar_bazar", name: "Nasirnagar Bazar" },
        { id: "nasirnagar_area1", name: "Area 1" },
        { id: "others_nasirnagar", name: "Others" },
      ],
      sarail: [
        { id: "sarail_center", name: "Sarail Center" },
        { id: "sarail_bazar", name: "Sarail Bazar" },
        { id: "sarail_area1", name: "Area 1" },
        { id: "others_sarail", name: "Others" },
      ],
      comilla_sadar: [
        { id: "comilla_sadar_center", name: "Comilla Sadar Center" },
        { id: "comilla_sadar_bazar", name: "Comilla Sadar Bazar" },
        { id: "comilla_sadar_area1", name: "Area 1" },
        { id: "others_comilla_sadar", name: "Others" },
      ],
      barura: [
        { id: "barura_center", name: "Barura Center" },
        { id: "barura_bazar", name: "Barura Bazar" },
        { id: "barura_area1", name: "Area 1" },
        { id: "others_barura", name: "Others" },
      ],
      brahmanpara: [
        { id: "brahmanpara_center", name: "Brahmanpara Center" },
        { id: "brahmanpara_bazar", name: "Brahmanpara Bazar" },
        { id: "brahmanpara_area1", name: "Area 1" },
        { id: "others_brahmanpara", name: "Others" },
      ],
      burichang: [
        { id: "burichang_center", name: "Burichang Center" },
        { id: "burichang_bazar", name: "Burichang Bazar" },
        { id: "burichang_area1", name: "Area 1" },
        { id: "others_burichang", name: "Others" },
      ],
      chandina: [
        { id: "chandina_center", name: "Chandina Center" },
        { id: "chandina_bazar", name: "Chandina Bazar" },
        { id: "chandina_area1", name: "Area 1" },
        { id: "others_chandina", name: "Others" },
      ],
      chauddagram: [
        { id: "chauddagram_center", name: "Chauddagram Center" },
        { id: "chauddagram_bazar", name: "Chauddagram Bazar" },
        { id: "chauddagram_area1", name: "Area 1" },
        { id: "others_chauddagram", name: "Others" },
      ],
      daudkandi: [
        { id: "daudkandi_center", name: "Daudkandi Center" },
        { id: "daudkandi_bazar", name: "Daudkandi Bazar" },
        { id: "daudkandi_area1", name: "Area 1" },
        { id: "others_daudkandi", name: "Others" },
      ],
      debidwar: [
        { id: "debidwar_center", name: "Debidwar Center" },
        { id: "debidwar_bazar", name: "Debidwar Bazar" },
        { id: "debidwar_area1", name: "Area 1" },
        { id: "others_debidwar", name: "Others" },
      ],
      homna: [
        { id: "homna_center", name: "Homna Center" },
        { id: "homna_bazar", name: "Homna Bazar" },
        { id: "homna_area1", name: "Area 1" },
        { id: "others_homna", name: "Others" },
      ],
      laksam: [
        { id: "laksam_center", name: "Laksam Center" },
        { id: "laksam_bazar", name: "Laksam Bazar" },
        { id: "laksam_area1", name: "Area 1" },
        { id: "others_laksam", name: "Others" },
      ],
      muradnagar: [
        { id: "muradnagar_center", name: "Muradnagar Center" },
        { id: "muradnagar_bazar", name: "Muradnagar Bazar" },
        { id: "muradnagar_area1", name: "Area 1" },
        { id: "others_muradnagar", name: "Others" },
      ],
      nangalkot: [
        { id: "nangalkot_center", name: "Nangalkot Center" },
        { id: "nangalkot_bazar", name: "Nangalkot Bazar" },
        { id: "nangalkot_area1", name: "Area 1" },
        { id: "others_nangalkot", name: "Others" },
      ],
      meghna: [
        { id: "meghna_center", name: "Meghna Center" },
        { id: "meghna_bazar", name: "Meghna Bazar" },
        { id: "meghna_area1", name: "Area 1" },
        { id: "others_meghna", name: "Others" },
      ],
      titas: [
        { id: "titas_center", name: "Titas Center" },
        { id: "titas_bazar", name: "Titas Bazar" },
        { id: "titas_area1", name: "Area 1" },
        { id: "others_titas", name: "Others" },
      ],
      monoharganj: [
        { id: "monoharganj_center", name: "Monoharganj Center" },
        { id: "monoharganj_bazar", name: "Monoharganj Bazar" },
        { id: "monoharganj_area1", name: "Area 1" },
        { id: "others_monoharganj", name: "Others" },
      ],
      rajshahi_sadar: [
        { id: "rajshahi_sadar_center", name: "Rajshahi Sadar Center" },
        { id: "rajshahi_sadar_bazar", name: "Rajshahi Sadar Bazar" },
        { id: "rajshahi_sadar_area1", name: "Area 1" },
        { id: "others_rajshahi_sadar", name: "Others" },
      ],
      paba: [
        { id: "paba_center", name: "Paba Center" },
        { id: "paba_bazar", name: "Paba Bazar" },
        { id: "paba_area1", name: "Area 1" },
        { id: "others_paba", name: "Others" },
      ],
      durgapur: [
        { id: "durgapur_center", name: "Durgapur Center" },
        { id: "durgapur_bazar", name: "Durgapur Bazar" },
        { id: "durgapur_area1", name: "Area 1" },
        { id: "others_durgapur", name: "Others" },
      ],
      mohanpur: [
        { id: "mohanpur_center", name: "Mohanpur Center" },
        { id: "mohanpur_bazar", name: "Mohanpur Bazar" },
        { id: "mohanpur_area1", name: "Area 1" },
        { id: "others_mohanpur", name: "Others" },
      ],
      charghat: [
        { id: "charghat_center", name: "Charghat Center" },
        { id: "charghat_bazar", name: "Charghat Bazar" },
        { id: "charghat_area1", name: "Area 1" },
        { id: "others_charghat", name: "Others" },
      ],
      puthia: [
        { id: "puthia_center", name: "Puthia Center" },
        { id: "puthia_bazar", name: "Puthia Bazar" },
        { id: "puthia_area1", name: "Area 1" },
        { id: "others_puthia", name: "Others" },
      ],
      bagha: [
        { id: "bagha_center", name: "Bagha Center" },
        { id: "bagha_bazar", name: "Bagha Bazar" },
        { id: "bagha_area1", name: "Area 1" },
        { id: "others_bagha", name: "Others" },
      ],
      godagari: [
        { id: "godagari_center", name: "Godagari Center" },
        { id: "godagari_bazar", name: "Godagari Bazar" },
        { id: "godagari_area1", name: "Area 1" },
        { id: "others_godagari", name: "Others" },
      ],
      tanore: [
        { id: "tanore_center", name: "Tanore Center" },
        { id: "tanore_bazar", name: "Tanore Bazar" },
        { id: "tanore_area1", name: "Area 1" },
        { id: "others_tanore", name: "Others" },
      ],
      natore_sadar: [
        { id: "natore_sadar_center", name: "Natore Sadar Center" },
        { id: "natore_sadar_bazar", name: "Natore Sadar Bazar" },
        { id: "natore_sadar_area1", name: "Area 1" },
        { id: "others_natore_sadar", name: "Others" },
      ],
      bagatipara: [
        { id: "bagatipara_center", name: "Bagatipara Center" },
        { id: "bagatipara_bazar", name: "Bagatipara Bazar" },
        { id: "bagatipara_area1", name: "Area 1" },
        { id: "others_bagatipara", name: "Others" },
      ],
      baraigram: [
        { id: "baraigram_center", name: "Baraigram Center" },
        { id: "baraigram_bazar", name: "Baraigram Bazar" },
        { id: "baraigram_area1", name: "Area 1" },
        { id: "others_baraigram", name: "Others" },
      ],
      gurudaspur: [
        { id: "gurudaspur_center", name: "Gurudaspur Center" },
        { id: "gurudaspur_bazar", name: "Gurudaspur Bazar" },
        { id: "gurudaspur_area1", name: "Area 1" },
        { id: "others_gurudaspur", name: "Others" },
      ],
      lalpur: [
        { id: "lalpur_center", name: "Lalpur Center" },
        { id: "lalpur_bazar", name: "Lalpur Bazar" },
        { id: "lalpur_area1", name: "Area 1" },
        { id: "others_lalpur", name: "Others" },
      ],
      singra: [
        { id: "singra_center", name: "Singra Center" },
        { id: "singra_bazar", name: "Singra Bazar" },
        { id: "singra_area1", name: "Area 1" },
        { id: "others_singra", name: "Others" },
      ],
      chapainawabganj_sadar: [
        {
          id: "chapainawabganj_sadar_center",
          name: "Chapainawabganj Sadar Center",
        },
        {
          id: "chapainawabganj_sadar_bazar",
          name: "Chapainawabganj Sadar Bazar",
        },
        { id: "chapainawabganj_sadar_area1", name: "Area 1" },
        { id: "others_chapainawabganj_sadar", name: "Others" },
      ],
      bholahat: [
        { id: "bholahat_center", name: "Bholahat Center" },
        { id: "bholahat_bazar", name: "Bholahat Bazar" },
        { id: "bholahat_area1", name: "Area 1" },
        { id: "others_bholahat", name: "Others" },
      ],
      gomastapur: [
        { id: "gomastapur_center", name: "Gomastapur Center" },
        { id: "gomastapur_bazar", name: "Gomastapur Bazar" },
        { id: "gomastapur_area1", name: "Area 1" },
        { id: "others_gomastapur", name: "Others" },
      ],
      nachole: [
        { id: "nachole_center", name: "Nachole Center" },
        { id: "nachole_bazar", name: "Nachole Bazar" },
        { id: "nachole_area1", name: "Area 1" },
        { id: "others_nachole", name: "Others" },
      ],
      shibganj_chapai: [
        { id: "shibganj_chapai_center", name: "Shibganj Chapai Center" },
        { id: "shibganj_chapai_bazar", name: "Shibganj Chapai Bazar" },
        { id: "shibganj_chapai_area1", name: "Area 1" },
        { id: "others_shibganj_chapai", name: "Others" },
      ],
      naogaon_sadar: [
        { id: "naogaon_sadar_center", name: "Naogaon Sadar Center" },
        { id: "naogaon_sadar_bazar", name: "Naogaon Sadar Bazar" },
        { id: "naogaon_sadar_area1", name: "Area 1" },
        { id: "others_naogaon_sadar", name: "Others" },
      ],
      atrai: [
        { id: "atrai_center", name: "Atrai Center" },
        { id: "atrai_bazar", name: "Atrai Bazar" },
        { id: "atrai_area1", name: "Area 1" },
        { id: "others_atrai", name: "Others" },
      ],
      badalgachhi: [
        { id: "badalgachhi_center", name: "Badalgachhi Center" },
        { id: "badalgachhi_bazar", name: "Badalgachhi Bazar" },
        { id: "badalgachhi_area1", name: "Area 1" },
        { id: "others_badalgachhi", name: "Others" },
      ],
      dhamoirhat: [
        { id: "dhamoirhat_center", name: "Dhamoirhat Center" },
        { id: "dhamoirhat_bazar", name: "Dhamoirhat Bazar" },
        { id: "dhamoirhat_area1", name: "Area 1" },
        { id: "others_dhamoirhat", name: "Others" },
      ],
      manda: [
        { id: "manda_center", name: "Manda Center" },
        { id: "manda_bazar", name: "Manda Bazar" },
        { id: "manda_area1", name: "Area 1" },
        { id: "others_manda", name: "Others" },
      ],
      mohadevpur: [
        { id: "mohadevpur_center", name: "Mohadevpur Center" },
        { id: "mohadevpur_bazar", name: "Mohadevpur Bazar" },
        { id: "mohadevpur_area1", name: "Area 1" },
        { id: "others_mohadevpur", name: "Others" },
      ],
      niamatpur: [
        { id: "niamatpur_center", name: "Niamatpur Center" },
        { id: "niamatpur_bazar", name: "Niamatpur Bazar" },
        { id: "niamatpur_area1", name: "Area 1" },
        { id: "others_niamatpur", name: "Others" },
      ],
      patnitala: [
        { id: "patnitala_center", name: "Patnitala Center" },
        { id: "patnitala_bazar", name: "Patnitala Bazar" },
        { id: "patnitala_area1", name: "Area 1" },
        { id: "others_patnitala", name: "Others" },
      ],
      porsha: [
        { id: "porsha_center", name: "Porsha Center" },
        { id: "porsha_bazar", name: "Porsha Bazar" },
        { id: "porsha_area1", name: "Area 1" },
        { id: "others_porsha", name: "Others" },
      ],
      raninagar: [
        { id: "raninagar_center", name: "Raninagar Center" },
        { id: "raninagar_bazar", name: "Raninagar Bazar" },
        { id: "raninagar_area1", name: "Area 1" },
        { id: "others_raninagar", name: "Others" },
      ],
      sapahar: [
        { id: "sapahar_center", name: "Sapahar Center" },
        { id: "sapahar_bazar", name: "Sapahar Bazar" },
        { id: "sapahar_area1", name: "Area 1" },
        { id: "others_sapahar", name: "Others" },
      ],
      pabna_sadar: [
        { id: "pabna_sadar_center", name: "Pabna Sadar Center" },
        { id: "pabna_sadar_bazar", name: "Pabna Sadar Bazar" },
        { id: "pabna_sadar_area1", name: "Area 1" },
        { id: "others_pabna_sadar", name: "Others" },
      ],
      atgharia: [
        { id: "atgharia_center", name: "Atgharia Center" },
        { id: "atgharia_bazar", name: "Atgharia Bazar" },
        { id: "atgharia_area1", name: "Area 1" },
        { id: "others_atgharia", name: "Others" },
      ],
      bera: [
        { id: "bera_center", name: "Bera Center" },
        { id: "bera_bazar", name: "Bera Bazar" },
        { id: "bera_area1", name: "Area 1" },
        { id: "others_bera", name: "Others" },
      ],
      bhangura: [
        { id: "bhangura_center", name: "Bhangura Center" },
        { id: "bhangura_bazar", name: "Bhangura Bazar" },
        { id: "bhangura_area1", name: "Area 1" },
        { id: "others_bhangura", name: "Others" },
      ],
      chatmohar: [
        { id: "chatmohar_center", name: "Chatmohar Center" },
        { id: "chatmohar_bazar", name: "Chatmohar Bazar" },
        { id: "chatmohar_area1", name: "Area 1" },
        { id: "others_chatmohar", name: "Others" },
      ],
      faridpur_pabna: [
        { id: "faridpur_pabna_center", name: "Faridpur Pabna Center" },
        { id: "faridpur_pabna_bazar", name: "Faridpur Pabna Bazar" },
        { id: "faridpur_pabna_area1", name: "Area 1" },
        { id: "others_faridpur_pabna", name: "Others" },
      ],
      ishwardi: [
        { id: "ishwardi_center", name: "Ishwardi Center" },
        { id: "ishwardi_bazar", name: "Ishwardi Bazar" },
        { id: "ishwardi_area1", name: "Area 1" },
        { id: "others_ishwardi", name: "Others" },
      ],
      santhia: [
        { id: "santhia_center", name: "Santhia Center" },
        { id: "santhia_bazar", name: "Santhia Bazar" },
        { id: "santhia_area1", name: "Area 1" },
        { id: "others_santhia", name: "Others" },
      ],
      sujanagar: [
        { id: "sujanagar_center", name: "Sujanagar Center" },
        { id: "sujanagar_bazar", name: "Sujanagar Bazar" },
        { id: "sujanagar_area1", name: "Area 1" },
        { id: "others_sujanagar", name: "Others" },
      ],
      sirajganj_sadar: [
        { id: "sirajganj_sadar_center", name: "Sirajganj Sadar Center" },
        { id: "sirajganj_sadar_bazar", name: "Sirajganj Sadar Bazar" },
        { id: "sirajganj_sadar_area1", name: "Area 1" },
        { id: "others_sirajganj_sadar", name: "Others" },
      ],
      belkuchi: [
        { id: "belkuchi_center", name: "Belkuchi Center" },
        { id: "belkuchi_bazar", name: "Belkuchi Bazar" },
        { id: "belkuchi_area1", name: "Area 1" },
        { id: "others_belkuchi", name: "Others" },
      ],
      chauhali: [
        { id: "chauhali_center", name: "Chauhali Center" },
        { id: "chauhali_bazar", name: "Chauhali Bazar" },
        { id: "chauhali_area1", name: "Area 1" },
        { id: "others_chauhali", name: "Others" },
      ],
      kamarkhanda: [
        { id: "kamarkhanda_center", name: "Kamarkhanda Center" },
        { id: "kamarkhanda_bazar", name: "Kamarkhanda Bazar" },
        { id: "kamarkhanda_area1", name: "Area 1" },
        { id: "others_kamarkhanda", name: "Others" },
      ],
      kazipur: [
        { id: "kazipur_center", name: "Kazipur Center" },
        { id: "kazipur_bazar", name: "Kazipur Bazar" },
        { id: "kazipur_area1", name: "Area 1" },
        { id: "others_kazipur", name: "Others" },
      ],
      raiganj: [
        { id: "raiganj_center", name: "Raiganj Center" },
        { id: "raiganj_bazar", name: "Raiganj Bazar" },
        { id: "raiganj_area1", name: "Area 1" },
        { id: "others_raiganj", name: "Others" },
      ],
      shahjadpur: [
        { id: "shahjadpur_center", name: "Shahjadpur Center" },
        { id: "shahjadpur_bazar", name: "Shahjadpur Bazar" },
        { id: "shahjadpur_area1", name: "Area 1" },
        { id: "others_shahjadpur", name: "Others" },
      ],
      tarash: [
        { id: "tarash_center", name: "Tarash Center" },
        { id: "tarash_bazar", name: "Tarash Bazar" },
        { id: "tarash_area1", name: "Area 1" },
        { id: "others_tarash", name: "Others" },
      ],
      ullahpara: [
        { id: "ullahpara_center", name: "Ullahpara Center" },
        { id: "ullahpara_bazar", name: "Ullahpara Bazar" },
        { id: "ullahpara_area1", name: "Area 1" },
        { id: "others_ullahpara", name: "Others" },
      ],
      bogra_sadar: [
        { id: "bogra_sadar_center", name: "Bogra Sadar Center" },
        { id: "bogra_sadar_bazar", name: "Bogra Sadar Bazar" },
        { id: "bogra_sadar_area1", name: "Area 1" },
        { id: "others_bogra_sadar", name: "Others" },
      ],
      adamdighi: [
        { id: "adamdighi_center", name: "Adamdighi Center" },
        { id: "adamdighi_bazar", name: "Adamdighi Bazar" },
        { id: "adamdighi_area1", name: "Area 1" },
        { id: "others_adamdighi", name: "Others" },
      ],
      dhunat: [
        { id: "dhunat_center", name: "Dhunat Center" },
        { id: "dhunat_bazar", name: "Dhunat Bazar" },
        { id: "dhunat_area1", name: "Area 1" },
        { id: "others_dhunat", name: "Others" },
      ],
      dhupchanchia: [
        { id: "dhupchanchia_center", name: "Dhupchanchia Center" },
        { id: "dhupchanchia_bazar", name: "Dhupchanchia Bazar" },
        { id: "dhupchanchia_area1", name: "Area 1" },
        { id: "others_dhupchanchia", name: "Others" },
      ],
      gabtali: [
        { id: "gabtali_center", name: "Gabtali Center" },
        { id: "gabtali_bazar", name: "Gabtali Bazar" },
        { id: "gabtali_area1", name: "Area 1" },
        { id: "others_gabtali", name: "Others" },
      ],
      kahaloo: [
        { id: "kahaloo_center", name: "Kahaloo Center" },
        { id: "kahaloo_bazar", name: "Kahaloo Bazar" },
        { id: "kahaloo_area1", name: "Area 1" },
        { id: "others_kahaloo", name: "Others" },
      ],
      nandigram: [
        { id: "nandigram_center", name: "Nandigram Center" },
        { id: "nandigram_bazar", name: "Nandigram Bazar" },
        { id: "nandigram_area1", name: "Area 1" },
        { id: "others_nandigram", name: "Others" },
      ],
      sariakandi: [
        { id: "sariakandi_center", name: "Sariakandi Center" },
        { id: "sariakandi_bazar", name: "Sariakandi Bazar" },
        { id: "sariakandi_area1", name: "Area 1" },
        { id: "others_sariakandi", name: "Others" },
      ],
      shajahanpur: [
        { id: "shajahanpur_center", name: "Shajahanpur Center" },
        { id: "shajahanpur_bazar", name: "Shajahanpur Bazar" },
        { id: "shajahanpur_area1", name: "Area 1" },
        { id: "others_shajahanpur", name: "Others" },
      ],
      sherpur_bogra: [
        { id: "sherpur_bogra_center", name: "Sherpur Bogra Center" },
        { id: "sherpur_bogra_bazar", name: "Sherpur Bogra Bazar" },
        { id: "sherpur_bogra_area1", name: "Area 1" },
        { id: "others_sherpur_bogra", name: "Others" },
      ],
      shibganj_bogra: [
        { id: "shibganj_bogra_center", name: "Shibganj Bogra Center" },
        { id: "shibganj_bogra_bazar", name: "Shibganj Bogra Bazar" },
        { id: "shibganj_bogra_area1", name: "Area 1" },
        { id: "others_shibganj_bogra", name: "Others" },
      ],
      sonatala: [
        { id: "sonatala_center", name: "Sonatala Center" },
        { id: "sonatala_bazar", name: "Sonatala Bazar" },
        { id: "sonatala_area1", name: "Area 1" },
        { id: "others_sonatala", name: "Others" },
      ],
      joypurhat_sadar: [
        { id: "joypurhat_sadar_center", name: "Joypurhat Sadar Center" },
        { id: "joypurhat_sadar_bazar", name: "Joypurhat Sadar Bazar" },
        { id: "joypurhat_sadar_area1", name: "Area 1" },
        { id: "others_joypurhat_sadar", name: "Others" },
      ],
      akkelpur: [
        { id: "akkelpur_center", name: "Akkelpur Center" },
        { id: "akkelpur_bazar", name: "Akkelpur Bazar" },
        { id: "akkelpur_area1", name: "Area 1" },
        { id: "others_akkelpur", name: "Others" },
      ],
      kalai: [
        { id: "kalai_center", name: "Kalai Center" },
        { id: "kalai_bazar", name: "Kalai Bazar" },
        { id: "kalai_area1", name: "Area 1" },
        { id: "others_kalai", name: "Others" },
      ],
      khetlal: [
        { id: "khetlal_center", name: "Khetlal Center" },
        { id: "khetlal_bazar", name: "Khetlal Bazar" },
        { id: "khetlal_area1", name: "Area 1" },
        { id: "others_khetlal", name: "Others" },
      ],
      panchbibi: [
        { id: "panchbibi_center", name: "Panchbibi Center" },
        { id: "panchbibi_bazar", name: "Panchbibi Bazar" },
        { id: "panchbibi_area1", name: "Area 1" },
        { id: "others_panchbibi", name: "Others" },
      ],
      khulna_sadar: [
        { id: "khulna_sadar_center", name: "Khulna Sadar Center" },
        { id: "khulna_sadar_bazar", name: "Khulna Sadar Bazar" },
        { id: "khulna_sadar_area1", name: "Area 1" },
        { id: "others_khulna_sadar", name: "Others" },
      ],
      batiaghata: [
        { id: "batiaghata_center", name: "Batiaghata Center" },
        { id: "batiaghata_bazar", name: "Batiaghata Bazar" },
        { id: "batiaghata_area1", name: "Area 1" },
        { id: "others_batiaghata", name: "Others" },
      ],
      dacope: [
        { id: "dacope_center", name: "Dacope Center" },
        { id: "dacope_bazar", name: "Dacope Bazar" },
        { id: "dacope_area1", name: "Area 1" },
        { id: "others_dacope", name: "Others" },
      ],
      daulatpur_khulna: [
        { id: "daulatpur_khulna_center", name: "Daulatpur Khulna Center" },
        { id: "daulatpur_khulna_bazar", name: "Daulatpur Khulna Bazar" },
        { id: "daulatpur_khulna_area1", name: "Area 1" },
        { id: "others_daulatpur_khulna", name: "Others" },
      ],
      dighalia: [
        { id: "dighalia_center", name: "Dighalia Center" },
        { id: "dighalia_bazar", name: "Dighalia Bazar" },
        { id: "dighalia_area1", name: "Area 1" },
        { id: "others_dighalia", name: "Others" },
      ],
      dumuria: [
        { id: "dumuria_center", name: "Dumuria Center" },
        { id: "dumuria_bazar", name: "Dumuria Bazar" },
        { id: "dumuria_area1", name: "Area 1" },
        { id: "others_dumuria", name: "Others" },
      ],
      khalishpur: [
        { id: "khalishpur_center", name: "Khalishpur Center" },
        { id: "khalishpur_bazar", name: "Khalishpur Bazar" },
        { id: "khalishpur_area1", name: "Area 1" },
        { id: "others_khalishpur", name: "Others" },
      ],
      koyra: [
        { id: "koyra_center", name: "Koyra Center" },
        { id: "koyra_bazar", name: "Koyra Bazar" },
        { id: "koyra_area1", name: "Area 1" },
        { id: "others_koyra", name: "Others" },
      ],
      paikgachha: [
        { id: "paikgachha_center", name: "Paikgachha Center" },
        { id: "paikgachha_bazar", name: "Paikgachha Bazar" },
        { id: "paikgachha_area1", name: "Area 1" },
        { id: "others_paikgachha", name: "Others" },
      ],
      phultala: [
        { id: "phultala_center", name: "Phultala Center" },
        { id: "phultala_bazar", name: "Phultala Bazar" },
        { id: "phultala_area1", name: "Area 1" },
        { id: "others_phultala", name: "Others" },
      ],
      rupsa: [
        { id: "rupsa_center", name: "Rupsa Center" },
        { id: "rupsa_bazar", name: "Rupsa Bazar" },
        { id: "rupsa_area1", name: "Area 1" },
        { id: "others_rupsa", name: "Others" },
      ],
      sonadanga: [
        { id: "sonadanga_center", name: "Sonadanga Center" },
        { id: "sonadanga_bazar", name: "Sonadanga Bazar" },
        { id: "sonadanga_area1", name: "Area 1" },
        { id: "others_sonadanga", name: "Others" },
      ],
      terokhada: [
        { id: "terokhada_center", name: "Terokhada Center" },
        { id: "terokhada_bazar", name: "Terokhada Bazar" },
        { id: "terokhada_area1", name: "Area 1" },
        { id: "others_terokhada", name: "Others" },
      ],
      bagerhat_sadar: [
        { id: "bagerhat_sadar_center", name: "Bagerhat Sadar Center" },
        { id: "bagerhat_sadar_bazar", name: "Bagerhat Sadar Bazar" },
        { id: "bagerhat_sadar_area1", name: "Area 1" },
        { id: "others_bagerhat_sadar", name: "Others" },
      ],
      chitalmari: [
        { id: "chitalmari_center", name: "Chitalmari Center" },
        { id: "chitalmari_bazar", name: "Chitalmari Bazar" },
        { id: "chitalmari_area1", name: "Area 1" },
        { id: "others_chitalmari", name: "Others" },
      ],
      fakirhat: [
        { id: "fakirhat_center", name: "Fakirhat Center" },
        { id: "fakirhat_bazar", name: "Fakirhat Bazar" },
        { id: "fakirhat_area1", name: "Area 1" },
        { id: "others_fakirhat", name: "Others" },
      ],
      kachua_bagerhat: [
        { id: "kachua_bagerhat_center", name: "Kachua Bagerhat Center" },
        { id: "kachua_bagerhat_bazar", name: "Kachua Bagerhat Bazar" },
        { id: "kachua_bagerhat_area1", name: "Area 1" },
        { id: "others_kachua_bagerhat", name: "Others" },
      ],
      mollahat: [
        { id: "mollahat_center", name: "Mollahat Center" },
        { id: "mollahat_bazar", name: "Mollahat Bazar" },
        { id: "mollahat_area1", name: "Area 1" },
        { id: "others_mollahat", name: "Others" },
      ],
      mongla: [
        { id: "mongla_center", name: "Mongla Center" },
        { id: "mongla_bazar", name: "Mongla Bazar" },
        { id: "mongla_area1", name: "Area 1" },
        { id: "others_mongla", name: "Others" },
      ],
      morrelganj: [
        { id: "morrelganj_center", name: "Morrelganj Center" },
        { id: "morrelganj_bazar", name: "Morrelganj Bazar" },
        { id: "morrelganj_area1", name: "Area 1" },
        { id: "others_morrelganj", name: "Others" },
      ],
      rampal: [
        { id: "rampal_center", name: "Rampal Center" },
        { id: "rampal_bazar", name: "Rampal Bazar" },
        { id: "rampal_area1", name: "Area 1" },
        { id: "others_rampal", name: "Others" },
      ],
      sarankhola: [
        { id: "sarankhola_center", name: "Sarankhola Center" },
        { id: "sarankhola_bazar", name: "Sarankhola Bazar" },
        { id: "sarankhola_area1", name: "Area 1" },
        { id: "others_sarankhola", name: "Others" },
      ],
      satkhira_sadar: [
        { id: "satkhira_sadar_center", name: "Satkhira Sadar Center" },
        { id: "satkhira_sadar_bazar", name: "Satkhira Sadar Bazar" },
        { id: "satkhira_sadar_area1", name: "Area 1" },
        { id: "others_satkhira_sadar", name: "Others" },
      ],
      assasuni: [
        { id: "assasuni_center", name: "Assasuni Center" },
        { id: "assasuni_bazar", name: "Assasuni Bazar" },
        { id: "assasuni_area1", name: "Area 1" },
        { id: "others_assasuni", name: "Others" },
      ],
      debhata: [
        { id: "debhata_center", name: "Debhata Center" },
        { id: "debhata_bazar", name: "Debhata Bazar" },
        { id: "debhata_area1", name: "Area 1" },
        { id: "others_debhata", name: "Others" },
      ],
      kalaroa: [
        { id: "kalaroa_center", name: "Kalaroa Center" },
        { id: "kalaroa_bazar", name: "Kalaroa Bazar" },
        { id: "kalaroa_area1", name: "Area 1" },
        { id: "others_kalaroa", name: "Others" },
      ],
      kaliganj_satkhira: [
        { id: "kaliganj_satkhira_center", name: "Kaliganj Satkhira Center" },
        { id: "kaliganj_satkhira_bazar", name: "Kaliganj Satkhira Bazar" },
        { id: "kaliganj_satkhira_area1", name: "Area 1" },
        { id: "others_kaliganj_satkhira", name: "Others" },
      ],
      shyamnagar: [
        { id: "shyamnagar_center", name: "Shyamnagar Center" },
        { id: "shyamnagar_bazar", name: "Shyamnagar Bazar" },
        { id: "shyamnagar_area1", name: "Area 1" },
        { id: "others_shyamnagar", name: "Others" },
      ],
      tala: [
        { id: "tala_center", name: "Tala Center" },
        { id: "tala_bazar", name: "Tala Bazar" },
        { id: "tala_area1", name: "Area 1" },
        { id: "others_tala", name: "Others" },
      ],
      jessore_sadar: [
        { id: "jessore_sadar_center", name: "Jessore Sadar Center" },
        { id: "jessore_sadar_bazar", name: "Jessore Sadar Bazar" },
        { id: "jessore_sadar_area1", name: "Area 1" },
        { id: "others_jessore_sadar", name: "Others" },
      ],
      abhaynagar: [
        { id: "abhaynagar_center", name: "Abhaynagar Center" },
        { id: "abhaynagar_bazar", name: "Abhaynagar Bazar" },
        { id: "abhaynagar_area1", name: "Area 1" },
        { id: "others_abhaynagar", name: "Others" },
      ],
      bagherpara: [
        { id: "bagherpara_center", name: "Bagherpara Center" },
        { id: "bagherpara_bazar", name: "Bagherpara Bazar" },
        { id: "bagherpara_area1", name: "Area 1" },
        { id: "others_bagherpara", name: "Others" },
      ],
      chougachha: [
        { id: "chougachha_center", name: "Chougachha Center" },
        { id: "chougachha_bazar", name: "Chougachha Bazar" },
        { id: "chougachha_area1", name: "Area 1" },
        { id: "others_chougachha", name: "Others" },
      ],
      jhikargachha: [
        { id: "jhikargachha_center", name: "Jhikargachha Center" },
        { id: "jhikargachha_bazar", name: "Jhikargachha Bazar" },
        { id: "jhikargachha_area1", name: "Area 1" },
        { id: "others_jhikargachha", name: "Others" },
      ],
      keshabpur: [
        { id: "keshabpur_center", name: "Keshabpur Center" },
        { id: "keshabpur_bazar", name: "Keshabpur Bazar" },
        { id: "keshabpur_area1", name: "Area 1" },
        { id: "others_keshabpur", name: "Others" },
      ],
      manirampur: [
        { id: "manirampur_center", name: "Manirampur Center" },
        { id: "manirampur_bazar", name: "Manirampur Bazar" },
        { id: "manirampur_area1", name: "Area 1" },
        { id: "others_manirampur", name: "Others" },
      ],
      sharsha: [
        { id: "sharsha_center", name: "Sharsha Center" },
        { id: "sharsha_bazar", name: "Sharsha Bazar" },
        { id: "sharsha_area1", name: "Area 1" },
        { id: "others_sharsha", name: "Others" },
      ],
      jhenaidah_sadar: [
        { id: "jhenaidah_sadar_center", name: "Jhenaidah Sadar Center" },
        { id: "jhenaidah_sadar_bazar", name: "Jhenaidah Sadar Bazar" },
        { id: "jhenaidah_sadar_area1", name: "Area 1" },
        { id: "others_jhenaidah_sadar", name: "Others" },
      ],
      harinakunda: [
        { id: "harinakunda_center", name: "Harinakunda Center" },
        { id: "harinakunda_bazar", name: "Harinakunda Bazar" },
        { id: "harinakunda_area1", name: "Area 1" },
        { id: "others_harinakunda", name: "Others" },
      ],
      kaliganj_jhenaidah: [
        { id: "kaliganj_jhenaidah_center", name: "Kaliganj Jhenaidah Center" },
        { id: "kaliganj_jhenaidah_bazar", name: "Kaliganj Jhenaidah Bazar" },
        { id: "kaliganj_jhenaidah_area1", name: "Area 1" },
        { id: "others_kaliganj_jhenaidah", name: "Others" },
      ],
      kotchandpur: [
        { id: "kotchandpur_center", name: "Kotchandpur Center" },
        { id: "kotchandpur_bazar", name: "Kotchandpur Bazar" },
        { id: "kotchandpur_area1", name: "Area 1" },
        { id: "others_kotchandpur", name: "Others" },
      ],
      maheshpur: [
        { id: "maheshpur_center", name: "Maheshpur Center" },
        { id: "maheshpur_bazar", name: "Maheshpur Bazar" },
        { id: "maheshpur_area1", name: "Area 1" },
        { id: "others_maheshpur", name: "Others" },
      ],
      shailkupa: [
        { id: "shailkupa_center", name: "Shailkupa Center" },
        { id: "shailkupa_bazar", name: "Shailkupa Bazar" },
        { id: "shailkupa_area1", name: "Area 1" },
        { id: "others_shailkupa", name: "Others" },
      ],
      magura_sadar: [
        { id: "magura_sadar_center", name: "Magura Sadar Center" },
        { id: "magura_sadar_bazar", name: "Magura Sadar Bazar" },
        { id: "magura_sadar_area1", name: "Area 1" },
        { id: "others_magura_sadar", name: "Others" },
      ],
      mohammadpur_magura: [
        { id: "mohammadpur_magura_center", name: "Mohammadpur Magura Center" },
        { id: "mohammadpur_magura_bazar", name: "Mohammadpur Magura Bazar" },
        { id: "mohammadpur_magura_area1", name: "Area 1" },
        { id: "others_mohammadpur_magura", name: "Others" },
      ],
      shalikha: [
        { id: "shalikha_center", name: "Shalikha Center" },
        { id: "shalikha_bazar", name: "Shalikha Bazar" },
        { id: "shalikha_area1", name: "Area 1" },
        { id: "others_shalikha", name: "Others" },
      ],
      sreepur_magura: [
        { id: "sreepur_magura_center", name: "Sreepur Magura Center" },
        { id: "sreepur_magura_bazar", name: "Sreepur Magura Bazar" },
        { id: "sreepur_magura_area1", name: "Area 1" },
        { id: "others_sreepur_magura", name: "Others" },
      ],
      narail_sadar: [
        { id: "narail_sadar_center", name: "Narail Sadar Center" },
        { id: "narail_sadar_bazar", name: "Narail Sadar Bazar" },
        { id: "narail_sadar_area1", name: "Area 1" },
        { id: "others_narail_sadar", name: "Others" },
      ],
      kalia: [
        { id: "kalia_center", name: "Kalia Center" },
        { id: "kalia_bazar", name: "Kalia Bazar" },
        { id: "kalia_area1", name: "Area 1" },
        { id: "others_kalia", name: "Others" },
      ],
      lohagara_narail: [
        { id: "lohagara_narail_center", name: "Lohagara Narail Center" },
        { id: "lohagara_narail_bazar", name: "Lohagara Narail Bazar" },
        { id: "lohagara_narail_area1", name: "Area 1" },
        { id: "others_lohagara_narail", name: "Others" },
      ],
      kushtia_sadar: [
        { id: "kushtia_sadar_center", name: "Kushtia Sadar Center" },
        { id: "kushtia_sadar_bazar", name: "Kushtia Sadar Bazar" },
        { id: "kushtia_sadar_area1", name: "Area 1" },
        { id: "others_kushtia_sadar", name: "Others" },
      ],
      bheramara: [
        { id: "bheramara_center", name: "Bheramara Center" },
        { id: "bheramara_bazar", name: "Bheramara Bazar" },
        { id: "bheramara_area1", name: "Area 1" },
        { id: "others_bheramara", name: "Others" },
      ],
      daulatpur_kushtia: [
        { id: "daulatpur_kushtia_center", name: "Daulatpur Kushtia Center" },
        { id: "daulatpur_kushtia_bazar", name: "Daulatpur Kushtia Bazar" },
        { id: "daulatpur_kushtia_area1", name: "Area 1" },
        { id: "others_daulatpur_kushtia", name: "Others" },
      ],
      khoksa: [
        { id: "khoksa_center", name: "Khoksa Center" },
        { id: "khoksa_bazar", name: "Khoksa Bazar" },
        { id: "khoksa_area1", name: "Area 1" },
        { id: "others_khoksa", name: "Others" },
      ],
      kumarkhali: [
        { id: "kumarkhali_center", name: "Kumarkhali Center" },
        { id: "kumarkhali_bazar", name: "Kumarkhali Bazar" },
        { id: "kumarkhali_area1", name: "Area 1" },
        { id: "others_kumarkhali", name: "Others" },
      ],
      mirpur_kushtia: [
        { id: "mirpur_kushtia_center", name: "Mirpur Kushtia Center" },
        { id: "mirpur_kushtia_bazar", name: "Mirpur Kushtia Bazar" },
        { id: "mirpur_kushtia_area1", name: "Area 1" },
        { id: "others_mirpur_kushtia", name: "Others" },
      ],
      meherpur_sadar: [
        { id: "meherpur_sadar_center", name: "Meherpur Sadar Center" },
        { id: "meherpur_sadar_bazar", name: "Meherpur Sadar Bazar" },
        { id: "meherpur_sadar_area1", name: "Area 1" },
        { id: "others_meherpur_sadar", name: "Others" },
      ],
      gangni: [
        { id: "gangni_center", name: "Gangni Center" },
        { id: "gangni_bazar", name: "Gangni Bazar" },
        { id: "gangni_area1", name: "Area 1" },
        { id: "others_gangni", name: "Others" },
      ],
      mujibnagar: [
        { id: "mujibnagar_center", name: "Mujibnagar Center" },
        { id: "mujibnagar_bazar", name: "Mujibnagar Bazar" },
        { id: "mujibnagar_area1", name: "Area 1" },
        { id: "others_mujibnagar", name: "Others" },
      ],
      chuadanga_sadar: [
        { id: "chuadanga_sadar_center", name: "Chuadanga Sadar Center" },
        { id: "chuadanga_sadar_bazar", name: "Chuadanga Sadar Bazar" },
        { id: "chuadanga_sadar_area1", name: "Area 1" },
        { id: "others_chuadanga_sadar", name: "Others" },
      ],
      alamdanga: [
        { id: "alamdanga_center", name: "Alamdanga Center" },
        { id: "alamdanga_bazar", name: "Alamdanga Bazar" },
        { id: "alamdanga_area1", name: "Area 1" },
        { id: "others_alamdanga", name: "Others" },
      ],
      damurhuda: [
        { id: "damurhuda_center", name: "Damurhuda Center" },
        { id: "damurhuda_bazar", name: "Damurhuda Bazar" },
        { id: "damurhuda_area1", name: "Area 1" },
        { id: "others_damurhuda", name: "Others" },
      ],
      jibannagar: [
        { id: "jibannagar_center", name: "Jibannagar Center" },
        { id: "jibannagar_bazar", name: "Jibannagar Bazar" },
        { id: "jibannagar_area1", name: "Area 1" },
        { id: "others_jibannagar", name: "Others" },
      ],
      barishal_sadar: [
        { id: "barishal_sadar_center", name: "Barishal Sadar Center" },
        { id: "barishal_sadar_bazar", name: "Barishal Sadar Bazar" },
        { id: "barishal_sadar_area1", name: "Area 1" },
        { id: "others_barishal_sadar", name: "Others" },
      ],
      agailjhara: [
        { id: "agailjhara_center", name: "Agailjhara Center" },
        { id: "agailjhara_bazar", name: "Agailjhara Bazar" },
        { id: "agailjhara_area1", name: "Area 1" },
        { id: "others_agailjhara", name: "Others" },
      ],
      babuganj: [
        { id: "babuganj_center", name: "Babuganj Center" },
        { id: "babuganj_bazar", name: "Babuganj Bazar" },
        { id: "babuganj_area1", name: "Area 1" },
        { id: "others_babuganj", name: "Others" },
      ],
      bakerganj: [
        { id: "bakerganj_center", name: "Bakerganj Center" },
        { id: "bakerganj_bazar", name: "Bakerganj Bazar" },
        { id: "bakerganj_area1", name: "Area 1" },
        { id: "others_bakerganj", name: "Others" },
      ],
      banaripara: [
        { id: "banaripara_center", name: "Banaripara Center" },
        { id: "banaripara_bazar", name: "Banaripara Bazar" },
        { id: "banaripara_area1", name: "Area 1" },
        { id: "others_banaripara", name: "Others" },
      ],
      gaurnadi: [
        { id: "gaurnadi_center", name: "Gaurnadi Center" },
        { id: "gaurnadi_bazar", name: "Gaurnadi Bazar" },
        { id: "gaurnadi_area1", name: "Area 1" },
        { id: "others_gaurnadi", name: "Others" },
      ],
      hizla: [
        { id: "hizla_center", name: "Hizla Center" },
        { id: "hizla_bazar", name: "Hizla Bazar" },
        { id: "hizla_area1", name: "Area 1" },
        { id: "others_hizla", name: "Others" },
      ],
      mehendiganj: [
        { id: "mehendiganj_center", name: "Mehendiganj Center" },
        { id: "mehendiganj_bazar", name: "Mehendiganj Bazar" },
        { id: "mehendiganj_area1", name: "Area 1" },
        { id: "others_mehendiganj", name: "Others" },
      ],
      muladi: [
        { id: "muladi_center", name: "Muladi Center" },
        { id: "muladi_bazar", name: "Muladi Bazar" },
        { id: "muladi_area1", name: "Area 1" },
        { id: "others_muladi", name: "Others" },
      ],
      wazirpur: [
        { id: "wazirpur_center", name: "Wazirpur Center" },
        { id: "wazirpur_bazar", name: "Wazirpur Bazar" },
        { id: "wazirpur_area1", name: "Area 1" },
        { id: "others_wazirpur", name: "Others" },
      ],
      bhola_sadar: [
        { id: "bhola_sadar_center", name: "Bhola Sadar Center" },
        { id: "bhola_sadar_bazar", name: "Bhola Sadar Bazar" },
        { id: "bhola_sadar_area1", name: "Area 1" },
        { id: "others_bhola_sadar", name: "Others" },
      ],
      burhanuddin: [
        { id: "burhanuddin_center", name: "Burhanuddin Center" },
        { id: "burhanuddin_bazar", name: "Burhanuddin Bazar" },
        { id: "burhanuddin_area1", name: "Area 1" },
        { id: "others_burhanuddin", name: "Others" },
      ],
      char_fasson: [
        { id: "char_fasson_center", name: "Char Fasson Center" },
        { id: "char_fasson_bazar", name: "Char Fasson Bazar" },
        { id: "char_fasson_area1", name: "Area 1" },
        { id: "others_char_fasson", name: "Others" },
      ],
      daulatkhan: [
        { id: "daulatkhan_center", name: "Daulatkhan Center" },
        { id: "daulatkhan_bazar", name: "Daulatkhan Bazar" },
        { id: "daulatkhan_area1", name: "Area 1" },
        { id: "others_daulatkhan", name: "Others" },
      ],
      lalmohan: [
        { id: "lalmohan_center", name: "Lalmohan Center" },
        { id: "lalmohan_bazar", name: "Lalmohan Bazar" },
        { id: "lalmohan_area1", name: "Area 1" },
        { id: "others_lalmohan", name: "Others" },
      ],
      manpura: [
        { id: "manpura_center", name: "Manpura Center" },
        { id: "manpura_bazar", name: "Manpura Bazar" },
        { id: "manpura_area1", name: "Area 1" },
        { id: "others_manpura", name: "Others" },
      ],
      tazumuddin: [
        { id: "tazumuddin_center", name: "Tazumuddin Center" },
        { id: "tazumuddin_bazar", name: "Tazumuddin Bazar" },
        { id: "tazumuddin_area1", name: "Area 1" },
        { id: "others_tazumuddin", name: "Others" },
      ],
      patuakhali_sadar: [
        { id: "patuakhali_sadar_center", name: "Patuakhali Sadar Center" },
        { id: "patuakhali_sadar_bazar", name: "Patuakhali Sadar Bazar" },
        { id: "patuakhali_sadar_area1", name: "Area 1" },
        { id: "others_patuakhali_sadar", name: "Others" },
      ],
      bauphal: [
        { id: "bauphal_center", name: "Bauphal Center" },
        { id: "bauphal_bazar", name: "Bauphal Bazar" },
        { id: "bauphal_area1", name: "Area 1" },
        { id: "others_bauphal", name: "Others" },
      ],
      dashmina: [
        { id: "dashmina_center", name: "Dashmina Center" },
        { id: "dashmina_bazar", name: "Dashmina Bazar" },
        { id: "dashmina_area1", name: "Area 1" },
        { id: "others_dashmina", name: "Others" },
      ],
      dumki: [
        { id: "dumki_center", name: "Dumki Center" },
        { id: "dumki_bazar", name: "Dumki Bazar" },
        { id: "dumki_area1", name: "Area 1" },
        { id: "others_dumki", name: "Others" },
      ],
      galachipa: [
        { id: "galachipa_center", name: "Galachipa Center" },
        { id: "galachipa_bazar", name: "Galachipa Bazar" },
        { id: "galachipa_area1", name: "Area 1" },
        { id: "others_galachipa", name: "Others" },
      ],
      kalapara: [
        { id: "kalapara_center", name: "Kalapara Center" },
        { id: "kalapara_bazar", name: "Kalapara Bazar" },
        { id: "kalapara_area1", name: "Area 1" },
        { id: "others_kalapara", name: "Others" },
      ],
      mirzaganj: [
        { id: "mirzaganj_center", name: "Mirzaganj Center" },
        { id: "mirzaganj_bazar", name: "Mirzaganj Bazar" },
        { id: "mirzaganj_area1", name: "Area 1" },
        { id: "others_mirzaganj", name: "Others" },
      ],
      rangabali: [
        { id: "rangabali_center", name: "Rangabali Center" },
        { id: "rangabali_bazar", name: "Rangabali Bazar" },
        { id: "rangabali_area1", name: "Area 1" },
        { id: "others_rangabali", name: "Others" },
      ],
      barguna_sadar: [
        { id: "barguna_sadar_center", name: "Barguna Sadar Center" },
        { id: "barguna_sadar_bazar", name: "Barguna Sadar Bazar" },
        { id: "barguna_sadar_area1", name: "Area 1" },
        { id: "others_barguna_sadar", name: "Others" },
      ],
      amtali: [
        { id: "amtali_center", name: "Amtali Center" },
        { id: "amtali_bazar", name: "Amtali Bazar" },
        { id: "amtali_area1", name: "Area 1" },
        { id: "others_amtali", name: "Others" },
      ],
      bamna: [
        { id: "bamna_center", name: "Bamna Center" },
        { id: "bamna_bazar", name: "Bamna Bazar" },
        { id: "bamna_area1", name: "Area 1" },
        { id: "others_bamna", name: "Others" },
      ],
      betagi: [
        { id: "betagi_center", name: "Betagi Center" },
        { id: "betagi_bazar", name: "Betagi Bazar" },
        { id: "betagi_area1", name: "Area 1" },
        { id: "others_betagi", name: "Others" },
      ],
      patharghata: [
        { id: "patharghata_center", name: "Patharghata Center" },
        { id: "patharghata_bazar", name: "Patharghata Bazar" },
        { id: "patharghata_area1", name: "Area 1" },
        { id: "others_patharghata", name: "Others" },
      ],
      taltali: [
        { id: "taltali_center", name: "Taltali Center" },
        { id: "taltali_bazar", name: "Taltali Bazar" },
        { id: "taltali_area1", name: "Area 1" },
        { id: "others_taltali", name: "Others" },
      ],
      jhalokati_sadar: [
        { id: "jhalokati_sadar_center", name: "Jhalokati Sadar Center" },
        { id: "jhalokati_sadar_bazar", name: "Jhalokati Sadar Bazar" },
        { id: "jhalokati_sadar_area1", name: "Area 1" },
        { id: "others_jhalokati_sadar", name: "Others" },
      ],
      kathalia: [
        { id: "kathalia_center", name: "Kathalia Center" },
        { id: "kathalia_bazar", name: "Kathalia Bazar" },
        { id: "kathalia_area1", name: "Area 1" },
        { id: "others_kathalia", name: "Others" },
      ],
      nalchity: [
        { id: "nalchity_center", name: "Nalchity Center" },
        { id: "nalchity_bazar", name: "Nalchity Bazar" },
        { id: "nalchity_area1", name: "Area 1" },
        { id: "others_nalchity", name: "Others" },
      ],
      rajapur: [
        { id: "rajapur_center", name: "Rajapur Center" },
        { id: "rajapur_bazar", name: "Rajapur Bazar" },
        { id: "rajapur_area1", name: "Area 1" },
        { id: "others_rajapur", name: "Others" },
      ],
      pirojpur_sadar: [
        { id: "pirojpur_sadar_center", name: "Pirojpur Sadar Center" },
        { id: "pirojpur_sadar_bazar", name: "Pirojpur Sadar Bazar" },
        { id: "pirojpur_sadar_area1", name: "Area 1" },
        { id: "others_pirojpur_sadar", name: "Others" },
      ],
      bhandaria: [
        { id: "bhandaria_center", name: "Bhandaria Center" },
        { id: "bhandaria_bazar", name: "Bhandaria Bazar" },
        { id: "bhandaria_area1", name: "Area 1" },
        { id: "others_bhandaria", name: "Others" },
      ],
      kawkhali_pirojpur: [
        { id: "kawkhali_pirojpur_center", name: "Kawkhali Pirojpur Center" },
        { id: "kawkhali_pirojpur_bazar", name: "Kawkhali Pirojpur Bazar" },
        { id: "kawkhali_pirojpur_area1", name: "Area 1" },
        { id: "others_kawkhali_pirojpur", name: "Others" },
      ],
      mathbaria: [
        { id: "mathbaria_center", name: "Mathbaria Center" },
        { id: "mathbaria_bazar", name: "Mathbaria Bazar" },
        { id: "mathbaria_area1", name: "Area 1" },
        { id: "others_mathbaria", name: "Others" },
      ],
      nazirpur: [
        { id: "nazirpur_center", name: "Nazirpur Center" },
        { id: "nazirpur_bazar", name: "Nazirpur Bazar" },
        { id: "nazirpur_area1", name: "Area 1" },
        { id: "others_nazirpur", name: "Others" },
      ],
      nesarabad: [
        { id: "nesarabad_center", name: "Nesarabad Center" },
        { id: "nesarabad_bazar", name: "Nesarabad Bazar" },
        { id: "nesarabad_area1", name: "Area 1" },
        { id: "others_nesarabad", name: "Others" },
      ],
      zianagar: [
        { id: "zianagar_center", name: "Zianagar Center" },
        { id: "zianagar_bazar", name: "Zianagar Bazar" },
        { id: "zianagar_area1", name: "Area 1" },
        { id: "others_zianagar", name: "Others" },
      ],
      // Sylhet District Areas - DETAILED
      sylhet_sadar: [
        { id: "shahjalal_upashahar", name: "Shahjalal Upashahar" },
        { id: "kumarpara", name: "Kumarpara" },
        { id: "kajalshah", name: "Kajalshah" },
        { id: "mirabazar", name: "Mirabazar" },
        { id: "zindabazar", name: "Zindabazar" },
        { id: "amberkhana", name: "Amberkhana" },
        { id: "uposhohor", name: "Uposhohor" },
        { id: "bandar_bazar", name: "Bandar Bazar" },
        { id: "chowhatta", name: "Chowhatta" },
        { id: "dargah_gate", name: "Dargah Gate" },
        { id: "lalbazar", name: "Lalbazar" },
        { id: "pathantula", name: "Pathantula" },
        { id: "rikabibazar", name: "Rikabibazar" },
        { id: "sheikh_ghat", name: "Sheikh Ghat" },
        { id: "subidbazar", name: "Subidbazar" },
        { id: "taltala", name: "Taltala" },
        { id: "others_sylhet_sadar", name: "Others" },
      ],
      beanibazar: [
        { id: "beanibazar_center", name: "Beanibazar Center" },
        { id: "mathiura", name: "Mathiura" },
        { id: "lauta", name: "Lauta" },
        { id: "tilpara", name: "Tilpara" },
        { id: "others_beanibazar", name: "Others" },
      ],
      golapganj: [
        { id: "golapganj_center", name: "Golapganj Center" },
        { id: "dhaka_dakshin", name: "Dhaka Dakshin" },
        { id: "lakshmipasha", name: "Lakshmipasha" },
        { id: "fulbari_golapganj", name: "Fulbari" },
        { id: "others_golapganj", name: "Others" },
      ],
      kanaighat: [
        { id: "kanaighat_center", name: "Kanaighat Center" },
        { id: "jalalpur", name: "Jalalpur" },
        { id: "darbast", name: "Darbast" },
        { id: "others_kanaighat", name: "Others" },
      ],
      bishwanath: [
        { id: "bishwanath_center", name: "Bishwanath Center" },
        { id: "alambazar", name: "Alambazar" },
        { id: "dashghar", name: "Dashghar" },
        { id: "others_bishwanath", name: "Others" },
      ],
      fenchuganj: [
        { id: "fenchuganj_center", name: "Fenchuganj Center" },
        { id: "gilachhara", name: "Gilachhara" },
        { id: "maijgaon", name: "Maijgaon" },
        { id: "others_fenchuganj", name: "Others" },
      ],
      gowainghat: [
        { id: "gowainghat_center", name: "Gowainghat Center" },
        { id: "jaflong", name: "Jaflong" },
        { id: "westgobinda", name: "West Gobinda" },
        { id: "others_gowainghat", name: "Others" },
      ],
      jaintiapur: [
        { id: "jaintiapur_center", name: "Jaintiapur Center" },
        { id: "charikatha", name: "Charikatha" },
        { id: "fatehpur", name: "Fatehpur" },
        { id: "others_jaintiapur", name: "Others" },
      ],
      zakiganj: [
        { id: "zakiganj_center", name: "Zakiganj Center" },
        { id: "barahal", name: "Barahal" },
        { id: "birsree", name: "Birsree" },
        { id: "others_zakiganj", name: "Others" },
      ],
      balaganj: [
        { id: "balaganj_center", name: "Balaganj Center" },
        { id: "osmanpur", name: "Osmanpur" },
        { id: "sadipur", name: "Sadipur" },
        { id: "others_balaganj", name: "Others" },
      ],
      osmaninagar: [
        { id: "osmaninagar_center", name: "Osmaninagar Center" },
        { id: "chiknagul", name: "Chiknagul" },
        { id: "pathankata", name: "Pathankata" },
        { id: "others_osmaninagar", name: "Others" },
      ],
      companiganj_sylhet: [
        { id: "companiganj_center", name: "Companiganj Center" },
        { id: "ranigaon", name: "Ranigaon" },
        { id: "islampur_east", name: "Islampur East" },
        { id: "others_companiganj", name: "Others" },
      ],

      // Moulvibazar District Areas - DETAILED
      moulvibazar_sadar: [
        { id: "moulvibazar_town", name: "Moulvibazar Town" },
        { id: "monumukh", name: "Monumukh" },
        { id: "khalilpur", name: "Khalilpur" },
        { id: "mir_bazar", name: "Mir Bazar" },
        { id: "others_moulvibazar_sadar", name: "Others" },
      ],
      kamalganj: [
        { id: "kamalganj_center", name: "Kamalganj Center" },
        { id: "adampur", name: "Adampur" },
        { id: "islampur", name: "Islampur" },
        { id: "patanushar", name: "Patanushar" },
        { id: "others_kamalganj", name: "Others" },
      ],
      kulaura: [
        { id: "kulaura_center", name: "Kulaura Center" },
        { id: "bhatera", name: "Bhatera" },
        { id: "bramhanbazar", name: "Bramhanbazar" },
        { id: "prithimpasha", name: "Prithimpasha" },
        { id: "others_kulaura", name: "Others" },
      ],
      rajnagar: [
        { id: "rajnagar_center", name: "Rajnagar Center" },
        { id: "kamarchar", name: "Kamarchar" },
        { id: "mansurnagar", name: "Mansurnagar" },
        { id: "others_rajnagar", name: "Others" },
      ],
      sreemangal: [
        { id: "sreemangal_town", name: "Sreemangal Town" },
        { id: "kalighat", name: "Kalighat" },
        { id: "satgaon", name: "Satgaon" },
        { id: "bhunabir", name: "Bhunabir" },
        { id: "others_sreemangal", name: "Others" },
      ],
      juri: [
        { id: "juri_center", name: "Juri Center" },
        { id: "goalbari", name: "Goalbari" },
        { id: "sagarnal", name: "Sagarnal" },
        { id: "others_juri", name: "Others" },
      ],
      barlekha: [
        { id: "barlekha_center", name: "Barlekha Center" },
        { id: "jatirpool", name: "Jatirpool" },
        { id: "talimpur", name: "Talimpur" },
        { id: "others_barlekha", name: "Others" },
      ],

      // Habiganj District Areas - DETAILED
      habiganj_sadar: [
        { id: "habiganj_town", name: "Habiganj Town" },
        { id: "shayestaganj", name: "Shayestaganj" },
        { id: "hobigonj_road", name: "Habiganj Road" },
        { id: "digholbak", name: "Digholbak" },
        { id: "others_habiganj_sadar", name: "Others" },
      ],
      bahubal: [
        { id: "bahubal_center", name: "Bahubal Center" },
        { id: "bhadeshwar", name: "Bhadeshwar" },
        { id: "lamatashi", name: "Lamatashi" },
        { id: "others_bahubal", name: "Others" },
      ],
      chunarughat: [
        { id: "chunarughat_center", name: "Chunarughat Center" },
        { id: "paikpara", name: "Paikpara" },
        { id: "ranikhai", name: "Ranikhai" },
        { id: "others_chunarughat", name: "Others" },
      ],
      madhabpur: [
        { id: "madhabpur_center", name: "Madhabpur Center" },
        { id: "shahjahanpur", name: "Shahjahanpur" },
        { id: "shahpur", name: "Shahpur" },
        { id: "others_madhabpur", name: "Others" },
      ],
      nabiganj: [
        { id: "nabiganj_center", name: "Nabiganj Center" },
        { id: "bausha", name: "Bausha" },
        { id: "inathganj", name: "Inathganj" },
        { id: "others_nabiganj", name: "Others" },
      ],
      lakhai: [
        { id: "lakhai_center", name: "Lakhai Center" },
        { id: "bamoi", name: "Bamoi" },
        { id: "muriauk", name: "Muriauk" },
        { id: "others_lakhai", name: "Others" },
      ],
      ajmiriganj: [
        { id: "ajmiriganj_center", name: "Ajmiriganj Center" },
        { id: "badolpur", name: "Badolpur" },
        { id: "jolsuka", name: "Jolsuka" },
        { id: "others_ajmiriganj", name: "Others" },
      ],
      baniachong: [
        { id: "baniachong_center", name: "Baniachong Center" },
        { id: "daulatpur", name: "Daulatpur" },
        { id: "khagaura", name: "Khagaura" },
        { id: "others_baniachong", name: "Others" },
      ],

      // Sunamganj District Areas - DETAILED
      sunamganj_sadar: [
        { id: "sunamganj_town", name: "Sunamganj Town" },
        { id: "hospital_road", name: "Hospital Road" },
        { id: "station_road", name: "Station Road" },
        { id: "court_bazar", name: "Court Bazar" },
        { id: "others_sunamganj_sadar", name: "Others" },
      ],
      chhatak: [
        { id: "chhatak_center", name: "Chhatak Center" },
        { id: "gobindganj", name: "Gobindganj" },
        { id: "khurma", name: "Khurma" },
        { id: "others_chhatak", name: "Others" },
      ],
      derai: [
        { id: "derai_center", name: "Derai Center" },
        { id: "karimpur", name: "Karimpur" },
        { id: "taral", name: "Taral" },
        { id: "others_derai", name: "Others" },
      ],
      dharamapasha: [
        { id: "dharamapasha_center", name: "Dharamapasha Center" },
        { id: "charnarchar", name: "Charnarchar" },
        { id: "paikurati", name: "Paikurati" },
        { id: "others_dharamapasha", name: "Others" },
      ],
      bishwambarpur: [
        { id: "bishwambarpur_center", name: "Bishwambarpur Center" },
        { id: "dhaka_dakshin_bm", name: "Dhaka Dakshin" },
        { id: "palash_bm", name: "Palash" },
        { id: "others_bishwambarpur", name: "Others" },
      ],
      dowarabazar: [
        { id: "dowarabazar_center", name: "Dowarabazar Center" },
        { id: "boglabazar", name: "Boglabazar" },
        { id: "surma", name: "Surma" },
        { id: "others_dowarabazar", name: "Others" },
      ],
      jagannathpur: [
        { id: "jagannathpur_center", name: "Jagannathpur Center" },
        { id: "asharkandi", name: "Asharkandi" },
        { id: "mir_bazar_jgn", name: "Mir Bazar" },
        { id: "others_jagannathpur", name: "Others" },
      ],
      jamalganj: [
        { id: "jamalganj_center", name: "Jamalganj Center" },
        { id: "badaghat_north", name: "Badaghat North" },
        { id: "fenarbak", name: "Fenarbak" },
        { id: "others_jamalganj", name: "Others" },
      ],
      sulla: [
        { id: "sulla_center", name: "Sulla Center" },
        { id: "atgaon", name: "Atgaon" },
        { id: "habibpur", name: "Habibpur" },
        { id: "others_sulla", name: "Others" },
      ],
      shanthiganj: [
        { id: "shanthiganj_center", name: "Shanthiganj Center" },
        { id: "bahara", name: "Bahara" },
        { id: "patharia", name: "Patharia" },
        { id: "others_shanthiganj", name: "Others" },
      ],
      tahirpur: [
        { id: "tahirpur_center", name: "Tahirpur Center" },
        { id: "balijuri", name: "Balijuri" },
        { id: "sreepur_tahir", name: "Sreepur" },
        { id: "others_tahirpur", name: "Others" },
      ],
      rangpur_sadar: [
        { id: "rangpur_sadar_center", name: "Rangpur Sadar Center" },
        { id: "rangpur_sadar_bazar", name: "Rangpur Sadar Bazar" },
        { id: "rangpur_sadar_area1", name: "Area 1" },
        { id: "others_rangpur_sadar", name: "Others" },
      ],
      badarganj: [
        { id: "badarganj_center", name: "Badarganj Center" },
        { id: "badarganj_bazar", name: "Badarganj Bazar" },
        { id: "badarganj_area1", name: "Area 1" },
        { id: "others_badarganj", name: "Others" },
      ],
      gangachara: [
        { id: "gangachara_center", name: "Gangachara Center" },
        { id: "gangachara_bazar", name: "Gangachara Bazar" },
        { id: "gangachara_area1", name: "Area 1" },
        { id: "others_gangachara", name: "Others" },
      ],
      kaunia: [
        { id: "kaunia_center", name: "Kaunia Center" },
        { id: "kaunia_bazar", name: "Kaunia Bazar" },
        { id: "kaunia_area1", name: "Area 1" },
        { id: "others_kaunia", name: "Others" },
      ],
      mithapukur: [
        { id: "mithapukur_center", name: "Mithapukur Center" },
        { id: "mithapukur_bazar", name: "Mithapukur Bazar" },
        { id: "mithapukur_area1", name: "Area 1" },
        { id: "others_mithapukur", name: "Others" },
      ],
      pirgachha: [
        { id: "pirgachha_center", name: "Pirgachha Center" },
        { id: "pirgachha_bazar", name: "Pirgachha Bazar" },
        { id: "pirgachha_area1", name: "Area 1" },
        { id: "others_pirgachha", name: "Others" },
      ],
      pirganj: [
        { id: "pirganj_center", name: "Pirganj Center" },
        { id: "pirganj_bazar", name: "Pirganj Bazar" },
        { id: "pirganj_area1", name: "Area 1" },
        { id: "others_pirganj", name: "Others" },
      ],
      taraganj: [
        { id: "taraganj_center", name: "Taraganj Center" },
        { id: "taraganj_bazar", name: "Taraganj Bazar" },
        { id: "taraganj_area1", name: "Area 1" },
        { id: "others_taraganj", name: "Others" },
      ],
      dinajpur_sadar: [
        { id: "dinajpur_sadar_center", name: "Dinajpur Sadar Center" },
        { id: "dinajpur_sadar_bazar", name: "Dinajpur Sadar Bazar" },
        { id: "dinajpur_sadar_area1", name: "Area 1" },
        { id: "others_dinajpur_sadar", name: "Others" },
      ],
      birampur: [
        { id: "birampur_center", name: "Birampur Center" },
        { id: "birampur_bazar", name: "Birampur Bazar" },
        { id: "birampur_area1", name: "Area 1" },
        { id: "others_birampur", name: "Others" },
      ],
      birganj: [
        { id: "birganj_center", name: "Birganj Center" },
        { id: "birganj_bazar", name: "Birganj Bazar" },
        { id: "birganj_area1", name: "Area 1" },
        { id: "others_birganj", name: "Others" },
      ],
      biral: [
        { id: "biral_center", name: "Biral Center" },
        { id: "biral_bazar", name: "Biral Bazar" },
        { id: "biral_area1", name: "Area 1" },
        { id: "others_biral", name: "Others" },
      ],
      bochaganj: [
        { id: "bochaganj_center", name: "Bochaganj Center" },
        { id: "bochaganj_bazar", name: "Bochaganj Bazar" },
        { id: "bochaganj_area1", name: "Area 1" },
        { id: "others_bochaganj", name: "Others" },
      ],
      chirirbandar: [
        { id: "chirirbandar_center", name: "Chirirbandar Center" },
        { id: "chirirbandar_bazar", name: "Chirirbandar Bazar" },
        { id: "chirirbandar_area1", name: "Area 1" },
        { id: "others_chirirbandar", name: "Others" },
      ],
      fulbari_dinajpur: [
        { id: "fulbari_dinajpur_center", name: "Fulbari Dinajpur Center" },
        { id: "fulbari_dinajpur_bazar", name: "Fulbari Dinajpur Bazar" },
        { id: "fulbari_dinajpur_area1", name: "Area 1" },
        { id: "others_fulbari_dinajpur", name: "Others" },
      ],
      ghoraghat: [
        { id: "ghoraghat_center", name: "Ghoraghat Center" },
        { id: "ghoraghat_bazar", name: "Ghoraghat Bazar" },
        { id: "ghoraghat_area1", name: "Area 1" },
        { id: "others_ghoraghat", name: "Others" },
      ],
      hakimpur: [
        { id: "hakimpur_center", name: "Hakimpur Center" },
        { id: "hakimpur_bazar", name: "Hakimpur Bazar" },
        { id: "hakimpur_area1", name: "Area 1" },
        { id: "others_hakimpur", name: "Others" },
      ],
      kaharole: [
        { id: "kaharole_center", name: "Kaharole Center" },
        { id: "kaharole_bazar", name: "Kaharole Bazar" },
        { id: "kaharole_area1", name: "Area 1" },
        { id: "others_kaharole", name: "Others" },
      ],
      khansama: [
        { id: "khansama_center", name: "Khansama Center" },
        { id: "khansama_bazar", name: "Khansama Bazar" },
        { id: "khansama_area1", name: "Area 1" },
        { id: "others_khansama", name: "Others" },
      ],
      nawabganj_dinajpur: [
        { id: "nawabganj_dinajpur_center", name: "Nawabganj Dinajpur Center" },
        { id: "nawabganj_dinajpur_bazar", name: "Nawabganj Dinajpur Bazar" },
        { id: "nawabganj_dinajpur_area1", name: "Area 1" },
        { id: "others_nawabganj_dinajpur", name: "Others" },
      ],
      parbatipur: [
        { id: "parbatipur_center", name: "Parbatipur Center" },
        { id: "parbatipur_bazar", name: "Parbatipur Bazar" },
        { id: "parbatipur_area1", name: "Area 1" },
        { id: "others_parbatipur", name: "Others" },
      ],
      gaibandha_sadar: [
        { id: "gaibandha_sadar_center", name: "Gaibandha Sadar Center" },
        { id: "gaibandha_sadar_bazar", name: "Gaibandha Sadar Bazar" },
        { id: "gaibandha_sadar_area1", name: "Area 1" },
        { id: "others_gaibandha_sadar", name: "Others" },
      ],
      fulchhari: [
        { id: "fulchhari_center", name: "Fulchhari Center" },
        { id: "fulchhari_bazar", name: "Fulchhari Bazar" },
        { id: "fulchhari_area1", name: "Area 1" },
        { id: "others_fulchhari", name: "Others" },
      ],
      gobindaganj: [
        { id: "gobindaganj_center", name: "Gobindaganj Center" },
        { id: "gobindaganj_bazar", name: "Gobindaganj Bazar" },
        { id: "gobindaganj_area1", name: "Area 1" },
        { id: "others_gobindaganj", name: "Others" },
      ],
      palashbari: [
        { id: "palashbari_center", name: "Palashbari Center" },
        { id: "palashbari_bazar", name: "Palashbari Bazar" },
        { id: "palashbari_area1", name: "Area 1" },
        { id: "others_palashbari", name: "Others" },
      ],
      sadullapur: [
        { id: "sadullapur_center", name: "Sadullapur Center" },
        { id: "sadullapur_bazar", name: "Sadullapur Bazar" },
        { id: "sadullapur_area1", name: "Area 1" },
        { id: "others_sadullapur", name: "Others" },
      ],
      saghata: [
        { id: "saghata_center", name: "Saghata Center" },
        { id: "saghata_bazar", name: "Saghata Bazar" },
        { id: "saghata_area1", name: "Area 1" },
        { id: "others_saghata", name: "Others" },
      ],
      sundarganj: [
        { id: "sundarganj_center", name: "Sundarganj Center" },
        { id: "sundarganj_bazar", name: "Sundarganj Bazar" },
        { id: "sundarganj_area1", name: "Area 1" },
        { id: "others_sundarganj", name: "Others" },
      ],
      kurigram_sadar: [
        { id: "kurigram_sadar_center", name: "Kurigram Sadar Center" },
        { id: "kurigram_sadar_bazar", name: "Kurigram Sadar Bazar" },
        { id: "kurigram_sadar_area1", name: "Area 1" },
        { id: "others_kurigram_sadar", name: "Others" },
      ],
      bhurungamari: [
        { id: "bhurungamari_center", name: "Bhurungamari Center" },
        { id: "bhurungamari_bazar", name: "Bhurungamari Bazar" },
        { id: "bhurungamari_area1", name: "Area 1" },
        { id: "others_bhurungamari", name: "Others" },
      ],
      char_rajibpur: [
        { id: "char_rajibpur_center", name: "Char Rajibpur Center" },
        { id: "char_rajibpur_bazar", name: "Char Rajibpur Bazar" },
        { id: "char_rajibpur_area1", name: "Area 1" },
        { id: "others_char_rajibpur", name: "Others" },
      ],
      chilmari: [
        { id: "chilmari_center", name: "Chilmari Center" },
        { id: "chilmari_bazar", name: "Chilmari Bazar" },
        { id: "chilmari_area1", name: "Area 1" },
        { id: "others_chilmari", name: "Others" },
      ],
      nageshwari: [
        { id: "nageshwari_center", name: "Nageshwari Center" },
        { id: "nageshwari_bazar", name: "Nageshwari Bazar" },
        { id: "nageshwari_area1", name: "Area 1" },
        { id: "others_nageshwari", name: "Others" },
      ],
      phulbari_kurigram: [
        { id: "phulbari_kurigram_center", name: "Phulbari Kurigram Center" },
        { id: "phulbari_kurigram_bazar", name: "Phulbari Kurigram Bazar" },
        { id: "phulbari_kurigram_area1", name: "Area 1" },
        { id: "others_phulbari_kurigram", name: "Others" },
      ],
      rajarhat: [
        { id: "rajarhat_center", name: "Rajarhat Center" },
        { id: "rajarhat_bazar", name: "Rajarhat Bazar" },
        { id: "rajarhat_area1", name: "Area 1" },
        { id: "others_rajarhat", name: "Others" },
      ],
      roumari: [
        { id: "roumari_center", name: "Roumari Center" },
        { id: "roumari_bazar", name: "Roumari Bazar" },
        { id: "roumari_area1", name: "Area 1" },
        { id: "others_roumari", name: "Others" },
      ],
      ulipur: [
        { id: "ulipur_center", name: "Ulipur Center" },
        { id: "ulipur_bazar", name: "Ulipur Bazar" },
        { id: "ulipur_area1", name: "Area 1" },
        { id: "others_ulipur", name: "Others" },
      ],
      lalmonirhat_sadar: [
        { id: "lalmonirhat_sadar_center", name: "Lalmonirhat Sadar Center" },
        { id: "lalmonirhat_sadar_bazar", name: "Lalmonirhat Sadar Bazar" },
        { id: "lalmonirhat_sadar_area1", name: "Area 1" },
        { id: "others_lalmonirhat_sadar", name: "Others" },
      ],
      aditmari: [
        { id: "aditmari_center", name: "Aditmari Center" },
        { id: "aditmari_bazar", name: "Aditmari Bazar" },
        { id: "aditmari_area1", name: "Area 1" },
        { id: "others_aditmari", name: "Others" },
      ],
      hatibandha: [
        { id: "hatibandha_center", name: "Hatibandha Center" },
        { id: "hatibandha_bazar", name: "Hatibandha Bazar" },
        { id: "hatibandha_area1", name: "Area 1" },
        { id: "others_hatibandha", name: "Others" },
      ],
      kaliganj_lalmonirhat: [
        {
          id: "kaliganj_lalmonirhat_center",
          name: "Kaliganj Lalmonirhat Center",
        },
        {
          id: "kaliganj_lalmonirhat_bazar",
          name: "Kaliganj Lalmonirhat Bazar",
        },
        { id: "kaliganj_lalmonirhat_area1", name: "Area 1" },
        { id: "others_kaliganj_lalmonirhat", name: "Others" },
      ],
      patgram: [
        { id: "patgram_center", name: "Patgram Center" },
        { id: "patgram_bazar", name: "Patgram Bazar" },
        { id: "patgram_area1", name: "Area 1" },
        { id: "others_patgram", name: "Others" },
      ],
      nilphamari_sadar: [
        { id: "nilphamari_sadar_center", name: "Nilphamari Sadar Center" },
        { id: "nilphamari_sadar_bazar", name: "Nilphamari Sadar Bazar" },
        { id: "nilphamari_sadar_area1", name: "Area 1" },
        { id: "others_nilphamari_sadar", name: "Others" },
      ],
      domar: [
        { id: "domar_center", name: "Domar Center" },
        { id: "domar_bazar", name: "Domar Bazar" },
        { id: "domar_area1", name: "Area 1" },
        { id: "others_domar", name: "Others" },
      ],
      dimla: [
        { id: "dimla_center", name: "Dimla Center" },
        { id: "dimla_bazar", name: "Dimla Bazar" },
        { id: "dimla_area1", name: "Area 1" },
        { id: "others_dimla", name: "Others" },
      ],
      jaldhaka: [
        { id: "jaldhaka_center", name: "Jaldhaka Center" },
        { id: "jaldhaka_bazar", name: "Jaldhaka Bazar" },
        { id: "jaldhaka_area1", name: "Area 1" },
        { id: "others_jaldhaka", name: "Others" },
      ],
      kishoreganj_nilphamari: [
        {
          id: "kishoreganj_nilphamari_center",
          name: "Kishoreganj Nilphamari Center",
        },
        {
          id: "kishoreganj_nilphamari_bazar",
          name: "Kishoreganj Nilphamari Bazar",
        },
        { id: "kishoreganj_nilphamari_area1", name: "Area 1" },
        { id: "others_kishoreganj_nilphamari", name: "Others" },
      ],
      saidpur: [
        { id: "saidpur_center", name: "Saidpur Center" },
        { id: "saidpur_bazar", name: "Saidpur Bazar" },
        { id: "saidpur_area1", name: "Area 1" },
        { id: "others_saidpur", name: "Others" },
      ],
      panchagarh_sadar: [
        { id: "panchagarh_sadar_center", name: "Panchagarh Sadar Center" },
        { id: "panchagarh_sadar_bazar", name: "Panchagarh Sadar Bazar" },
        { id: "panchagarh_sadar_area1", name: "Area 1" },
        { id: "others_panchagarh_sadar", name: "Others" },
      ],
      atwari: [
        { id: "atwari_center", name: "Atwari Center" },
        { id: "atwari_bazar", name: "Atwari Bazar" },
        { id: "atwari_area1", name: "Area 1" },
        { id: "others_atwari", name: "Others" },
      ],
      boda: [
        { id: "boda_center", name: "Boda Center" },
        { id: "boda_bazar", name: "Boda Bazar" },
        { id: "boda_area1", name: "Area 1" },
        { id: "others_boda", name: "Others" },
      ],
      debiganj: [
        { id: "debiganj_center", name: "Debiganj Center" },
        { id: "debiganj_bazar", name: "Debiganj Bazar" },
        { id: "debiganj_area1", name: "Area 1" },
        { id: "others_debiganj", name: "Others" },
      ],
      tetulia: [
        { id: "tetulia_center", name: "Tetulia Center" },
        { id: "tetulia_bazar", name: "Tetulia Bazar" },
        { id: "tetulia_area1", name: "Area 1" },
        { id: "others_tetulia", name: "Others" },
      ],
      thakurgaon_sadar: [
        { id: "thakurgaon_sadar_center", name: "Thakurgaon Sadar Center" },
        { id: "thakurgaon_sadar_bazar", name: "Thakurgaon Sadar Bazar" },
        { id: "thakurgaon_sadar_area1", name: "Area 1" },
        { id: "others_thakurgaon_sadar", name: "Others" },
      ],
      baliadangi: [
        { id: "baliadangi_center", name: "Baliadangi Center" },
        { id: "baliadangi_bazar", name: "Baliadangi Bazar" },
        { id: "baliadangi_area1", name: "Area 1" },
        { id: "others_baliadangi", name: "Others" },
      ],
      haripur: [
        { id: "haripur_center", name: "Haripur Center" },
        { id: "haripur_bazar", name: "Haripur Bazar" },
        { id: "haripur_area1", name: "Area 1" },
        { id: "others_haripur", name: "Others" },
      ],
      pirganj_thakurgaon: [
        { id: "pirganj_thakurgaon_center", name: "Pirganj Thakurgaon Center" },
        { id: "pirganj_thakurgaon_bazar", name: "Pirganj Thakurgaon Bazar" },
        { id: "pirganj_thakurgaon_area1", name: "Area 1" },
        { id: "others_pirganj_thakurgaon", name: "Others" },
      ],
      ranisankail: [
        { id: "ranisankail_center", name: "Ranisankail Center" },
        { id: "ranisankail_bazar", name: "Ranisankail Bazar" },
        { id: "ranisankail_area1", name: "Area 1" },
        { id: "others_ranisankail", name: "Others" },
      ],
      mymensingh_sadar: [
        { id: "mymensingh_sadar_center", name: "Mymensingh Sadar Center" },
        { id: "mymensingh_sadar_bazar", name: "Mymensingh Sadar Bazar" },
        { id: "mymensingh_sadar_area1", name: "Area 1" },
        { id: "others_mymensingh_sadar", name: "Others" },
      ],
      bhaluka: [
        { id: "bhaluka_center", name: "Bhaluka Center" },
        { id: "bhaluka_bazar", name: "Bhaluka Bazar" },
        { id: "bhaluka_area1", name: "Area 1" },
        { id: "others_bhaluka", name: "Others" },
      ],
      dhobaura: [
        { id: "dhobaura_center", name: "Dhobaura Center" },
        { id: "dhobaura_bazar", name: "Dhobaura Bazar" },
        { id: "dhobaura_area1", name: "Area 1" },
        { id: "others_dhobaura", name: "Others" },
      ],
      fulbaria: [
        { id: "fulbaria_center", name: "Fulbaria Center" },
        { id: "fulbaria_bazar", name: "Fulbaria Bazar" },
        { id: "fulbaria_area1", name: "Area 1" },
        { id: "others_fulbaria", name: "Others" },
      ],
      gafargaon: [
        { id: "gafargaon_center", name: "Gafargaon Center" },
        { id: "gafargaon_bazar", name: "Gafargaon Bazar" },
        { id: "gafargaon_area1", name: "Area 1" },
        { id: "others_gafargaon", name: "Others" },
      ],
      gauripur: [
        { id: "gauripur_center", name: "Gauripur Center" },
        { id: "gauripur_bazar", name: "Gauripur Bazar" },
        { id: "gauripur_area1", name: "Area 1" },
        { id: "others_gauripur", name: "Others" },
      ],
      haluaghat: [
        { id: "haluaghat_center", name: "Haluaghat Center" },
        { id: "haluaghat_bazar", name: "Haluaghat Bazar" },
        { id: "haluaghat_area1", name: "Area 1" },
        { id: "others_haluaghat", name: "Others" },
      ],
      ishwarganj: [
        { id: "ishwarganj_center", name: "Ishwarganj Center" },
        { id: "ishwarganj_bazar", name: "Ishwarganj Bazar" },
        { id: "ishwarganj_area1", name: "Area 1" },
        { id: "others_ishwarganj", name: "Others" },
      ],
      muktagachha: [
        { id: "muktagachha_center", name: "Muktagachha Center" },
        { id: "muktagachha_bazar", name: "Muktagachha Bazar" },
        { id: "muktagachha_area1", name: "Area 1" },
        { id: "others_muktagachha", name: "Others" },
      ],
      nandail: [
        { id: "nandail_center", name: "Nandail Center" },
        { id: "nandail_bazar", name: "Nandail Bazar" },
        { id: "nandail_area1", name: "Area 1" },
        { id: "others_nandail", name: "Others" },
      ],
      phulpur: [
        { id: "phulpur_center", name: "Phulpur Center" },
        { id: "phulpur_bazar", name: "Phulpur Bazar" },
        { id: "phulpur_area1", name: "Area 1" },
        { id: "others_phulpur", name: "Others" },
      ],
      trishal: [
        { id: "trishal_center", name: "Trishal Center" },
        { id: "trishal_bazar", name: "Trishal Bazar" },
        { id: "trishal_area1", name: "Area 1" },
        { id: "others_trishal", name: "Others" },
      ],
      jamalpur_sadar: [
        { id: "jamalpur_sadar_center", name: "Jamalpur Sadar Center" },
        { id: "jamalpur_sadar_bazar", name: "Jamalpur Sadar Bazar" },
        { id: "jamalpur_sadar_area1", name: "Area 1" },
        { id: "others_jamalpur_sadar", name: "Others" },
      ],
      bakshiganj: [
        { id: "bakshiganj_center", name: "Bakshiganj Center" },
        { id: "bakshiganj_bazar", name: "Bakshiganj Bazar" },
        { id: "bakshiganj_area1", name: "Area 1" },
        { id: "others_bakshiganj", name: "Others" },
      ],
      dewanganj: [
        { id: "dewanganj_center", name: "Dewanganj Center" },
        { id: "dewanganj_bazar", name: "Dewanganj Bazar" },
        { id: "dewanganj_area1", name: "Area 1" },
        { id: "others_dewanganj", name: "Others" },
      ],
      islampur_jamalpur: [
        { id: "islampur_jamalpur_center", name: "Islampur Jamalpur Center" },
        { id: "islampur_jamalpur_bazar", name: "Islampur Jamalpur Bazar" },
        { id: "islampur_jamalpur_area1", name: "Area 1" },
        { id: "others_islampur_jamalpur", name: "Others" },
      ],
      madarganj: [
        { id: "madarganj_center", name: "Madarganj Center" },
        { id: "madarganj_bazar", name: "Madarganj Bazar" },
        { id: "madarganj_area1", name: "Area 1" },
        { id: "others_madarganj", name: "Others" },
      ],
      melandaha: [
        { id: "melandaha_center", name: "Melandaha Center" },
        { id: "melandaha_bazar", name: "Melandaha Bazar" },
        { id: "melandaha_area1", name: "Area 1" },
        { id: "others_melandaha", name: "Others" },
      ],
      sarishabari: [
        { id: "sarishabari_center", name: "Sarishabari Center" },
        { id: "sarishabari_bazar", name: "Sarishabari Bazar" },
        { id: "sarishabari_area1", name: "Area 1" },
        { id: "others_sarishabari", name: "Others" },
      ],
      netrokona_sadar: [
        { id: "netrokona_sadar_center", name: "Netrokona Sadar Center" },
        { id: "netrokona_sadar_bazar", name: "Netrokona Sadar Bazar" },
        { id: "netrokona_sadar_area1", name: "Area 1" },
        { id: "others_netrokona_sadar", name: "Others" },
      ],
      atpara: [
        { id: "atpara_center", name: "Atpara Center" },
        { id: "atpara_bazar", name: "Atpara Bazar" },
        { id: "atpara_area1", name: "Area 1" },
        { id: "others_atpara", name: "Others" },
      ],
      barhatta: [
        { id: "barhatta_center", name: "Barhatta Center" },
        { id: "barhatta_bazar", name: "Barhatta Bazar" },
        { id: "barhatta_area1", name: "Area 1" },
        { id: "others_barhatta", name: "Others" },
      ],
      durgapur_netrokona: [
        { id: "durgapur_netrokona_center", name: "Durgapur Netrokona Center" },
        { id: "durgapur_netrokona_bazar", name: "Durgapur Netrokona Bazar" },
        { id: "durgapur_netrokona_area1", name: "Area 1" },
        { id: "others_durgapur_netrokona", name: "Others" },
      ],
      kalmakanda: [
        { id: "kalmakanda_center", name: "Kalmakanda Center" },
        { id: "kalmakanda_bazar", name: "Kalmakanda Bazar" },
        { id: "kalmakanda_area1", name: "Area 1" },
        { id: "others_kalmakanda", name: "Others" },
      ],
      kendua: [
        { id: "kendua_center", name: "Kendua Center" },
        { id: "kendua_bazar", name: "Kendua Bazar" },
        { id: "kendua_area1", name: "Area 1" },
        { id: "others_kendua", name: "Others" },
      ],
      khaliajuri: [
        { id: "khaliajuri_center", name: "Khaliajuri Center" },
        { id: "khaliajuri_bazar", name: "Khaliajuri Bazar" },
        { id: "khaliajuri_area1", name: "Area 1" },
        { id: "others_khaliajuri", name: "Others" },
      ],
      madan: [
        { id: "madan_center", name: "Madan Center" },
        { id: "madan_bazar", name: "Madan Bazar" },
        { id: "madan_area1", name: "Area 1" },
        { id: "others_madan", name: "Others" },
      ],
      mohanganj: [
        { id: "mohanganj_center", name: "Mohanganj Center" },
        { id: "mohanganj_bazar", name: "Mohanganj Bazar" },
        { id: "mohanganj_area1", name: "Area 1" },
        { id: "others_mohanganj", name: "Others" },
      ],
      purbadhala: [
        { id: "purbadhala_center", name: "Purbadhala Center" },
        { id: "purbadhala_bazar", name: "Purbadhala Bazar" },
        { id: "purbadhala_area1", name: "Area 1" },
        { id: "others_purbadhala", name: "Others" },
      ],
      sherpur_sadar: [
        { id: "sherpur_sadar_center", name: "Sherpur Sadar Center" },
        { id: "sherpur_sadar_bazar", name: "Sherpur Sadar Bazar" },
        { id: "sherpur_sadar_area1", name: "Area 1" },
        { id: "others_sherpur_sadar", name: "Others" },
      ],
      jhenaigati: [
        { id: "jhenaigati_center", name: "Jhenaigati Center" },
        { id: "jhenaigati_bazar", name: "Jhenaigati Bazar" },
        { id: "jhenaigati_area1", name: "Area 1" },
        { id: "others_jhenaigati", name: "Others" },
      ],
      nakla: [
        { id: "nakla_center", name: "Nakla Center" },
        { id: "nakla_bazar", name: "Nakla Bazar" },
        { id: "nakla_area1", name: "Area 1" },
        { id: "others_nakla", name: "Others" },
      ],
      nalitabari: [
        { id: "nalitabari_center", name: "Nalitabari Center" },
        { id: "nalitabari_bazar", name: "Nalitabari Bazar" },
        { id: "nalitabari_area1", name: "Area 1" },
        { id: "others_nalitabari", name: "Others" },
      ],
      sreebardi: [
        { id: "sreebardi_center", name: "Sreebardi Center" },
        { id: "sreebardi_bazar", name: "Sreebardi Bazar" },
        { id: "sreebardi_area1", name: "Area 1" },
        { id: "others_sreebardi", name: "Others" },
      ],
    },
  };

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
