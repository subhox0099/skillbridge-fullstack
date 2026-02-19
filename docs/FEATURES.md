# SkillBridge Backend - Enhanced Features

## 📧 Real-Time Email Notifications

### Email Service
- **Location**: `src/services/emailService.js`
- **Provider**: Nodemailer (supports Gmail, Outlook, SendGrid, Mailgun, etc.)
- **Templates**: Beautiful HTML email templates for all events

### Email Events
1. **Application Received** - Sent to student when they apply
2. **Application Status Update** - Sent when status changes (SELECTED, SHORTLISTED, REJECTED)
3. **New Application Received** - Sent to business when student applies
4. **Review Received** - Sent to student when business leaves a review
5. **New Project Match** - Sent when high-match project is found (future feature)
6. **General Notifications** - For any system notification

### Configuration
Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

## 🔔 Notification System

### Features
- **Database Storage** - All notifications stored in `notifications` table
- **Email Integration** - Automatically sends emails for important events
- **Real-time Updates** - Frontend polls for new notifications
- **Read/Unread Status** - Track notification status
- **Related Entities** - Link notifications to projects, applications, reviews

### Notification Types
- `APPLICATION_SUBMITTED` - Student submitted application
- `APPLICATION_STATUS_UPDATE` - Application status changed
- `NEW_APPLICATION` - Business received new application
- `REVIEW_RECEIVED` - Student received review
- `PROJECT_MATCH` - New matching project found

### API Endpoints
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 📝 Enhanced Application Management

### Features
- **Status Updates** - Business can update application status
- **Email Notifications** - Automatic emails on status changes
- **Application Tracking** - Students can view all their applications
- **Business View** - Businesses see all applications for their projects

### API Endpoints
- `GET /api/applications` - Get applications (filtered by role)
- `POST /api/applications` - Submit application
- `PATCH /api/applications/:id/status` - Update application status

### Status Flow
1. `APPLIED` - Initial status
2. `SHORTLISTED` - Business shortlisted candidate
3. `SELECTED` - Candidate selected for project
4. `REJECTED` - Application rejected

## 🎯 Additional Features

### Project Management
- Create projects with location coordinates
- View all projects
- Filter and search projects
- Project status management

### Candidate Matching
- View ranked candidates with match scores
- Match score calculation with configurable weights
- Geo-distance matching
- Skill-based matching

### Review System
- Leave reviews after project completion
- View all reviews for a user
- Average rating calculation
- Email notifications on reviews

### Resume Parsing
- Upload PDF resumes
- Extract skills, education, experience
- Auto-update user skills
- Store parsed data

## 🔐 Security Features

- JWT authentication
- Role-based access control
- Input validation
- SQL injection protection (Sequelize)
- XSS protection
- CORS configuration

## 📊 Database Schema Updates

### Notification Model
- `user_id` - User receiving notification
- `type` - Notification type
- `message` - Notification message
- `is_read` - Read status
- `related_id` - Related entity ID
- `related_type` - Related entity type

## 🚀 Performance Optimizations

- Efficient database queries
- Email sending in background (non-blocking)
- Notification polling optimization
- Caching strategies (future)

## 📈 Future Enhancements

- Real-time WebSocket notifications
- Push notifications
- Email templates customization
- Bulk email sending
- Email analytics
- Notification preferences
- SMS notifications
- In-app messaging system
