import { Link } from 'react-router-dom'

const CREATORS = [
  { name: 'Shobhit', role: 'Developer' },
  { name: 'Subhojit', role: 'Developer' },
  { name: 'Manish', role: 'Developer' },
]

const AppFooter = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark'

  return (
    <footer className={isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold">SkillBridge</span>
            </div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Connecting talent with opportunity.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li><Link to="/dashboard" className="hover:underline">Browse Projects</Link></li>
              <li><Link to="/dashboard" className="hover:underline">Upload Resume</Link></li>
              <li><Link to="/profile" className="hover:underline">My Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Businesses</h3>
            <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li><Link to="/dashboard" className="hover:underline">Post Project</Link></li>
              <li><Link to="/dashboard" className="hover:underline">Find Candidates</Link></li>
              <li><Link to="/dashboard" className="hover:underline">Manage Projects</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><a href="mailto:support@skillbridge.com" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Creators Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <h3 className="font-semibold mb-4 text-center">Built with ❤️ by</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {CREATORS.map((creator) => (
              <div
                key={creator.name}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {creator.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{creator.name}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{creator.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`border-t mt-6 pt-6 text-center ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter
export { CREATORS }
