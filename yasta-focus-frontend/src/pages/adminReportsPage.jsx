import { useState } from 'react'
import { useUser } from '../services/authServices'
import { useGetReports, useUpdateReportStatus, useDeleteReport, useGetLogs } from '../services/adminServices'
import { Search, Filter, AlertTriangle, Activity, Calendar, User, Check, X, Trash2, Eye, Clock, Shield } from 'lucide-react'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'logs'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'Under review by the team', 'Resolved', 'Rejected'
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Logs filters
  const [logFilters, setLogFilters] = useState({
    page: 1,
    limit: 10,
    action_type: 'all',
    actor_type: 'all',
    start_date: '',
    end_date: '',
    order_by: 'desc' // 'desc' for newest first, 'asc' for oldest first
  })

  // Fetch reports
  const { data: reportsData, isLoading } = useGetReports()
  const updateStatus = useUpdateReportStatus()
  const deleteReport = useDeleteReport()
  
  // Fetch logs
  const { data: logsData, isLoading: logsLoading } = useGetLogs(logFilters)
  const logs = logsData?.data?.logs || []
  const logsPagination = logsData?.data?.pagination || {}

  console.log('Current logFilters:', logFilters)

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

  const getActionIcon = (actionType) => {
    const iconMap = {
      // Authentication
      'LOGIN': <User size={16} className="text-blue-400" />,
      'SIGNUP': <User size={16} className="text-green-400" />,
      'FORGOT_PASSWORD_REQUEST': <User size={16} className="text-yellow-400" />,
      'FORGOT_PASSWORD_RESET': <User size={16} className="text-yellow-400" />,
      'RESET_PASSWORD': <User size={16} className="text-orange-400" />,
      'UPDATE_PASSWORD': <User size={16} className="text-cyan-400" />,
      // Community
      'CREATE_COMMUNITY': <Activity size={16} className="text-purple-400" />,
      'JOIN_COMMUNITY_REQUEST': <Activity size={16} className="text-indigo-400" />,
      'LEAVE_COMMUNITY': <Activity size={16} className="text-orange-400" />,
      'UPDATE_COMMUNITY': <Activity size={16} className="text-yellow-400" />,
      'DELETE_COMMUNITY': <Trash2 size={16} className="text-red-400" />,
      // Competition
      'CREATE_COMPETITION': <Activity size={16} className="text-teal-400" />,
      'JOIN_COMPETITION': <Activity size={16} className="text-cyan-400" />,
      'DELETE_COMPETITION': <Trash2 size={16} className="text-red-400" />,
      // Admin Actions
      'ADMIN_UPDATE_REPORT_STATUS': <Check size={16} className="text-purple-400" />,
      'ADMIN_DELETE_REPORT': <Trash2 size={16} className="text-red-400" />,
      'ADMIN_UPDATE_USER_ROLE': <User size={16} className="text-indigo-400" />,
      'ADMIN_DELETE_USER': <Trash2 size={16} className="text-red-500" />,
    }
    return iconMap[actionType] || <Activity size={16} className="text-slate-400" />
  }

  const formatActionType = (actionType) => {
    return actionType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Shield className="text-red-400" size={40} />
            Reports & Logs
          </h1>
          <p className="text-slate-400">
            Monitor user reports and system activity logs.
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
                placeholder={activeTab === 'reports' ? 'Search reports...' : 'Search logs...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            {activeTab === 'reports' ? (
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
            ) : (
              <>
                <select
                  value={logFilters.action_type}
                  onChange={(e) => setLogFilters({ ...logFilters, action_type: e.target.value, page: 1 })}
                  className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Actions</option>
                  <optgroup label="Authentication">
                    <option value="SIGNUP">Signup</option>
                    <option value="LOGIN">Login</option>
                    <option value="FORGOT_PASSWORD_REQUEST">Forgot Password Request</option>
                    <option value="FORGOT_PASSWORD_RESET">Forgot Password Reset</option>
                    <option value="RESET_PASSWORD">Reset Password</option>
                    <option value="UPDATE_PASSWORD">Update Password</option>
                  </optgroup>
                  <optgroup label="Community">
                    <option value="CREATE_COMMUNITY">Create Community</option>
                    <option value="JOIN_COMMUNITY_REQUEST">Join Community</option>
                    <option value="LEAVE_COMMUNITY">Leave Community</option>
                    <option value="UPDATE_COMMUNITY">Update Community</option>
                    <option value="DELETE_COMMUNITY">Delete Community</option>
                  </optgroup>
                  <optgroup label="Competition">
                    <option value="CREATE_COMPETITION">Create Competition</option>
                    <option value="JOIN_COMPETITION">Join Competition</option>
                    <option value="DELETE_COMPETITION">Delete Competition</option>
                  </optgroup>
                  <optgroup label="Admin Actions">
                    <option value="ADMIN_UPDATE_REPORT_STATUS">Update Report Status</option>
                    <option value="ADMIN_DELETE_REPORT">Delete Report</option>
                    <option value="ADMIN_UPDATE_USER_ROLE">Update User Role</option>
                    <option value="ADMIN_DELETE_USER">Delete User</option>
                  </optgroup>
                </select>
                <select
                  value={logFilters.actor_type}
                  onChange={(e) => setLogFilters({ ...logFilters, actor_type: e.target.value, page: 1 })}
                  className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Actors</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-1 border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setLogFilters({ ...logFilters, order_by: 'desc', page: 1 })}
                    className={`px-4 py-2 font-medium transition-colors ${
                      logFilters.order_by === 'desc'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Newest First
                    </div>
                  </button>
                  <button
                    onClick={() => setLogFilters({ ...logFilters, order_by: 'asc', page: 1 })}
                    className={`px-4 py-2 font-medium transition-colors ${
                      logFilters.order_by === 'asc'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Oldest First
                    </div>
                  </button>
                </div>
              </>
            )}
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
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {logsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">No logs found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Content</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actor Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {logs.filter(log => {
                        const matchesSearch = 
                          log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action_content?.toLowerCase().includes(searchQuery.toLowerCase())
                        return matchesSearch
                      }).map((log) => (
                        <tr key={log.log_no} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action_type)}
                              <span className="text-white text-sm font-medium">{formatActionType(log.action_type)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {log.profile_picture ? (
                                <img src={log.profile_picture} alt={log.username} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                                  {log.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-slate-300 text-sm">{log.username || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm max-w-md truncate">{log.action_content}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.actor_type === 'admin' 
                                ? 'bg-purple-900/30 text-purple-400 border border-purple-600/30'
                                : 'bg-blue-900/30 text-blue-400 border border-blue-600/30'
                            }`}>
                              {log.actor_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {logsPagination.totalPages > 1 && (
                  <div className="flex justify-between items-center px-6 py-4 bg-slate-900/50 border-t border-slate-700/50">
                    <div className="text-slate-400 text-sm">
                      Showing {((logsPagination.page - 1) * logsPagination.limit) + 1} - {Math.min(logsPagination.page * logsPagination.limit, logsPagination.total)} of {logsPagination.total} logs
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLogFilters({ ...logFilters, page: logFilters.page - 1 })}
                        disabled={logFilters.page === 1}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setLogFilters({ ...logFilters, page: logFilters.page + 1 })}
                        disabled={logFilters.page >= logsPagination.totalPages}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
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
