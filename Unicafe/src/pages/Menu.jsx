import { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Best Sellers Data
  const bestSellers = [
    {
      id: 1,
      name: "Caramel Macchiato",
      description:
        "Espresso with vanilla syrup, steamed milk, and caramel drizzle",
      price: 5.49,
      icon: "☕",
      rating: 4.9,
      sales: "2.5k+",
    },
    {
      id: 2,
      name: "Flat White",
      description: "Rich espresso with velvety microfoam milk",
      price: 4.99,
      icon: "🥛",
      rating: 4.8,
      sales: "2.1k+",
    },
    {
      id: 3,
      name: "Iced Mocha",
      description: "Chilled espresso with chocolate, milk, and whipped cream",
      price: 5.99,
      icon: "🍫",
      rating: 4.9,
      sales: "1.9k+",
    },
  ];

  // Full Menu Products
  const products = [
    // Espresso Based
    {
      id: 4,
      name: "Americano",
      category: "espresso",
      description: "Bold espresso with hot water",
      price: 3.99,
      icon: "☕",
    },
    {
      id: 5,
      name: "Cappuccino",
      category: "espresso",
      description: "Espresso with steamed milk and foam",
      price: 4.49,
      icon: "☕",
    },
    {
      id: 6,
      name: "Latte",
      category: "espresso",
      description: "Smooth espresso with steamed milk",
      price: 4.79,
      icon: "☕",
    },
    {
      id: 7,
      name: "Espresso",
      category: "espresso",
      description: "Classic double shot",
      price: 2.99,
      icon: "☕",
    },
    {
      id: 8,
      name: "Cortado",
      category: "espresso",
      description: "Espresso cut with warm milk",
      price: 3.99,
      icon: "☕",
    },
    {
      id: 9,
      name: "Affogato",
      category: "espresso",
      description: "Espresso poured over vanilla ice cream",
      price: 5.49,
      icon: "🍨",
    },
    // Cold Brews
    {
      id: 10,
      name: "Cold Brew",
      category: "cold",
      description: "Smooth, cold-steeped coffee",
      price: 4.49,
      icon: "🧊",
    },
    {
      id: 11,
      name: "Nitro Cold Brew",
      category: "cold",
      description: "Cold brew infused with nitrogen",
      price: 5.49,
      icon: "🧊",
    },
    {
      id: 12,
      name: "Iced Coffee",
      category: "cold",
      description: "Chilled brewed coffee over ice",
      price: 3.99,
      icon: "🧊",
    },
    {
      id: 13,
      name: "Iced Latte",
      category: "cold",
      description: "Cold espresso with milk over ice",
      price: 4.99,
      icon: "🧊",
    },
    {
      id: 14,
      name: "Iced Caramel Latte",
      category: "cold",
      description: "Iced latte with caramel syrup",
      price: 5.49,
      icon: "🧊",
    },
    {
      id: 15,
      name: "Frappuccino",
      category: "cold",
      description: "Blended ice coffee drink",
      price: 5.99,
      icon: "🥤",
    },
    // Specialty
    {
      id: 16,
      name: "Mocha",
      category: "specialty",
      description: "Espresso with chocolate and steamed milk",
      price: 5.29,
      icon: "🍫",
    },
    {
      id: 17,
      name: "White Mocha",
      category: "specialty",
      description: "Espresso with white chocolate and milk",
      price: 5.49,
      icon: "🤍",
    },
    {
      id: 18,
      name: "Pumpkin Spice Latte",
      category: "specialty",
      description: "Seasonal favorite with pumpkin and spices",
      price: 5.99,
      icon: "🎃",
    },
    {
      id: 19,
      name: "Hazelnut Latte",
      category: "specialty",
      description: "Latte with hazelnut syrup",
      price: 5.29,
      icon: "🌰",
    },
    {
      id: 20,
      name: "Vanilla Bean Latte",
      category: "specialty",
      description: "Creamy latte with vanilla bean",
      price: 5.29,
      icon: "🤍",
    },
    {
      id: 21,
      name: "Honey Almond Latte",
      category: "specialty",
      description: "Sweet honey with almond milk",
      price: 5.49,
      icon: "🍯",
    },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const categories = [
    { id: "all", name: "All", icon: "☕" },
    { id: "espresso", name: "Espresso", icon: "☕" },
    { id: "cold", name: "Cold Brew", icon: "🧊" },
    { id: "specialty", name: "Specialty", icon: "✨" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <NavBar />

      {/* Hero Section - Engaging Intro - Full Screen */}
      <section className="h-screen flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block mb-8">
            <span className="text-8xl md:text-9xl mb-4 inline-block animate-bounce">
              ☕
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-amber-900 mb-8 tracking-tight">
            Our Coffee Menu
          </h1>
          <p className="text-2xl md:text-3xl text-amber-800/80 max-w-4xl mx-auto leading-relaxed font-light mb-12">
            Discover handcrafted beverages made with passion. Each cup tells a
            story of quality,
            <span className="font-medium text-amber-900">
              {" "}
              flavor, and dedication
            </span>
            .
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-400"></div>
            <span className="text-amber-600 text-3xl">✦</span>
            <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>
        </div>

        {/* Scroll Down Indicator - Positioned Absolutely */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 text-amber-600 animate-bounce"
          style={{ bottom: "40px" }}
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
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm flex justify-center">
        <div className="w-full max-w-7xl 2xl:max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">
              Fan Favorites
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
              Best Sellers
            </h2>
            <br></br>
            <br></br>
          </div>

          <div className="flex justify-center">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
              {bestSellers.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative bg-gradient-to-br from-white to-amber-50/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-100/50 hover:border-amber-300/50 hover:-translate-y-2 flex flex-col"
                >
                  {/* Badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg">
                    #{index + 1}
                  </div>

                  {/* Icon */}
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                    {product.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-amber-900 mb-3">
                    {product.name}
                  </h3>
                  <p className="text-amber-800/70 mb-6 leading-relaxed flex-grow">
                    {product.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 text-sm">
                    <div className="flex items-center gap-1 text-amber-600">
                      <span className="text-lg">⭐</span>
                      <span className="font-semibold">{product.rating}</span>
                    </div>
                    <div className="text-amber-700/70">
                      <span className="font-semibold">{product.sales}</span>{" "}
                      sold
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-3xl font-bold text-amber-900">
                      ${product.price}
                    </span>
                    <button
                      className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{
                        paddingLeft: "24px",
                        paddingRight: "24px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
              <br></br>
            </div>
          </div>
        </div>
      </section>

      {/* Full Menu Section */}
      <section className="py-20 px-6 flex justify-center">
        <div className="w-full max-w-7xl 2xl:max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
              Full Menu
            </h2>
            <div className="flex justify-center">
              <p className="text-amber-800/70 text-lg max-w-2xl text-center">
                Explore our complete collection of artisan coffee beverages
              </p>
            </div>
            <br></br>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                    : "bg-white text-amber-800 hover:bg-amber-50 border-2 border-amber-200"
                }`}
                style={{
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
          <br></br>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100/50 hover:border-amber-300/50 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {product.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-amber-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-amber-800/60 text-sm mb-4 leading-relaxed min-h-[2.5rem]">
                  {product.description}
                </p>

                {/* Price & Button */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-amber-900">
                    ${product.price}
                  </span>
                  <button
                    className="bg-amber-100 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-700 text-amber-900 hover:text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                    style={{ padding: "16px" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <br></br>
          <br></br>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">☕</span>
              <p className="text-xl text-amber-800/70">
                No products found in this category
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-br from-amber-900 to-amber-800 relative overflow-hidden flex justify-center">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="w-full max-w-4xl 2xl:max-w-3xl text-center relative z-10">
          <br></br>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Can't Decide?
          </h2>
          <p className="text-amber-100 text-xl mb-8 leading-relaxed">
            Our baristas are here to help you find your perfect cup. Visit us
            in-store for personalized recommendations.
          </p>
          <br></br>
          <button
            className="bg-white text-amber-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105"
            style={{
              paddingLeft: "26px",
              paddingRight: "26px",
              paddingTop: "14px",
              paddingBottom: "14px",
            }}
          >
            Visit Us Today
          </button>
          <br></br>
          <br></br>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Menu;
