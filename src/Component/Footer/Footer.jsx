// components/Footer.js
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-2xl">♥</span>
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">DonorHub</h1>
                <p className="text-red-200">Save Lives, Build Bangladesh</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Inspired by the spirit of great blood donation movements, we
              continue to work tirelessly. Your one bottle of blood could be
              someone's chance for a new life.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition"
              >
                <span className="font-semibold">f</span>
              </a>
              <a
                href="#"
                className="bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500 transition"
              >
                <span className="font-semibold">t</span>
              </a>
              <a
                href="#"
                className="bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-700 transition"
              >
                <span className="font-semibold">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="text-gray-400 hover:text-white transition"
                >
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/find-blood"
                  className="text-gray-400 hover:text-white transition"
                >
                  Find Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Info</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-3">
                <span className="text-red-500">📍</span>
                <span>Shamimabad, Bagbari ,sylhet-3100</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-red-500">📞</span>
                <span>10666 (24/7 Helpline)</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-red-500">✉️</span>
                <span>help@DonorHub.org</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-red-500">🕒</span>
                <span>24 Hour Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              © 2024 DonorHub Bangladesh - All Rights Reserved
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
