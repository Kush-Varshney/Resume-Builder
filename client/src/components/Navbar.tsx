"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Sun, Moon, LogOut, User, FileText } from "lucide-react"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center group">
              <FileText className="h-7 w-7 text-emerald-600 dark:text-emerald-400 mr-2 transition-transform group-hover:scale-110 duration-200" />
              <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">ResumeBuilder</span>
            </Link>
          </div>

          <div className="flex items-center space-x-5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:block">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <User size={18} />
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
