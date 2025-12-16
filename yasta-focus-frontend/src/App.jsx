import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'
import AuthPage from './pages/authPage'
import TimerPage from './pages/timerPage'
import SubjectsPage from './pages/subjectsPage'
import DeckDetailPage from './pages/deckDetailPage'
import CommunitiesPage from './pages/communitiesPage'
import CommunityDetailPage from './pages/communityDetailPage'
import StudyRoomsPage from './pages/studyRoomsPage'
import LeaderboardPage from './pages/leaderboardPage'
import StatisticsPage from './pages/statisticsPage'
import ProfilePage from './pages/profilePage'
import SettingsPage from './pages/settingsPage'
import DashboardPage from './pages/dashboardPage'
import AdminStatisticsPage from './pages/adminStatisticsPage'
import AdminReportsPage from './pages/adminReportsPage'
import RoomInterfacePage from './pages/roomInterfacePage'
import ProtectedRoute from './components/ProtectedRoute'
import AchievementsPage from './pages/achievementsPage' 

export default function App() {
  return (
    <Routes>
      <Route path='/auth' element={<AuthPage/>}/>
      <Route path="/" element={<MainLayout/>}>
        {/* Dashboard - shows appropriate dashboard based on user role */}
        <Route path="dashboard" element={<DashboardPage/>}/>
        
        <Route path="timer" element={<TimerPage/>}/>
        <Route path="subjects" element={<SubjectsPage/>}/>
        <Route path="notes" element={<SubjectsPage/>}/>
        <Route path="communities" element={<CommunitiesPage/>}/>
        <Route path="communities/:communityId" element={<CommunityDetailPage/>}/>
        <Route path="communities/:communityId/rooms" element={<StudyRoomsPage/>}/>
        <Route path="communities/:communityId/rooms/:roomCode" element={<RoomInterfacePage/>}/>
        <Route path="leaderboard" element={<LeaderboardPage/>}/>
        <Route path="statistics" element={<StatisticsPage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
        <Route path="profile/:userId" element={<ProfilePage/>}/>
        <Route path="settings" element={<SettingsPage/>}/>
        <Route path="decks/:subjectName/:deckTitle" element={<DeckDetailPage/>}/>
        <Route path="achievements" element={<AchievementsPage/>}/>

        {/* Admin-only Routes */}
        <Route path="admin/statistics" element={
          <ProtectedRoute requiredRole={0}>
            <AdminStatisticsPage/>
          </ProtectedRoute>
        }/>
        <Route path="admin/reports" element={
          <ProtectedRoute requiredRole={0}>
            <AdminReportsPage/>
          </ProtectedRoute>
        }/>
      </Route>
    </Routes>
  )
}
