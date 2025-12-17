import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'
import AuthPage from './pages/authPage'
import TimerPage from './pages/timerPage'
import SubjectsPage from './pages/subjectsPage'
import DeckDetailPage from './pages/deckDetailPage'
import CommunitiesPage from './pages/communitiesPage'
import CommunityDetailPage from './pages/communityDetailPage'
import CompetitionLeaderboardPage from './pages/competitionLeaderboardPage'
import GlobalCompetitionLeaderboardPage from './pages/globalCompetitionLeaderboardPage'
import StudyRoomsPage from './pages/studyRoomsPage'
import LeaderboardPage from './pages/leaderboardPage'
import StatisticsPage from './pages/statisticsPage'
import ProfilePage from './pages/profilePage'
import SettingsPage from './pages/settingsPage'
import DashboardPage from './pages/dashboardPage'
import AdminUsersPage from './pages/adminUsersPage'
import AdminReportsPage from './pages/adminReportsPage'
import RoomInterfacePage from './pages/roomInterfacePage'
import LiveEventPage from './pages/liveEventPage'
import ProtectedRoute from './components/ProtectedRoute'
import AchievementsPage from './pages/achievementsPage' 
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from './services/authServices'
import { useQueryClient } from '@tanstack/react-query'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { data: userData, isLoading } = useUser()
  const user = userData?.data?.user

  // Invalidate user query on login/signup
  useEffect(() => {
    if (location.pathname === '/auth' && user) {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  }, [user, location.pathname, queryClient])

  useEffect(() => {
    if (isLoading) return
    // If not logged in, redirect to /auth
    if (!user) {
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true })
      }
    } else {
      // If logged in, redirect to dashboard if on root or /auth
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, isLoading, location.pathname, navigate])

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
        <Route path="communities/:communityId/competitions/:competitionId/leaderboard" element={<CompetitionLeaderboardPage/>}/>
        <Route path="competitions/:competitionId/leaderboard" element={<GlobalCompetitionLeaderboardPage/>}/>
        <Route path="communities/:communityId/rooms" element={<StudyRoomsPage/>}/>
        <Route path="communities/:communityId/rooms/:roomCode" element={<RoomInterfacePage/>}/>
        <Route path="event/:eventId/live" element={<LiveEventPage/>}/>
        <Route path="leaderboard" element={<LeaderboardPage/>}/>
        <Route path="statistics" element={<StatisticsPage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
        <Route path="profile/:userId" element={<ProfilePage/>}/>
        <Route path="settings" element={<SettingsPage/>}/>
        <Route path="decks/:subjectName/:deckTitle" element={<DeckDetailPage/>}/>
        <Route path="achievements" element={<AchievementsPage/>}/>

        {/* Admin-only Routes */}
        <Route path="admin/users" element={
          <ProtectedRoute requiredRole={0}>
            <AdminUsersPage/>
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
