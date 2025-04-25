"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface TemplateSelectorProps {
  currentTemplate: string
  onTemplateChange: (template: string) => void
}

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional with a modern touch",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and elegant resume layout",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and straightforward design",
  },
]

const TemplateSelector = ({ 
  currentTemplate, 
  onTemplateChange
}: TemplateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Template</h3>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {isOpen ? "Close" : "Change Template"}
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                onTemplateChange(template.id)
                setIsOpen(false)
              }}
              className={`cursor-pointer border rounded-lg p-4 ${
                currentTemplate === template.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                </div>
                {currentTemplate === template.id && (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </div>

              <div className="mt-3 h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{template.name} Preview</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Current template: <span className="font-medium">{templates.find((t) => t.id === currentTemplate)?.name}</span>
        </span>
      </div>
    </div>
  )
}

export default TemplateSelector
