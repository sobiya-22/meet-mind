# MeetMind

<div align="center">
  <img src="assets/images/readme.png" alt="MeetMind Logo" width="200"/>
</div>
MeetMind is an AI-powered meeting assistant that helps you manage, analyze, and optimize your meetings. It provides real-time meeting analysis, task tracking, and intelligent insights to make your meetings more productive.

## ✨ Features

- **Real-time Meeting Analysis**: Get instant insights during your meetings
- **Task Management**: Track and manage meeting-related tasks
- **Meeting Analytics**: View detailed analytics of past meetings
- **Upcoming Meetings**: Keep track of your scheduled meetings
- **AI-Powered Insights**: Get smart suggestions and summaries
- **Cross-Platform**: Works on web and mobile devices
- **Transcription**: Automatically transcribe audio recordings from meetings using AssemblyAI for accurate text conversion
- **Summary Generation**: Generate concise bullet-point summaries of meetings using AssemblyAI's informative summarization model
- **Task Extraction**: Extract actionable tasks from meeting transcripts with due dates (if specified) using Gemini AI
- **Minutes Extraction**: Summarize key discussion points, decisions, and updates from meetings into structured minutes using Gemini AI
- **Recording Download**: Download meeting recordings from URLs, including Google Drive links, and save them locally for processing

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
- AssemblyAI (for transcription and summarization)
- Gemini API (for task and minutes extraction)
- Axios (for HTTP requests and file downloads)

### Authentication
- Firebase Auth

### Analysis
- AssemblyAI (transcription and summarization)
- Gemini API (task and minutes extraction)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development) or Mobile Phone

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meetmind.git
cd meetmind

```

2. Install dependencies:
```bash

# Install frontend dependencies
npm install
```

# Install backend dependencies
cd backend
npm install


3. Set up environment variables:
```
a. Create a `.env` file in the backend directory:

IP_ADDRESS= your-current-ip-address     #Ensure both the devices mobile and laptop are connected 
                                        over same IP Address
PORT= 5000
# firebase configuration
#add your firebase configuration for firestore storage and auth setup
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
FIREBASE_APP_ID=your-firebase-app-id

b. Create a `.env` file in the backend directory:


PORT=5000
GOOGLE_EMAIL=add-your-email
GOOGLE_PASSWORD=gmail-password
ASSEMBLYAI_API_KEY=assembly-ai-api-key     #for uplaoding, transcribing ans summarizing audio files
GEMINI_API_KEY=your-gemini-api-key         #for extarcting tasks,minutes of meeting

# firebase configuration
#add your firebase configuration for firestore storage and auth setup
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
FIREBASE_APP_ID=your-firebase-app-id
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start app
cd ../
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

### User Statistics
- `GET/api/user/:uid/stats` - Get User profile Information

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.



<div align="center">
  Made with ❤️ by Sobiya
</div>