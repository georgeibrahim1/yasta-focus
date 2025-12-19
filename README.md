
<div align="center">
  <h1>
    <img src="yasta-focus-frontend/public/Logo.svg" alt="Yasta Focus Logo" height="50" style="vertical-align: middle; margin-right: 10px;" />
    YASTA <span style="color: #a855f7">FOCUS</span>
  </h1>
  <p><strong>A Gamified Educational & Productivity Hub</strong></p>
</div>

---

## 🚀 Overview

**Yasta Focus** is a comprehensive platform designed to enhance student productivity and engagement through gamification and community features. It combines essential study tools with social interaction to create a motivating environment for learning.

## ✨ Features

### 🧠 Productivity Tools
- **Focus Timer**: Customizable Pomodoro-style timer to manage study sessions.
- **Subjects & Tasks**: Organize study materials and track assignments.
- **Notes**: Rich text editor for taking and organizing study notes.
- **AI-Powered Flashcards**: Create decks and flashcards manually or generate them instantly using AI.

### 👥 Community & Social
- **Study Rooms**: Join virtual rooms with video and chat capabilities to study with peers.
- **Communities**: Create or join interest-based groups.
- **Friends System**: Connect with other students.
- **Leaderboards**: Compete globally or within communities (Daily, Weekly, All-time).

### 🏆 Gamification
- **Competitions**: Participate in global or local community challenges.
- **Achievements**: Earn badges and rewards for study streaks and milestones.
- **Levels & XP**: Gain experience points for every productive action.

### 📅 Events
- **Live Events**: Host or attend live video sessions and workshops.

### 🛡️ Admin Dashboard
- **Analytics**: Comprehensive reports on user engagement and content creation.
- **User Management**: Manage users, communities, and content.
- **System Control**: Create global competitions and manage platform settings.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4
- **State Management**: React Query
- **Real-time**: Socket.io Client, Stream Chat/Video SDK
- **Visualization**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini AI
- **Real-time**: Socket.io

## 📸 Screenshots

<div align="center">
  <img src="yasta-focus-frontend/public/screenshots/adminDashbaord.png" alt="Admin Dashboard" width="800"/>
  <p><em>Admin Dashboard with Analytics</em></p>
</div>

<div align="center">
  <img src="yasta-focus-frontend/public/screenshots/UserPageHasAchievmentsFriends.png" alt="User Profile" width="800"/>
  <p><em>User Profile with Achievements</em></p>
</div>

| | |
|:-------------------------:|:-------------------------:|
| <img src="yasta-focus-frontend/public/screenshots/CommunityHaveCompetitionAndAnnouncments,StudyRoomsWithChat.png" width="400"/> <br> **Community & Study Rooms** | <img src="yasta-focus-frontend/public/screenshots/VideoCallEvents.png" width="400"/> <br> **Video Call & Events** |
| <img src="yasta-focus-frontend/public/screenshots/LeaderBoardByWeekMonthAllthetIMEToday.png" width="400"/> <br> **Leaderboards** | <img src="yasta-focus-frontend/public/screenshots/timerAndStudySessionsPomodoroForSubjects.png" width="400"/> <br> **Focus Timer** |
| <img src="yasta-focus-frontend/public/screenshots/AiChatBot.png" width="400"/> <br> **AI Chat Assistant** | <img src="yasta-focus-frontend/public/screenshots/adminControlAllCommunitites.png" width="400"/> <br> **Communities** |

## 💻 Run Locally

Prerequisites: **Node.js** and **PostgreSQL** installed.

### 1. Clone the project

```bash
git clone https://github.com/your-username/yasta-focus.git
cd yasta-focus
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd yasta-focus-backend
npm install
```

Create a `config.env` file in the root of `yasta-focus-backend`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/yasta_focus
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development

# External Services
GEMINI_API_KEY=your_google_gemini_key
STREAM_API_KEY=your_getstream_key
STREAM_API_SECRET=your_getstream_secret
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../yasta-focus-frontend
npm install
```

Create a `.env` file in the root of `yasta-focus-frontend`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_KEY=your_getstream_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the application:
```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

---

<div align="center">
  <p>Made with ❤️ by the Yasta Focus Team</p>
</div>
<table align = "center">
<tr>
  <td align = "center"> 
	<a href = "https://github.com/georgeibrahim1">
	  <img src = "https://github.com/georgeibrahim1.png" width = 100>
	  <br />
	  <sub> George Ibrahim </sub>
	</a>
  </td>
  <td align = "center"> 
	<a href = "https://github.com/OMAR-Zizo827">
	  <img src = "https://github.com/OMAR-Zizo827.png" width = 100>
	  <br />
	  <sub> Omar Abdelaziz </sub>
	</a>
  </td>
  <td align = "center"> 
	<a href = "https://github.com/PierreEhab-1337">
	  <img src = "https://github.com/PierreEhab-1337.png" width = 100>
	  <br />
	  <sub> Pierre Ehab </sub>
	</a>
  </td>
  <td align = "center"> 
	<a href = "https://github.com/NourEl-deenAhmed">
	  <img src = "https://github.com/NourEl-deenAhmed.png" width = 100>
	  <br />
	  <sub> Nour El-deen Ahmed </sub>
	</a>
  </td>
</tr>
</table>