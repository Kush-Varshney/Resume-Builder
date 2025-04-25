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
      
      // Log that we're starting the download
      console.log(`Starting download for resume ID: ${id}, title: ${resume.title}`)
      
      try {
        // Method 1: Try the blob approach first
        const response = await api.get(`/resumes/${id}/pdf`, {
          responseType: 'blob',
        })
        
        // Check if we got a valid PDF (at least by MIME type)
        const contentType = response.headers['content-type']
        if (!contentType || !contentType.includes('application/pdf')) {
          console.warn('Response is not a PDF:', contentType)
          throw new Error('Response is not a PDF')
        }
        
        // Create a blob and download it
        const blob = new Blob([response.data], { type: 'application/pdf' })
        
        // Check if blob is valid
        if (blob.size === 0) {
          console.warn('Generated PDF has zero size')
          throw new Error('Generated PDF has zero size')
        }
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${resume.title}.pdf`
        document.body.appendChild(a)
        a.click()
        
        // Small delay before cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)
        
        toast.success("PDF downloaded successfully!")
      } catch (blobError) {
        console.error("Blob download failed, trying alternative method:", blobError)
        
        // Method 2: Open in a new tab as fallback
        const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
        const token = localStorage.getItem('token')
        const pdfUrl = `${apiBaseUrl}/resumes/${id}/pdf`
        
        const newTab = window.open('about:blank', '_blank')
        if (!newTab) {
          throw new Error('Could not open new tab. Please check your popup blocker settings.')
        }
        
        // Create a form to post with the token for authorization
        newTab.document.write(`
          <html>
            <body>
              <h1>Preparing your PDF download...</h1>
              <p>If the download doesn't start automatically, <a id="direct-link" href="${pdfUrl}">click here</a>.</p>
              <script>
                // Create a hidden iframe to handle the download
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                // Load the PDF URL in the iframe
                iframe.src = "${pdfUrl}";
                
                // Set the Authorization header for the direct link
                document.getElementById('direct-link').onclick = function(e) {
                  fetch("${pdfUrl}", {
                    headers: {
                      "Authorization": "Bearer ${token}"
                    }
                  })
                  .then(response => response.blob())
                  .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "${resume.title}.pdf";
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                  e.preventDefault();
                };
              </script>
            </body>
          </html>
        `)
        
        toast.success("PDF opened in a new tab")
      }
      
      setLoading(false)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
        
        <div className="flex gap-2">
        <button
          onClick={createNewResume}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Resume
        </button>
      </div>
      </div>
      
      {/* Search and filter bar */}
      {resumes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative">
                <button
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {templateFilter ? `Template: ${templateNames[templateFilter as keyof typeof templateNames]}` : "Filter Templates"}
                </button>
                
                {isFilterMenuOpen && (
                  <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none right-0">
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${!templateFilter ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
                        className={`block px-4 py-2 text-sm w-full text-left ${templateFilter === key ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
              
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => changeSortField("title")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    sortField === "title" 
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Name
                  {sortField === "title" && (
                    sortDirection === "asc" ? <SortAsc className="inline ml-1 h-4 w-4" /> : <SortDesc className="inline ml-1 h-4 w-4" />
                  )}
                </button>
                
                <button
                  onClick={() => changeSortField("updatedAt")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    sortField === "updatedAt" 
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Updated
                  {sortField === "updatedAt" && (
                    sortDirection === "asc" ? <SortAsc className="inline ml-1 h-4 w-4" /> : <SortDesc className="inline ml-1 h-4 w-4" />
                  )}
                </button>
              </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-teal-600">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white text-center px-4">Start Your Professional Journey</h2>
            </div>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <FileText className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Create Your First Resume</h3>
              <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Build a standout resume that showcases your skills and experience. Choose from professionally designed 
                templates and customize colors to match your personal brand.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(templateNames).map(([id, name]) => (
                <div key={id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                  <div className="p-4 text-center">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{name} Template</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {id === 'modern' && 'Clean design with modern elements'}
                      {id === 'classic' && 'Traditional format for established professionals'}
                      {id === 'minimal' && 'Simple and elegant for a focused presentation'}
                    </p>
                  </div>
                  
                  <div 
                    className="h-40 opacity-90 hover:opacity-100 transition-opacity"
                    style={{ 
                      backgroundColor: id === 'modern' ? '#e6f7f0' : id === 'classic' ? '#eef2ff' : '#f0f9ff'
                    }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="text-5xl text-gray-300 dark:text-gray-600">{name.charAt(0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col items-center">
              <button
                onClick={createNewResume}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your Resume Now
              </button>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
                <div className="p-3">
                  <div className="text-emerald-500 font-bold text-lg mb-1">Easy to Use</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Simple step-by-step process with intuitive editing</p>
                </div>
                <div className="p-3">
                  <div className="text-emerald-500 font-bold text-lg mb-1">Professional Templates</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Designed to impress recruiters and hiring managers</p>
                </div>
                <div className="p-3">
                  <div className="text-emerald-500 font-bold text-lg mb-1">Easy Sharing</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Download as PDF or share via secure link</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : filteredAndSortedResumes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No matching resumes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSearchTerm('')
                setTemplateFilter(null)
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedResumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl"
            >
              <div 
                className="h-3 w-full" 
                style={{ backgroundColor: "#1e7f54" }}
              />
              <div className="p-6">
                <Link
                  to={`/resume/${resume._id}`}
                  className="block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {resume.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {resume.content?.personalInfo?.name || "Unnamed Resume"}
                </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-md mr-2">
                      {templateNames[resume.template as keyof typeof templateNames]}
                    </span>
                    <span>
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={`/resume/${resume._id}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={(e) => downloadResume(resume._id, e)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
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
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      View Public
                    </a>
                  ) : (
                    <button
                      onClick={(e) => createPublicLink(resume._id, e)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                      <LinkIcon className="mr-1 h-3.5 w-3.5" />
                      Share
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteClick(resume._id, e)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-200 shadow-sm text-xs font-medium rounded-md text-red-600 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
