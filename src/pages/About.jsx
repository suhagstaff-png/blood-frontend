// pages/About.js (Sample additional page)

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            About DonorHub
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Welcome to DonorHub - a life-saving platform that connects
              blood donors with those in urgent need. Our mission began with a
              simple yet powerful vision: to ensure that no one dies waiting for
              blood in Bangladesh.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Founded in response to the critical blood shortage in our
              healthcare system, DonorHub emerged as a beacon of hope. We
              witnessed how families struggled to find compatible blood during
              emergencies, and we knew we had to create a solution that could
              save lives instantly.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              What We Do
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We bridge the gap between voluntary blood donors and patients in
              need through our innovative digital platform. Our system matches
              blood requests with available donors in real-time, ensuring quick
              response during critical situations.
            </p>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
              <h3 className="text-xl font-bold text-red-800 mb-3">
                Did You Know?
              </h3>
              <ul className="text-gray-700 space-y-2">
                <li>• One blood donation can save up to three lives</li>
                <li>
                  • Blood cannot be manufactured - it only comes from generous
                  donors
                </li>
                <li>• Every 2 seconds, someone needs blood</li>
                <li>• Only 3% of age-eligible people donate blood yearly</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              Our Impact
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Since our inception, we've facilitated thousands of successful
              blood donations and helped countless patients receive the
              life-saving blood they needed. Our network spans across all
              districts of Bangladesh, with dedicated volunteers and donors in
              every community.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Compassion
                </h3>
                <p className="text-gray-600">
                  Every life matters, and we treat every request with utmost
                  urgency and care.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Transparency
                </h3>
                <p className="text-gray-600">
                  We maintain complete transparency in our operations and donor
                  matching process.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Reliability
                </h3>
                <p className="text-gray-600">
                  Available 24/7 to ensure help is always within reach when
                  needed most.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Community
                </h3>
                <p className="text-gray-600">
                  Building a strong network of donors who believe in giving back
                  to society.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              Join Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Whether you're a potential donor, a healthcare professional, or
              someone who wants to support our cause, there's a place for you in
              our community. Together, we can ensure that blood is always
              available for those who need it most.
            </p>

            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center text-white mt-12">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Make a Difference?
              </h3>
              <p className="text-red-100 mb-6">
                Join thousands of life-savers in our mission to create a
                blood-secure Bangladesh
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-white text-red-700 px-6 py-3 rounded-full font-bold hover:bg-red-50 transition shadow-lg">
                  Become a Donor
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-red-700 transition">
                  Learn More
                </button>
              </div>
            </div>

            <div className="mt-12 text-center text-gray-600 border-t border-gray-200 pt-8">
              <p className="font-semibold">DonorHub Bangladesh</p>
              <p className="text-sm">Saving Lives, One Donation at a Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
