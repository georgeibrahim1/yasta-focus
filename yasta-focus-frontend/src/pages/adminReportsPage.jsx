import { useState } from 'react'
import { useUser } from '../services/authServices'
import { useGetReports, useUpdateReportStatus, useDeleteReport } from '../services/adminServices'
import { Search, Filter, AlertTriangle, Activity, Calendar, User, Check, X, Trash2, Eye } from 'lucide-react'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'logs'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'Under review by the team', 'Resolved', 'Rejected'
  const [selectedReport, setSelectedReport] = useState(null)

  // Fetch reports
  const { data: reportsData, isLoading } = useGetReports()
  const updateStatus = useUpdateReportStatus()
  const deleteReport = useDeleteReport()

  const reports = reportsData?.data?.reports || []

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const handleUpdateStatus = async (reporterId, reportedId, status) => {
    try {
      await updateStatus.mutateAsync({ reporterId, reportedId, status })
      setSelectedReport(null)
    } catch (error) {
      console.error('Failed to update report status:', error)
    }
  }

  const handleDeleteReport = async (reporterId, reportedId) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      await deleteReport.mutateAsync({ reporterId, reportedId })
      setSelectedReport(null)
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  const StatusBadge = ({ status }) => {
    const colors = {
      'Under review by the team': 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30',
      'Resolved': 'bg-green-900/30 text-green-400 border border-green-600/30',
      'Rejected': 'bg-red-900/30 text-red-400 border border-red-600/30'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-700 text-slate-300'}`}>
        {status}
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
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Under review by the team">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">No reports found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reporter</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reported User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredReports.map((report) => (
                      <tr key={`${report.reporterid}-${report.reporteeid}`} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-400" />
                            <span className="text-white text-sm font-medium">{report.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{report.reporter_name}</td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{report.reported_name}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700/50 text-center">
            <Activity size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">System Logs - Coming Soon</p>
            <p className="text-slate-500 text-sm mt-2">Log functionality will be implemented in future updates</p>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700/50 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={24} className="text-yellow-400" />
                  Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Report Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Reporter</p>
                    <p className="text-white font-medium">{selectedReport.reporter_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Reported User</p>
                    <p className="text-white font-medium">{selectedReport.reported_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Date</p>
                    <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Title</p>
                  <p className="text-white font-semibold text-lg">{selectedReport.title}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Description</p>
                  <p className="text-slate-300 bg-slate-900/50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-700 pt-6">
                  <p className="text-slate-400 text-sm mb-4">Update Status</p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reporterid, selectedReport.reporteeid, 'Under review by the team')}
                      disabled={updateStatus.isPending}
                      className="flex-1 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Activity size={16} />
                      Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reporterid, selectedReport.reporteeid, 'Resolved')}
                      disabled={updateStatus.isPending}
                      className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reporterid, selectedReport.reporteeid, 'Rejected')}
                      disabled={updateStatus.isPending}
                      className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteReport(selectedReport.reporterid, selectedReport.reporteeid)}
                    disabled={deleteReport.isPending}
                    className="w-full mt-3 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-red-600/30"
                  >
                    <Trash2 size={16} />
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
