const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header Section */}
      <header className="bg-red-700 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xl">♥</span>
            </div>
            <h1 className="text-2xl font-bold">রক্তদান</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#home" className="hover:text-red-200 transition">
              হোম
            </a>
            <a href="#about" className="hover:text-red-200 transition">
              আমাদের সম্পর্কে
            </a>
            <a href="#donate" className="hover:text-red-200 transition">
              রক্ত দিন
            </a>
            <a href="#find" className="hover:text-red-200 transition">
              রক্ত খুঁজুন
            </a>
            <a href="#contact" className="hover:text-red-200 transition">
              যোগাযোগ
            </a>
          </nav>
          <button className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition">
            লগইন
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="py-16 px-6 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(220, 38, 38, 0.7), rgba(220, 38, 38, 0.7)), url("https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="container mx-auto text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            একটি রক্তদান, একটি জীবন
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            "ভাষার জন্য যারা জীবন দিয়েছেন, তাদের স্মরণে - আসুন আমরা জীবন
            বাঁচাই। আপনার এক বোতল রক্ত হতে পারে কারো জন্য নতুন জীবনের সূচনা।"
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <button className="bg-white text-red-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-red-100 transition transform hover:scale-105">
              রক্ত দিন এখনই
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-red-700 transition">
              রক্তের প্রয়োজন?
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-red-600 mb-2">
                ৫০,০০০+
              </div>
              <div className="text-gray-600">রক্তদাতা</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-red-600 mb-2">
                ১,২০,০০০+
              </div>
              <div className="text-gray-600">রক্তদান</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-red-600 mb-2">৬৪</div>
              <div className="text-gray-600">জেলা</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-red-600 mb-2">১০০+</div>
              <div className="text-gray-600">হাসপাতাল</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Donate Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            কিভাবে রক্ত দিবেন?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-red-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">নিবন্ধন করুন</h3>
              <p className="text-gray-600">
                আমাদের প্লাটফর্মে রেজিস্ট্রেশন করুন এবং রক্তদাতা হিসেবে নিজেকে
                নিবন্ধিত করুন
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-red-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">সুযোগ খুঁজুন</h3>
              <p className="text-gray-600">
                কাছাকাছি রক্তদান ক্যাম্প বা হাসপাতালে রক্তদানের সুযোগ খুঁজুন
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-red-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">রক্ত দিন</h3>
              <p className="text-gray-600">
                নিরাপদ ও স্বাস্থ্যকর পরিবেশে রক্তদান করুন এবং জীবন বাঁচান
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 bg-red-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            জরুরী রক্তের প্রয়োজন?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            আমাদের ইমারজেন্সি হেল্পলাইনে কল করুন বা অনলাইনে রিকোয়েস্ট করুন
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="bg-white text-red-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-red-100 transition">
              ☎ ১০৬৬৬
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-red-700 transition">
              অনলাইনে রিকোয়েস্ট করুন
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">রক্তদান</h3>
              <p className="text-gray-400">
                বাংলাদেশের বৃহত্তম রক্তদান নেটওয়ার্ক
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">লিংক</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    হোম
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    আমাদের সম্পর্কে
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    রক্ত দিন
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    রক্ত খুঁজুন
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">যোগাযোগ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ইমেইল: info@roktodan.org</li>
                <li>ফোন: ১০৬৬৬</li>
                <li>ঠিকানা: ঢাকা, বাংলাদেশ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">সামাজিক যোগাযোগ</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  ফেসবুক
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  টুইটার
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  ইনস্টাগ্রাম
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© ২০২৪ রক্তদান - সকল অধিকার সংরক্ষিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
