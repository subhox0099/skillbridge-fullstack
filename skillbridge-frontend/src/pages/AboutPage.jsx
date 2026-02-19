import { Link } from 'react-router-dom'
import { CREATORS } from '../components/AppFooter'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About SkillBridge</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talented students with innovative businesses through smart matching and real-time collaboration.
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            SkillBridge aims to bridge the gap between students seeking meaningful internship experiences and businesses looking for skilled talent. We use intelligent matching algorithms, real-time notifications, and a robust rating system to create the best connections.
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <li className="flex items-center gap-2">✓ Smart skill-based matching</li>
            <li className="flex items-center gap-2">✓ Geo-distance location matching</li>
            <li className="flex items-center gap-2">✓ Resume parsing with NLP</li>
            <li className="flex items-center gap-2">✓ Real-time email notifications</li>
            <li className="flex items-center gap-2">✓ Rating & review system</li>
            <li className="flex items-center gap-2">✓ Application management</li>
          </ul>
        </div>

        {/* Creators Section */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creators</h2>
          <p className="text-gray-600 mb-8">SkillBridge was built by</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREATORS.map((creator) => (
              <div
                key={creator.name}
                className="p-6 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {creator.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                <p className="text-primary-600 font-medium">{creator.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            SkillBridge © {new Date().getFullYear()} — Shobhit, Subhojit & Manish
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
