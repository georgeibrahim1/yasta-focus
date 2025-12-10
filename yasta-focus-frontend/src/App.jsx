import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'
import AuthPage from './pages/authPage'
import TimerPage from './pages/timerPage'
import SubjectsPage from './pages/subjectsPage'
import DeckDetailPage from './pages/deckDetailPage'
import CommunitiesPage from './pages/communitiesPage'
import LeaderboardPage from './pages/leaderboardPage'
import StatisticsPage from './pages/statisticsPage'
import ProfilePage from './pages/profilePage'


export default function App() {
  return (
    <Routes>
      <Route path='/auth' element={<AuthPage/>}/>
      <Route path="/" element={<MainLayout/>}>
        <Route path="timer" element={<TimerPage/>}/>
        <Route path="subjects" element={<SubjectsPage/>}/>
        <Route path="notes" element={<SubjectsPage/>}/>
        <Route path="communities" element={<CommunitiesPage/>}/>
        <Route path="leaderboard" element={<LeaderboardPage/>}/>
        <Route path="statistics" element={<StatisticsPage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
        <Route path="profile/:userId" element={<ProfilePage/>}/>
        <Route path="decks/:subjectName/:deckTitle" element={<DeckDetailPage/>}/>
      </Route>
    </Routes>
  )
}
