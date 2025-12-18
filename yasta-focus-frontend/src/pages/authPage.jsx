import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, User, X, Send } from 'lucide-react'
import Snowfall from 'react-snowfall'
import Input from '../components/Input'
import BlurredBubbles from '../components/BlurredBubbles'
import { useLogin } from '../services/authServices/hooks/useLogin'
import { useSignup } from '../services/authServices/hooks/useSignup'
import { api } from '../services/api'

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
    <div className="min-h-screen flex bg-[#10121A] overflow-hidden">
      {/* Snowfall Effect */}
      <Snowfall
        color="#ffffff"
        snowflakeCount={80}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}
      />

      {/* Background Blurred Bubbles - Multiple layers for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Layer 1 - Large bubbles on left side */}
        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-cyan-500/25 rounded-full blur-3xl animate-glow"></div>
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-20 w-[380px] h-[380px] bg-teal-500/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }}></div>

        {/* Layer 2 - Medium bubbles around form area */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-sky-400/25 rounded-full blur-2xl animate-glow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-10 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl animate-glow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2.5s' }}></div>

        {/* Layer 3 - Small accent bubbles */}
        <div className="absolute top-1/2 left-1/5 w-48 h-48 bg-blue-300/30 rounded-full blur-xl animate-glow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-20 left-1/6 w-56 h-56 bg-cyan-400/20 rounded-full blur-2xl animate-glow" style={{ animationDelay: '3.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-52 h-52 bg-purple-400/25 rounded-full blur-2xl animate-glow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Left Side - Auth Form */}
      <div className="w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Form Container with Glow Effect */}
        <div className="relative w-full max-w-md">
          {/* Animated Glow Background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50 animate-glow"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50 rounded-2xl blur-md opacity-60"></div>

          {/* Form Card */}
          <div className="relative bg-[#1a1c24]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                YASTA FOCUS
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login' ? 'Log in to continue your journey.' : 'Create an account to get started.'}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-5 p-1 rounded-lg bg-slate-700/50">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {mutation.error && (
              <div className="mb-3 p-2 rounded-lg border border-red-500 text-red-500 text-xs">
                {mutation.error?.response?.data?.message || mutation.error?.message || 'Something went wrong'}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Username (Signup only) */}
              {mode === 'signup' && (
                <Input
                  id="username"
                  label="Username"
                  placeholder="Choose a username"
                  leftIcon={User}
                  error={errors.username?.message}
                  {...register('username', { required: 'Username is required' })}
                />
              )}

              {/* Email */}
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                leftIcon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />

              {/* Password */}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  leftIcon={Lock}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    leftIcon={Lock}
                    error={errors.passwordConfirm?.message}
                    {...register('passwordConfirm', {
                      required: 'Please confirm your password',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {mutation.isPending ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1c24] border border-white/10 rounded-2xl p-8 max-w-md w-full relative">
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
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-sm text-slate-400">
                {emailVerified ? 'Enter your new password' : 'Enter your email to verify your account'}
              </p>
            </div>

            {/* Message */}
            {forgotMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg border text-sm ${forgotMessage.type === 'success'
                  ? 'bg-green-600/20 border-green-500/50 text-green-400'
                  : 'bg-red-600/20 border-red-500/50 text-red-400'
                  }`}
              >
                {forgotMessage.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Email Field - Always visible but disabled after verification */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={emailVerified}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* New Password Fields - Only show after email verification */}
              {emailVerified && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showForgotNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showForgotConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-base text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {emailVerified ? <Lock className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                {forgotLoading ? 'Processing...' : (emailVerified ? 'Reset Password' : 'Verify Email')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Right Side - Infinite Scrolling Pattern */}
      <div className='w-1/2 bg-[#3D2B58] px-8'>
        <div className="h-full overflow-hidden relative">
          <div
            className="absolute animate-scroll"
            style={{ top: 0, right: 0, width: '100%' }}
          >
            <img src="/ArtGroupBig.svg" alt="" className="w-full block pb-8" />
            <img src="/ArtGroupBig.svg" alt="" className="w-full block pb-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
