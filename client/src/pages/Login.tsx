"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero/Branding Section */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 h-full p-12">
        <div className="flex flex-col items-center">
          <div className="bg-emerald-600 rounded-full p-4 mb-4 shadow-lg">
            {/* Simple brand icon (SVG) */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#059669" />
              <path d="M13 27L27 13M13 13h14v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 mb-2 tracking-tight">Resume Builder</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xs">Create, manage, and share professional resumes with ease.</p>
        </div>
      </div>
      {/* Login Form Section */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Sign in to your account</h2>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-white font-semibold text-base shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <div className="text-center text-sm mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
