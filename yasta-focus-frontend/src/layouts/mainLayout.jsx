import { Outlet } from 'react-router'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Username</h3>
              <p className="text-sm text-gray-500">XP: 0</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Tasks
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Community
              </a>
            </li>
            <li>
              <a href="#" className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <Outlet/>
      </main>
    </div>
  )
}
