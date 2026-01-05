// AdminPanelLeft.jsx
import axios from "axios";
import {
  Bell,
  FileText,
  Grid,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminDonors from "./AdminDonors";
import BloodBank from "./BloodBank";
import Dashboard from "./Dashboard";
import DonationsView from "./DonationsView";

/**
 * AdminPanelLeft.jsx
 * - Left collapsible sidebar
 * - Topbar with admin name & logout
 * - Main content area with multiple views
 * - Sync active tab to query param: ?tab=donors (so reload preserves tab)
 *
 * Drop into a route: <Route path="/admin" element={<AdminPanelLeft />} />
 */

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: <Grid className="w-5 h-5" /> },
  { id: "donors", label: "Donors", icon: <Users className="w-5 h-5" /> },
  { id: "donations", label: "Donations", icon: <Heart className="w-5 h-5" /> },
  // { id: "requests", label: "Requests", icon: <FileText className="w-5 h-5" /> },
  {
    id: "hospitals",
    label: "Blood Bank",
    icon: <MapPin className="w-5 h-5" />,
  },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

const AdminPanelLeft = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialTab = query.get("tab") || "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    districts: 0,
  });
  const [displayCounters, setDisplayCounters] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    districts: 0,
  });
  const animRef = useRef([]);

  const adminToken = localStorage.getItem("adminToken");
  const adminName = (function () {
    const raw =
      localStorage.getItem("adminName") || localStorage.getItem("user");
    if (!raw) return "Admin";
    try {
      const parsed = JSON.parse(raw);
      return parsed?.fullName || parsed?.name || raw;
    } catch {
      return raw;
    }
  })();

  // Sync active tab with URL ?tab=...
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get("tab") || "dashboard";
    setActive(t);
  }, [location.search]);

  // On mount or when dashboard opened: fetch stats
  useEffect(() => {
    if (active === "dashboard") fetchStats();
    return () => {
      animRef.current.forEach((t) => clearInterval(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Fetch stats from API (fallback to mock)
  const fetchStats = async () => {
    setLoading(true);
    const mock = {
      donors: 253647,
      donations: 512893,
      lives: 1025786,
      districts: 64,
    };
    if (!adminToken) {
      setStats(mock);
      animateTo(mock);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 7000,
      });
      const data = res.data || {};
      const fetched = {
        donors: data.donors ?? mock.donors,
        donations: data.donations ?? mock.donations,
        lives: data.lives ?? mock.lives,
        districts: data.districts ?? mock.districts,
      };
      setStats(fetched);
      animateTo(fetched);
    } catch (err) {
      console.error("Fetch stats failed:", err);
      setStats(mock);
      animateTo(mock);
    } finally {
      setLoading(false);
    }
  };

  // Animate counters
  const animateTo = (target) => {
    animRef.current.forEach((t) => clearInterval(t));
    animRef.current = [];

    const duration = 1000;
    const steps = 40;
    const stepDuration = Math.max(8, Math.floor(duration / steps));

    Object.keys(target).forEach((key) => {
      let current = 0;
      const increment = Math.max(1, Math.floor(target[key] / steps));
      const timer = setInterval(() => {
        current += increment;
        if (current >= target[key]) {
          current = target[key];
          clearInterval(timer);
        }
        setDisplayCounters((prev) => ({ ...prev, [key]: current }));
      }, stepDuration);
      animRef.current.push(timer);
    });
  };

  // Change tab handler (updates URL)
  const changeTab = (tabId) => {
    const q = new URLSearchParams(location.search);
    q.set("tab", tabId);
    navigate(
      { pathname: location.pathname, search: q.toString() },
      { replace: true }
    );
    // setActive will be set by location effect
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminName");
    navigate("/");
  };

  // Render main content per tab
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard />;
      case "donors":
        return <AdminDonors />;
      case "donations":
        return <DonationsView />;
      case "requests":
        return <RequestsView />;
      case "hospitals":
        return <BloodBank />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <DashboardView
            stats={stats}
            loading={loading}
            display={displayCounters}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-red-700 text-white sticky top-0 z-40 shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-2 rounded-md bg-red-600/30 hover:bg-red-600/40 transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
                ♥
              </div>
              <div>
                <div className="text-lg font-bold">Admin Panel</div>
                <div className="text-xs text-red-200">
                  Bangladesh Blood Donation System
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-1 gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="outline-none text-sm px-1 py-1 w-48 bg-transparent"
              />
            </div>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="relative p-2 rounded-md hover:bg-red-600/30 transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-red-800 font-bold px-1.5 rounded-full">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 bg-white bg-opacity-10 px-3 py-1 rounded-full">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-red-700 font-semibold">
                {adminName?.charAt(0) ?? "A"}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">{adminName}</div>
                <div className="text-xs text-red-200">Administrator</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-red-700 px-3 py-2 rounded-full font-semibold hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar (left) */}
        <aside
          className={`lg:col-span-3 xl:col-span-2 transition-all duration-200 ${
            sidebarOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl p-4 shadow mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-700">
                  {adminName?.charAt(0) ?? "A"}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{adminName}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => changeTab("dashboard")}
                  className={`flex-1 py-2 text-sm rounded-md ${
                    active === "dashboard"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  Dashboard
                </button>
                {/* <button
                  onClick={() => changeTab("requests")}
                  className={`flex-1 py-2 text-sm rounded-md ${
                    active === "requests"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  Requests
                </button> */}
              </div>
            </div>

            {/* Menu */}
            <nav className="bg-white rounded-2xl p-3 shadow">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md mb-2 text-left transition ${
                    active === t.id
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div
                    className={`${
                      active === t.id ? "text-white" : "text-red-600"
                    }`}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1">{t.label}</div>
                  {t.id === "dashboard" && (
                    <div className="text-xs text-gray-400">Quick</div>
                  )}
                </button>
              ))}

              <div className="border-t mt-3 pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-left text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5" /> <span>Logout</span>
                </button>
              </div>
            </nav>

            {/* Shortcut / quick links */}
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Quick Links</div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/admin/donors"
                  className="block text-center text-sm py-2 rounded-lg bg-white shadow"
                >
                  <Users className="mx-auto" />
                  <div className="text-xs mt-1">Donors</div>
                </a>
                <a
                  href="/admin/donations"
                  className="block text-center text-sm py-2 rounded-lg bg-white shadow"
                >
                  <Heart className="mx-auto" />
                  <div className="text-xs mt-1">Donations</div>
                </a>
                {/* <a
                  href="/admin/requests"
                  className="block text-center text-sm py-2 rounded-lg bg-white shadow"
                >
                  <FileText className="mx-auto" />
                  <div className="text-xs mt-1">Requests</div>
                </a> */}
                <a
                  href="/admin/hospitals"
                  className="block text-center text-sm py-2 rounded-lg bg-white shadow"
                >
                  <MapPin className="mx-auto" />
                  <div className="text-xs mt-1">Blood Bank</div>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-9 xl:col-span-10">{renderContent()}</main>
      </div>
    </div>
  );
};

