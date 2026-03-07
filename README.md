# Compliance Intelligence Platform

A comprehensive MERN stack application for automating compliance management, tracking regulatory obligations, and maintaining audit readiness.

## 🚀 Features

- **Smart Compliance Tracking**: Automatically identify applicable regulations based on business profile
- **Task Management**: Convert regulations into actionable tasks with deadlines
- **AI Copilot**: Get intelligent guidance on compliance questions and document analysis
- **Evidence Management**: Upload and track compliance evidence for audit readiness
- **Email Reminders**: Automated daily reminders for overdue and upcoming tasks
- **Role-Based Access Control**: Admin, Manager, Employee, and Viewer roles
- **Activity Logging**: Track all compliance-related activities
- **Analytics Dashboard**: Visual insights into compliance posture and risk levels
- **Multi-User Support**: Organization-based user management

## 🛠️ Tech Stack

### Frontend
- **React** (v19.2.0) - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering for AI responses
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks
- **Nodemailer** - Email service
- **HuggingFace API** - AI/ML capabilities

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email notifications)
- HuggingFace API key (for AI features)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Compliance_System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/compliance_db
JWT_SECRET=your_jwt_secret_key_here
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
HUGGINGFACE_API_KEY=your_huggingface_api_key
FRONTEND_URL=http://localhost:5173
```

**Note**: For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running Locally

### Start MongoDB

```bash
# If using local MongoDB
mongod
```

### Start Backend Server

```bash
cd backend
npm start
```

Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
4. Add environment variables:
   - `PORT` (Render provides this automatically)
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `MAIL_USER`
   - `MAIL_PASS`
   - `HUGGINGFACE_API_KEY`
   - `FRONTEND_URL` (your Vercel URL)

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts
5. Add environment variable:
   - `VITE_API_URL` = your Render backend URL

Or deploy via Vercel Dashboard:
1. Import your GitHub repository
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all IPs)
4. Get connection string and update `MONGO_URI` in backend environment variables

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `MAIL_USER` | Gmail address for sending emails | `your_email@gmail.com` |
| `MAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `HUGGINGFACE_API_KEY` | HuggingFace API key | `hf_xxxxx` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-api.onrender.com` |

## 📁 Project Structure

```
Compliance_System/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── jobs/           # Cron jobs
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── uploads/        # File uploads
│   ├── utils/          # Utility functions
│   ├── .env            # Environment variables
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── assets/     # Static assets
│   │   ├── App.jsx     # Main app component
│   │   ├── config.js   # API configuration
│   │   └── main.jsx    # Entry point
│   ├── .env            # Environment variables
│   ├── vite.config.js  # Vite configuration
│   └── package.json
├── .gitignore
└── README.md
```

## 🔑 Default User Roles

- **Admin**: Full access to all features including user management
- **Manager**: Can manage tasks and view analytics
- **Employee**: Can upload evidence and complete tasks
- **Viewer**: Read-only access to dashboard

## 📧 Email Notifications

The system sends automated email reminders at 5:35 PM IST daily for:
- Overdue tasks
- Tasks due within 7 days

Configure the schedule in `backend/jobs/reminderJob.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check network access settings in MongoDB Atlas

### Email Not Sending
- Verify Gmail App Password is correct
- Enable "Less secure app access" or use App Password
- Check MAIL_USER and MAIL_PASS environment variables

### CORS Errors
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Check that backend CORS configuration allows your frontend origin

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Ensure all environment variables are set

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for compliance automation
