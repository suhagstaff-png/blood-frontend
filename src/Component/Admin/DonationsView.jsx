// DonationsSummary.jsx
import axios from "axios";
import { useEffect, useState } from "react";

/**
 * DonationsSummary.jsx
 *
 * Works with your backend routes:
 *  - GET /api/stats                -> summary numbers (donors, donations, lives, districts)
 *  - GET /api/search-requests     -> list of recent search requests (admin/public route in your app)
 *  - GET /api/donations/history   -> donor-specific history (requires auth token)
 *  - GET /api/donations/my-requests -> donor-specific assigned requests (requires auth)
 *  - PUT /api/donations/:id/accept -> accept a DonationRequest (requires auth; donor must match)
 *
 * Added: "Check location" button that opens Google Maps in a new tab.
 *
 * It will:
 *  - fetch stats and show totals (donations will show from /api/stats.donations)
 *  - fetch search requests and donor history (if token present) and normalize the list
 *  - show accept button when token present (accept may fail if user not the donor — server enforces)
 *
 * Notes:
 *  - This assumes Tailwind CSS is available in your project.
 *  - Token expected in localStorage.token for donor actions (or admin can pass another token).
 */

const DonationsSummary = () => {
  const [stats, setStats] = useState(null);
  const [searchRequests, setSearchRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [combined, setCombined] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const token = localStorage.getItem("token"); // donor token (for accept)
  const adminToken = localStorage.getItem("adminToken"); // optional admin token if you store it
  const authHeaders = (useAdmin = false) =>
    useAdmin
      ? { headers: { Authorization: `Bearer ${adminToken}` } }
      : token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

  useEffect(() => {
    fetchStats();
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // whenever underlying lists change, recompute a normalized combined list for UI
    const normalized = [];

    // normalize search requests
    searchRequests.forEach((sr) => {
      normalized.push({
        id: sr._id || sr.id,
        source: "searchRequest",
        patientName: sr.patientInfo?.patientName || sr.patientName || "",
        bloodGroup: sr.patientInfo?.bloodGroup || sr.filters?.bloodGroup || "",
        bags: sr.patientInfo?.bloodBagsNeeded || 1,
        requester: sr.browserId ? `Search (${sr.browserId})` : "Search Request",
        phone: "",
        status: sr.status || "active",
        createdAt: sr.searchDate || sr.createdAt || sr.updatedAt,
        raw: sr,
      });
    });

    // normalize donation history (your user.donationHistory entries)
    donationHistory.forEach((h) => {
      normalized.push({
        id: h.requestId || h._id || Math.random().toString(36).slice(2, 9),
        source: "donationHistory",
        patientName: h.patientInfo?.patientName || "",
        bloodGroup: h.patientInfo?.bloodGroup || "",
        bags: h.patientInfo?.bloodBagsNeeded || 1,
        requester: "Accepted (history)",
        phone: "",
        status: "accepted",
        createdAt: h.acceptedAt || h.date || h.createdAt,
        raw: h,
      });
    });

    // normalize my incoming requests
    myRequests.forEach((r) => {
      normalized.push({
        id: r._id || r.id,
        source: "donationRequest",
        patientName: r.patientInfo?.patientName || "",
        bloodGroup: r.patientInfo?.bloodGroup || "",
        bags: r.patientInfo?.bloodBagsNeeded || 1,
        requester: r.requesterName || "Requester",
        phone: r.requesterPhone || "",
        status: r.status || "pending",
        createdAt: r.createdAt || r.date,
        raw: r,
      });
    });

    // sort by createdAt desc
    normalized.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    setCombined(normalized);
  }, [searchRequests, donationHistory, myRequests]);

  // Fetch stats from /api/stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get("http://localhost:5000/api/stats");
      setStats(res.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch search requests and user-specific donation endpoints
  const fetchLists = async () => {
    setLoadingList(true);

    // 1) GET all search requests (admin/public)
    try {
      const res = await axios.get(
        "http://localhost:5000/api/search-requests",
        authHeaders(true)
      ); // try admin token first if present
      const items =
        res.data?.data?.searchRequests || res.data?.searchRequests || [];
      setSearchRequests(items);
    } catch (err) {
      // fallback: try without admin header
      try {
        const res2 = await axios.get(
          "http://localhost:5000/api/search-requests"
        );
        const items =
          res2.data?.data?.searchRequests || res2.data?.searchRequests || [];
        setSearchRequests(items);
      } catch (err2) {
        console.warn(
          "Could not load /api/search-requests:",
          err2.message || err2
        );
        setSearchRequests([]);
      }
    }

    // 2) If token exists, get donor-specific history & my-requests
    if (token) {
      try {
        const resHist = await axios.get(
          "http://localhost:5000/api/donations/history",
          authHeaders()
        );
        setDonationHistory(resHist.data?.data?.history || []);
      } catch (err) {
        // no-op if protected or not available
        console.warn("donation history load failed:", err.message || err);
        setDonationHistory([]);
      }

      try {
        const resMy = await axios.get(
          "http://localhost:5000/api/donations/my-requests",
          authHeaders()
        );
        setMyRequests(resMy.data?.data?.requests || []);
      } catch (err) {
        console.warn("my-requests load failed:", err.message || err);
        setMyRequests([]);
      }
    } else {
      setDonationHistory([]);
      setMyRequests([]);
    }

    setLoadingList(false);
  };

  // Accept a request: PUT /api/donations/:id/accept
  const handleAccept = async (id) => {
    if (!token) {
      alert("You must be logged in to accept requests (token missing).");
      return;
    }
    if (!window.confirm("Are you sure you want to accept this request?"))
      return;

    try {
      setProcessingId(id);
      const res = await axios.put(
        `/api/donations/${id}/accept`,
        {},
        authHeaders()
      );
      // update lists & stats
      await fetchLists();
      await fetchStats();
      alert("Request accepted successfully.");
    } catch (err) {
      console.error(
        "Accept failed:",
        err?.response?.data || err.message || err
      );
      const msg =
        err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Accept failed: ${msg}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Format date/time
  const fmt = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch (e) {
      return String(d);
    }
  };

  // ---------- Location helpers ----------
  // Try to extract coords or address from a donor or request "raw" object
  const extractLatLng = (obj) => {
    if (!obj) return null;
    // common fields
    if (obj.lat && obj.lng) return { lat: obj.lat, lng: obj.lng };
    if (obj.latitude && obj.longitude)
      return { lat: obj.latitude, lng: obj.longitude };
    if (obj.location && typeof obj.location === "object") {
      // GeoJSON style: { type: 'Point', coordinates: [lng, lat] } or {lat,lng}
      if (
        Array.isArray(obj.location.coordinates) &&
        obj.location.coordinates.length >= 2
      ) {
        const [lng, lat] = obj.location.coordinates;
        return { lat, lng };
      }
      if (obj.location.lat && obj.location.lng)
        return { lat: obj.location.lat, lng: obj.location.lng };
      if (obj.location.latitude && obj.location.longitude)
        return { lat: obj.location.latitude, lng: obj.location.longitude };
    }
    // nested candidates
    if (obj.patientInfo) {
      const r = extractLatLng(obj.patientInfo);
      if (r) return r;
    }
    if (obj.requesterLocation) {
      const r = extractLatLng(obj.requesterLocation);
      if (r) return r;
    }
    return null;
  };

  const extractAddress = (obj) => {
    if (!obj) return null;
    const candidates = [
      "address",
      "formattedAddress",
      "locationAddress",
      "fullAddress",
      "place",
      "locationString",
      "patientAddress",
      "requesterAddress",
    ];
    for (const key of candidates) {
      if (obj[key]) return String(obj[key]);
    }
    // nested
    if (obj.patientInfo) {
      const a = extractAddress(obj.patientInfo);
      if (a) return a;
    }
    if (obj.requesterLocation && typeof obj.requesterLocation === "string")
      return obj.requesterLocation;
    if (obj.requesterLocation && typeof obj.requesterLocation === "object") {
      const a = extractAddress(obj.requesterLocation);
      if (a) return a;
    }
    // If raw contains coordinates in a string e.g. "12.34,56.78"
    if (typeof obj === "string") {
      return obj;
    }
    return null;
  };

  const buildGoogleMapsUrl = ({ lat, lng, address }) => {
    if (lat != null && lng != null) {
      // use query with coordinates
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        lat + "," + lng
      )}`;
    }
    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
    }
    return null;
  };

  // Given a raw donor/request object, return a maps URL (or null)
  const getMapsUrlFromRaw = (raw) => {
    if (!raw) return null;
    // Try direct lat/lng
    const coords = extractLatLng(raw);
    if (coords) return buildGoogleMapsUrl(coords);
    // Try address
    const addr = extractAddress(raw);
    if (addr) return buildGoogleMapsUrl({ address: addr });
    // special-case: if it's a donor object with phone + name but no address, don't build
    return null;
  };

  const openMaps = (url) => {
    if (!url) return;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      // fallback
      const w = window.open();
      if (w) {
        w.location.href = url;
      } else {
        alert("Unable to open map - please check your popup settings.");
      }
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Donation Summary
            </h1>
            <p className="text-sm text-gray-600">
              Summary & recent donation/search requests (from your backend)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStats();
                fetchLists();
              }}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:shadow-md"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                // quick debug view
                const w = window.open();
                w.document.write(
                  `<pre>${JSON.stringify(
                    {
                      stats,
                      searchRequests: searchRequests.length,
                      donationHistory: donationHistory.length,
                      myRequests: myRequests.length,
                    },
                    null,
                    2
                  )}</pre>`
                );
              }}
              className="px-4 py-2 bg-gray-100 rounded text-sm"
            >
              Dev: Inspect
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Donors</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {loadingStats ? "…" : stats?.donors ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Active donors (computed)
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Donations</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {loadingStats ? "…" : stats?.donations ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Completed donations (from /api/stats)
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Lives</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {loadingStats ? "…" : stats?.lives ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Estimated lives helped
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Districts</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {loadingStats ? "…" : stats?.districts ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Unique districts</div>
          </div>
        </div>

        {/* Totals from lists */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-sm text-gray-500">Total search requests</div>
            <div className="text-xl font-semibold">{searchRequests.length}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              Your donation history (if logged in)
            </div>
            <div className="text-xl font-semibold">
              {donationHistory.length}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              Assigned requests to you (my-requests)
            </div>
            <div className="text-xl font-semibold">{myRequests.length}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Combined recent items</div>
            <div className="text-xl font-semibold">{combined.length}</div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Requests & History
            </h2>
            <div className="text-sm text-gray-500">
              {loadingList ? "loading…" : `${combined.length} items`}
            </div>
          </div>

          {loadingList ? (
            <div className="text-center py-8 text-gray-600">
              <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="mt-2">Loading...</div>
            </div>
          ) : combined.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No recent items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combined.map((it) => {
                // request-level maps url (if request has its own location or patient info)
                const requestMapsUrl = getMapsUrlFromRaw(it.raw);
                return (
                  <div key={it.id} className="p-4 rounded-lg border bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {it.patientName || "No patient name"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Group: {it.bloodGroup || "-"} · Bags: {it.bags}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Requested by: {it.requester}{" "}
                          {it.phone && `• ${it.phone}`}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 text-right">
                        <div>{fmt(it.createdAt)}</div>
                        <div
                          className={`mt-2 px-2 py-1 rounded text-xs ${
                            it.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : it.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {it.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {it.source}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => {
                          setDetailItem(it);
                          setShowDetail(true);
                        }}
                        className="px-3 py-2 bg-white border rounded"
                      >
                        View
                      </button>

                      {it.source === "donationRequest" &&
                        it.status === "pending" &&
                        token && (
                          <button
                            disabled={processingId === it.id}
                            onClick={() => handleAccept(it.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded"
                          >
                            {processingId === it.id ? "Processing…" : "Accept"}
                          </button>
                        )}

                      {it.source === "donationRequest" &&
                        it.status === "pending" &&
                        !token && (
                          <button
                            onClick={() =>
                              alert(
                                "Please login (donor token) to use this option."
                              )
                            }
                            className="px-3 py-2 bg-gray-100 rounded"
                          >
                            Login to accept
                          </button>
                        )}

                      {/* Request-level Check Location */}
                      {requestMapsUrl ? (
                        <button
                          onClick={() => openMaps(requestMapsUrl)}
                          className="px-3 py-2 bg-blue-600 text-white rounded"
                          title="Open request location in Google Maps"
                        >
                          Check location
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-2 bg-gray-100 rounded text-sm"
                          title="No location available"
                        >
                          No location
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Details</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm text-gray-500">Requested by</div>
                <div className="font-semibold">
                  {detailItem.requester}{" "}
                  {detailItem.phone && `• ${detailItem.phone}`}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Patient</div>
                <div className="font-semibold">
                  {detailItem.patientName || "-"}
                </div>
                <div className="text-sm text-gray-600">
                  Group: {detailItem.bloodGroup || "-"} • Bags:{" "}
                  {detailItem.bags}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-semibold">{detailItem.status}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Created: {fmt(detailItem.createdAt)}
                </div>
              </div>

              {/* Found donors (with check location button per donor) */}
              {detailItem.raw?.foundDonors &&
                detailItem.raw.foundDonors.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500">Found donors</div>
                    <div className="text-sm text-gray-700 space-y-2 mt-2">
                      {detailItem.raw.foundDonors.slice(0, 50).map((d, i) => {
                        const donorMapsUrl =
                          getMapsUrlFromRaw(d) ||
                          getMapsUrlFromRaw({
                            ...d,
                            requesterLocation: d.location,
                          });
                        return (
                          <div
                            key={i}
                            className="p-2 border rounded flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">
                                {d.fullName || d.name || d._id}
                              </div>
                              <div className="text-xs text-gray-600">
                                {d.phone && `• ${d.phone}`}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {donorMapsUrl ? (
                                <button
                                  onClick={() => openMaps(donorMapsUrl)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                  title="Open donor location in Google Maps"
                                >
                                  Check location
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="px-3 py-1 bg-gray-100 rounded text-sm"
                                  title="No location available for this donor"
                                >
                                  No location
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Raw patientInfo */}
              {detailItem.raw?.patientInfo && (
                <div>
                  <div className="text-sm text-gray-500">
                    Patient info (raw)
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(detailItem.raw.patientInfo, null, 2)}
                  </pre>
                  {/* Attempt to provide a maps link from patientInfo */}
                  {getMapsUrlFromRaw(detailItem.raw.patientInfo) && (
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          openMaps(
                            getMapsUrlFromRaw(detailItem.raw.patientInfo)
                          )
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Open patient location in Google Maps
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {detailItem.source === "donationRequest" &&
                detailItem.status === "pending" &&
                token && (
                  <button
                    disabled={processingId === detailItem.id}
                    onClick={() => handleAccept(detailItem.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    {processingId === detailItem.id ? "Processing…" : "Accept"}
                  </button>
                )}
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-100 rounded"
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

export default DonationsSummary;
