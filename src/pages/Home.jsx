import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SuccessStore from "./SuccessStore";

const Home = () => {
  const [counters, setCounters] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    districts: 0,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Simple, direct image URLs - these WILL work
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=1200&auto=format&fit=crop",
      title: "One Donation, Three Lives",
      description: "Your single blood donation can save up to three lives",
    },
    {
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&auto=format&fit=crop",
      title: "Be a Hero",
      description: "Join thousands of volunteers making a difference every day",
    },
    {
      image:
        "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=1200&auto=format&fit=crop",
      title: "Life-Saving Mission",
      description: "Every blood donation tells a story of survival",
    },
    {
      image:
        "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&auto=format&fit=crop",
      title: "Continuous Journey",
      description: "We continue to move forward with the same spirit",
    },
    {
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&auto=format&fit=crop",
      title: "Community Strength",
      description: "Together we build a safer, healthier community",
    },
  ];

  useEffect(() => {
    // Counter animation
    const targetValues = {
      donors: 253647,
      donations: 512893,
      lives: 1025786,
      districts: 64,
    };

    const duration = 3000;
    const steps = 60;
    const stepDuration = duration / steps;

    const timers = [];

    Object.keys(targetValues).forEach((key) => {
      let current = 0;
      const increment = targetValues[key] / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValues[key]) {
          current = targetValues[key];
          clearInterval(timer);
        }
        setCounters((prev) => ({
          ...prev,
          [key]: Math.floor(current),
        }));
      }, stepDuration);

      timers.push(timer);
    });

    // Carousel auto-slide
    const carouselTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      timers.forEach((timer) => clearInterval(timer));
      clearInterval(carouselTimer);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleImageLoad = (index) => {
    setImageLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageError = (index) => {
    console.error(`Image ${index} failed to load`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            'linear-gradient(rgba(220, 38, 38, 0.85), rgba(185, 28, 28, 0.9)), url("https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white border-opacity-30">
              <span className="text-6xl text-red-600">♥</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              One Blood Donation
              <br />
              <span className="text-red-200">Three Lives Saved</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed font-light">
              "Join our life-saving mission today. Your single blood donation
              <br />
              can be someone's new beginning and hope for tomorrow"
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link
              to="/register"
              className="bg-white text-red-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-red-50 transition transform hover:scale-105 shadow-2xl"
            >
              Donate Blood Now
            </Link>
            <Link
              to="/searchdonor"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-red-700 transition shadow-2xl"
            >
              Need Blood?
            </Link>
          </div>
          <div className="mt-12 animate-bounce">
            <span className="text-white text-lg">↓</span>
          </div>
        </div>
      </section>

      {/* Emotional Quote Section */}
      <section className="py-20 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-l-4 border-red-500">
            <span className="text-6xl text-red-300">"</span>
            <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-light mb-6">
              Every 2 seconds, someone needs blood. Behind each donation stands
              a hero who chose to give the gift of life. Together, we're
              building a chain of hope that connects strangers and saves lives
              in moments of critical need.
            </p>
            <div className="w-24 h-1 bg-red-500 mx-auto mb-4"></div>
            <p className="text-red-600 font-semibold">
              - Blood Donation Foundation
            </p>
          </div>
        </div>
      </section>

      {/* NEW CAROUSEL WITH IMG TAGS */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Our Life-Saving Journey
          </h2>
          <p className="text-center text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
            Moments that define our mission to save lives through blood donation
          </p>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
            {/* Carousel Container */}
            <div className="relative w-full h-[500px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                >
                  {/* Image with loading state */}
                  <div className="relative w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />

                    {/* Loading placeholder */}
                    {!imageLoaded[index] && (
                      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                        <div className="text-white text-xl">Loading...</div>
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                    {/* Text content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {slide.title}
                      </h3>
                      <p className="text-lg md:text-xl text-gray-200">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all"
            >
              ›
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentSlide
                      ? "w-8 h-3 bg-white"
                      : "w-3 h-3 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide counter */}
          <div className="text-center mt-4">
            <span className="text-gray-400">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>
      </section>

      <SuccessStore />

      {/* Blood Donation Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Simple Donation Process
          </h2>
          <p className="text-center text-gray-600 text-xl mb-12 max-w-2xl mx-auto">
            Become a life-saver in just 3 easy steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Register",
                description:
                  "Complete your registration on our platform easily",
                icon: "📝",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "2",
                title: "Donate Blood",
                description: "Safe and comfortable blood donation process",
                icon: "💉",
                color: "from-red-500 to-red-600",
              },
              {
                step: "3",
                title: "Save Lives",
                description: "Your blood gives someone a second chance at life",
                icon: "🎉",
                color: "from-purple-500 to-purple-600",
              },
            ].map((process, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 h-full">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${process.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto`}
                  >
                    {process.step}
                  </div>
                  <div className="text-4xl text-center mb-4">
                    {process.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {process.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-2xl text-gray-300 group-hover:text-red-400 transition-colors">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600 opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-red-600 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🚨 Emergency Blood Need?
            </h2>
            <p className="text-xl mb-8 text-red-100">
              24/7 Emergency Service. Call now or request online immediately
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <a
                href="tel:10666"
                className="bg-white text-red-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-red-50 transition transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
              >
                <span>☎</span>
                <span>10666</span>
              </a>
              <Link
                to="/searchdonor"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-red-700 transition shadow-2xl"
              >
                Request Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-red-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            What <span className="text-red-600">People Say</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Last year during the emergency, my father needed heart surgery. Thanks to unknown blood donors, he's alive today.",
                name: "Anika Islam",
                location: "Dhaka",
                role: "Daughter",
              },
              {
                quote:
                  "Through blood donation, I feel I'm contributing to society. I donate blood every three months regularly.",
                name: "Rafiqul Islam",
                location: "Chattogram",
                role: "Volunteer",
              },
              {
                quote:
                  "During my daughter's birth complications, we needed massive blood transfusion. This platform saved lives.",
                name: "Jahanara Begum",
                location: "Rajshahi",
                role: "Mother",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow"
              >
                <div className="text-red-400 text-4xl mb-4">"</div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="border-t border-red-200 pt-4">
                  <div className="font-semibold text-gray-800">
                    {testimonial.name}
                  </div>
                  <div className="text-red-600 text-sm">
                    {testimonial.location} • {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
