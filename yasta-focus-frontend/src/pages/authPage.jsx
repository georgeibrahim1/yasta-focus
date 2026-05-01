import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, User, X, Send } from 'lucide-react'
import Input from '../components/Input'
import { useLogin } from '../services/authServices/hooks/useLogin'
import { useSignup } from '../services/authServices/hooks/useSignup'
import { api } from '../services/api'
import YastaFocusRowLogo from '../components/YastaFocusRowLogo'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' })

  const login = useLogin()
  const signup = useSignup()
  const mutation = mode === 'login' ? login : signup

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    if (mode === 'login') {
      login.mutate({ email: data.email, password: data.password })
    } else {
      signup.mutate({
        username: data.username,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      })
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    reset()
    login.reset()
    signup.reset()
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotMessage({ type: '', text: '' })

    if (!emailVerified) {
      // Step 1: Verify email
      if (!forgotEmail) {
        setForgotMessage({ type: 'error', text: 'Please enter your email' })
        return
      }

      setForgotLoading(true)

      try {
        const response = await api.post('/api/auth/forgotPassword', { email: forgotEmail })
        setForgotMessage({
          type: 'success',
          text: response.data.message || 'Email verified!'
        })
        setEmailVerified(true)
      } catch (error) {
        setForgotMessage({
          type: 'error',
          text: error.response?.data?.message || 'Email not found'
        })
      } finally {
        setForgotLoading(false)
      }
    } else {
      // Step 2: Reset password
      if (!newPassword || !confirmPassword) {
        setForgotMessage({ type: 'error', text: 'Please fill in all fields' })
        return
      }

      if (newPassword !== confirmPassword) {
        setForgotMessage({ type: 'error', text: 'Passwords do not match' })
        return
      }

      if (newPassword.length < 8) {
        setForgotMessage({ type: 'error', text: 'Password must be at least 8 characters' })
        return
      }

      setForgotLoading(true)

      try {
        const response = await api.post('/api/auth/forgotPassword', {
          email: forgotEmail,
          newPassword,
          confirmPassword
        })
        setForgotMessage({
          type: 'success',
          text: response.data.message || 'Password reset successfully!'
        })
        setTimeout(() => {
          setShowForgotModal(false)
          setForgotMessage({ type: '', text: '' })
          setEmailVerified(false)
          setForgotEmail('')
          setNewPassword('')
          setConfirmPassword('')
        }, 2000)
      } catch (error) {
        setForgotMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to reset password'
        })
      } finally {
        setForgotLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] overflow-x-hidden relative">
      {/* Import Funky Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Orbitron', sans-serif;
        }

        .star-field {
          background: radial-gradient(circle at center, #171f33 0%, #060e20 100%);
          position: relative;
          overflow-x: hidden;
        }
        .star-field::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 40px, #a855f7, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 150px 150px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 250px 200px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 300px 100px, #adc6ff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 400px 400px;
          opacity: 0.3;
          pointer-events: none;
        }
        .glass-panel {
          background: rgba(23, 31, 51, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(183, 109, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        .inner-glow {
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .bloom-border:focus-within {
          border-color: #b76dff;
          box-shadow: 0 0 15px rgba(183, 109, 255, 0.3);
        }
        .bloom-border input:focus {
          outline: none;
          border-color: #b76dff;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #b76dff 0%, #842bd2 100%);
        }
      `}</style>

      {/* Atmospheric Background Elements */}
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ddb7ff]/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed top-[-5%] left-[-5%] w-[300px] h-[300px] bg-[#0566d9]/20 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Decorative HUD Corner Elements */}
      <div className="fixed top-6 left-6 border-t-2 border-l-2 border-[#ddb7ff]/40 w-8 h-8 pointer-events-none z-50"></div>
      <div className="fixed top-6 right-6 border-t-2 border-r-2 border-[#ddb7ff]/40 w-8 h-8 pointer-events-none z-50"></div>
      <div className="fixed bottom-6 left-6 border-b-2 border-l-2 border-[#ddb7ff]/40 w-8 h-8 pointer-events-none z-50"></div>
      <div className="fixed bottom-6 right-6 border-b-2 border-r-2 border-[#ddb7ff]/40 w-8 h-8 pointer-events-none z-50"></div>

      {/* Main Content */}
      <div className="relative z-10 star-field">
        {/* Hero Header */}
        <header className="relative pt-20 pb-12 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="inline-block mb-6 animate-pulse">
            <YastaFocusRowLogo className="w-48 h-auto drop-shadow-[0_0_20px_rgba(183,109,255,0.8)]" />
          </div>
          <h1 className="text-5xl font-bold text-[#ddb7ff] mb-1 tracking-[0.2em] uppercase">
            YASTA FOCUS
          </h1>
          <p className="text-lg text-[#adc6ff] uppercase opacity-80 max-w-lg mb-8 tracking-widest">
            A Gamified Educational & Productivity Hub
          </p>
          <div className="flex gap-6">
            <a href="#join" className="btn-gradient px-12 py-4 rounded-lg font-bold text-white shadow-[0_0_20px_rgba(183,109,255,0.4)] hover:shadow-[0_0_30px_rgba(183,109,255,0.6)] transition-all uppercase tracking-widest">
              Get Started
            </a>
            <a href="#features" className="px-12 py-4 rounded-lg font-bold text-[#ddb7ff] border border-[#ddb7ff]/30 hover:bg-[#ddb7ff]/10 transition-all uppercase tracking-widest">
              Learn More
            </a>
          </div>
        </header>

        {/* Feature Sections */}
        <main className="relative z-10">
          <div className="px-6 space-y-20 py-20" id="features">
            {/* Productivity Tools */}
            <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-[#ddb7ff]">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-xs uppercase tracking-widest">System Modules</span>
                </div>
                <h2 className="text-4xl text-[#f0dbff]">Productivity Tools</h2>
                <p className="text-[#cfc2d6] leading-relaxed">
                  Master your workflow with our integrated suite. Use the <span className="text-[#ddb7ff]">Focus Timer</span> (Pomodoro) to maintain deep work states, organize your academic life with <span className="text-[#ddb7ff]">Subjects & Tasks</span>, and get instant assistance via our <span className="text-[#ddb7ff]">AI-Powered Chat</span> assistant.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-8 flex items-center justify-center aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-[#ddb7ff]/10"></div>
                <span className="text-8xl text-[#ddb7ff]/40">📊</span>
              </div>
            </section>

            {/* Community & Social */}
            <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 glass-panel rounded-xl p-8 flex items-center justify-center aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-[#adc6ff]/10"></div>
                <span className="text-8xl text-[#adc6ff]/40">👥</span>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 text-[#adc6ff]">
                  <span className="text-2xl">🌐</span>
                  <span className="text-xs uppercase tracking-widest">Social Network</span>
                </div>
                <h2 className="text-4xl text-[#d8e2ff]">Community & Social</h2>
                <p className="text-[#cfc2d6] leading-relaxed">
                  Never study alone. Enter collaborative <span className="text-[#adc6ff]">Study Rooms</span> featuring real-time video and text chat. Join niche <span className="text-[#adc6ff]">Communities</span> to share resources, ask questions, and grow with peers who share your mission.
                </p>
              </div>
            </section>

            {/* Gamification */}
            <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-[#b76dff]">
                  <span className="text-2xl">🎖️</span>
                  <span className="text-xs uppercase tracking-widest">Leveling System</span>
                </div>
                <h2 className="text-4xl text-[#f0dbff]">Gamification</h2>
                <p className="text-[#cfc2d6] leading-relaxed">
                  Turn discipline into a game. Earn <span className="text-[#b76dff]">Achievements</span> for your milestones, climb through <span className="text-[#b76dff]">XP Levels</span> as you complete tasks, and dominate the global <span className="text-[#b76dff]">Leaderboards</span> to prove your dedication.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-8 flex items-center justify-center aspect-video relative overflow-hidden">
                <div className="absolute inset-0 bg-[#b76dff]/10"></div>
                <span className="text-8xl text-[#b76dff]/40">⭐</span>
              </div>
            </section>
          </div>

          {/* Auth Section */}
          <section className="py-20 px-6 bg-[#131b2e]/40" id="join">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-4xl text-[#f0dbff] mb-1">INITIALIZE ACCESS</h2>
                <p className="text-xs text-[#cfc2d6] opacity-60 uppercase tracking-widest">Prepare for departure to your peak performance</p>
              </div>

              {/* Login Card */}
              <div className="glass-panel inner-glow rounded-xl p-8 space-y-6">
                {/* Toggle */}
                <div className="flex bg-[#2d3449]/50 rounded-lg p-1 border border-[#988d9f]/30">
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className={`flex-1 py-3 px-4 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                      mode === 'login'
                        ? 'bg-[#ddb7ff] text-[#490080] shadow-lg'
                        : 'text-[#cfc2d6] hover:text-[#dae2fd]'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('signup')}
                    className={`flex-1 py-3 px-4 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                      mode === 'signup'
                        ? 'bg-[#ddb7ff] text-[#490080] shadow-lg'
                        : 'text-[#cfc2d6] hover:text-[#dae2fd]'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {mutation.error && (
                  <div className="p-3 rounded-lg border border-red-500/50 text-red-400 text-sm bg-red-600/20">
                    {mutation.error?.response?.data?.message || mutation.error?.message || 'Something went wrong'}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Username (Signup only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#cfc2d6] px-1 uppercase tracking-widest">Username</label>
                      <div className="relative bloom-border rounded-lg bg-[#060e20]/80 border border-[#988d9f]/30 transition-all flex items-center">
                        <span className="ml-4 text-[#cfc2d6]">👤</span>
                        <input
                          {...register('username', { required: 'Username is required' })}
                          className="bg-transparent border-none focus:ring-0 text-[#dae2fd] placeholder:text-[#988d9f] w-full py-4 px-3"
                          placeholder="Choose a username"
                        />
                      </div>
                      {errors.username && <p className="text-red-400 text-xs ml-1">{errors.username.message}</p>}
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#cfc2d6] px-1 uppercase tracking-widest">Email Address</label>
                    <div className="relative bloom-border rounded-lg bg-[#060e20]/80 border border-[#988d9f]/30 transition-all flex items-center">
                      <span className="ml-4 text-[#cfc2d6]">✉️</span>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        className="bg-transparent border-none focus:ring-0 text-[#dae2fd] placeholder:text-[#988d9f] w-full py-4 px-3"
                        placeholder="commander@nebula.io"
                        type="email"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-[#cfc2d6] uppercase tracking-widest">Access Key</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs font-bold text-[#ddb7ff] hover:text-[#f0dbff] transition-colors uppercase tracking-widest"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative bloom-border rounded-lg bg-[#060e20]/80 border border-[#988d9f]/30 transition-all flex items-center">
                      <span className="ml-4 text-[#cfc2d6]">🔐</span>
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="bg-transparent border-none focus:ring-0 text-[#dae2fd] placeholder:text-[#988d9f] w-full py-4 px-3"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="mr-4 text-[#cfc2d6] hover:text-[#ddb7ff] transition-colors"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#cfc2d6] px-1 uppercase tracking-widest">Confirm Password</label>
                      <div className="relative bloom-border rounded-lg bg-[#060e20]/80 border border-[#988d9f]/30 transition-all flex items-center">
                        <span className="ml-4 text-[#cfc2d6]">🔐</span>
                        <input
                          {...register('passwordConfirm', {
                            required: 'Please confirm your password',
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="bg-transparent border-none focus:ring-0 text-[#dae2fd] placeholder:text-[#988d9f] w-full py-4 px-3"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="mr-4 text-[#cfc2d6] hover:text-[#ddb7ff] transition-colors"
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.passwordConfirm && <p className="text-red-400 text-xs ml-1">{errors.passwordConfirm.message}</p>}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full btn-gradient py-4 rounded-lg text-lg font-bold text-white shadow-[0_0_20px_rgba(183,109,255,0.4)] hover:shadow-[0_0_30px_rgba(183,109,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Create Account')}
                  </button>
                </form>
              </div>

              {/* Footer Help */}
              <p className="text-center mt-8 text-[#cfc2d6]/60 text-sm">
                By entering the hub, you agree to the{' '}
                <a href="#" className="text-[#adc6ff] hover:underline underline-offset-4">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-12 text-center border-t border-[#988d9f]/20 bg-[#0b1326]">
          <div className="flex flex-col items-center gap-3">
            <span className="text-2xl text-[#ddb7ff]/40">🚀</span>
            <p className="text-[#cfc2d6]/40 text-xs tracking-[0.3em] uppercase">© 2024 YASTA FOCUS • GALACTIC PRODUCTIVITY SYSTEM</p>
          </div>
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#171f33] border border-[#988d9f]/20 rounded-2xl p-8 max-w-md w-full relative glass-panel">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotModal(false)
                setForgotMessage({ type: '', text: '' })
                setForgotEmail('')
                setEmailVerified(false)
                setNewPassword('')
                setConfirmPassword('')
              }}
              className="absolute top-4 right-4 text-[#cfc2d6] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#dae2fd] mb-2">Reset Password</h2>
              <p className="text-sm text-[#cfc2d6]">
                {emailVerified ? 'Enter your new password' : 'Enter your email to verify your account'}
              </p>
            </div>

            {/* Message */}
            {forgotMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg border text-sm ${
                  forgotMessage.type === 'success'
                    ? 'bg-green-600/20 border-green-500/50 text-green-400'
                    : 'bg-red-600/20 border-red-500/50 text-red-400'
                }`}
              >
                {forgotMessage.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#cfc2d6] mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#cfc2d6]">✉️</span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={emailVerified}
                    className="w-full pl-10 pr-4 py-3 bg-[#2d3449] border border-[#4d4354] rounded-lg text-white placeholder-[#988d9f] focus:outline-none focus:border-[#ddb7ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* New Password Fields */}
              {emailVerified && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#cfc2d6] mb-2">New Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#cfc2d6]">🔐</span>
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-[#2d3449] border border-[#4d4354] rounded-lg text-white placeholder-[#988d9f] focus:outline-none focus:border-[#ddb7ff] transition-colors"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#cfc2d6] hover:text-white transition-colors"
                      >
                        {showForgotNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cfc2d6] mb-2">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#cfc2d6]">🔐</span>
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-[#2d3449] border border-[#4d4354] rounded-lg text-white placeholder-[#988d9f] focus:outline-none focus:border-[#ddb7ff] transition-colors"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#cfc2d6] hover:text-white transition-colors"
                      >
                        {showForgotConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full btn-gradient py-3 rounded-lg font-bold text-white shadow-[0_0_20px_rgba(183,109,255,0.4)] hover:shadow-[0_0_30px_rgba(183,109,255,0.6)] disabled:opacity-60 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
              >
                {forgotLoading ? 'Processing...' : (emailVerified ? 'Reset Password' : 'Verify Email')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
