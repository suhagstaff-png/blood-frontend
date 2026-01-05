import axios from "axios";
import { useEffect, useRef, useState } from "react";

/**
 * SuccessStore.jsx
 * - Fetches /api/stats to get donors, donations, lives (successfulSearches), districts and targets
 * - Smoothly animates numbers when section becomes visible
 * - Calculates progress percentage from targets
 * - Has manual refresh and optional polling
 */

const SuccessStore = ({ apiBase = "http://localhost:5000" }) => {
  const [counters, setCounters] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    districts: 0,
  });

  const [targets, setTargets] = useState({
    donors: 300000,
    donations: 600000,
    lives: 1000000,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const animRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // IntersectionObserver to trigger animation & fetch when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    const el = document.getElementById("achievement-section");
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // fetch stats from backend
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/stats`);
      if (res.data && res.data.data) {
        const data = res.data.data;
        const payload = {
          donors: Number(data.donors) || 0,
          donations: Number(data.donations) || 0,
          // use successfulSearches as "lives" (how many searches resulted successfully)
          lives: Number(data.successfulSearches ?? data.lives) || 0,
          districts: Number(data.districts) || 0,
        };
        const tg = data.targets || targets;
        // set immediate targets (used in progress bars)
        setTargets({
          donors: Number(tg.donors) || targets.donors,
          donations: Number(tg.donations) || targets.donations,
          lives: Number(tg.lives) || targets.lives,
        });
        setLastUpdated(data.updatedAt ? new Date(data.updatedAt) : new Date());
        // animate from current to payload
        animateCounters(payload, 1600);
      } else {
        console.warn("Invalid stats response", res.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // animate counters smoothly using requestAnimationFrame
  const animateCounters = (targetsObj, duration = 1500) => {
    const start = performance.now();
    const initial = { ...counters };

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const next = {};
      Object.keys(targetsObj).forEach((k) => {
        const from = initial[k] || 0;
        const to = targetsObj[k] || 0;
        next[k] = Math.floor(from + (to - from) * easeOutCubic);
      });

      if (mountedRef.current) setCounters(next);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // ensure final exact values
        if (mountedRef.current)
          setCounters({
            donors: Math.floor(targetsObj.donors || 0),
            donations: Math.floor(targetsObj.donations || 0),
            lives: Math.floor(targetsObj.lives || 0),
            districts: Math.floor(targetsObj.districts || 0),
          });
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
  };

  // format number to English grouping
  const formatNumber = (num) => {
    return Number(num).toLocaleString("en-US");
  };

  // progress percent helpers
  const percent = (value, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((value / target) * 100));
  };

  // initial fetch when component mounts or when it becomes visible
  useEffect(() => {
    // fetch immediately once (so page shows something even if not visible)
    fetchStats();

    // optional: polling every 60s to keep fresh (you can change or remove)
    const interval = setInterval(() => {
      fetchStats();
    }, 60_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if element becomes visible and counters still zero, fetch/animate
  useEffect(() => {
    if (isVisible && !loading) {
      // animate again to current targets (useful when user scrolls back)
      animateCounters(
        {
          donors: counters.donors,
          donations: counters.donations,
          lives: counters.lives,
          districts: counters.districts,
        },
        700
      );
    }
    // eslint-disable-next-line
  }, [isVisible]);

  // manual refresh handler
  const handleRefresh = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen">
      <section
        id="achievement-section"
        className="py-20 bg-gradient-to-br from-red-800 via-red-600 to-red-700 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-2 h-12 bg-white rounded-full mr-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Our Achievements
              </h2>
              <div className="w-2 h-12 bg-white rounded-full ml-4" />
            </div>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium">
              The story of our journey in numbers - behind every statistic are
              thousands of life-saving stories
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  value: counters.donors,
                  suffix: "+",
                  label: "Registered Donors",
                  icon: "👥",
                  description: "Active registrations",
                  color: "from-orange-400 to-red-500",
                },
                {
                  value: counters.donations,
                  suffix: "+",
                  label: "Successful Donations",
                  icon: "💉",
                  description: "Blood units collected",
                  color: "from-green-400 to-emerald-500",
                },
                {
                  value: counters.lives,
                  suffix: "+",
                  label: "Successful Search Requests",
                  icon: "❤️",
                  description: "Patients who found blood",
                  color: "from-pink-400 to-rose-500",
                },
                {
                  value: counters.districts,
                  suffix: "",
                  label: "District Coverage",
                  icon: "🗺️",
                  description: "Nationwide presence",
                  color: "from-blue-400 to-cyan-500",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:border-opacity-60 transition-all duration-500 hover:scale-105 group"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div
                      className={`text-3xl md:text-4xl font-bold text-white mb-2 transition-all duration-700 ${
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      {formatNumber(stat.value)}
                      <span className="text-red-100">{stat.suffix}</span>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {stat.label}
                    </div>
                    <div className="text-red-100 text-sm font-medium">
                      {stat.description}
                    </div>
                    <div
                      className={`w-12 h-1 bg-gradient-to-r ${stat.color} rounded-full mx-auto mt-3 group-hover:w-16 transition-all duration-300`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Our Journey Milestones
              </h3>

              <div className="space-y-6">
                {[
                  {
                    label: "Donor Growth",
                    value: counters.donors,
                    target: targets.donors,
                    color: "bg-red-400",
                  },
                  {
                    label: "District Coverage",
                    value: counters.districts,
                    target: Math.max(Math.round(targets.donors / 5000), 64),
                    color: "bg-green-400",
                  },
                  {
                    label: "Emergency Services (Donations)",
                    value: counters.donations,
                    target: targets.donations,
                    color: "bg-blue-400",
                  },
                  {
                    label: "Successful Search Requests",
                    value: counters.lives,
                    target: targets.lives,
                    color: "bg-purple-400",
                  },
                ].map((p, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-white">
                        {p.label}
                      </span>
                      <span className="text-red-100 font-medium">
                        {percent(p.value, p.target)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${p.color} transition-all duration-1000 ease-out group-hover:shadow-lg`}
                        style={{
                          width: isVisible
                            ? `${percent(p.value, p.target)}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-red-100">
                      {formatNumber(p.value)} / {formatNumber(p.target)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/20 rounded-xl border border-white/40">
                <div className="flex items-center text-white">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <div className="font-semibold text-white">
                      Current Targets
                    </div>
                    <div className="text-red-100 text-sm font-medium">
                      Donor Target: {formatNumber(targets.donors)} · Donation
                      Target: {formatNumber(targets.donations)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                  <div className="text-white font-bold text-lg">
                    {percent(counters.donors, targets.donors)}%
                  </div>
                  <div className="text-red-100 text-xs font-medium">
                    Registration vs Target
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                  <div className="text-white font-bold text-lg">
                    {percent(counters.donations, targets.donations)}%
                  </div>
                  <div className="text-red-100 text-xs font-medium">
                    Donations Completed
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {loading ? "Refreshing..." : "Refresh Stats"}
                </button>
                <div className="mt-2 text-xs text-red-100">
                  {!lastUpdated
                    ? ""
                    : `Last updated: ${lastUpdated.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            {[
              {
                number: "99%",
                label: "Safe Blood Donation",
                icon: "🛡️",
                color: "text-green-300",
              },
              {
                number: "24/7",
                label: "Service Availability",
                icon: "⏰",
                color: "text-blue-300",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/30 hover:border-opacity-60 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-white text-sm font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-white/20 backdrop-blur-lg rounded-2xl px-8 py-6 border border-white/40">
              <p className="text-lg text-white italic font-medium">
                "Every drop of blood carries the relentless desire to save lives
                - let's build a healthy nation together"
              </p>
              <div className="w-16 h-1 bg-red-200 rounded-full mx-auto mt-3" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-200 to-transparent animate-pulse" />
      </section>
    </div>
  );
};

export default SuccessStore;
