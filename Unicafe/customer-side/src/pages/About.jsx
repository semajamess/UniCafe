import { motion } from 'framer-motion'
import { Coffee, Heart, Users, Award } from 'lucide-react'
import CafeBackground from '../components/CafeBackground'

const About = () => {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <section className="relative bg-gradient-to-br from-primary-100 via-orange-50 to-amber-100 py-20 overflow-hidden">
        <CafeBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold gradient-text mb-4"
          >
            About UniCafé
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Where passion for coffee meets community
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold gradient-text mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 text-lg">
                <p>
                  UniCafé was born from a simple idea: everyone deserves great coffee at affordable prices. 
                  Founded in 2020, we started as a small coffee shop and quickly became the heartbeat 
                  of our community.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers every week, providing 
                  not just exceptional coffee, but a welcoming space where ideas flow and friendships flourish.
                </p>
                <p>
                  Every cup we serve is crafted with care, using ethically sourced beans and sustainable practices. 
                  Because we believe great coffee should also do great things for our community and planet.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-effect rounded-2xl p-12 shadow-2xl"
            >
              <Coffee className="w-32 h-32 text-primary-600 mx-auto mb-6" />
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-700 text-lg">
                  To fuel your day, one cup at a time. We're committed to providing 
                  quality coffee, affordable prices, and a community space where everyone belongs.
                </p>
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg">
              What makes UniCafé special
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Coffee className="w-12 h-12" />,
                title: 'Quality First',
                description: 'Premium ingredients, expert preparation, consistent excellence in every cup.'
              },
              {
                icon: <Heart className="w-12 h-12" />,
                title: 'Community Love',
                description: 'Building connections and supporting our local community every day.'
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: 'Customer Friendly',
                description: 'Affordable pricing and flexible hours designed for your convenience.'
              },
              {
                icon: <Award className="w-12 h-12" />,
                title: 'Sustainability',
                description: 'Committed to ethical sourcing and environmentally responsible practices.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-8 text-center hover:shadow-xl transition-all"
              >
                <div className="text-primary-600 flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect rounded-2xl p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '10K+', label: 'Happy Customers' },
                { number: '50K+', label: 'Cups Served' },
                { number: '4.9/5', label: 'Average Rating' },
                { number: '24/7', label: 'Customer Support' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl font-bold gradient-text mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">Meet Our Team</h2>
            <p className="text-gray-600 text-lg">
              The passionate people behind your favorite coffee
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Head Barista', specialty: 'Latte Art Master' },
              { name: 'Mike Chen', role: 'Coffee Roaster', specialty: 'Bean Selection Expert' },
              { name: 'Emma Davis', role: 'Customer Relations', specialty: 'Community Builder' }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="h-64 bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
                  <Users className="w-24 h-24 text-primary-600" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.specialty}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
