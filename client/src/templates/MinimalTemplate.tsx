interface MinimalTemplateProps {
  resume: any
}

const MinimalTemplate = ({ resume }: MinimalTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content
  const primaryColor = "#1e7f54" // Fixed emerald green

  return (
    <div className="p-8 font-sans" style={{ "--primary-color": primaryColor } as React.CSSProperties}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: primaryColor }}>{personalInfo.name}</h1>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>

        {personalInfo.summary && <p className="mt-4 text-gray-700">{personalInfo.summary}</p>}
      </header>

      <hr className="border-t border-gray-200 my-6" />

      {/* Experience Section */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4" style={{ color: primaryColor }}>Experience</h2>

          <div className="space-y-5">
            {experience.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold" style={{ color: primaryColor }}>{exp.position}</h3>
                  <div className="text-sm text-gray-500">
                    {exp.startDate &&
                      new Date(exp.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    {" - "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                      : "Present"}
                  </div>
                </div>

                <div className="text-gray-700 mb-2">{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>

                <p className="text-sm text-gray-600">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-t border-gray-200 my-6" />

      {/* Education Section */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4" style={{ color: primaryColor }}>Education</h2>

          <div className="space-y-5">
            {education.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold" style={{ color: primaryColor }}>{edu.institution}</h3>
                  <div className="text-sm text-gray-500">
                    {edu.startDate &&
                      new Date(edu.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    {" - "}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                      : "Present"}
                  </div>
                </div>

                <div className="text-gray-700 mb-2">
                  {edu.degree}
                  {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                </div>

                {edu.description && <p className="text-sm text-gray-600">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-t border-gray-200 my-6" />

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4" style={{ color: primaryColor }}>Skills</h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any, index: number) => (
              <div key={index} className="px-3 py-1.5 text-sm rounded" 
                   style={{ 
                     borderLeft: `2px solid ${primaryColor}`,
                     backgroundColor: "rgba(0,0,0,0.03)"
                   }}>
                {skill.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wide mb-4" style={{ color: primaryColor }}>Projects</h2>

          <div className="space-y-5">
            {projects.map((project: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold mb-1" style={{ color: primaryColor }}>{project.title}</h3>

                {project.link && (
                  <div className="text-sm mb-2">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor }} className="hover:underline">
                      {project.link}
                    </a>
                  </div>
                )}

                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default MinimalTemplate
