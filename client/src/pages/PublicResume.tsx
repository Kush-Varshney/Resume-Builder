"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import toast from "react-hot-toast"
import { Download, Share2 } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import ResumePreview from "../components/ResumePreview"

interface Resume {
  title: string;
  content: any;
  template: string;
  // Add other resume properties as needed
}

const PublicResume = () => {
  const { id } = useParams<{ id: string }>()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicResume = async () => {
      try {
        const response = await api.get(`/resumes/public/${id}`)
        setResume(response.data)
      } catch (error) {
        toast.error("Failed to fetch resume")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPublicResume()
    }
  }, [id])

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resumes/public/${id}/pdf`, { responseType: "blob" })

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${resume?.title || "resume"}.pdf`)

      // Append to html link element page
      document.body.appendChild(link)

      // Start download
      link.click()

      // Clean up and remove the link
      link.parentNode?.removeChild(link)

      toast.success("Resume downloaded successfully")
    } catch (error) {
      toast.error("Failed to download resume")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Resume not found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            This resume may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">{resume.title}</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
              aria-label="Share public link"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
              aria-label="Download PDF"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  )
}

export default PublicResume
