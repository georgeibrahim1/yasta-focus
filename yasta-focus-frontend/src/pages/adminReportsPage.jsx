import { useState } from 'react'
import { useUser } from '../services/authServices'
import { Search, Filter, AlertTriangle, Activity, Calendar, User } from 'lucide-react'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'logs'
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - will be replaced with real API calls
  const mockReports = [
    {
      id: 1,
      type: 'User Report',
      reporter: 'John Doe',
      reported: 'Jane Smith',
      reason: 'Inappropriate behavior',
      status: 'pending',
      date: '2025-12-10T10:30:00Z'
    },
    {
      id: 2,
      type: 'Content Report',
      reporter: 'Alice Brown',
      reported: 'Bob Wilson',
      reason: 'Spam content',
      status: 'resolved',
      date: '2025-12-09T14:20:00Z'
    }
  ]

  const mockLogs = [
    {
      id: 1,
      action: 'User Login',
      user: 'admin@example.com',
      details: 'Successful login from IP 192.168.1.1',
      timestamp: '2025-12-11T08:45:00Z'
    },
    {
      id: 2,
      action: 'Community Created',
      user: 'john.doe@example.com',
      details: 'Created "Study Group Alpha"',
      timestamp: '2025-12-11T07:30:00Z'
    },
    {
      id: 3,
      action: 'User Banned',
      user: 'admin@example.com',
      details: 'Banned user jane.smith@example.com',
      timestamp: '2025-12-10T16:20:00Z'
    }
  ]

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-400',
      resolved: 'bg-green-900/30 text-green-400',
      rejected: 'bg-red-900/30 text-red-400'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Reports & Logs
          </h1>
          <p className="text-slate-400">
            Monitor user reports and system activity logs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              Reports
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={18} />
              System Logs
            </div>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reporter</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reported User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reason</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mockReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-yellow-400" />
                          <span className="text-white text-sm">{report.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{report.reporter}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{report.reported}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{report.reason}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-600/20 rounded-lg">
                        <Activity size={16} className="text-indigo-400" />
                      </div>
                      <h3 className="text-white font-semibold">{log.action}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{log.details}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {log.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
