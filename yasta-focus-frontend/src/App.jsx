import MainLayout from './layouts/mainLayout'
import { Route , Routes } from 'react-router'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout/>}>
      </Route>
    </Routes>
  )
}
