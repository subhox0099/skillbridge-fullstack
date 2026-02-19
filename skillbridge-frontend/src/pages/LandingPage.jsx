import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import AnimatedCounter from '../components/AnimatedCounter'
import TestimonialCard from '../components/TestimonialCard'
import ScrollReveal from '../components/ScrollReveal'
import LiveIndicator from '../components/LiveIndicator'

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="glass-effect shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <span className="text-3xl drop-shadow-sm">🎓</span>
              <span className="text-2xl font-bold text-gradient">SkillBridge</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-primary-50"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-slideUp">
            Find Your Perfect
            <span className="text-gradient block mt-2">Internship Match</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Connect talented students with innovative businesses. Get matched based on skills, location, and ratings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => setShowRegister(true)}
              className="btn-primary text-lg px-8 py-4 animate-glow-pulse"
            >
              Start as Student
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="btn-secondary text-lg px-8 py-4"
            >
              Post a Project
            </button>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 flex justify-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-float" />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl border border-gray-100/80">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-hover group/card">
                  <div className="text-4xl mb-3 transition-transform duration-300 group-hover/card:scale-110">🎯</div>
                  <h3 className="font-bold text-lg mb-2">Smart Matching</h3>
                  <p className="text-gray-600 text-sm">AI-powered matching algorithm</p>
                </div>
                <div className="card-hover group/card flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-4xl transition-transform duration-300 group-hover/card:scale-110">📊</div>
                    <LiveIndicator />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Real-time Updates</h3>
                  <p className="text-gray-600 text-sm">Instant notifications & emails</p>
                </div>
                <div className="card-hover group/card">
                  <div className="text-4xl mb-3 transition-transform duration-300 group-hover/card:scale-110">⭐</div>
                  <h3 className="font-bold text-lg mb-2">Rating System</h3>
                  <p className="text-gray-600 text-sm">Build your reputation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SkillBridge?</h2>
            <p className="text-xl text-gray-600">Everything you need to find the perfect match</p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔍"
                title="Smart Search"
                description="Find projects that match your skills and location with our advanced matching algorithm."
              />
              <FeatureCard
                icon="📧"
                title="Real-time Notifications"
                description="Get instant email and in-app notifications for applications, updates, and matches."
              />
              <FeatureCard
                icon="📄"
                title="Resume Parsing"
                description="Upload your resume and automatically extract skills to enhance your profile."
              />
              <FeatureCard
                icon="⭐"
                title="Rating System"
                description="Build your reputation with ratings and reviews from completed projects."
              />
              <FeatureCard
                icon="📍"
                title="Location Matching"
                description="Find opportunities near you using geo-distance calculation."
              />
              <FeatureCard
                icon="💼"
                title="Project Management"
                description="Businesses can manage projects, applications, and candidates all in one place."
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title="Create Account"
                description="Sign up as a student or business. Complete your profile with skills and preferences."
              />
              <StepCard
                number="2"
                title="Get Matched"
                description="Our algorithm matches you with the best opportunities based on skills, location, and ratings."
              />
              <StepCard
                number="3"
                title="Start Working"
                description="Apply to projects, get selected, and start your internship journey!"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied students and businesses</p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
              name="Sarah Johnson"
              role="Computer Science Student"
              rating={5}
              text="SkillBridge helped me find the perfect internship! The matching algorithm is amazing and I got matched with a great company."
            />
            <TestimonialCard
              name="Michael Chen"
              role="Business Owner"
              rating={5}
              text="We've found incredible talent through SkillBridge. The platform makes it so easy to find qualified candidates."
            />
              <TestimonialCard
                name="Emily Rodriguez"
                role="Data Science Student"
                rating={5}
                text="The resume parsing feature saved me so much time. I uploaded my resume and my profile was automatically updated!"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  <AnimatedCounter end={1000} suffix="+" />
                </div>
                <div className="text-gray-600">Active Students</div>
              </div>
              <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  <AnimatedCounter end={500} suffix="+" />
                </div>
                <div className="text-gray-600">Projects Posted</div>
              </div>
              <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  <AnimatedCounter end={2000} suffix="+" />
                </div>
                <div className="text-gray-600">Applications</div>
              </div>
              <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">4.8★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of students and businesses finding their perfect match
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowRegister(true)}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg btn-primary"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-400 transition-colors text-lg border-2 border-white active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer with Creators */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎓</span>
                <span className="text-xl font-bold">SkillBridge</span>
              </div>
              <p className="text-gray-400">Connecting talent with opportunity.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Upload Resume</a></li>
                <li><a href="#" className="hover:text-white transition-colors">View Applications</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Project</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Candidates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manage Projects</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About & Creators</Link></li>
                <li><a href="mailto:support@skillbridge.com" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Creators */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <h3 className="font-semibold mb-4 text-center text-gray-300">Built with ❤️ by</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
                <div>
                  <p className="font-semibold">Shobhit</p>
                  <p className="text-sm text-gray-400">Developer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
                <div>
                  <p className="font-semibold">Subhojit</p>
                  <p className="text-sm text-gray-400">Developer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">M</div>
                <div>
                  <p className="font-semibold">Manish</p>
                  <p className="text-sm text-gray-400">Developer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => {
        setShowLogin(false)
        setShowRegister(true)
      }} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => {
        setShowRegister(false)
        setShowLogin(true)
      }} />
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="card-hover text-center group">
    <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

const StepCard = ({ number, title, description }) => (
  <div className="relative group">
    <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-transform duration-300 group-hover:scale-110">
      {number}
    </div>
    <div className="card-hover pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
)

export default LandingPage
