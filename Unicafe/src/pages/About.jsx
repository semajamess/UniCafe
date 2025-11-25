import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const About = () => {
  // Add keyframes for bounce animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
    
    @media (min-width: 640px) {
      .button-container {
        flex-direction: row !important;
      }
    }
  `;
  if (!document.head.querySelector("#about-animations")) {
    style.id = "about-animations";
    document.head.appendChild(style);
  }
  const teamMembers = [
    {
      name: "Sarah Martinez",
      role: "Founder & CEO",
      icon: "👨‍💼",
      description:
        "Coffee enthusiast with 15 years of experience in the hospitality industry.",
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Michael Chen",
      role: "Head Barista",
      icon: "☕",
      description:
        "Award-winning barista specializing in latte art and specialty brews.",
      color: "from-amber-600 to-yellow-600",
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager",
      icon: "📊",
      description:
        "Expert in streamlining cafe operations and customer experience.",
      color: "from-orange-500 to-amber-600",
    },
    {
      name: "James Wilson",
      role: "Pastry Chef",
      icon: "🥐",
      description:
        "Culinary artist creating delicious pastries and cafe treats.",
      color: "from-yellow-600 to-amber-500",
    },
    {
      name: "Sophia Lee",
      role: "Marketing Director",
      icon: "🎯",
      description:
        "Creative strategist building community connections and brand awareness.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  const milestones = [
    { year: "2018", event: "UniCafé Founded", icon: "🏢" },
    { year: "2019", event: "First Award Won", icon: "🏆" },
    { year: "2021", event: "Expanded to 3 Locations", icon: "📍" },
    { year: "2023", event: "50,000+ Happy Customers", icon: "❤️" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50">
      <NavBar />

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          paddingTop: "8rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(to bottom right, rgba(251, 191, 36, 0.5), rgba(251, 146, 60, 0.3))",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "5rem",
            left: "2.5rem",
            width: "18rem",
            height: "18rem",
            backgroundColor: "rgba(252, 211, 77, 0.2)",
            borderRadius: "9999px",
            filter: "blur(60px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "2.5rem",
            width: "24rem",
            height: "24rem",
            backgroundColor: "rgba(251, 146, 60, 0.2)",
            borderRadius: "9999px",
            filter: "blur(60px)",
          }}
        ></div>

        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            position: "relative",
            zIndex: "10",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                marginBottom: "1.5rem",
                animation: "bounce 1s infinite",
              }}
            >
              <div style={{ fontSize: "4.5rem" }}>☕</div>
            </div>
            <h1
              style={{
                fontSize: "clamp(3rem, 8vw, 5rem)",
                fontWeight: "bold",
                background:
                  "linear-gradient(to right, #78350f, #c2410c, #78350f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "1.5rem",
              }}
            >
              About UniCafé
            </h1>
            <p
              style={{
                fontSize: "clamp(1.25rem, 4vw, 1.5rem)",
                color: "rgba(146, 64, 14, 0.8)",
                maxWidth: "48rem",
                margin: "0 auto",
                lineHeight: "1.75",
              }}
            >
              Where passion for coffee meets exceptional service
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "0",
              }}
            >
              <div
                style={{
                  padding: "clamp(3rem, 8vw, 4rem)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background:
                    "linear-gradient(to bottom right, #78350f, #c2410c)",
                  color: "white",
                }}
              >
                <div style={{ fontSize: "3.75rem", marginBottom: "1.5rem" }}>
                  📖
                </div>
                <h2
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  Our Story
                </h2>
                <div
                  style={{
                    height: "0.25rem",
                    width: "6rem",
                    backgroundColor: "#fbbf24",
                    marginBottom: "2rem",
                  }}
                ></div>
                <p
                  style={{
                    color: "#fef3c7",
                    fontSize: "1.125rem",
                    lineHeight: "1.75",
                    marginBottom: "1.5rem",
                  }}
                >
                  Founded in 2018, UniCafé began with a simple dream: to create
                  a welcoming space where students, professionals, and coffee
                  lovers could gather, connect, and enjoy exceptional coffee.
                </p>
                <p
                  style={{
                    color: "#fef3c7",
                    fontSize: "1.125rem",
                    lineHeight: "1.75",
                  }}
                >
                  What started as a small corner cafe has grown into a beloved
                  community hub, serving thousands of customers while
                  maintaining our commitment to quality, sustainability, and
                  warm hospitality.
                </p>
              </div>

              <div
                style={{
                  padding: "clamp(3rem, 8vw, 4rem)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background:
                    "linear-gradient(to bottom right, #fffbeb, #ffedd5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "2.25rem", flexShrink: "0" }}>
                      🌱
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#78350f",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Sustainability First
                      </h3>
                      <p style={{ color: "rgba(146, 64, 14, 0.8)" }}>
                        We source ethically-grown beans and use eco-friendly
                        packaging
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "2.25rem", flexShrink: "0" }}>
                      🤝
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#78350f",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Community Focused
                      </h3>
                      <p style={{ color: "rgba(146, 64, 14, 0.8)" }}>
                        Supporting local farmers and giving back to our
                        community
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "2.25rem", flexShrink: "0" }}>
                      ⭐
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#78350f",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Quality Assured
                      </h3>
                      <p style={{ color: "rgba(146, 64, 14, 0.8)" }}>
                        Every cup is crafted with precision and care by expert
                        baristas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          background:
            "linear-gradient(to right, rgba(254, 243, 199, 0.5), rgba(255, 237, 213, 0.5))",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "bold",
              textAlign: "center",
              color: "#78350f",
              marginBottom: "1rem",
            }}
          >
            Our Journey
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "rgba(146, 64, 14, 0.8)",
              fontSize: "1.125rem",
              marginBottom: "4rem",
            }}
          >
            Milestones that shaped UniCafé
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              justifyItems: "center",
            }}
          >
            {milestones.map((milestone, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  padding: "2rem",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  maxWidth: "300px",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-0.5rem)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  {milestone.icon}
                </div>
                <div
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                    color: "#d97706",
                    marginBottom: "0.75rem",
                  }}
                >
                  {milestone.year}
                </div>
                <p
                  style={{
                    color: "#78350f",
                    fontWeight: "600",
                    fontSize: "1.125rem",
                  }}
                >
                  {milestone.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: "bold",
                color: "#78350f",
                marginBottom: "1rem",
              }}
            >
              Meet Our Team
            </h2>
            <p
              style={{
                color: "rgba(146, 64, 14, 0.8)",
                fontSize: "1.125rem",
                maxWidth: "42rem",
                margin: "0 auto",
              }}
            >
              The passionate individuals behind your perfect cup of coffee
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              justifyItems: "center",
            }}
          >
            {teamMembers.map((member, index) => {
              const gradientMap = {
                "from-amber-500 to-orange-500":
                  "linear-gradient(to bottom right, #f59e0b, #f97316)",
                "from-amber-600 to-yellow-600":
                  "linear-gradient(to bottom right, #d97706, #ca8a04)",
                "from-orange-500 to-amber-600":
                  "linear-gradient(to bottom right, #f97316, #d97706)",
                "from-yellow-600 to-amber-500":
                  "linear-gradient(to bottom right, #ca8a04, #f59e0b)",
                "from-amber-500 to-orange-600":
                  "linear-gradient(to bottom right, #f59e0b, #ea580c)",
              };

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    maxWidth: "320px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "1.5rem",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-0.75rem)";
                      e.currentTarget.style.boxShadow =
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    {/* Icon/Avatar Section */}
                    <div
                      style={{
                        background: gradientMap[member.color],
                        height: "12rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "5rem",
                          position: "relative",
                          zIndex: "10",
                          transition: "transform 0.3s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        {member.icon}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div
                      style={{
                        padding: "1.5rem",
                        textAlign: "center",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#78350f",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {member.name}
                      </h3>
                      <p
                        style={{
                          color: "#d97706",
                          fontWeight: "600",
                          marginBottom: "0.75rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        {member.role}
                      </p>
                      <p
                        style={{
                          color: "rgba(146, 64, 14, 0.7)",
                          fontSize: "0.875rem",
                          lineHeight: "1.625",
                        }}
                      >
                        {member.description}
                      </p>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div
                      style={{
                        height: "0.5rem",
                        background: gradientMap[member.color],
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          background: "linear-gradient(to bottom right, #78350f, #c2410c)",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            Our Core Values
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              justifyItems: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s",
                cursor: "pointer",
                maxWidth: "350px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)")
              }
            >
              <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>
                💎
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                Excellence
              </h3>
              <p style={{ color: "#fef3c7" }}>
                We strive for perfection in every cup, every interaction, every
                moment.
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s",
                cursor: "pointer",
                maxWidth: "350px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)")
              }
            >
              <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>
                🌍
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                Responsibility
              </h3>
              <p style={{ color: "#fef3c7" }}>
                Committed to sustainable practices and ethical sourcing for our
                planet.
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                backdropFilter: "blur(8px)",
                transition: "all 0.3s",
                cursor: "pointer",
                maxWidth: "350px",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)")
              }
            >
              <div style={{ fontSize: "3.75rem", marginBottom: "1rem" }}>
                🎨
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                Innovation
              </h3>
              <p style={{ color: "#fef3c7" }}>
                Constantly exploring new flavors and techniques to delight our
                customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "bold",
              color: "#78350f",
              marginBottom: "1.5rem",
            }}
          >
            Join Our Story
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "rgba(146, 64, 14, 0.8)",
              marginBottom: "2.5rem",
              lineHeight: "1.75",
            }}
          >
            Visit us today and become part of the UniCafé family. Every cup
            tells a story, and we'd love for you to be part of ours.
          </p>
          <div
            className="button-container"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link
              to="/menu"
              style={{
                background: "linear-gradient(to right, #d97706, #ea580c)",
                color: "white",
                paddingLeft: "2.5rem",
                paddingRight: "2.5rem",
                paddingTop: "1rem",
                paddingBottom: "1rem",
                borderRadius: "9999px",
                fontWeight: "600",
                fontSize: "1.125rem",
                transition: "all 0.3s",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                textDecoration: "none",
                display: "inline-block",
                minWidth: "200px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }}
            >
              View Our Menu
            </Link>
            <Link
              to="/"
              style={{
                backgroundColor: "white",
                color: "#78350f",
                paddingLeft: "2.5rem",
                paddingRight: "2.5rem",
                paddingTop: "1rem",
                paddingBottom: "1rem",
                borderRadius: "9999px",
                fontWeight: "600",
                fontSize: "1.125rem",
                border: "2px solid #d97706",
                transition: "all 0.3s",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                textDecoration: "none",
                display: "inline-block",
                minWidth: "200px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.backgroundColor = "#fffbeb";
                e.currentTarget.style.boxShadow =
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }}
            >
              Visit Homepage
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
