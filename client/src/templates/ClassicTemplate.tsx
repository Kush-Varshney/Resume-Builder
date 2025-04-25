interface ClassicTemplateProps {
  resume: any
}

const ClassicTemplate = ({ resume }: ClassicTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content
  const primaryColor = "#1e7f54" // Fixed emerald green

  return (
    <div className="p-8 font-serif" style={{ "--primary-color": primaryColor } as React.CSSProperties}>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>{personalInfo.name}</h1>

        <div className="text-sm text-gray-600">
          {personalInfo.email && <span className="mx-1">{personalInfo.email}</span>}
          {personalInfo.phone && <span className="mx-1">• {personalInfo.phone}</span>}
          {personalInfo.website && <span className="mx-1">• {personalInfo.website}</span>}
          {personalInfo.address && <span className="mx-1">• {personalInfo.address}</span>}
        </div>

        {personalInfo.summary && <p className="mt-4 text-gray-700 max-w-3xl mx-auto">{personalInfo.summary}</p>}
      </header>

      <hr className="border-t my-6" style={{ borderColor: primaryColor }} />

      {/* Experience Section */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wider" style={{ color: primaryColor }}>Professional Experience</h2>

          <div className="space-y-6">
            {experience.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold" style={{ color: primaryColor }}>{exp.position}</h3>
                  <div className="text-sm text-gray-600 italic">
                    {exp.startDate &&
                      new Date(exp.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    {" - "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                      : "Present"}
                  </div>
                </div>

                <div className="font-semibold text-gray-700 mb-2">
                  {exp.company}
                  {exp.location ? `, ${exp.location}` : ""}
                </div>

                <p className="text-gray-600">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-t border-gray-300 my-6" />

      {/* Education Section */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Education</h2>

          <div className="space-y-6">
            {education.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                  <div className="text-sm text-gray-600 italic">
                    {edu.startDate &&
                      new Date(edu.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    {" - "}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                      : "Present"}
                  </div>
                </div>

                <div className="font-semibold text-gray-700 mb-2">
                  {edu.degree}
                  {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                </div>

                {edu.description && <p className="text-gray-600">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-t border-gray-300 my-6" />

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Skills</h2>

          <div className="flex flex-wrap">
            {skills.map((skill: any, index: number) => (
              <div key={index} className="mr-2 mb-2 px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                {skill.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Projects</h2>

          <div className="space-y-6">
            {projects.map((project: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800">{project.title}</h3>
                </div>

                {project.link && (
                  <div className="text-sm text-gray-700 mb-2">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="underline">
                      {project.link}
                    </a>
                  </div>
                )}

                <p className="text-gray-600">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ClassicTemplate
