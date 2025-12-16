import { useState } from 'react'
import { useGetAllUsers, useUpdateUserRole } from '../services/adminServices'
import { Users, Search, Shield, User, Crown, ChevronLeft, ChevronRight } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 0, label: 'Admin', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  { value: 1, label: 'Student', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
]

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  const { data, isLoading } = useGetAllUsers(page, 20, search)
  const updateRole = useUpdateUserRole()

  const users = data?.data?.users || []
  const total = data?.data?.total || 0
  const totalPages = data?.data?.totalPages || 1

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole })
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const getRoleInfo = (roleValue) => {
    return ROLE_OPTIONS.find(r => r.value === roleValue) || ROLE_OPTIONS[1]
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-extrabold text-white">User Management</h1>
          </div>
          <p className="text-slate-400">Manage user roles and permissions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setPage(1)
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-400">
            Total users: <span className="text-white font-semibold">{total.toLocaleString()}</span>
          </p>
          <p className="text-slate-400">
            Page {page} of {totalPages}
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      XP
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((user) => {
                    const currentRole = getRoleInfo(user.role)
                    return (
                      <tr key={user.user_id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{user.username}</p>
                              <p className="text-slate-400 text-xs">ID: {user.user_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-300">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-yellow-400 font-semibold">{user.xp?.toLocaleString() || 0}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.user_id, parseInt(e.target.value))}
                              disabled={updateRole.isPending}
                              className={`appearance-none pl-3 pr-8 py-2 ${currentRole.bg} ${currentRole.border} border rounded-lg ${currentRole.color} font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                            >
                              {ROLE_OPTIONS.map((roleOption) => (
                                <option key={roleOption.value} value={roleOption.value}>
                                  {roleOption.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className={`w-4 h-4 ${currentRole.color}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
