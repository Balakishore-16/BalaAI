# CBIT Personal AI Career Agent

An AI-powered career assistance platform designed specifically for CBIT students to help with job hunting, internships, hackathons, and career development.

## 🚀 Features

### 🔐 Authentication & Access Control
- CBIT student-only registration (roll numbers starting with 1601)
- JWT authentication with secure password hashing
- Private roll number display

### 💼 Job Hunting & Smart Search
- Aggregated job, internship, and hackathon data
- Natural language search powered by OpenAI
- Save and schedule searches
- Source attribution and direct links

### 🔔 Smart Notifications
- Multi-channel alerts (Telegram, SMS/WhatsApp, Email)
- Automated job matching notifications
- Background worker with hourly updates

### 📝 Auto-Apply Helper
- Pre-fill common application information
- Mock implementation for supported job boards
- Resume and cover letter generation

### 📅 Scheduler & Reminders
- Deadline and interview tracking
- Automated reminders via preferred channels
- Dashboard integration

### 📄 Resume & Cover Letter Generator
- AI-powered customization using OpenAI
- Job-specific content generation
- Professional formatting

### 🔍 Research Helper
- Company information and insights
- Role responsibility analysis
- Required skills breakdown

### 🎤 Voice Assistant
- Voice input using Web Speech API
- AI-powered career guidance
- Text-to-speech responses

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark mode support
- Intuitive dashboard layout

## 🏗️ Project Structure

```
cbit-career-agent/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js + Express backend API
├── worker/            # Background job processor
├── shared/            # Shared types and constants
├── package.json       # Root package configuration
└── README.md          # This file
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT, bcrypt
- **AI Services**: OpenAI API
- **Notifications**: Telegram Bot API, Twilio, Nodemailer
- **Background Jobs**: Node-cron
- **Voice**: Web Speech API

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn
- OpenAI API key
- Telegram Bot token
- Twilio credentials (optional)
- Email service credentials

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd cbit-career-agent
npm run install:all
```

### 2. Environment Setup

Copy the environment files and configure your API keys:

```bash
cp backend/.env.example backend/.env
cp worker/.env.example worker/.env
```

Edit the `.env` files with your actual API keys and configuration.

### 3. Database Setup

Ensure MongoDB is running and create the database:

```bash
mongosh
use cbit-career-agent
```

### 4. Start Development

```bash
npm run dev
```

This will start all services concurrently:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Worker: Background processing

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cbit-career-agent
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

#### Worker (.env)
```
MONGODB_URI=mongodb://localhost:27017/cbit-career-agent
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/saved` - Get saved searches
- `POST /api/jobs/save-search` - Save search
- `GET /api/jobs/recommendations` - Get personalized recommendations

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/resume` - Upload resume
- `POST /api/profile/cover-letter` - Generate cover letter

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/settings` - Update notification preferences
- `POST /api/notifications/test` - Test notification channels

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI job matching
- [ ] Integration with more job boards
- [ ] Video interview preparation
- [ ] Networking event recommendations
- [ ] Skill assessment tools
- [ ] Career path planning
- [ ] Mentorship matching

---

Built with ❤️ for CBIT students