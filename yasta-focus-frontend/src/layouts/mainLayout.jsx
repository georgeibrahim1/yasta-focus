import { Outlet } from 'react-router'
import ProfileStatus from '../components/ProfileStatus'
import SidebarButton from '../components/SidebarButton'

export default function MainLayout() {
  
  return (
    <div className="min-h-screen bg-[#10121A] flex">
        <div className="w-80 flex flex-col p-4 gap-4">
          <header>
            <ProfileStatus 
              name="George Ibrahim"
              level={0}
              xp={70}
              maxXp={100}
              avatarUrl={null}
            />
          </header>
          <nav className="flex flex-col bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
            <SidebarButton icon="/icons/blackboard-icon.svg" label="Dashboard" link="/dashboard" />
            <SidebarButton icon="/icons/alarm-icon.svg" label="Timer" link="/timer" />
            <SidebarButton icon="/icons/notebook-icon.svg" label="Subjects" link="/notes" />
            <SidebarButton icon="/icons/globes-icon.svg" label="Explore" link="/explore" />
            <SidebarButton icon="/icons/win-cup-icon.svg" label="Achievements" link="/achievements" />
            <SidebarButton icon="/icons/circle-crown-icon.svg" label="Premium" link="/premium" />
            <SidebarButton icon="/icons/chart-icon.svg" label="Statistics" link="/statistics" />
          </nav>
        </div>
        <div className="flex-1">
          <main className="p-6">
            <Outlet/>
          </main>
        </div>
    </div>
  )
}
