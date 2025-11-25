import { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setStatus("sending");
    setTimeout(() => {
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setStatus(""), 3000);
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #fffbeb, #ffedd5, #fef3c7)",
      }}
    >
      <NavBar />

      {/* Hero Section */}
      <div
        style={{
          paddingTop: "6rem",
          paddingBottom: "4rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        <div
          style={{ maxWidth: "80rem", margin: "0 auto", textAlign: "center" }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-4">
            Get in Touch
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#b45309",
              maxWidth: "42rem",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 1rem 5rem 1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Contact Info Cards */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Location Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#78350f",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Visit Us
                  </h3>
                  <p
                    style={{
                      color: "#92400e",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    123 University Avenue
                    <br />
                    Campus Center, Building A
                    <br />
                    Metro Manila, Philippines
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(to bottom right, #10b981, #059669)",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    flexShrink: 0,
                  }}
                >
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#78350f",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Call Us
                  </h3>
                  <p
                    style={{
                      color: "#92400e",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    +63 (2) 1234-5678
                    <br />
                    +63 917 123 4567
                    <br />
                    Mon-Fri: 8:00 AM - 8:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(to bottom right, #3b82f6, #2563eb)",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    flexShrink: 0,
                  }}
                >
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#78350f",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Email Us
                  </h3>
                  <p
                    style={{
                      color: "#92400e",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    info@unicafe.ph
                    <br />
                    support@unicafe.ph
                    <br />
                    We'll reply within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(to bottom right, #a855f7, #9333ea)",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    flexShrink: 0,
                  }}
                >
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
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#78350f",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Follow Us
                  </h3>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        transition: "background-color 0.3s",
                        display: "inline-flex",
                      }}
                      aria-label="Facebook"
                    >
                      <svg
                        className="w-5 h-5 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        transition: "background-color 0.3s",
                        display: "inline-flex",
                      }}
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-5 h-5 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        transition: "background-color 0.3s",
                        display: "inline-flex",
                      }}
                      aria-label="Twitter"
                    >
                      <svg
                        className="w-5 h-5 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ gridColumn: "span 1" }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                padding: "clamp(2rem, 4vw, 2.5rem)",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.875rem, 3vw, 2.25rem)",
                  fontWeight: "bold",
                  color: "#78350f",
                  marginBottom: "1.5rem",
                }}
              >
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#78350f",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "1px solid #fde68a",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        transition: "all 0.3s",
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#78350f",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "1px solid #fde68a",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        transition: "all 0.3s",
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      htmlFor="phone"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#78350f",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "1px solid #fde68a",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        transition: "all 0.3s",
                      }}
                      placeholder="+63 917 123 4567"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#78350f",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "1px solid #fde68a",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        transition: "all 0.3s",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="partnership">Partnership</option>
                      <option value="catering">Catering Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#78350f",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #fde68a",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.3s",
                      resize: "none",
                    }}
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    style={{
                      background: "linear-gradient(to right, #d97706, #b45309)",
                      color: "white",
                      padding: "0.75rem 2rem",
                      borderRadius: "0.5rem",
                      fontWeight: "600",
                      transition: "all 0.3s",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      border: "none",
                      cursor: status === "sending" ? "not-allowed" : "pointer",
                      opacity: status === "sending" ? 0.5 : 1,
                    }}
                  >
                    {status === "sending" ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
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
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>

                  {status === "success" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#059669",
                        fontWeight: "500",
                      }}
                    >
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
                      Message sent successfully!
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div
          style={{
            marginTop: "4rem",
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "clamp(1.5rem, 3vw, 2rem)" }}>
            <h2
              style={{
                fontSize: "clamp(1.875rem, 3vw, 2.25rem)",
                fontWeight: "bold",
                color: "#78350f",
                marginBottom: "1rem",
              }}
            >
              Find Us Here
            </h2>
            <p className="text-amber-700 mb-6">
              Visit our cozy café located in the heart of the university campus
            </p>
          </div>
          <div
            style={{
              width: "100%",
              height: "24rem",
              background: "linear-gradient(to bottom right, #fef3c7, #fde68a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <svg
                className="w-20 h-20 text-amber-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p style={{ color: "#92400e", fontWeight: "500" }}>
                Interactive Map Placeholder
              </p>
              <p
                style={{
                  color: "#d97706",
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                }}
              >
                123 University Avenue, Campus Center
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
