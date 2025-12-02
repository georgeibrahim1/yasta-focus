import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'
import AuthPage from './pages/authPage'


export default function App() {
  return (
    <Routes>
      <Route path='/auth' element={<AuthPage/>}/>
      <Route path="/" element={<MainLayout/>}>
      </Route>
    </Routes>
  )
}
