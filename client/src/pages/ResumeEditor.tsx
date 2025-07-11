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
    if (!resume) return;

    try {
      // 1. Render the current preview to HTML using a hidden container
      const previewContainer = document.createElement('div');
      previewContainer.style.position = 'fixed';
      previewContainer.style.left = '-9999px';
      previewContainer.style.top = '0';
      previewContainer.style.width = '800px'; // A4 width
      previewContainer.style.background = '#fff';
      document.body.appendChild(previewContainer);

      // Render the correct template
      let templateHtml = '';
      switch (resume.template) {
        case 'modern':
          templateHtml = require('react-dom/server').renderToStaticMarkup(
            require('../templates/ModernTemplate').default({ resume })
          );
          break;
        case 'classic':
          templateHtml = require('react-dom/server').renderToStaticMarkup(
            require('../templates/ClassicTemplate').default({ resume })
          );
          break;
        case 'minimal':
          templateHtml = require('react-dom/server').renderToStaticMarkup(
            require('../templates/MinimalTemplate').default({ resume })
          );
          break;
        default:
          templateHtml = require('react-dom/server').renderToStaticMarkup(
            require('../templates/ModernTemplate').default({ resume })
          );
      }
      previewContainer.innerHTML = templateHtml;

      // 2. Get the HTML content
      const html = previewContainer.innerHTML;
      document.body.removeChild(previewContainer);

      // 3. Send HTML to backend for PDF generation
      const pdfBlob = await api.generatePdfFromHtml(resume._id, html);

      // 4. Check if the blob is actually a PDF
      if (pdfBlob.type !== 'application/pdf') {
        const text = await pdfBlob.text();
        toast.error('Failed to generate PDF: ' + text);
        return;
      }

      // 5. Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.title || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 6. Reload the resume from the backend to refresh the preview
      const response = await api.get(`/resumes/${resume._id}`);
      setResume(response.data);
      setOriginalResume(JSON.parse(JSON.stringify(response.data)));
      setHasUnsavedChanges(false);

      toast.success('Resume downloaded and preview reloaded!');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      {/* Validation Errors Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-800 focus:outline-none" role="dialog" aria-modal="true" aria-labelledby="validation-modal-title">
            <h3 id="validation-modal-title" className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg></span>
              Resume Validation Errors
            </h3>
            <div className="mb-6">
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
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={() => setShowValidationModal(false)}
                aria-label="Close validation errors dialog"
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-800 focus:outline-none" role="dialog" aria-modal="true" aria-labelledby="discard-modal-title">
            <h3 id="discard-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              You have unsaved changes. What would you like to do?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={handleCancelNavigation}
                aria-label="Continue editing"
              >
                Continue Editing
              </button>
              <button
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={handleSaveAndNavigate}
                aria-label="Save and exit"
              >
                Save & Exit
              </button>
              <button
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                onClick={handleConfirmNavigation}
                aria-label="Discard changes"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigateAway("/dashboard")}
            className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 truncate max-w-xs sm:max-w-md">{resume.title}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {saving ? (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center animate-pulse">Saving...</span>
              ) : lastSaved ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : null}
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-500 dark:text-amber-400">• Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow px-4 py-3">
            <button
              onClick={handleSave}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors mr-2 ${hasUnsavedChanges ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-white opacity-70 cursor-not-allowed'}`}
              disabled={!hasUnsavedChanges || saving}
              aria-label="Save resume"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors mr-2"
              aria-label="Download PDF"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={handleShareLink}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
              aria-label="Share public link"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Main Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("edit")}
              className={`py-4 px-6 text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                activeTab === "edit"
                  ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === "edit" ? "page" : undefined}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-4 px-6 text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                activeTab === "preview"
                  ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === "preview" ? "page" : undefined}
            >
              Preview
            </button>
          </nav>
        </div>
        <div className="p-8">
          {activeTab === "edit" ? (
            <div className="space-y-8">
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

