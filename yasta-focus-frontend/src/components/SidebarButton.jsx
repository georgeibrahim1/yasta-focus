import { NavLink } from 'react-router'

export default function SidebarButton({ icon, label, link }) {
  return (
    <NavLink 
      to={link}
      className={({ isActive }) => `flex items-center gap-4 px-4 py-4 transition-all border-b border-slate-700/50 last:border-b-0
        ${isActive 
          ? 'bg-indigo-500/10' 
          : 'hover:bg-slate-700/30'
        }`}
    >
      <img src={icon} alt={label} className="w-16 h-16 object-contain" />
      <span className="text-slate-300 text-lg font-medium">{label}</span>
    </NavLink>
  )
}