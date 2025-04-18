# MeetMind 🧠

<div align="center">
  <img src="assets/images/app-logo.png" alt="MeetMind Logo" width="200"/>
</div>

MeetMind is an AI-powered meeting assistant that helps you manage, analyze, and optimize your meetings. It provides real-time meeting analysis, task tracking, and intelligent insights to make your meetings more productive.

## ✨ Features

- **Real-time Meeting Analysis**: Get instant insights during your meetings
- **Task Management**: Track and manage meeting-related tasks
- **Meeting Analytics**: View detailed analytics of past meetings
- **Upcoming Meetings**: Keep track of your scheduled meetings
- **AI-Powered Insights**: Get smart suggestions and summaries
- **Cross-Platform**: Works on web and mobile devices

## 🛠️ Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation
- Firebase Authentication
- Material Icons

### Backend
- Node.js with Express
- Firebase Firestore
- Firebase Admin SDK
- Multer (for file uploads)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meetmind.git
cd meetmind
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../app
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start app
npm start
```

## 📱 API Endpoints

### Meetings
- `GET /api/meet/upcoming-meetings/:uid` - Get upcoming meetings
- `GET /api/meet/recent-activity/:id` - Get recent meeting activity
- `POST /api/meet/add-meeting` - Add a new meeting
- `GET /api/meet/meetings/:itemid` - Get meeting details

### Tasks
- `GET /api/meet/tasks` - Get all tasks
- `PATCH /api/meet/tasks/:meetingId/:taskTitle` - Update task status

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.



<div align="center">
  Made with ❤️ by Sobiya
</div>