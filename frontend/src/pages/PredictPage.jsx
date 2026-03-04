import { useState } from 'react'
import { Phone, Shield, TrendingUp, RotateCcw, Zap } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'
import api from '../utils/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const DEMO_NUMBERS = {
  '8328335457': { age: 32, annual_income: 75000,  employment_type: 'Employed',      loan_amount: 20000, num_credit_cards: 4, credit_utilization: 20, outstanding_debt: 4000,  payment_history_score: 90, num_late_payments: 0 },
  '7207284507': { age: 28, annual_income: 45000,  employment_type: 'Employed',      loan_amount: 15000, num_credit_cards: 3, credit_utilization: 45, outstanding_debt: 8000,  payment_history_score: 72, num_late_payments: 2 },
  '8978203220': { age: 45, annual_income: 120000, employment_type: 'Employed',      loan_amount: 50000, num_credit_cards: 6, credit_utilization: 15, outstanding_debt: 2000,  payment_history_score: 95, num_late_payments: 0 },
  '7396466565': { age: 22, annual_income: 25000,  employment_type: 'Unemployed',    loan_amount: 10000, num_credit_cards: 1, credit_utilization: 80, outstanding_debt: 15000, payment_history_score: 45, num_late_payments: 6 },
  '9966881988': { age: 38, annual_income: 90000,  employment_type: 'Employed',      loan_amount: 30000, num_credit_cards: 5, credit_utilization: 18, outstanding_debt: 3000,  payment_history_score: 92, num_late_payments: 0 },
  '9985391639': { age: 26, annual_income: 35000,  employment_type: 'Self-Employed', loan_amount: 12000, num_credit_cards: 2, credit_utilization: 55, outstanding_debt: 9000,  payment_history_score: 65, num_late_payments: 3 },
  '6301014134': { age: 33, annual_income: 55000,  employment_type: 'Employed',      loan_amount: 18000, num_credit_cards: 3, credit_utilization: 35, outstanding_debt: 6000,  payment_history_score: 78, num_late_payments: 1 },
  '8341849936': { age: 52, annual_income: 150000, employment_type: 'Employed',      loan_amount: 80000, num_credit_cards: 8, credit_utilization: 10, outstanding_debt: 1000,  payment_history_score: 98, num_late_payments: 0 },
  '9704844822': { age: 21, annual_income: 18000,  employment_type: 'Unemployed',    loan_amount: 5000,  num_credit_cards: 1, credit_utilization: 90, outstanding_debt: 20000, payment_history_score: 30, num_late_payments: 9 },
  '8309702276': { age: 35, annual_income: 68000,  employment_type: 'Employed',      loan_amount: 22000, num_credit_cards: 4, credit_utilization: 28, outstanding_debt: 5000,  payment_history_score: 85, num_late_payments: 1 },
}

const defaultProfile = {
  age: 28, annual_income: 50000, employment_type: 'Employed',
  loan_amount: 15000, num_credit_cards: 3, credit_utilization: 35,
  outstanding_debt: 5000, payment_history_score: 75, num_late_payments: 2,
}

