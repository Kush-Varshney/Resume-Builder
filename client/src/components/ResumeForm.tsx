"use client"

import type React from "react"

import { useState, forwardRef, useImperativeHandle } from "react"
import { PlusCircle, Trash2, AlertCircle, Github, Linkedin } from "lucide-react"

interface ResumeFormProps {
  resume: any
  onChange: (updatedResume: any) => void
}

export interface ResumeFormRef {
  validateArrayFields: () => boolean
}

const ResumeForm = forwardRef<ResumeFormRef, ResumeFormProps>(({ resume, onChange }, ref) => {
  const [activeSection, setActiveSection] = useState("personalInfo")
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [touchedFields, setTouchedFields] = useState<{[key: string]: boolean}>({})

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    validateArrayFields: () => validateArrayFields()
  }));

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true
    })
    
    // Clear error if value exists
    if (value && errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }

    onChange({
      ...resume,
      content: {
        ...resume.content,
        personalInfo: {
          ...resume.content.personalInfo,
          [name]: value,
        },
      },
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      'title': true
    })
    
    // Clear error if value exists
    if (value && errors['title']) {
      const newErrors = { ...errors }
      delete newErrors['title']
      setErrors(newErrors)
    }
    
    onChange({
      ...resume,
      title: value,
    })
  }

  const handleArrayItemChange = (
    section: "education" | "experience" | "skills" | "projects",
    index: number,
    field: string,
    value: string | number,
  ) => {
    const errorKey = `${section}-${index}-${field}`
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [errorKey]: true
    })
    
    // Clear error if value exists
    if (value && errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
    } else if (!value && isRequiredField(section, field)) {
      // Add error if required field is empty
      setErrors({
        ...errors,
        [errorKey]: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      })
    }

    const updatedItems = [...resume.content[section]]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Special validation for education dates
    if (section === "education" && (field === "startDate" || field === "endDate")) {
      const edu = updatedItems[index];
      const dateError = `${section}-${index}-dateRange`;
      
      // If both dates exist, validate they're in the right order
      if (edu.startDate && edu.endDate) {
        const startDate = new Date(edu.startDate);
        const endDate = new Date(edu.endDate);
        
        if (startDate > endDate) {
          setErrors({
            ...errors,
            [dateError]: "Start date must be before end date"
          });
          setTouchedFields({
            ...touchedFields,
            [dateError]: true
          });
        } else {
          // Clear date range error if dates are valid
          const newErrors = { ...errors };
          delete newErrors[dateError];
          setErrors(newErrors);
        }
      }
    }
    // Special validation for experience dates
    else if (section === "experience" && (field === "startDate" || field === "endDate")) {
      const exp = updatedItems[index];
      const dateError = `${section}-${index}-dateRange`;
      
      // If both dates exist, validate they're in the right order
      if (exp.startDate && exp.endDate) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        
        if (startDate > endDate) {
          setErrors({
            ...errors,
            [dateError]: "Start date must be before end date"
          });
          setTouchedFields({
            ...touchedFields,
            [dateError]: true
          });
        } else {
          // Clear date range error if dates are valid
          const newErrors = { ...errors };
          delete newErrors[dateError];
          setErrors(newErrors);
        }
      }
    }

    onChange({
      ...resume,
      content: {
        ...resume.content,
        [section]: updatedItems,
      },
    })
  }

  // Check if field is required based on section and field name
  const isRequiredField = (section: string, field: string): boolean => {
    switch (section) {
      case "skills":
        return field === "name";
      case "experience":
        return field === "company" || field === "position";
      case "education":
        return field === "institution" || field === "degree";
      default:
        return false;
    }
  }

  // Validate all required fields in array sections
  const validateArrayFields = () => {
    const newErrors = { ...errors };
    let valid = true;

    // Validate skills
    resume.content.skills.forEach((skill: { name: string, level: number }, index: number) => {
      if (!skill.name) {
        const errorKey = `skills-${index}-name`;
        newErrors[errorKey] = "Skill name is required";
        setTouchedFields({...touchedFields, [errorKey]: true});
        valid = false;
      }
    });

    // Validate experience
    resume.content.experience.forEach((exp: { 
      company: string, 
      position: string,
      location: string,
      startDate: string,
      endDate: string,
      description: string
    }, index: number) => {
      if (!exp.company) {
        const errorKey = `experience-${index}-company`;
        newErrors[errorKey] = "Company name is required";
        setTouchedFields({...touchedFields, [errorKey]: true});
        valid = false;
      }
      if (!exp.position) {
        const errorKey = `experience-${index}-position`;
        newErrors[errorKey] = "Position is required";
        setTouchedFields({...touchedFields, [errorKey]: true});
        valid = false;
      }
      
      // Check that start date is before end date
      if (exp.startDate && exp.endDate) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        
        if (startDate > endDate) {
          const errorKey = `experience-${index}-dateRange`;
          newErrors[errorKey] = "Start date must be before end date";
          setTouchedFields({...touchedFields, [errorKey]: true});
          valid = false;
        }
      }
    });

    // Validate education
    resume.content.education.forEach((edu: {
      institution: string,
      degree: string,
      fieldOfStudy: string,
      startDate: string,
      endDate: string,
      description: string
    }, index: number) => {
      if (!edu.institution) {
        const errorKey = `education-${index}-institution`;
        newErrors[errorKey] = "Institution is required";
        setTouchedFields({...touchedFields, [errorKey]: true});
        valid = false;
      }
      if (!edu.degree) {
        const errorKey = `education-${index}-degree`;
        newErrors[errorKey] = "Degree is required";
        setTouchedFields({...touchedFields, [errorKey]: true});
        valid = false;
      }
      
      // Check that start date is before end date
      if (edu.startDate && edu.endDate) {
        const startDate = new Date(edu.startDate);
        const endDate = new Date(edu.endDate);
        
        if (startDate > endDate) {
          const errorKey = `education-${index}-dateRange`;
          newErrors[errorKey] = "Start date must be before end date";
          setTouchedFields({...touchedFields, [errorKey]: true});
          valid = false;
        }
      }
    });

    setErrors(newErrors);
    return valid;
  }

  const addArrayItem = (section: "education" | "experience" | "skills" | "projects") => {
    let newItem

    switch (section) {
      case "education":
        newItem = {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
          location: "",
        }
        break
      case "experience":
        newItem = {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        }
        break
      case "skills":
        newItem = {
          name: "",
          level: 3,
        }
        break
      case "projects":
        newItem = {
          title: "",
          description: "",
          link: "",
        }
        break
      default:
        return
    }

    onChange({
      ...resume,
      content: {
        ...resume.content,
        [section]: [...resume.content[section], newItem],
      },
    })
  }

  const removeArrayItem = (section: "education" | "experience" | "skills" | "projects", index: number) => {
    const updatedItems = [...resume.content[section]]
    updatedItems.splice(index, 1)

    // Remove any errors related to this item
    const newErrors = { ...errors }
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${section}-${index}-`)) {
        delete newErrors[key];
      }
    })
    setErrors(newErrors)

    onChange({
      ...resume,
      content: {
        ...resume.content,
        [section]: updatedItems,
      },
    })
  }

  // Validate required field
  const validateField = (fieldName: string, value: string, displayName?: string) => {
    if (!value || value.trim() === '') {
      setErrors({
        ...errors,
        [fieldName]: `${displayName || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
      })
      return false
    }
    return true
  }

  // Validate email field
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  }

  // Validate phone field
  const validatePhone = (phone: string) => {
    if (!phone) return ""; // Phone is optional
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
    return "";
  }

  // Handle phone number input to ensure only numbers, +, -, (, ), and spaces
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const cleaned = value.replace(/[^\d+\-() ]/g, '');
    
    handlePersonalInfoChange({
      target: {
        name: 'phone',
        value: cleaned
      }
    } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
          Resume Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={resume.title}
          onChange={handleTitleChange}
          onBlur={() => {
            setTouchedFields({...touchedFields, title: true})
            validateField('title', resume.title)
          }}
          className={`mt-1 block w-full rounded-md border ${
            touchedFields.title && errors.title ? 'border-red-500' : 'border-gray-300'
          } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
          required
        />
        {touchedFields.title && errors.title && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {["personalInfo", "education", "experience", "skills", "projects"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeSection === section
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, " $1")}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "personalInfo" && (
        <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">Personal Information</h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={resume.content.personalInfo.name}
                onChange={handlePersonalInfoChange}
                onBlur={() => {
                  setTouchedFields({...touchedFields, name: true})
                  validateField('name', resume.content.personalInfo.name, 'Full Name')
                }}
                className={`mt-1 block w-full rounded-md border ${
                  touchedFields.name && errors.name ? 'border-red-500' : 'border-gray-300'
                } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                required
              />
              {touchedFields.name && errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={resume.content.personalInfo.email}
                onChange={handlePersonalInfoChange}
                onBlur={() => {
                  setTouchedFields({...touchedFields, email: true});
                  const emailError = validateEmail(resume.content.personalInfo.email);
                  if (emailError) {
                    setErrors({...errors, email: emailError});
                  }
                }}
                className={`mt-1 block w-full rounded-md border ${
                  touchedFields.email && errors.email ? 'border-red-500' : 'border-gray-300'
                } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                required
              />
              {touchedFields.email && errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={resume.content.personalInfo.phone}
                onChange={handlePhoneInput}
                onBlur={() => {
                  setTouchedFields({...touchedFields, phone: true});
                  const phoneError = validatePhone(resume.content.personalInfo.phone);
                  if (phoneError) {
                    setErrors({...errors, phone: phoneError});
                  }
                }}
                className={`mt-1 block w-full rounded-md border ${
                  touchedFields.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                placeholder="+1 (555) 123-4567"
              />
              {touchedFields.phone && errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={resume.content.personalInfo.address}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={resume.content.personalInfo.website}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label htmlFor="github" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1 flex items-center">
                <Github size={16} className="mr-1" /> GitHub
              </label>
              <input
                type="url"
                id="github"
                name="github"
                value={resume.content.personalInfo.github || ''}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1 flex items-center">
                <Linkedin size={16} className="mr-1" /> LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={resume.content.personalInfo.linkedin || ''}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
              Professional Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={4}
              value={resume.content.personalInfo.summary}
              onChange={handlePersonalInfoChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
            />
          </div>
        </div>
      )}

      {activeSection === "education" && (
        <div className="space-y-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">Education</h3>
          
              {resume.content.education.map((edu: any, index: number) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 relative">
                  <button
                    onClick={() => removeArrayItem("education", index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  >
                <Trash2 size={18} />
                  </button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                    Institution <span className="text-red-500">*</span>
                  </label>
                      <input
                        type="text"
                    id={`edu-institution-${index}`}
                        value={edu.institution}
                        onChange={(e) => handleArrayItemChange("education", index, "institution", e.target.value)}
                    onBlur={() => setTouchedFields({...touchedFields, [`education-${index}-institution`]: true})}
                    className={`mt-1 block w-full rounded-md border ${touchedFields[`education-${index}-institution`] ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                    required
                  />
                  {touchedFields[`education-${index}-institution`] && errors[`education-${index}-institution`] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors[`education-${index}-institution`]}
                    </p>
                  )}
                    </div>

                    <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                    Degree <span className="text-red-500">*</span>
                  </label>
                      <input
                        type="text"
                    id={`edu-degree-${index}`}
                        value={edu.degree}
                        onChange={(e) => handleArrayItemChange("education", index, "degree", e.target.value)}
                    onBlur={() => setTouchedFields({...touchedFields, [`education-${index}-degree`]: true})}
                    className={`mt-1 block w-full rounded-md border ${touchedFields[`education-${index}-degree`] ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                    required
                  />
                  {touchedFields[`education-${index}-degree`] && errors[`education-${index}-degree`] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors[`education-${index}-degree`]}
                    </p>
                  )}
                    </div>

                    <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleArrayItemChange("education", index, "fieldOfStudy", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={edu.location || ""}
                        onChange={(e) => handleArrayItemChange("education", index, "location", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>

                <div className="grid grid-cols-2 gap-3">
                      <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => handleArrayItemChange("education", index, "startDate", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                        />
                      </div>

                      <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => handleArrayItemChange("education", index, "endDate", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                        />
                      </div>
                    </div>
                    {touchedFields[`education-${index}-dateRange`] && errors[`education-${index}-dateRange`] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {errors[`education-${index}-dateRange`]}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={edu.description}
                      onChange={(e) => handleArrayItemChange("education", index, "description", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                    />
                  </div>
                </div>
              ))}
          
          <button
            onClick={() => addArrayItem("education")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Education
          </button>
        </div>
      )}

      {activeSection === "experience" && (
        <div className="space-y-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Experience</h3>
            <button
              type="button"
              onClick={() => addArrayItem("experience")}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 shadow-sm"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add Experience
            </button>
          </div>

          {resume.content.experience.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 text-center py-6 italic bg-white dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
              No experience entries yet. Click "Add Experience" to add your work history.
            </p>
          ) : (
            <div className="space-y-4">
              {resume.content.experience.map((exp: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-md relative shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                  <button
                    type="button"
                    onClick={() => removeArrayItem("experience", index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Remove experience"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayItemChange("experience", index, "company", e.target.value)}
                        onBlur={() => setTouchedFields({...touchedFields, [`experience-${index}-company`]: true})}
                        className={`mt-1 block w-full rounded-md border ${
                          touchedFields[`experience-${index}-company`] && errors[`experience-${index}-company`] 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                        required
                      />
                      {touchedFields[`experience-${index}-company`] && errors[`experience-${index}-company`] && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors[`experience-${index}-company`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                        Position <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleArrayItemChange("experience", index, "position", e.target.value)}
                        onBlur={() => setTouchedFields({...touchedFields, [`experience-${index}-position`]: true})}
                        className={`mt-1 block w-full rounded-md border ${
                          touchedFields[`experience-${index}-position`] && errors[`experience-${index}-position`] 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                        required
                      />
                      {touchedFields[`experience-${index}-position`] && errors[`experience-${index}-position`] && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {errors[`experience-${index}-position`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleArrayItemChange("experience", index, "location", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                    />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate || ''}
                        onChange={(e) => handleArrayItemChange("experience", index, "startDate", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate || ''}
                        onChange={(e) => handleArrayItemChange("experience", index, "endDate", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  {touchedFields[`experience-${index}-dateRange`] && errors[`experience-${index}-dateRange`] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      {errors[`experience-${index}-dateRange`]}
                    </p>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleArrayItemChange("experience", index, "description", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === "skills" && (
        <div className="space-y-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>
            <button
              type="button"
              onClick={() => addArrayItem("skills")}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 shadow-sm"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add Skill
            </button>
          </div>

          {resume.content.skills.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 text-center py-6 italic bg-white dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
              No skills added yet. Click "Add Skill" to add your skills.
            </p>
          ) : (
            <div className="space-y-4">
              {resume.content.skills.map((skill: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-md relative flex items-center shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                  <div className="flex-grow mr-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                          Skill <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => handleArrayItemChange("skills", index, "name", e.target.value)}
                          onBlur={() => setTouchedFields({...touchedFields, [`skills-${index}-name`]: true})}
                          className={`mt-1 block w-full rounded-md border ${
                            touchedFields[`skills-${index}-name`] && errors[`skills-${index}-name`] 
                              ? 'border-red-500' 
                              : 'border-gray-300'
                          } shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400`}
                          required
                        />
                        {touchedFields[`skills-${index}-name`] && errors[`skills-${index}-name`] && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {errors[`skills-${index}-name`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                          Proficiency Level: <span className="text-emerald-600 dark:text-emerald-400">{skill.level}/5</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={skill.level}
                          onChange={(e) =>
                            handleArrayItemChange("skills", index, "level", Number.parseInt(e.target.value))
                          }
                          className="mt-1 block w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeArrayItem("skills", index)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Remove skill"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === "projects" && (
        <div className="space-y-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h3>
            <button
              type="button"
              onClick={() => addArrayItem("projects")}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 shadow-sm"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add Project
            </button>
          </div>

          {resume.content.projects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300 text-center py-6 italic bg-white dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
              No projects added yet. Click "Add Project" to showcase your work.
            </p>
          ) : (
            <div className="space-y-4">
              {resume.content.projects.map((project: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-md relative shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                  <button
                    type="button"
                    onClick={() => removeArrayItem("projects", index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Remove project"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleArrayItemChange("projects", index, "title", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Project Link</label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => handleArrayItemChange("projects", index, "link", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                        placeholder="https://"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={project.description}
                        onChange={(e) => handleArrayItemChange("projects", index, "description", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default ResumeForm