/* --- Subviews --- */

const DashboardView = ({ stats, loading, display }) => {
  return (
    <div>
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Summary
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest statistics & quick actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Last updated:</div>
            <div className="text-sm font-semibold text-gray-800">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Donors"
          value={display.donors}
          icon={<Users className="w-6 h-6 text-red-600" />}
        />
        <StatCard
          title="Total Donations"
          value={display.donations}
          icon={<Heart className="w-6 h-6 text-yellow-600" />}
        />
        <StatCard
          title="Estimated Lives Saved"
          value={display.lives}
          icon={<UserCheck className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Covered Districts"
          value={display.districts}
          icon={<MapPin className="w-6 h-6 text-indigo-600" />}
        />
      </section>

      {/* Actions + mini chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAction
              title="Manage Donors"
              desc="View donor list"
              href="/admin/donors"
              icon={<Users />}
            />
            <QuickAction
              title="Donation Records"
              desc="Add new records"
              href="/admin/donations"
              icon={<Heart />}
            />
            <QuickAction
              title="Requests"
              desc="Process emergency requests"
              href="/admin/requests"
              icon={<FileText />}
            />
            <QuickAction
              title="Configure Blood Bank"
              desc="Update blood bank"
              href="/admin/hospitals"
              icon={<MapPin />}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">Weekly Summary</h3>
          <div className="h-40 flex items-end gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const base = stats?.donations || 100000;
              const height = Math.max(
                24,
                Math.round((base / 700000) * 160 * ((i + 1) / 7))
              );
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height}px`,
                    background: "linear-gradient(180deg,#ef4444,#b91c1c)",
                  }}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-3">
            Sample data — Connect API for real-time data
          </div>
        </div>
      </section>

      {/* Recent */}
      <section className="bg-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Recent Activity</h3>
          <a
            href="/admin/requests"
            className="text-sm text-red-600 font-semibold"
          >
            View All →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Location</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "REQ-1001",
                  type: "Blood Request",
                  name: "Ahmed",
                  location: "Dhaka",
                  date: "2025-10-25",
                  status: "Pending",
                },
                {
                  id: "DN-9987",
                  type: "New Donor",
                  name: "Nureen",
                  location: "Chattogram",
                  date: "2025-10-27",
                  status: "Approved",
                },
                {
                  id: "DN-9999",
                  type: "Donation",
                  name: "Rafiqul",
                  location: "Rajshahi",
                  date: "2025-10-28",
                  status: "Completed",
                },
              ].map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 text-sm font-medium">{r.id}</td>
                  <td className="py-2 px-2 text-sm">{r.type}</td>
                  <td className="py-2 px-2 text-sm">{r.name}</td>
                  <td className="py-2 px-2 text-sm">{r.location}</td>
                  <td className="py-2 px-2 text-sm">{r.date}</td>
                  <td className="py-2 px-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const DonorsView = ({ search, setSearch }) => {
  // placeholder list — connect your API here
  const [list] = useState([
    {
      id: "D-1001",
      name: "Rafiqul Islam",
      blood: "A+",
      location: "Chattogram",
      lastDonation: "2025-07-10",
    },
    {
      id: "D-1002",
      name: "Sabrin Rahman",
      blood: "B+",
      location: "Dhaka",
      lastDonation: "2025-08-01",
    },
    {
      id: "D-1003",
      name: "Anika Islam",
      blood: "O-",
      location: "Rajshahi",
      lastDonation: "2025-09-12",
    },
  ]);

  const filtered = list.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.blood.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 mb-4 shadow flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Manage Donors</h2>
          <div className="text-sm text-gray-500">
            Donor profiles, search & actions
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name / Blood Group / ID"
            className="px-3 py-2 rounded-lg border outline-none text-sm"
          />
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
            New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Blood Group</th>
                <th className="py-2 px-2">Location</th>
                <th className="py-2 px-2">Last Donation</th>
                <th className="py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{d.id}</td>
                  <td className="py-2 px-2 font-semibold">{d.name}</td>
                  <td className="py-2 px-2">{d.blood}</td>
                  <td className="py-2 px-2">{d.location}</td>
                  <td className="py-2 px-2">{d.lastDonation}</td>
                  <td className="py-2 px-2">
                    <button className="text-sm text-red-600 font-semibold">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RequestsView = () => {
  return (
    <div>
      <PanelHeader
        title="Request Management"
        subtitle="View and accept/cancel emergency requests"
      />
      <div className="bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-600">
          Add request list and action buttons here.
        </p>
      </div>
    </div>
  );
};

const HospitalsView = () => {
  return (
    <div>
      <PanelHeader
        title="Blood Banks & Clinics"
        subtitle="Add/edit blood banks and map"
      />
      <div className="bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-600">
          Display blood bank resources and configuration here.
        </p>
      </div>
    </div>
  );
};

const SettingsView = () => {
  return (
    <div>
      <PanelHeader
        title="System Settings"
        subtitle="App configuration and security"
      />
      <div className="bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-600">
          Settings options — Manage API/SMTP/keys here.
        </p>
      </div>
    </div>
  );
};

/* --- Small helpers --- */

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4 border-l-4 border-red-500">
    <div className="p-3 rounded-lg bg-red-50">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-800">
        {value ? value.toLocaleString() : "—"}
      </div>
    </div>
  </div>
);

const QuickAction = ({ title, desc, href, icon }) => (
  <div className="rounded-lg p-4 border border-gray-100 flex items-start gap-4">
    <div className="p-2 rounded-md bg-gray-50">{icon}</div>
    <div>
      <div className="font-semibold text-gray-800">{title}</div>
      <div className="text-sm text-gray-500 mt-1">{desc}</div>
      <div className="mt-3">
        <a href={href} className="text-sm text-red-600 font-semibold">
          Manage →
        </a>
      </div>
    </div>
  </div>
);

const PanelHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

export default AdminPanelLeft;