export default function PredictPage() {
  const [step, setStep]       = useState(1) // 1=phone, 2=otp, 3=result
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  const isDemoNumber = DEMO_NUMBERS.hasOwnProperty(phone)

  const sendOTP = async (e) => {
    e.preventDefault()
    if (phone.length !== 10) return toast.error('Enter valid 10-digit number')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone })
      if (isDemoNumber) {
        toast.success('Demo number! Use OTP: 123456 📱')
      } else {
        toast.success('OTP sent to your mobile! 📱')
      }
      setStep(2)
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndPredict = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      // Verify OTP
      await api.post('/auth/check-otp', { phone, otp })

      // Get profile for this number
      const profile = DEMO_NUMBERS[phone] || defaultProfile

      // Predict
      const { data } = await api.post('/predictions/predict', profile)
      setResult(data)
      setStep(3)
      toast.success('Credit score ready! 🎯')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setPhone('')
    setOtp('')
    setResult(null)
  }

  const scoreColor = result?.risk_category === 'Low'    ? '#10B981' :
                     result?.risk_category === 'Medium' ? '#F59E0B' : '#EF4444'

  const shapChartData = result?.shap_values && {
    labels: Object.keys(result.shap_values),
    datasets: [{
      label: 'SHAP Impact',
      data: Object.values(result.shap_values).map(v => +v.toFixed(4)),
      backgroundColor: Object.values(result.shap_values).map(v =>
        v >= 0 ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.7)'),
      borderRadius: 6,
    }]
  }

  const chartOpts = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6B7280' }, grid: { color: '#1F2937' } },
      y: { ticks: { color: '#9CA3AF', font: { size: 11 } }, grid: { display: false } }
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Credit Score Prediction</h1>
          <p className="text-gray-400 mt-1">Enter your mobile number to get your AI credit score</p>
        </div>
        {step > 1 && (
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Step 1 — Phone */}
      {step === 1 && (
        <div className="card animate-slide-up">
          <form onSubmit={sendOTP} className="space-y-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Phone size={30} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-display font-bold">Enter Mobile Number</h2>
              <p className="text-gray-500 text-sm mt-2">We'll verify and predict your credit score</p>
            </div>

            <div className="flex gap-2">
              <div className="px-4 py-3 glass rounded-xl text-gray-300 text-sm font-medium whitespace-nowrap">
                🇮🇳 +91
              </div>
              <input
                type="tel" required maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="input-field flex-1 text-xl font-mono tracking-wider"
                placeholder="9876543210"
                autoFocus
              />
            </div>

            {isDemoNumber && (
              <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 text-sm text-center">
                  ✅ Demo number recognized! OTP will be <strong>123456</strong>
                </p>
              </div>
            )}

            <button type="submit" disabled={loading || phone.length !== 10}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP…</>
                : <><Phone size={20} />Send OTP</>}
            </button>
          </form>
        </div>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <div className="card animate-slide-up">
          <form onSubmit={verifyAndPredict} className="space-y-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <Shield size={30} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-display font-bold">Enter OTP</h2>
              <p className="text-gray-500 text-sm mt-2">
                Sent to <span className="text-white font-medium">+91 {phone}</span>
              </p>
              {DEMO_NUMBERS[phone] && (
                <div className="mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-sm font-medium">Demo OTP: <strong>123456</strong></p>
                </div>
              )}
            </div>

            <input
              type="tel" required maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center text-4xl font-mono tracking-[1em] py-6"
              placeholder="······"
              autoFocus
            />

            <button type="submit" disabled={loading || otp.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base glow">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Calculating score…</>
                : <><TrendingUp size={20} />Verify & Get My Score</>}
            </button>

            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-300">
                ← Change number
              </button>
              <button type="button" onClick={sendOTP} className="text-blue-400 hover:text-blue-300">
                Resend OTP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3 — Result */}
      {step === 3 && result && (
        <div className="space-y-6 animate-slide-up">
          {/* Score Card */}
          <div className="card border-2" style={{ borderColor: scoreColor + '40' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="text-center">
                <div className="font-display text-8xl font-bold" style={{ color: scoreColor }}>
                  {result.credit_score}
                </div>
                <div className="text-gray-400 mt-1 text-sm">out of 850</div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-xl text-sm font-bold border-2"
                    style={{ color: scoreColor, borderColor: scoreColor + '60', background: scoreColor + '15' }}>
                    {result.risk_category} Risk
                  </span>
                  <span className="px-3 py-2 bg-white/5 text-gray-300 rounded-xl text-sm border border-white/10">
                    {(result.probability * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{result.message}</p>
                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>300 Poor</span><span>580</span><span>700</span><span>850 Excellent</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" />
                    <div className="absolute top-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-900 shadow-lg"
                      style={{ left: `${((result.credit_score - 300) / 550) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP Chart */}
          {shapChartData && (
            <div className="card">
              <h2 className="font-semibold text-gray-300 mb-1">Explainable AI — What Affected Your Score</h2>
              <p className="text-xs text-gray-500 mb-4">Blue = positive impact · Red = negative impact</p>
              <div style={{ height: 260 }}>
                <Bar data={shapChartData} options={chartOpts} />
              </div>
            </div>
          )}

          {/* Check another */}
          <button onClick={reset}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Check Another Number
          </button>
        </div>
      )}
    </div>
  )
}