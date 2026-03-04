import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, History, ArrowRight, Award, AlertTriangle, CheckCircle } from 'lucide-react'
import { Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler
} from 'chart.js'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler)

export default function DashboardPage() {
  const { user }        = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/predictions/history')
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false))
  }, [])

  const latest = history[0]
  const riskCounts = {
    Low:    history.filter(p => p.risk_category === 'Low').length,
    Medium: history.filter(p => p.risk_category === 'Medium').length,
    High:   history.filter(p => p.risk_category === 'High').length,
  }

  const scoreColor = (cat) => cat === 'Low' ? '#10B981' : cat === 'Medium' ? '#F59E0B' : '#EF4444'

  const donutData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [riskCounts.Low, riskCounts.Medium, riskCounts.High],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 2,
    }]
  }

  const lineData = {
    labels: [...history].reverse().slice(-10).map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Credit Score',
      data: [...history].reverse().slice(-10).map(p => p.credit_score),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3B82F6',
      pointRadius: 5,
    }]
  }

  const chartOpts = {
    plugins: { legend: { labels: { color: '#9CA3AF', font: { family: 'DM Sans' } } } },
    scales:  { x: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } },
                y: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } } },
    maintainAspectRatio: false,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Hello, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's your credit score overview</p>
        </div>
        <Link to="/predict" className="btn-primary flex items-center gap-2 self-start">
          <TrendingUp size={18} /> New Prediction <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Award} label="Total Predictions" value={history.length} color="blue" />
        <StatCard icon={CheckCircle} label="Low Risk Count" value={riskCounts.Low} color="green" />
        <StatCard icon={AlertTriangle} label="High Risk Count" value={riskCounts.High} color="red" />
      </div>

      {/* Latest prediction */}
      {latest && (
        <div className="card border border-blue-500/20">
          <h2 className="font-semibold text-gray-300 mb-4 text-sm uppercase tracking-wider">Latest Prediction</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center">
              <div className="font-display text-6xl font-bold" style={{ color: scoreColor(latest.risk_category) }}>
                {latest.credit_score}
              </div>
              <div className="text-gray-400 text-sm mt-1">Credit Score</div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Risk Category</span>
                <RiskBadge cat={latest.risk_category} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Confidence</span>
                <span className="text-white font-medium">{(latest.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Predicted On</span>
                <span className="text-white font-medium text-sm">{new Date(latest.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wider">Risk Distribution</h2>
            <div className="h-56">
              <Doughnut data={donutData} options={{ ...chartOpts, scales: undefined, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wider">Score Trend</h2>
            <div className="h-56">
              <Line data={lineData} options={chartOpts} />
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="card text-center py-16">
            <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No predictions yet</h3>
            <p className="text-gray-600 text-sm mb-6">Make your first prediction to see charts here</p>
            <Link to="/predict" className="btn-primary inline-flex items-center gap-2">
              <TrendingUp size={16} /> Predict Now
            </Link>
          </div>
        )
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:   'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <div className={`card border ${colors[color]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-3xl font-display font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  )
}

function RiskBadge({ cat }) {
  const styles = {
    Low:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    High:   'bg-red-500/20 text-red-400 border-red-500/20',
  }
  return <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles[cat]}`}>{cat} Risk</span>
}
