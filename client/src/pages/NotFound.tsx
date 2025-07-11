import { Link } from "react-router-dom"
import { Home } from "lucide-react"

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-white dark:bg-gray-900 text-center">
      <div className="flex flex-col items-center mb-8">
        <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4">
          <Home className="h-12 w-12 text-emerald-500" aria-hidden="true" />
        </span>
        <h1 className="text-7xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">Sorry, we couldn't find the page you were looking for.</p>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-6">It may have been moved or deleted.</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-lg shadow-lg text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          aria-label="Back to Home"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
