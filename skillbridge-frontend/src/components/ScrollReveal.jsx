import { useScrollReveal } from '../hooks/useScrollReveal'

const ScrollReveal = ({ children, className = '', as: Component = 'div' }) => {
  const [ref, visible] = useScrollReveal({ once: true, threshold: 0.08 })

  return (
    <Component
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </Component>
  )
}

export default ScrollReveal
