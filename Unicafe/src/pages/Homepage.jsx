import { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Homepage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const featuredProducts = [
    {
      id: 1,
      name: "Espresso",
      price: "$3.50",
      image: "☕",
      description: "Rich and bold Italian-style espresso",
      category: "hot",
    },
    {
      id: 2,
      name: "Cappuccino",
      price: "$4.50",
      image: "☕",
      description: "Creamy espresso with steamed milk foam",
      category: "hot",
    },
    {
      id: 3,
      name: "Iced Latte",
      price: "$4.75",
      image: "🧊",
      description: "Smooth espresso with cold milk over ice",
      category: "cold",
    },
    {
      id: 4,
      name: "Caramel Macchiato",
      price: "$5.25",
      image: "☕",
      description: "Sweet vanilla and caramel delight",
      category: "hot",
    },
    {
      id: 5,
      name: "Cold Brew",
      price: "$4.25",
      image: "🧊",
      description: "Smooth, naturally sweet cold coffee",
      category: "cold",
    },
    {
      id: 6,
      name: "Mocha",
      price: "$5.00",
      image: "☕",
      description: "Rich chocolate and espresso blend",
      category: "hot",
    },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? featuredProducts
      : featuredProducts.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <div className="min-h-screen bg-amber-50">
      <NavBar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-linear-to-br from-amber-900 via-amber-800 to-amber-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>

        {/* Decorative Coffee Beans */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-bounce">
          ☕
        </div>
        <div className="absolute bottom-32 right-20 text-8xl opacity-10 animate-pulse">
          ☕
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to <span className="text-amber-300">UniCafé</span>
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            Where every cup tells a story. Experience the perfect blend of
            quality, comfort, and community.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl min-w-[200px]">
              Order Now
            </button>
            <button className="bg-white hover:bg-amber-50 text-amber-900 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl min-w-[200px]">
              View Menu
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>
      <br></br>
      {/* Featured Products Section */}
      <section className="py-40 px-4 md:py-52">
        <div className="w-full max-w-[1600px] mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-8">
              Our Featured Drinks
            </h2>
          </div>
          <br></br>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-24">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 min-w-[140px] ${
                selectedCategory === "all"
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white text-amber-800 hover:bg-amber-100 shadow-md"
              }`}
            >
              All Drinks
            </button>
            <button
              onClick={() => setSelectedCategory("hot")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 min-w-[140px] ${
                selectedCategory === "hot"
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white text-amber-800 hover:bg-amber-100 shadow-md"
              }`}
            >
              Hot ☕
            </button>
            <button
              onClick={() => setSelectedCategory("cold")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 min-w-[140px] ${
                selectedCategory === "cold"
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white text-amber-800 hover:bg-amber-100 shadow-md"
              }`}
            >
              Cold 🧊
            </button>
          </div>
          <br></br>
          <br></br>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="bg-linear-to-br from-amber-200 to-amber-100 h-56 flex items-center justify-center text-8xl">
                  {product.image}
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-amber-900">
                      {product.name}
                    </h3>
                    <span className="text-2xl font-bold text-amber-600 ml-4">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-amber-700 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-semibold transition-colors duration-300 shadow-md hover:shadow-lg">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <br></br>
      <br></br>
      <br></br>
      {/* About Section */}
      <section className="py-40 px-4 md:py-52 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-12">
                Our Story
              </h2>
              <p className="text-lg text-amber-800 mb-10 leading-relaxed">
                Founded in the heart of the university district, UniCafé has
                been serving exceptional coffee to students, faculty, and coffee
                lovers since 2020. We believe in creating more than just great
                coffee – we create experiences.
              </p>
              <p className="text-lg text-amber-800 mb-10 leading-relaxed">
                Every bean is carefully selected, every drink expertly crafted,
                and every customer warmly welcomed. Our baristas are trained
                artisans who take pride in every cup they create.
              </p>
              <div className="grid grid-cols-3 gap-8 mt-20">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600 mb-3">
                    5000+
                  </div>
                  <div className="text-sm text-amber-800 font-medium">
                    Happy Customers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600 mb-3">
                    20+
                  </div>
                  <div className="text-sm text-amber-800 font-medium">
                    Coffee Varieties
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600 mb-3">
                    4.9★
                  </div>
                  <div className="text-sm text-amber-800 font-medium">
                    Average Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="about-image-container bg-linear-to-br from-amber-200 to-amber-100 rounded-2xl h-96 lg:h-[500px] flex items-center justify-center text-9xl shadow-xl">
              ☕
            </div>
          </div>
        </div>
      </section>
      <br></br>
      {/* Why Choose Us Section */}
      <section className="py-40 px-4 md:py-52 bg-amber-50">
        <div className="w-full max-w-[1600px] mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-8">
              Why Choose UniCafé?
            </h2>
          </div>
          <br></br>
          <br></br>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-14">
            <div className="feature-card bg-white p-12 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                Premium Quality
              </h3>
              <p className="text-amber-700 leading-relaxed text-base">
                We source the finest beans from ethical farms around the world,
                ensuring every cup is exceptional.
              </p>
            </div>

            <div className="feature-card bg-white p-12 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                Quick Service
              </h3>
              <p className="text-amber-700 leading-relaxed text-base">
                Fast, efficient service without compromising quality. Perfect
                for busy students and professionals.
              </p>
            </div>

            <div className="feature-card bg-white p-12 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                Cozy Atmosphere
              </h3>
              <p className="text-amber-700 leading-relaxed text-base">
                A warm, welcoming space perfect for studying, working, or
                catching up with friends.
              </p>
            </div>
          </div>
        </div>
      </section>
      <br></br>
      {/* CTA Section */}
      <section className="py-40 px-4 md:py-52 bg-linear-to-br from-amber-700 via-amber-600 to-orange-600 flex items-center justify-center">
        <div className="w-full max-w-[1400px] mx-auto text-center px-8">
          <br></br>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">
            Ready to Experience the Best Coffee?
          </h2>
          <p className="text-xl text-amber-50 mb-20 leading-relaxed ">
            Visit us today or order online for pickup. Your perfect cup awaits!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white hover:bg-amber-50 text-amber-900 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl min-w-[200px]">
              Order Online
            </button>
            <button className="bg-amber-900 hover:bg-amber-800 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl border-2 border-white min-w-[200px]">
              Find Us
            </button>
            <br></br>
            <br></br>
            <br></br>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
