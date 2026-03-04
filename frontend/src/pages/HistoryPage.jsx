import { useEffect, useState } from 'react'
import { Download, Search, Filter, History, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    api.get('/predictions/history')
      .then(r => setHistory(r.data))
      .catch(() => toast.error('Could not load history'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = history.filter(p => {
    const matchFilter = filter === 'All' || p.risk_category === filter
    const matchSearch = !search || String(p.credit_score).includes(search) || p.risk_category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const downloadPDF = async (id) => {
    try {
      const res = await api.get(`/predictions/history/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `credit_report_${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  const scoreColor = (cat) => ({
    Low:    'text-emerald-400',
    Medium: 'text-amber-400',
    High:   'text-red-400',
  }[cat])

  const badgeStyle = (cat) => ({
    Low:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    High:   'bg-red-500/20 text-red-400 border-red-500/20',
  }[cat])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Prediction History</h1>
        <p className="text-gray-400 mt-1">All your past credit score predictions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by score or risk…"
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {['All', 'Low', 'Medium', 'High'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f ? 'bg-blue-600 text-white border-blue-600' : 'glass text-gray-400 border-white/10 hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-16 text-gray-500">Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <History size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No predictions found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="lg:hidden space-y-4">
            {filtered.map(p => (
              <div key={p.id} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-display text-3xl font-bold ${scoreColor(p.risk_category)}`}>{p.credit_score}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${badgeStyle(p.risk_category)}`}>{p.risk_category} Risk</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Income: </span><span className="text-white">${p.annual_income?.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Age: </span><span className="text-white">{p.age}</span></div>
                  <div><span className="text-gray-500">Confidence: </span><span className="text-white">{(p.probability * 100).toFixed(1)}%</span></div>
                  <div><span className="text-gray-500">Date: </span><span className="text-white">{new Date(p.created_at).toLocaleDateString()}</span></div>
                </div>
                <button onClick={() => downloadPDF(p.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 py-2 glass rounded-xl transition-all">
                  <Download size={14} /> Download PDF
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#', 'Score', 'Risk', 'Income', 'Age', 'Employment', 'Confidence', 'Date', 'Report'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-gray-600 text-sm font-mono">#{p.id}</td>
                      <td className="px-5 py-4">
                        <span className={`font-display text-xl font-bold ${scoreColor(p.risk_category)}`}>{p.credit_score}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${badgeStyle(p.risk_category)}`}>{p.risk_category}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-300 text-sm">${p.annual_income?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-300 text-sm">{p.age}</td>
                      <td className="px-5 py-4 text-gray-300 text-sm">{p.employment_type}</td>
                      <td className="px-5 py-4 text-gray-300 text-sm">{(p.probability * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => downloadPDF(p.id)}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600">
              Showing {filtered.length} of {history.length} predictions
            </div>
          </div>
        </>
      )}
    </div>
  )
}
