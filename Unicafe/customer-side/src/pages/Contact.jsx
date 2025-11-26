import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    }, 1500)
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <section className="relative bg-gradient-to-br from-primary-100 via-orange-50 to-amber-100 py-20 overflow-hidden">
        <AnimatedBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold gradient-text mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-700"
          >
            We'd love to hear from you
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-bold gradient-text mb-6">
                  Let's Connect
                </h2>
                <p className="text-gray-700 text-lg mb-8">
                  Have a question, feedback, or just want to say hi? We're here to help! 
                  Reach out through any of the channels below or fill out the contact form.
                </p>
              </div>

              <div className="space-y-6">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="glass-effect rounded-2xl p-6 flex items-start space-x-4"
                >
                  <div className="bg-primary-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      123 University Avenue<br />
                      Campus Building A, Ground Floor<br />
                      City, State 12345
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="glass-effect rounded-2xl p-6 flex items-start space-x-4"
                >
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                    <p className="text-gray-600">
                      +63 912 345 6789<br />
                      Mon-Fri: 7AM - 9PM<br />
                      Sat-Sun: 8AM - 10PM
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="glass-effect rounded-2xl p-6 flex items-start space-x-4"
                >
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                    <p className="text-gray-600">
                      hello@unicafe.com<br />
                      support@unicafe.com<br />
                      We reply within 24 hours
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 10 }}
                  className="glass-effect rounded-2xl p-6 flex items-start space-x-4"
                >
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Opening Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Friday: 7:00 AM - 9:00 PM</p>
                      <p>Saturday: 8:00 AM - 10:00 PM</p>
                      <p>Sunday: 9:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-semibold">
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="h-96 bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-24 h-24 text-primary-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-700">
                  Find Us on Campus
                </p>
                <p className="text-gray-600 mt-2">
                  Building A, Ground Floor • Next to the Main Library
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact
