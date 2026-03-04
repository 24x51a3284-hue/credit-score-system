import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Phone, Shield, TrendingUp, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const autoData = {
  age: 28, annual_income: 60000, employment_type: 'Employed',
  loan_amount: 15000, num_credit_cards: 3, credit_utilization: 25,
  outstanding_debt: 3000, payment_history_score: 85, num_late_payments: 1,
}

export default function SignupPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [step, setStep]     = useState(1)
  const [phone, setPhone]   = useState('')
  const [otp, setOtp]       = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore]   = useState(null)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')

  const sendOTP = async (e) => {
    e.preventDefault()
    if (phone.length !== 10) return toast.error('Enter a valid 10-digit number')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone })
      toast.success('OTP sent! 📱')
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
      // First create a temp account to get token
      const tempEmail = `${phone}@creditiq.temp`
      const tempPass  = `temp${phone}123`

      // Try signup first (might fail if exists)
      try {
        await api.post('/auth/signup', {
          full_name: 'User',
          email: tempEmail,
          password: tempPass,
        })
      } catch {}

      // Login to get token
      const { data: authData } = await api.post('/auth/login', {
        email: tempEmail,
        password: tempPass,
      })

      // Set token temporarily
      localStorage.setItem('token', authData.access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`

      // Predict credit score automatically
      const { data: prediction } = await api.post('/predictions/predict', autoData)
      setScore(prediction)
      setStep(3)
      toast.success('Credit score calculated! 🎯')
    } catch (err) {
      toast.error('Verification failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const completeSignup = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', {
        full_name: name,
        email,
        password,
      })
      login(data.access_token, data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = score?.risk_category === 'Low' ? '#10B981' :
                     score?.risk_category === 'Medium' ? '#F59E0B' : '#EF4444'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={22} />
          </div>
          <h1 className="font-display text-3xl font-bold">CreditIQ</h1>
          <p className="text-gray-500 mt-2 text-sm">Instant credit score prediction</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Mobile', 'Verify', 'Score', 'Account'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > i + 1 ? 'bg-emerald-500 text-white' :
                step === i + 1 ? 'bg-blue-600 text-white' :
                'bg-white/10 text-gray-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-white' : 'text-gray-600'}`}>{label}</span>
              {i < 3 && <div className={`w-6 h-px ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="card">

          {/* Step 1 — Phone */}
          {step === 1 && (
            <form onSubmit={sendOTP} className="space-y-5">
              <div className="text-center mb-2">
                <Phone size={32} className="text-blue-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold">Enter Mobile Number</h2>
                <p className="text-gray-500 text-sm mt-1">We'll send an OTP to verify</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-3 glass rounded-xl text-gray-400 text-sm font-mono whitespace-nowrap">🇮🇳 +91</div>
                <input
                  type="tel" required maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="input-field flex-1 text-lg font-mono tracking-wider"
                  placeholder="10-digit number"
                />
              </div>
              <button type="submit" disabled={loading || phone.length !== 10} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  : <><Phone size={18} /> Send OTP</>}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
              </p>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={verifyAndPredict} className="space-y-5">
              <div className="text-center mb-2">
                <Shield size={32} className="text-emerald-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold">Enter OTP</h2>
                <p className="text-gray-500 text-sm mt-1">Sent to <span className="text-white">+91 {phone}</span></p>
              </div>
              <input
                type="tel" required maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input-field text-center text-3xl font-mono tracking-[0.8em]"
                placeholder="······"
              />
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating score…</>
                  : <><TrendingUp size={18} /> Verify & See My Score</>}
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 text-center text-sm text-gray-500 hover:text-gray-300">
                  ← Change number
                </button>
                <button type="button" onClick={sendOTP} className="flex-1 text-center text-sm text-blue-400 hover:text-blue-300">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Score Result */}
          {step === 3 && score && (
            <div className="space-y-5">
              <div className="text-center">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold">Your Credit Score</h2>
                <p className="text-gray-500 text-sm">Based on your financial profile</p>
              </div>

              {/* Big score display */}
              <div className="text-center py-6 rounded-2xl border-2" style={{ borderColor: scoreColor + '40', background: scoreColor + '10' }}>
                <div className="font-display text-8xl font-bold" style={{ color: scoreColor }}>
                  {score.credit_score}
                </div>
                <div className="text-gray-400 mt-1">out of 850</div>
                <div className="mt-3">
                  <span className="px-4 py-2 rounded-xl text-sm font-bold border-2"
                    style={{ color: scoreColor, borderColor: scoreColor + '60', background: scoreColor + '20' }}>
                    {score.risk_category} Risk
                  </span>
                </div>
                <div className="text-gray-400 text-sm mt-3">{(score.probability * 100).toFixed(1)}% confidence</div>
              </div>

              {/* Score bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>300</span><span>580</span><span>700</span><span>850</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" />
                  <div className="absolute top-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-900 shadow-lg"
                    style={{ left: `${((score.credit_score - 300) / 550) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                  />
                </div>
              </div>

              <p className="text-gray-300 text-sm text-center leading-relaxed">{score.message}</p>

              <button onClick={() => setStep(4)} className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Create Account to Save Score
              </button>
            </div>
          )}

          {/* Step 4 — Account details */}
          {step === 4 && (
            <form onSubmit={completeSignup} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold">Save Your Score</h2>
                <p className="text-gray-500 text-sm mt-1">Create account to track your credit history</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input type="text" required value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
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
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                  : <><CheckCircle size={18} /> Create Account</>}
              </button>
            </form>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          <Link to="/" className="hover:text-gray-400">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}