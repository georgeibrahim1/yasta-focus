import { NavLink } from 'react-router'

export default function SidebarButton({ icon, label, link }) {
  return (
    <NavLink 
      to={link}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 transition-all border-b border-slate-700/50 last:border-b-0
        ${isActive 
          ? 'bg-indigo-500/10' 
          : 'hover:bg-slate-700/30'
        }`}
    >
      <img src={icon} alt={label} className="w-10 h-10 object-contain flex-shrink-0" />
      <span className="text-slate-300 text-base font-medium">{label}</span>
    </NavLink>
  )
}