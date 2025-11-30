import { Outlet } from 'react-router'

export default function MainLayout() {
  return (
    <div>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}
