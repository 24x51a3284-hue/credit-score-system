import { useEffect, useState } from 'react'
import { Users, TrendingUp, Activity, Award, Shield } from 'lucide-react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'
import api from '../utils/api'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function AdminPage() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [tab,   setTab]     = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data) })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading admin panel…</div>

  const riskDonut = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [stats.low_risk_count, stats.medium_risk_count, stats.high_risk_count],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderWidth: 0,
    }]
  }

  const userBar = {
    labels: users.slice(0, 10).map(u => u.full_name.split(' ')[0]),
    datasets: [{
      label: 'Predictions',
      data: users.slice(0, 10).map(u => u.prediction_count),
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 6,
    }]
  }

  const chartOpts = {
    plugins: { legend: { labels: { color: '#9CA3AF' } } },
    scales: {
      x: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } },
      y: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } }
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
          <Shield size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Platform analytics and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total Users"       value={stats.total_users}                          color="blue" />
        <StatCard icon={TrendingUp} label="Total Predictions" value={stats.total_predictions}                   color="purple" />
        <StatCard icon={Activity}   label="Model Accuracy"    value={`${(stats.model_accuracy * 100).toFixed(1)}%`} color="green" />
        <StatCard icon={Award}      label="Avg Credit Score"  value={Math.round(stats.avg_credit_score)}        color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        {['overview', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              tab === t ? 'text-blue-400 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk distribution */}
          <div className="card">
            <h2 className="font-semibold text-gray-300 mb-4 text-sm uppercase tracking-wider">Risk Distribution</h2>
            <div className="h-56">
              <Doughnut data={riskDonut} options={{ plugins: { legend: { labels: { color: '#9CA3AF' } } }, maintainAspectRatio: false }} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[['Low', stats.low_risk_count, 'emerald'], ['Medium', stats.medium_risk_count, 'amber'], ['High', stats.high_risk_count, 'red']].map(([label, count, color]) => (
                <div key={label} className={`text-center p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                  <div className={`text-2xl font-bold text-${color}-400`}>{count}</div>
                  <div className="text-xs text-gray-500 mt-1">{label} Risk</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top users bar */}
          <div className="card">
            <h2 className="font-semibold text-gray-300 mb-4 text-sm uppercase tracking-wider">Top Users by Predictions</h2>
            <div className="h-56">
              <Bar data={userBar} options={chartOpts} />
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Name', 'Email', 'Role', 'Predictions', 'Status', 'Joined'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-gray-600 text-sm font-mono">#{u.id}</td>
                    <td className="px-5 py-4 text-white text-sm font-medium">{u.full_name}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-sm">{u.prediction_count}</td>
                    <td className="px-5 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-gray-500">{u.is_active ? 'Active' : 'Disabled'}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const c = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  return (
    <div className={`card border ${c[color]}`}>
      <Icon size={20} className="mb-3" />
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
