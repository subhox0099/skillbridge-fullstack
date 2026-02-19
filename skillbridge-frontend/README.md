# SkillBridge Frontend

A modern, responsive React.js frontend for the SkillBridge internship matching platform.

## 🎨 Features

### Landing Page
- **Beautiful Hero Section** - Eye-catching introduction with call-to-action buttons
- **Features Showcase** - Highlight key platform features
- **How It Works** - Step-by-step guide for users
- **Statistics** - Animated counters showing platform metrics
- **Testimonials** - User reviews and ratings
- **Footer** - Complete site navigation and links

### Authentication
- **Login Modal** - Beautiful modal with social login options
- **Register Modal** - Role selection (Student/Business) with validation
- **Protected Routes** - Secure access to dashboard features

### Student Dashboard
- **Projects Tab** - Browse and search projects with match scores
- **Applications Tab** - Track all your applications
- **Resume Tab** - Upload and parse PDF resumes

### Business Dashboard
- **Overview Tab** - Analytics and statistics
- **Projects Tab** - Manage your projects
- **Candidates Tab** - View ranked candidates
- **Applications Tab** - Manage applications

### UI Components
- **Modern Design** - Gradient backgrounds, smooth animations
- **Responsive** - Works on all device sizes
- **Accessible** - WCAG compliant
- **Fast** - Optimized performance

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://localhost:4000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoginModal.jsx
│   ├── RegisterModal.jsx
│   ├── NotificationBell.jsx
│   ├── NotificationCenter.jsx
│   ├── ProjectCard.jsx
│   ├── StatsCard.jsx
│   └── ...
├── pages/               # Page components
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── StudentDashboard.jsx
│   ├── BusinessDashboard.jsx
│   └── Profile.jsx
├── context/             # React Context
│   └── AuthContext.jsx
├── services/            # API services
│   └── api.js
├── App.jsx             # Main app with routing
└── main.jsx            # Entry point
```

## 🎯 Key Features

### Landing Page
- Hero section with animated elements
- Feature cards with icons
- Step-by-step guide
- Animated statistics
- User testimonials
- Call-to-action sections
- Complete footer

### Authentication
- Modal-based login/register
- Role selection (Student/Business)
- Social login options (UI ready)
- Form validation
- Error handling

### Dashboards
- Real-time updates
- Search and filtering
- Statistics and analytics
- Notification center
- Profile management

## 🎨 Design System

### Colors
- Primary: Blue gradient (#3b82f6 to #1e40af)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

### Typography
- Headings: Bold, large sizes
- Body: Regular weight, readable sizes
- Labels: Semibold, small sizes

### Animations
- Fade-in animations
- Slide-up transitions
- Hover effects
- Loading states

## 🔐 Security

- JWT token management
- Protected routes
- Role-based access control
- Secure API calls
- Input validation

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly buttons
- Responsive grids

## 🚀 Performance

- Code splitting
- Lazy loading
- Memoized components
- Optimized re-renders
- Fast page loads

## 📝 License

MIT
