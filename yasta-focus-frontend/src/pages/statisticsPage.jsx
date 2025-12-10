// IMPORTANT: Install recharts before running this page
// Run: npm install recharts

import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useGetWeeklyStudyTime, useGetSessionTrends, useGetSubjectStats, useGetHeatmapData } from '../services/statisticsServices'

export default function StatisticsPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const { data: weeklyData = [], isLoading: weeklyLoading } = useGetWeeklyStudyTime()
  const { data: trendsData = [], isLoading: trendsLoading } = useGetSessionTrends()
  const { data: subjectStats = {}, isLoading: subjectLoading } = useGetSubjectStats()
  const { data: heatmapData = {}, isLoading: heatmapLoading } = useGetHeatmapData(selectedYear, selectedMonth + 1)

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const formatTimeShort = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h`
  }

  // Prepare weekly data for bar chart with all days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyDataMap = {}
  weeklyData.forEach(item => {
    weeklyDataMap[item.day] = Math.round(item.total_seconds / 60)
  })
  
  const weeklyChartData = daysOfWeek.map(day => ({
    day,
    minutes: weeklyDataMap[day] || 0
  }))

  // Prepare trends data for line chart with all days (ensure continuous line)
  const trendsDataMap = {}
  trendsData.forEach(item => {
    trendsDataMap[item.day] = parseInt(item.session_count)
  })
  
  const trendsChartData = daysOfWeek.map(day => ({
    day,
    sessions: trendsDataMap[day] || 0
  }))

  // Prepare heatmap
  const getHeatmapIntensity = (sessionCount) => {
    if (sessionCount === 0) return 'bg-slate-700/30'
    if (sessionCount === 1) return 'bg-green-900/40'
    if (sessionCount === 2) return 'bg-green-700/60'
    if (sessionCount === 3) return 'bg-green-600/80'
    return 'bg-green-500'
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)

  // Create heatmap grid
  const heatmapGrid = []
  const heatmapDataMap = {}
  ;(heatmapData.heatmapData || []).forEach(item => {
    heatmapDataMap[item.day] = parseInt(item.session_count)
  })

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    heatmapGrid.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    heatmapGrid.push({
      day,
      sessionCount: heatmapDataMap[day] || 0
    })
  }

  const [activeTab, setActiveTab] = useState('charts')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Statistics</h1>
        <p className="text-slate-400">Track your study progress and performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'charts'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Charts
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'heatmap'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Heatmap
        </button>
      </div>

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <>
          {/* Weekly Study Time Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white mb-1">Weekly Study Time</h2>
        <p className="text-sm text-slate-400 mb-6">Daily study time for the last 7 days</p>
        
        {weeklyLoading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Loading...
          </div>
        ) : weeklyChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            No study data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="minutes" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Session Trends Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white mb-1">Session Trends</h2>
        <p className="text-sm text-slate-400 mb-6">Number of study sessions per day</p>
        
        {trendsLoading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Loading...
          </div>
        ) : trendsChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            No session data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsChartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
        </>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <>
          {/* Subject Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most/Least Studied */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="space-y-6">
            {/* Most Studied */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Most Studied</h3>
              </div>
              {subjectStats.mostStudied ? (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{subjectStats.mostStudied.subject_name}</p>
                    <p className="text-sm text-slate-400">
                      {formatTime(subjectStats.mostStudied.total_seconds)} • {subjectStats.mostStudied.session_count} sessions
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No data available</p>
              )}
            </div>

            {/* Least Studied */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Least Studied</h3>
              </div>
              {subjectStats.leastStudied ? (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{subjectStats.leastStudied.subject_name}</p>
                    <p className="text-sm text-slate-400">
                      {formatTime(subjectStats.leastStudied.total_seconds)} • {subjectStats.leastStudied.session_count} sessions
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No comparison available</p>
              )}
            </div>

            {/* Total Subjects */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Subjects</span>
                <span className="text-2xl font-bold text-indigo-400">{subjectStats.totalSubjects || 0}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-400">Total Study Time</span>
                <span className="text-lg font-semibold text-white">
                  {formatTime(subjectStats.totalStudyTime || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Details */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subject Details</h3>
          <p className="text-sm text-slate-400 mb-4">Detailed statistics for each subject</p>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(subjectStats.subjects || []).map((subject, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-orange-500' : 
                  index === 2 ? 'bg-blue-500' : 
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{subject.subject_name}</p>
                  <p className="text-xs text-slate-400">
                    {subject.session_count} sessions • {subject.task_count || 0} tasks
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatTimeShort(subject.total_seconds)}</p>
                  <p className="text-xs text-slate-400">No tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

          {/* Studied Subjects Pie Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Studied Subjects</h3>
            <p className="text-sm text-slate-400 mb-4">Subjects with study activity</p>
            
            {subjectLoading ? (
              <div className="h-80 flex items-center justify-center text-slate-400">
                Loading...
              </div>
            ) : (subjectStats.subjects || []).length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-400">
                No subject data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={(subjectStats.subjects || []).map((subject, index) => ({
                      name: subject.subject_name,
                      value: parseFloat(subject.total_seconds),
                      sessions: subject.session_count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(subjectStats.subjects || []).map((entry, index) => {
                      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value, name, props) => [
                      `${formatTime(value)} (${props.payload.sessions} sessions)`,
                      props.payload.name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Study Activity Heatmap</h2>
            <p className="text-sm text-slate-400">Daily study activity for {monthNames[selectedMonth]} {selectedYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm text-slate-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-2">
          {heatmapGrid.map((item, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                item ? getHeatmapIntensity(item.sessionCount) + ' text-white' : 'bg-transparent'
              }`}
              title={item ? `${item.day} - ${item.sessionCount} sessions` : ''}
            >
              {item?.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 text-sm">
          <span className="text-slate-400">Activity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-700/30"></div>
            <span className="text-slate-400">0 sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-900/40"></div>
            <span className="text-slate-400">1 session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-700/60"></div>
            <span className="text-slate-400">2 sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600/80"></div>
            <span className="text-slate-400">3 sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-slate-400">4+ sessions</span>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
