import { Link } from 'react-router-dom'

const Breadcrumb = ({ items }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
    {items.map((item, index) => (
      <span key={item.label} className="flex items-center gap-2">
        {index > 0 && <span className="text-gray-400">/</span>}
        {item.href ? (
          <Link to={item.href} className="hover:text-primary-600 transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-gray-900">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
)

export default Breadcrumb
