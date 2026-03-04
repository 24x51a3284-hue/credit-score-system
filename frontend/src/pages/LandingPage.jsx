import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Phone, Shield, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const phoneProfiles = {
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

export default function LandingPage() {
  const navigate  = useNavigate()
  const [step, setStep]         = useState(1)
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [score, setScore]       = useState(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const sendOTP = async (e) => {
    e.preventDefault()
    if (phone.length !== 10) return toast.error('Enter valid 10-digit number')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone })
      toast.success('OTP sent to your mobile! 📱')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndPredict = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const profile   = phoneProfiles[phone] || defaultProfile
      const tempEmail = `${phone}@creditiq.temp`
      const tempPass  = `temp${phone}123`
      try {
        await api.post('/auth/signup', { full_name: 'User', email: tempEmail, password: tempPass })
      } catch {}
      const { data: authData } = await api.post('/auth/login', { email: tempEmail, password: tempPass })
      localStorage.setItem('token', authData.access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`
      const { data: prediction } = await api.post('/predictions/predict', profile)
      setScore(prediction)
      setStep(3)
      toast.success('Your credit score is ready! 🎯')
    } catch (err) {
      toast.error('Verification failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const completeSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { full_name: name, email, password })
      localStorage.setItem('token', data.access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      toast.success('Account created! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = score?.risk_category === 'Low'    ? '#10B981' :
                     score?.risk_category === 'Medium' ? '#F59E0B' : '#EF4444'

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <span className="font-display text-xl font-bold">CreditIQ</span>
        </div>
        <button onClick={() => navigate('/login')}
          className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium glass rounded-xl transition-colors">
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-blue-400 font-medium mb-8 border border-blue-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              AI-Powered Credit Score Prediction
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
              Check Your<br />
              <span className="gradient-text">Credit Score</span><br />
              Instantly
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Enter your mobile number, verify with OTP, and get your AI-powered credit score in seconds.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {['✅ 100% Free', '✅ Instant Result', '✅ AI Powered', '✅ Secure & Private'].map(f => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[['🟢 Low Risk', '742', '#10B981'], ['🟡 Medium', '615', '#F59E0B'], ['🔴 High Risk', '456', '#EF4444']].map(([label, sc, color]) => (
                <div key={label} className="card text-center py-4">
                  <div className="font-display text-2xl font-bold" style={{ color }}>{sc}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card */}
          <div className="card glow max-w-md w-full mx-auto">

            {/* Step 1 — Phone */}
            {step === 1 && (
              <form onSubmit={sendOTP} className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Phone size={26} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Enter Mobile Number</h2>
                  <p className="text-gray-500 text-sm mt-2">Get your credit score in 30 seconds</p>
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
                <button type="submit" disabled={loading || phone.length !== 10}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base glow">
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP…</>
                    : <><Phone size={20} />Send OTP <ArrowRight size={18} /></>}
                </button>
                <p className="text-center text-xs text-gray-600">
                  Already have account?{' '}
                  <button type="button" onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300">Sign in</button>
                </p>
              </form>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <form onSubmit={verifyAndPredict} className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Shield size={26} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Verify OTP</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Sent to <span className="text-white font-medium">+91 {phone}</span>
                  </p>
                </div>
                <input
                  type="tel" required maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field text-center text-4xl font-mono tracking-[1em] py-5"
                  placeholder="······"
                  autoFocus
                />
                <button type="submit" disabled={loading || otp.length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base glow">
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Calculating score…</>
                    : <><TrendingUp size={20} />Verify & See My Score <ArrowRight size={18} /></>}
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
            )}

            {/* Step 3 — Score */}
            {step === 3 && score && (
              <div className="space-y-5">
                <div className="text-center">
                  <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-display font-bold">Your Credit Score</h2>
                  <p className="text-gray-500 text-sm">AI-powered assessment</p>
                </div>
                <div className="text-center py-8 rounded-2xl border-2"
                  style={{ borderColor: scoreColor + '40', background: scoreColor + '10' }}>
                  <div className="font-display text-9xl font-bold leading-none" style={{ color: scoreColor }}>
                    {score.credit_score}
                  </div>
                  <div className="text-gray-400 mt-2 text-sm">out of 850</div>
                  <div className="mt-4">
                    <span className="px-5 py-2 rounded-xl text-sm font-bold border-2"
                      style={{ color: scoreColor, borderColor: scoreColor + '60', background: scoreColor + '20' }}>
                      {score.risk_category} Risk
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mt-3">{(score.probability * 100).toFixed(1)}% confidence</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>300 Poor</span><span>580</span><span>700</span><span>850 Excellent</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" />
                    <div className="absolute top-1/2 w-5 h-5 bg-white rounded-full border-2 border-gray-900 shadow-lg"
                      style={{ left: `${((score.credit_score - 300) / 550) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                    />
                  </div>
                </div>
                <p className="text-gray-400 text-sm text-center">{score.message}</p>
                <button onClick={() => setStep(4)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                  <CheckCircle size={18} />Save & Create Account
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className="btn-secondary w-full flex items-center justify-center gap-2">
                  View Full Dashboard <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 4 — Account */}
            {step === 4 && (
              <form onSubmit={completeSignup} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-display font-bold">Save Your Score</h2>
                  <p className="text-gray-500 text-sm mt-1">Create account to track history</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input type="text" required value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field" placeholder="Min 6 characters" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                    : <><CheckCircle size={18} />Create Account</>}
                </button>
              </form>
            )}

          </div>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 text-gray-600 text-sm border-t border-white/5">
        CreditIQ — College Project · Built with FastAPI + React + ML
      </footer>
    </div>
  )
}