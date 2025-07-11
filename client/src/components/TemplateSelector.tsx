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
    <section className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resume Template</h3>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          aria-expanded={isOpen}
          aria-controls="template-options"
        >
          {isOpen ? "Close" : "Change Template"}
        </button>
      </div>

      {isOpen && (
        <div id="template-options" className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onTemplateChange(template.id)
                setIsOpen(false)
              }}
              className={`group cursor-pointer border rounded-xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 text-left ${
                currentTemplate === template.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow"
                  : "border-gray-200 hover:border-emerald-400 dark:border-gray-700 dark:hover:border-emerald-500"
              }`}
              aria-pressed={currentTemplate === template.id}
              aria-label={`Select ${template.name} template`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                </div>
                {currentTemplate === template.id && (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </span>
                )}
              </div>
              <div className="mt-4 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-wide">{template.name} Preview</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Current template: <span className="font-semibold text-gray-900 dark:text-white">{templates.find((t) => t.id === currentTemplate)?.name}</span>
        </span>
      </div>
    </section>
  )
}

export default TemplateSelector
