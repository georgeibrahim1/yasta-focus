import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Input from '../components/Input'
import BlurredBubbles from '../components/BlurredBubbles'
import { useLogin } from '../services/authServices/hooks/useLogin'
import { useSignup } from '../services/authServices/hooks/useSignup'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  return (
    <div className="min-h-screen flex bg-[#10121A] overflow-hidden">
      {/* Background Blurred Bubbles */}
      <BlurredBubbles />

      {/* Left Side - Auth Form */}
      <div className="w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Form Container with Glow Effect */}
        <div className="relative w-full max-w-md">
          {/* Animated Glow Background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50 animate-glow"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50 rounded-2xl blur-md opacity-60"></div>
          
          {/* Form Card */}
          <div className="relative bg-[#1a1c24]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Join the Future
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {mode === 'login' ? 'Log in to continue your journey.' : 'Create an account to get started.'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-2 mb-8 p-1 rounded-lg bg-slate-700/50">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {mutation.error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500 text-red-500 text-sm">
              {mutation.error?.response?.data?.message || mutation.error?.message || 'Something went wrong'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline">
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 rounded-lg font-medium text-base text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {mutation.isPending ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline text-slate-400 hover:text-white">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline text-slate-400 hover:text-white">Privacy Policy</a>.
          </p>
          </div>
        </div>
      </div>

      {/* Right Side - Infinite Scrolling Pattern */}
      <div className='w-1/2 bg-[#402A5B] px-8'>
        <div className="h-full overflow-hidden relative bg-[#402A5B]">
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
