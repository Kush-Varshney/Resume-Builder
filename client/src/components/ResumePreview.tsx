"use client"

import { useState } from "react"
import ModernTemplate from "../templates/ModernTemplate"
import ClassicTemplate from "../templates/ClassicTemplate"
import MinimalTemplate from "../templates/MinimalTemplate"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface ResumePreviewProps {
  resume: any
}

const ResumePreview = ({ resume }: ResumePreviewProps) => {
  const [scale, setScale] = useState(1)

  const renderTemplate = () => {
    switch (resume.template) {
      case "modern":
        return <ModernTemplate resume={resume} />
      case "classic":
        return <ClassicTemplate resume={resume} />
      case "minimal":
        return <MinimalTemplate resume={resume} />
      default:
        return <ModernTemplate resume={resume} />
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setScale(1)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex space-x-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-200 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-200 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          aria-label="Reset zoom"
        >
          <RefreshCw size={18} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-200 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <span className="ml-2 text-sm font-medium text-secondary-600 dark:text-secondary-300 flex items-center">
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        className="overflow-auto bg-secondary-100 dark:bg-secondary-900 p-6 rounded-lg shadow-inner w-full"
        style={{ 
          maxHeight: "calc(100vh - 240px)",
          minHeight: "500px"
        }}
      >
        <div
          className="resume-container bg-white mx-auto"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-in-out",
            marginBottom: scale > 1 ? `${(scale - 1) * 500}px` : "0",
          }}
        >
          {renderTemplate()}
        </div>
      </div>
      
      <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-4 text-center">
        Tip: You can also use Ctrl/Cmd + Mouse Wheel to zoom in and out
      </div>
    </div>
  )
}

export default ResumePreview
