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
      <div className="flex justify-center items-center h-screen bg-secondary-50 dark:bg-secondary-950">
        <LoadingSpinner />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex flex-col bg-secondary-50 dark:bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="animate-fade-in card p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">Resume not found</h1>
            <p className="text-secondary-600 dark:text-secondary-300">
              This resume may have been removed or the link is invalid.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col bg-secondary-50 dark:bg-secondary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">{resume.title}</h1>

          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="btn btn-secondary flex items-center"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="card p-6">
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  )
}

export default PublicResume
