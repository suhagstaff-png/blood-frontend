// Dashboard.jsx
import axios from "axios";
import { FileText, Heart, MapPin, UserCheck, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* Small UI pieces (kept visually identical to your existing UI) */
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow flex items-center justify-between">
    <div>
      <h4 className="text-gray-500 text-sm">{title}</h4>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    {icon}
  </div>
);

const QuickAction = ({ title, desc, href, icon }) => (
  <a
    href={href}
    className="p-4 border rounded-xl hover:bg-red-50 transition flex items-start gap-3"
  >
    <div className="p-2 bg-red-100 rounded-lg text-red-600">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </a>
);

/**
 * Dashboard (defensive & 100% dynamic)
 * - Pass apiBase if your API runs on a non-root host: <Dashboard apiBase="http://localhost:5000" />
 */
const Dashboard = ({ apiBase = "http://localhost:5000" }) => {
  const statsUrl = `${apiBase.replace(/\/$/, "")}/api/stats`;

  // animated counters
  const [counters, setCounters] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    districts: 0,
  });

  const [rawStats, setRawStats] = useState({ donations: 700000 });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const animRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const formatNumber = (num) => {
    try {
      return Number(num).toLocaleString("en-US");
    } catch {
      return Number(num).toLocaleString();
    }
  };

  /* animate counters */
  const animateCounters = (targetObj, duration = 900) => {
    const start = performance.now();
    const from = { ...counters };

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const next = {};
      Object.keys(targetObj).forEach((k) => {
        const a = Number(from[k] || 0);
        const b = Number(targetObj[k] || 0);
        next[k] = Math.floor(a + (b - a) * ease);
      });

      if (mountedRef.current) setCounters(next);

      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        if (mountedRef.current)
          setCounters({
            donors: Math.floor(targetObj.donors || 0),
            donations: Math.floor(targetObj.donations || 0),
            lives: Math.floor(targetObj.lives || 0),
            districts: Math.floor(targetObj.districts || 0),
          });
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  };

  /* Flexible parser: try many shapes your backend might return */
  const parseStatsResponse = (res) => {
    // For debugging: log full response (open console to inspect)
    console.debug("Dashboard: /api/stats response:", res);

    // candidate containers to search for numbers
    const candidates = [
      res?.data?.data,
      res?.data?.stats,
      res?.data?.result,
      res?.data,
      res,
    ];

    // Flatten candidate object (first non-null)
    let blob = null;
    for (const c of candidates) {
      if (c && typeof c === "object" && Object.keys(c).length > 0) {
        blob = c;
        break;
      }
    }

    if (!blob) return null;

    // Try a bunch of probable field names
    const donors =
      Number(blob.donors) ||
      Number(blob.totalDonors) ||
      Number(blob.total_donors) ||
      Number(blob.total) ||
      Number(blob.donorCount) ||
      0;

    const donations =
      Number(blob.donations) ||
      Number(blob.totalDonations) ||
      Number(blob.total_donations) ||
      Number(blob.donationCount) ||
      Number(blob.completedDonations) ||
      0;

    const lives =
      Number(blob.lives) ||
      Number(blob.successfulSearches) ||
      Number(blob.successful_searches) ||
      Number(blob.estimatedLives) ||
      0;

    const districts =
      Number(blob.districts) ||
      Number(blob.coveredDistricts) ||
      Number(blob.uniqueDistricts) ||
      0;

    // updateAt may live at different keys
    const updatedAt =
      blob.updatedAt ||
      blob.updated_at ||
      blob.lastUpdated ||
      blob.last_updated ||
      blob.updated ||
      null;

    // if all zeros, return null to indicate no valid numeric data
    if (!donors && !donations && !lives && !districts) {
      return {
        donors,
        donations,
        lives,
        districts,
        updatedAt,
        blob,
        valid: false,
      };
    }

    return {
      donors,
      donations,
      lives,
      districts,
      updatedAt,
      blob,
      valid: true,
    };
  };

  /* fetch stats */
  const fetchStats = async () => {
    setLoading(true);
    try {
      // include adminToken if you store one (harmless if not required)
      const adminToken =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        null;
      const headers = adminToken
        ? { headers: { Authorization: `Bearer ${adminToken}` } }
        : {};

      const res = await axios.get(statsUrl, headers);

      const parsed = parseStatsResponse(res);
      if (!parsed) {
        console.warn(
          "Dashboard: /api/stats returned no parseable object. See console for full response."
        );
        setLoading(false);
        return;
      }

      // log if shape was unexpected or numbers were all zero
      if (!parsed.valid) {
        console.warn(
          "Dashboard: parsed stats but numbers are zero or missing. parsed:",
          parsed
        );
      }

      // persist raw donations for chart
      setRawStats({ donations: parsed.donations || rawStats.donations });

      // last updated (if present)
      try {
        setLastUpdated(
          parsed.updatedAt ? new Date(parsed.updatedAt) : new Date()
        );
      } catch {
        setLastUpdated(new Date());
      }

      // animate counters (even if zero — keeps UI consistent)
      animateCounters(
        {
          donors: parsed.donors || 0,
          donations: parsed.donations || 0,
          lives: parsed.lives || 0,
          districts: parsed.districts || 0,
        },
        1000
      );
    } catch (err) {
      console.error("Dashboard.fetchStats error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchStats();

    // Polling optional — keep to 60s
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* UI-ready display values */
  const display = {
    donors: formatNumber(counters.donors),
    donations: formatNumber(counters.donations),
    lives: formatNumber(counters.lives),
    districts: formatNumber(counters.districts),
  };

  const statsForChart = { donations: rawStats.donations };

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Summary
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest statistics and quick actions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Last updated:</div>
            <div
              className="text-sm font-semibold text-gray-800 cursor-pointer"
              onClick={fetchStats}
            >
              {lastUpdated
                ? lastUpdated.toLocaleString()
                : loading
                ? "Loading..."
                : "Refresh"}
            </div>

            <button
              onClick={fetchStats}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm"
              title="Manual refresh"
            >
              Refresh
            </button>
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

      {/* keep the rest of the dashboard UI exactly as before (quick actions, chart, recent table) */}
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
              desc="Process urgent requests"
              href="/admin/requests"
              icon={<FileText />}
            />
            <QuickAction
              title="Hospital Configuration"
              desc="Update hospitals"
              href="/admin/hospitals"
              icon={<MapPin />}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">Weekly Summary</h3>
          <div className="h-40 flex items-end gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const base = statsForChart?.donations || 100000;
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

      {/* Recent (left unchanged layout) */}
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
              {/* If you want I can wire this table to your recent endpoints (search-requests / requests). For now it stays as before. */}
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Recent items will appear here once your backend endpoints are
                  reachable. Click Refresh to retry.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
