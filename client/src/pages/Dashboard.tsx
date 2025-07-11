"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import toast from "react-hot-toast"
import { 
  Plus, 
  FileText, 
  Trash2, 
  LinkIcon, 
  ExternalLink, 
  Download, 
  Search, 
  SortAsc, 
  SortDesc, 
  Filter,
  AlertCircle,
  X,
  AlertTriangle
} from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

interface Resume {
  _id: string
  title: string
  createdAt: string
  updatedAt: string
  template: string
  publicId?: string
  content: {
    personalInfo: {
      name: string
    }
  }
}

const templateNames = {
  "modern": "Modern",
  "classic": "Classic",
  "minimal": "Minimal"
}

type SortField = "title" | "updatedAt" | "template"
type SortDirection = "asc" | "desc"

const Dashboard = () => {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("updatedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [templateFilter, setTemplateFilter] = useState<string | null>(null)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null)
  const [deletingResume, setDeletingResume] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Add click outside handler for the delete modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeDeleteModal();
      }
    };

    if (deleteModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [deleteModalOpen]);

  // Close the delete modal
  const closeDeleteModal = () => {
    if (!deletingResume) {
      setDeleteModalOpen(false);
      setResumeToDelete(null);
    }
  };

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes")
        setResumes(response.data)
      } catch (error) {
        toast.error("Failed to fetch resumes")
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [])

  const createNewResume = async () => {
    try {
      setLoading(true)
      const response = await api.post("/resumes", {
        title: `My Resume ${resumes.length + 1}`,
        template: "modern",
      })

      navigate(`/resume/${response.data._id}`)
      // After creating the resume, fetch all resumes again to update the list
      // instead of immediately navigating to the editor
      const resumesResponse = await api.get("/resumes")
      setResumes(resumesResponse.data)
      
      // Show success message with instructions
      
      setLoading(false)
    } catch (error) {
      toast.error("Failed to create resume")
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    
    try {
      setDeletingResume(true);
      await api.delete(`/resumes/${resumeToDelete}`);
      setResumes(resumes.filter((resume) => resume._id !== resumeToDelete));
      toast.success("Resume deleted successfully");
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingResume(false);
    }
  };

  const createPublicLink = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await api.post(`/resumes/${id}/public`)

      // Update the resume with the public ID
      setResumes(
        resumes.map((resume) => (resume._id === id ? { ...resume, publicId: response.data.publicId } : resume))
      )

      const publicUrl = `${window.location.origin}/public/${response.data.publicId}`
      navigator.clipboard.writeText(publicUrl)

      toast.success("Public link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to create public link")
    }
  }
  
  const downloadResume = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setLoading(true)
      // Find the resume to get its data
      const resume = resumes.find(r => r._id === id)
      if (!resume) {
        setLoading(false)
        toast.error("Resume not found")
        return
      }
      // Render the correct template to HTML (same as ResumeEditor)
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
      // Send HTML to backend for PDF generation
      const pdfBlob = await api.generatePdfFromHtml(resume._id, templateHtml);
      // Check if the blob is actually a PDF
      if (pdfBlob.type !== 'application/pdf') {
        const text = await pdfBlob.text();
        toast.error('Failed to generate PDF: ' + text);
        setLoading(false);
        return;
      }
      // Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.success("PDF downloaded successfully!");
      setLoading(false);
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error(`Failed to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  // Filter and sort resumes
  const filteredAndSortedResumes = resumes
    .filter(resume => {
      // Apply template filter
      if (templateFilter && resume.template !== templateFilter) {
        return false
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          resume.title.toLowerCase().includes(searchLower) ||
          (resume.content?.personalInfo?.name || "").toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } else if (sortField === "template") {
        return sortDirection === "asc"
          ? a.template.localeCompare(b.template)
          : b.template.localeCompare(a.template)
      } else {
        // Sort by updatedAt date
        return sortDirection === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc")
  }

  const changeSortField = (field: SortField) => {
    if (sortField === field) {
      toggleSortDirection()
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading && resumes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">Dashboard</h1>
          <p className="text-base text-gray-600 dark:text-gray-300">All your resumes in one place. Create, edit, download, and share with ease.</p>
        </div>
        <button
          onClick={createNewResume}
          className="inline-flex items-center px-6 py-3 rounded-lg shadow-lg text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Resume
        </button>
      </header>
      
      {/* Search and filter bar */}
      {resumes.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border border-gray-100 dark:border-gray-800">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition"
              placeholder="Search resumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search resumes"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Filter chip if active */}
            {templateFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mr-2">
                {templateNames[templateFilter as keyof typeof templateNames]}
                <button
                  onClick={() => setTemplateFilter(null)}
                  className="ml-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
                  aria-label="Clear template filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-haspopup="listbox"
                aria-expanded={isFilterMenuOpen}
              >
                <Filter className="h-4 w-4 mr-2" />
                {templateFilter ? `Template: ${templateNames[templateFilter as keyof typeof templateNames]}` : "Filter Templates"}
              </button>
              {isFilterMenuOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none right-0 border border-gray-100 dark:border-gray-800">
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${!templateFilter ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => {
                      setTemplateFilter(null)
                      setIsFilterMenuOpen(false)
                    }}
                  >
                    All Templates
                  </button>
                  {Object.entries(templateNames).map(([key, name]) => (
                    <button
                      key={key}
                      className={`block px-4 py-2 text-sm w-full text-left ${templateFilter === key ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => {
                        setTemplateFilter(key)
                        setIsFilterMenuOpen(false)
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2 items-center ml-2">
              <button
                onClick={() => changeSortField("title")}
                className={`px-3 py-2 text-xs font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                  sortField === "title" 
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Sort by name"
              >
                Name
                {sortField === "title" && (
                  sortDirection === "asc" ? <SortAsc className="inline ml-1 h-4 w-4" /> : <SortDesc className="inline ml-1 h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => changeSortField("updatedAt")}
                className={`px-3 py-2 text-xs font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors ${
                  sortField === "updatedAt" 
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Sort by updated date"
              >
                Updated
                {sortField === "updatedAt" && (
                  sortDirection === "asc" ? <SortAsc className="inline ml-1 h-4 w-4" /> : <SortDesc className="inline ml-1 h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Resume</h3>
              </div>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                disabled={deletingResume}
              >
                <X className="h-5 w-5" />
        </button>
      </div>

            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this resume? This action cannot be undone and all data will be permanently lost.
              </p>
      </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors disabled:opacity-50"
                onClick={closeDeleteModal}
                disabled={deletingResume}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                onClick={confirmDelete}
                disabled={deletingResume}
              >
                {deletingResume ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no resumes */}
      {resumes.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center py-16 px-6 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center mb-8">
            <FileText className="h-20 w-20 text-emerald-400 mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">Start Your Professional Journey</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl text-center mb-4">
              Build a standout resume that showcases your skills and experience. Choose from professionally designed templates and customize to match your personal brand.
            </p>
          </div>
          <button
            onClick={createNewResume}
            className="inline-flex items-center px-8 py-3 rounded-lg shadow-lg text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors mb-8"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your Resume Now
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-8">
            {Object.entries(templateNames).map(([id, name]) => (
              <div key={id} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center p-4">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-2">
                  <span className="text-2xl font-bold text-emerald-500">{name.charAt(0)}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{name} Template</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {id === 'modern' && 'Clean design with modern elements'}
                  {id === 'classic' && 'Traditional format for established professionals'}
                  {id === 'minimal' && 'Simple and elegant for a focused presentation'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : filteredAndSortedResumes.length === 0 ? (
        <div className="flex flex-col items-center py-16 px-6 bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800">
          <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching resumes</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6 text-center">Try adjusting your search or filters.</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setTemplateFilter(null)
            }}
            className="inline-flex items-center px-6 py-2 rounded-lg shadow text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedResumes.map((resume) => (
            <div
              key={resume._id}
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-2xl" />
              <div className="flex-1 flex flex-col p-6">
                <Link
                  to={`/resume/${resume._id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                  aria-label={`Edit resume: ${resume.title}`}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{resume.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">{resume.content?.personalInfo?.name || "Unnamed Resume"}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-medium">{templateNames[resume.template as keyof typeof templateNames]}</span>
                    <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    to={`/resume/${resume._id}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                    aria-label={`Edit resume: ${resume.title}`}
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={(e) => downloadResume(resume._id, e)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                    aria-label={`Download PDF for ${resume.title}`}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Download
                  </button>
                  {resume.publicId ? (
                    <a
                      href={`/public/${resume.publicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                      aria-label={`View public link for ${resume.title}`}
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      View Public
                    </a>
                  ) : (
                    <button
                      onClick={(e) => createPublicLink(resume._id, e)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                      aria-label={`Create public link for ${resume.title}`}
                    >
                      <LinkIcon className="mr-1 h-3.5 w-3.5" />
                      Share
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(resume._id, e)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-600 bg-white border border-red-200 hover:bg-red-50 dark:bg-gray-900 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
                    aria-label={`Delete resume: ${resume.title}`}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

export default Dashboard
