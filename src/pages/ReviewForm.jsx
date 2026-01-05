import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";

// bind to #root
Modal.setAppElement("#root");

const divisions = [
  { id: "dhaka", name: "Dhaka" },
  { id: "chattogram", name: "Chattogram" },
  { id: "rajshahi", name: "Rajshahi" },
  { id: "khulna", name: "Khulna" },
  { id: "barishal", name: "Barishal" },
  { id: "sylhet", name: "Sylhet" },
  { id: "rangpur", name: "Rangpur" },
  { id: "mymensingh", name: "Mymensingh" },
];

const ReviewForm = ({ apiBase = "http://localhost:5000" }) => {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // form state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    division: "",
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Custom modal styles
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "90vw",
      width: "500px",
      maxHeight: "90vh",
      borderRadius: "16px",
      padding: "0",
      border: "none",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      backgroundColor: "white",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
    },
  };

  useEffect(() => {
    if (!selectedDivision) {
      setSelectedDivision(divisions[0].id);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDivision) fetchReviews(selectedDivision);
  }, [selectedDivision]);

  const fetchReviews = async (divisionId) => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(
        `${apiBase}/api/reviews?division=${divisionId}`
      );
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const openModalForDivision = (divisionId) => {
    setForm((f) => ({ ...f, division: divisionId }));
    setErrors({});
    setMessage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Reset form when closing
    setTimeout(() => {
      setForm({
        division: selectedDivision,
        name: "",
        email: "",
        rating: 5,
        comment: "",
      });
      setErrors({});
      setMessage(null);
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!form.division) err.division = "Please select a division";
    if (!form.name?.trim()) err.name = "Please enter your name";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Please enter a valid email";
    if (!form.comment?.trim()) err.comment = "Please write a review";
    if (
      !form.rating ||
      isNaN(form.rating) ||
      form.rating < 1 ||
      form.rating > 5
    )
      err.rating = "Please provide a rating (1-5)";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        division: form.division,
        name: form.name.trim(),
        email: form.email.trim(),
        rating: Number(form.rating),
        comment: form.comment.trim(),
      };

      await axios.post(`${apiBase}/api/reviews`, payload);

      setMessage({
        type: "success",
        text: "Thank you — your review has been submitted!",
      });

      // Refresh reviews for the division
      if (form.division === selectedDivision) {
        await fetchReviews(selectedDivision);
      } else {
        setSelectedDivision(form.division);
      }

      // Reset form
      setForm({
        division: selectedDivision,
        name: "",
        email: "",
        rating: 5,
        comment: "",
      });

      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Error saving review:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to submit review. Please try again later.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "bg-green-100 text-green-800 border-green-200";
    if (rating >= 3) return "bg-blue-100 text-blue-800 border-blue-200";
    if (rating >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 4) return "😊";
    if (rating >= 3) return "🙂";
    if (rating >= 2) return "😐";
    return "😞";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            Division-Based Reviews
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your experience with blood donation services in your division
            and see what others are saying
          </p>
        </div>

        {/* Division selector + actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Division
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 md:mt-6">
              <button
                onClick={() => openModalForDivision(selectedDivision)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Write Review
              </button>
            </div>
          </div>
        </div>

        {/* Reviews list */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Reviews for "
                {divisions.find((d) => d.id === selectedDivision)?.name}"
                Division
              </h3>
              <p className="text-gray-600 mt-1">
                User opinions about local blood donation services
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${
                loadingReviews
                  ? "bg-gray-100 text-gray-600"
                  : reviews.length === 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {loadingReviews
                ? "Loading..."
                : reviews.length === 0
                ? "No Reviews"
                : `${reviews.length} Reviews`}
            </div>
          </div>

          {loadingReviews ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 mb-6">
                There are no reviews for this division yet. Be the first to
                write one!
              </p>
              <button
                onClick={() => openModalForDivision(selectedDivision)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                        {r.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{r.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${getRatingColor(
                        r.rating
                      )}`}
                    >
                      <span>{r.rating} ⭐</span>
                      <span>{getRatingEmoji(r.rating)}</span>
                    </div>
                  </div>

                  <div className="text-gray-700 leading-relaxed mb-3">
                    {r.comment}
                  </div>

                  <div className="text-sm text-gray-500 flex items-center">
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
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {r.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {reviews.length > 0 && (
          <div className="mt-8 bg-red-600 text-white rounded-2xl p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Review Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{reviews.length}</div>
                  <div className="text-sm opacity-90">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {(
                      reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)}
                  </div>
                  <div className="text-sm opacity-90">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {reviews.filter((r) => r.rating >= 4).length}
                  </div>
                  <div className="text-sm opacity-90">Positive Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {divisions.find((d) => d.id === selectedDivision)?.name}
                  </div>
                  <div className="text-sm opacity-90">Division</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for adding review */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={customStyles}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <div className="bg-white">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
            <div>
              <h3 className="text-2xl font-bold text-red-800">
                Write a Review
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Share your blood donation experience
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-red-100 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Division *
                </label>
                <select
                  name="division"
                  value={form.division}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.division && (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.division}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Your full name"
                    required
                  />
                  {errors.name && (
                    <div className="text-red-500 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Your email"
                    required
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating *
                </label>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="5">5 ⭐ — Excellent</option>
                  <option value="4">4 ⭐ — Very Good</option>
                  <option value="3">3 ⭐ — Good</option>
                  <option value="2">2 ⭐ — Average</option>
                  <option value="1">1 ⭐ — Poor</option>
                </select>
                {errors.rating && (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.rating}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review / Comment *
                </label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  placeholder="Write about your blood donation experience or opinion about the service..."
                  required
                />
                {errors.comment && (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.comment}
                  </div>
                )}
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg border ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    {message.type === "success" ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {message.text}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewForm;
