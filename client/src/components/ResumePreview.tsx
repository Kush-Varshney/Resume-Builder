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
    <div className="flex flex-col items-center w-full">
      {/* Zoom Controls */}
      <div className="mb-6 flex space-x-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 shadow-sm">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-lg text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          aria-label="Reset zoom"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Preview Area */}
      <div
        className="overflow-auto bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-3xl border border-gray-100 dark:border-gray-800"
        style={{ 
          maxHeight: "calc(100vh - 240px)",
          minHeight: "500px"
        }}
      >
        <div
          className="resume-container bg-white mx-auto rounded-xl shadow-md"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-in-out",
            marginBottom: scale > 1 ? `${(scale - 1) * 500}px` : "0",
            width: "800px",
            minHeight: "1100px"
          }}
        >
          {renderTemplate()}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Tip: You can also use Ctrl/Cmd + Mouse Wheel to zoom in and out
      </div>
    </div>
  )
}

export default ResumePreview
