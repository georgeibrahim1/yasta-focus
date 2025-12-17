import { Outlet } from 'react-router'
import ProfileStatus from '../components/ProfileStatus'
import SidebarButton from '../components/SidebarButton'
import ProtectedComponent from '../components/ProtectedComponent'
import YastaFocusLogo from '../components/YastaFocusLogo'
import { useUser } from '../services/authServices'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#10121A] flex">
      <div className="w-64 h-screen sticky top-0 flex flex-col p-3 gap-3 overflow-hidden">
        <header>
          <ProfileStatus />
        </header>
        <nav className="flex-1 min-h-0 flex flex-col bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Admin Navigation */}
          <ProtectedComponent requiredRole={0}>
            <SidebarButton icon="/icons/blackboard-icon.svg" label="Dashboard" link="/dashboard" />
            <SidebarButton icon="/icons/passports-icon.svg" label="Users" link="/admin/users" />
            <SidebarButton icon="/icons/globes-icon.svg" label="Communities" link="/communities" />
            <SidebarButton icon="/icons/credit-card-icon.svg" label="Reports & Logs" link="/admin/reports" />
            <SidebarButton icon="/icons/win-cup-icon.svg" label="Achievements" link="/achievements/admin" />
          </ProtectedComponent>

          {/* Student Navigation */}
          <ProtectedComponent allowedRoles={[1, 2]}>
            <SidebarButton icon="/icons/blackboard-icon.svg" label="Dashboard" link="/dashboard" />
            <SidebarButton icon="/icons/alarm-icon.svg" label="Timer" link="/timer" />
            <SidebarButton icon="/icons/notebook-icon.svg" label="Subjects" link="/notes" />
            <SidebarButton icon="/icons/globes-icon.svg" label="Communities" link="/communities" />
            <SidebarButton icon="/icons/win-cup-icon.svg" label="Achievements" link="/achievements" />
            <SidebarButton icon="/icons/circle-crown-icon.svg" label="Leaderboard" link="/leaderboard" />
            <SidebarButton icon="/icons/chart-icon.svg" label="Statistics" link="/statistics" />
          </ProtectedComponent>

          {/* Logo at bottom of sidebar */}
          <div className="mt-auto flex items-center justify-center">
            <YastaFocusLogo />
          </div>
        </nav>
      </div>
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
