"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import toast from "react-hot-toast"
import { Save, Download, Share, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import ResumeForm from "../components/ResumeForm"
import { ResumeFormRef } from "../components/ResumeForm"
import ResumePreview from "../components/ResumePreview"
import TemplateSelector from "../components/TemplateSelector"
import { debounce } from "lodash"

interface Resume {
  _id: string
  title: string
  template: string
  content: {
    personalInfo: {
      name: string
      email: string
      phone: string
      address: string
      website: string
      summary: string
    }
    education: Array<{
      _id?: string
      institution: string
      degree: string
      fieldOfStudy: string
      startDate: string
      endDate: string
      description: string
    }>
    experience: Array<{
      _id?: string
      company: string
      position: string
      location: string
      startDate: string
      endDate: string
      description: string
    }>
    skills: Array<{
      _id?: string
      name: string
      level: number
    }>
    projects: Array<{
      _id?: string
      title: string
      description: string
      link: string
    }>
  }
  createdAt: string
  updatedAt: string
}

const ResumeEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<Resume | null>(null)
  const [originalResume, setOriginalResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidationModal, setShowValidationModal] = useState(false)

  // Create a ref for the ResumeForm to access its validation methods
  const resumeFormRef = useRef<ResumeFormRef>(null)

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get(`/resumes/${id}`)
        setResume(response.data)
        setOriginalResume(JSON.parse(JSON.stringify(response.data))) // Deep copy for comparison
        // For new resumes, set hasUnsavedChanges to true immediately
        // This helps identify newly created resumes that haven't been filled out
        if (response.data.content.personalInfo.name === "" && 
            response.data.content.personalInfo.email === "") {
          setHasUnsavedChanges(true)
        }
      } catch (error) {
        toast.error("Failed to fetch resume")
        navigate("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResume()
    }
  }, [id, navigate])

  // Check for unsaved changes when resuming editing
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  const handleChange = (updatedResume: Resume) => {
    setResume(updatedResume)
    setHasUnsavedChanges(true)
  }

  const validateResume = (): boolean => {
    const errors: string[] = []
    
    if (!resume) return false
    
    // Validate title
    if (!resume.title || resume.title.trim() === '') {
      errors.push("Resume title is required")
    }
    
    // Validate personal info
    if (!resume.content.personalInfo.name || resume.content.personalInfo.name.trim() === '') {
      errors.push("Full name is required")
    }
    
    if (!resume.content.personalInfo.email || resume.content.personalInfo.email.trim() === '') {
      errors.push("Email is required")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(resume.content.personalInfo.email)) {
        errors.push("Valid email is required")
      }
    }

    // Validate date ranges in education and experience sections
    let hasDateRangeErrors = false;
    
    // Check education date ranges
    resume.content.education.forEach((edu, index) => {
      if (edu.startDate && edu.endDate) {
        const startDate = new Date(edu.startDate);
        const endDate = new Date(edu.endDate);
        if (startDate > endDate) {
          hasDateRangeErrors = true;
          errors.push(`In Education #${index + 1}: Start date must be before end date`);
        }
      }
    });
    
    // Check experience date ranges
    resume.content.experience.forEach((exp, index) => {
      if (exp.startDate && exp.endDate) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        if (startDate > endDate) {
          hasDateRangeErrors = true;
          errors.push(`In Experience #${index + 1}: Start date must be before end date`);
        }
      }
    });

    // If there are date range errors, don't proceed with additional validations
    if (hasDateRangeErrors) {
      setValidationErrors(errors);
      return false;
    }

    // Validate section fields if they exist (skills, experience, education)
    if (resumeFormRef.current) {
      // This will update the errors in the ResumeForm component and return whether all required fields are valid
      const sectionsValid = resumeFormRef.current.validateArrayFields();
      
      if (!sectionsValid) {
        if (resume.content.skills.length > 0) {
          const invalidSkills = resume.content.skills.some(skill => !skill.name);
          if (invalidSkills) {
            errors.push("All skills must have a name");
          }
        }
        
        if (resume.content.experience.length > 0) {
          const invalidExperiences = resume.content.experience.some(exp => !exp.company || !exp.position);
          if (invalidExperiences) {
            errors.push("All experience entries must have company name and position");
          }
        }
        
        if (resume.content.education.length > 0) {
          const invalidEducation = resume.content.education.some(edu => !edu.institution || !edu.degree);
          if (invalidEducation) {
            errors.push("All education entries must have institution and degree");
          }
        }
      }
    }
    
    setValidationErrors(errors)
    
    return errors.length === 0
  }

  const handleSave = async () => {
    if (!resume) return

    // Validate resume before saving
    if (!validateResume()) {
      setShowValidationModal(true)
      return
    }

    try {
      setSaving(true)
      await api.put(`/resumes/${id}`, resume)
      setLastSaved(new Date())
      setOriginalResume(JSON.parse(JSON.stringify(resume))) // Update original after save
      setHasUnsavedChanges(false)
      toast.success("Resume saved successfully")
      
      // Switch to preview mode after saving successfully
      setActiveTab("preview")
    } catch (error) {
      toast.error("Failed to save resume")
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resumes/${id}/pdf`, { responseType: "blob" })

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

  const handleShareLink = async () => {
    try {
      const response = await api.post(`/resumes/${id}/public`)
      const publicUrl = `${window.location.origin}/public/${response.data.publicId}`

      await navigator.clipboard.writeText(publicUrl)
      toast.success("Public link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to create public link")
    }
  }

  const handleTemplateChange = async (template: string) => {
    if (!resume) return

    const updatedResume = { ...resume, template }
    setResume(updatedResume)
    setHasUnsavedChanges(true)
  }

  const handleNavigateAway = (path: string) => {
    if (hasUnsavedChanges) {
      // If user is navigating back to dashboard
      if (path === "/dashboard") {
        // For an empty resume, skip validation and either show discard dialog
        // or delete it and navigate away directly
        if (resume && 
            resume.content.personalInfo.name === "" && 
            resume.content.personalInfo.email === "") {
          
          // Set pending path and show discard dialog
          setPendingNavigationPath(path);
          setShowDiscardModal(true);
          return;
        }
      }
      
      // For other paths, or non-empty resumes, proceed with normal validation
      // If it's a newly created resume with no content, run validation first
      if (resume && 
          resume.content.personalInfo.name === "" && 
          resume.content.personalInfo.email === "") {
        
        if (!validateResume()) {
          setShowValidationModal(true)
          setPendingNavigationPath(path)
          return
        }
      }
      
      setPendingNavigationPath(path)
      setShowDiscardModal(true)
    } else {
      navigate(path)
    }
  }

  const handleConfirmNavigation = () => {
    setShowDiscardModal(false);
    
    // Check if this is a newly created empty resume that should be deleted
    if (resume && 
        pendingNavigationPath && 
        resume.content.personalInfo.name === "" && 
        resume.content.personalInfo.email === "") {
      
      // Delete the empty resume before navigating away
      const deleteEmptyResume = async () => {
        try {
          await api.delete(`/resumes/${id}`);
        } catch (error) {
          // Even if deletion fails, still navigate away
          console.error("Failed to delete empty resume:", error);
        } finally {
          navigate(pendingNavigationPath);
        }
      };
      
      deleteEmptyResume();
    } else if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
  };

  const handleCancelNavigation = () => {
    setShowDiscardModal(false);
    setPendingNavigationPath(null);
  };

  const handleSaveAndNavigate = async () => {
    if (!resume) return
    
    // Validate resume before saving and navigating
    if (!validateResume()) {
      setShowValidationModal(true)
      return
    }
    
    try {
      setSaving(true)
      await api.put(`/resumes/${id}`, resume)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      toast.success("Resume saved successfully")
      
      if (pendingNavigationPath) {
        navigate(pendingNavigationPath)
      }
    } catch (error) {
      toast.error("Failed to save resume")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Resume not found</h3>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Validation Errors Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
              Resume Validation Errors
            </h3>
            <div className="mb-5">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Please fix the following issues before saving:
              </p>
              <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700"
                onClick={() => setShowValidationModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              You have unsaved changes. What would you like to do?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                onClick={handleCancelNavigation}
              >
                Continue Editing
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700"
                onClick={handleSaveAndNavigate}
              >
                Save & Exit
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                onClick={handleConfirmNavigation}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => handleNavigateAway("/dashboard")}
            className="mr-4 p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resume.title}</h1>
            <div className="flex items-center mt-1">
              {saving ? (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="pulse mr-1">Saving...</span>
                </span>
              ) : lastSaved ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-500 dark:text-amber-400 ml-2">
                  • Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 opacity-75 cursor-not-allowed'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
            disabled={!hasUnsavedChanges || saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </button>

          <button
            onClick={handleShareLink}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </button>
          
          {activeTab === "preview" && (
            <button
              onClick={() => handleNavigateAway("/dashboard")}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("edit")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "edit"
                  ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "preview"
                  ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Preview
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "edit" ? (
            <div className="space-y-6">
              <TemplateSelector 
                currentTemplate={resume.template} 
                onTemplateChange={handleTemplateChange}
              />

              <ResumeForm resume={resume} onChange={handleChange} ref={resumeFormRef} />
            </div>
          ) : (
            <ResumePreview resume={resume} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeEditor

