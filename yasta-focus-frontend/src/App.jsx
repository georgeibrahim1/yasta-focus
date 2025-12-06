import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'
import AuthPage from './pages/authPage'
import TimerPage from './pages/timerPage'
import SubjectsPage from './pages/subjectsPage'


export default function App() {
  return (
    <Routes>
      <Route path='/auth' element={<AuthPage/>}/>
      <Route path="/" element={<MainLayout/>}>
        <Route path="timer" element={<TimerPage/>}/>
        <Route path="subjects" element={<SubjectsPage/>}/>
        <Route path="notes" element={<SubjectsPage/>}/>
      </Route>
    </Routes>
  )
}
