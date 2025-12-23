
<div align="center">
  <img src="yasta-focus-frontend/public/Logo.svg" alt="Yasta Focus Logo" height="60" />
  <h1>YASTA <span style="color: #a855f7">FOCUS</span></h1>
  <p><strong>A Gamified Educational & Productivity Hub</strong></p>
</div>

<p align="center">
    <a href="https://yasta-focus.netlify.app/">
        <img src="https://img.shields.io/badge/Live-Demo-FF5722?style=for-the-badge&logo=firefox&logoColor=white" alt="Live Demo" />
    </a>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
</div>

---

## 🚀 Overview

**Yasta Focus** is a comprehensive platform designed to enhance student productivity and engagement through gamification and community features. It combines essential study tools with social interaction to create a motivating environment for learning.

## ✨ Features

### 🧠 Productivity Tools
- **Focus Timer**: Customizable Pomodoro-style timer to manage study sessions.
- **Subjects & Tasks**: Organize study materials and track assignments.
- **Notes**: Rich text editor for taking and organizing study notes.
- **AI-Powered Chat**: AI chat for student subjects.

### 👥 Community & Social
- **Study Rooms**: Join virtual rooms with video and chat capabilities to study with peers.
- **Communities**: Create or join interest-based groups.
- **Friends System**: Connect with other students and give xp gifts for them.
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
- **Core**: [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Navigation**: [React Router 7](https://reactrouter.com/)
- **State Management**: [TanStack React Query 5](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/)
- **UI Components & Icons**: [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/)
- **Real-time**: [Socket.io Client](https://socket.io/), [Stream Video SDK](https://getstream.io/video/), [Stream Chat SDK](https://getstream.io/chat/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Utilities**: [Axios](https://axios-http.com/), [React Hot Toast](https://react-hot-toast.com/), [React MD Editor](https://uiwjs.github.io/react-md-editor/), [Uploadcare](https://uploadcare.com/), [React Snowfall](https://github.com/cahilfoley/react-snowfall)
- **Development**: ESLint, Vite Plugins

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg`)
- **Authentication**: [JSON Web Token (JWT)](https://jwt.io/), [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/aistudio)
- **Real-time**: [Socket.io](https://socket.io/), [Stream Node SDK](https://getstream.io/video/)
- **Utilities**: [Axios](https://axios-http.com/), [Dotenv](https://github.com/motdotla/dotenv), [Cookie Parser](https://github.com/expressjs/cookie-parser), [CORS](https://github.com/expressjs/cors)
- **Development**: [Nodemon](https://nodemon.io/)

## 🗄️ Enhanced Entity Relationship Diagram (EER)

<img src="yasta-focus-frontend/public/screenshots/ER.png" alt="EER Diagram" width="800"/>

## 📸 Screenshots

<div align="center">
  <img src="yasta-focus-frontend/public/screenshots/adminDashbaord.png" alt="Admin Dashboard" width="800"/>
  <p><em>Admin Dashboard with Analytics</em></p>
</div>

| | |
|:-------------------------:|:-------------------------:|
| <img src="yasta-focus-frontend/public/screenshots/CommunityHaveCompetitionAndAnnouncments,StudyRoomsWithChat.png" width="400"/> <br> **Community & Study Rooms** | <img src="yasta-focus-frontend/public/screenshots/UserPageHasAchievmentsFriends.png" width="400"/> <br> **Profile Page** |
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
PG_USER=XXX
PG_PASSWORD=XXX
PG_HOST=XXX
PG_PORT=XXX
PG_DATABASE=postgres

NODE_ENV=development
PORT=3000

JWT_SECRET=XXX
JWT_EXPIRES_IN=XXX
JWT_COOKIE_EXPIRES_IN=XXX

GROQ_API_KEY=XXX

STREAM_API_KEY=XXX
STREAM_SECRET=XXX
```

Start the server:
```bash
npm run start
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../yasta-focus-frontend
npm install
```

Create a `.env` file in the root of `yasta-focus-frontend`:
```env
VITE_STREAM_API_KEY=XXX
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADCARE_PUBLIC_KEY=XXX
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
