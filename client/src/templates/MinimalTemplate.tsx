interface MinimalTemplateProps {
  resume: any
}

const MinimalTemplate = ({ resume }: MinimalTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-8 font-sans bg-white rounded-2xl shadow max-w-3xl mx-auto text-gray-900 print:shadow-none print:rounded-none print:p-0">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-emerald-700 mb-1 tracking-tight">{personalInfo.name}</h1>
        <div className="flex flex-wrap gap-3 text-base text-gray-600 mb-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>
        {personalInfo.summary && <p className="mt-3 text-gray-700 max-w-2xl leading-relaxed italic">{personalInfo.summary}</p>}
      </header>

      {/* Experience Section */}
      {experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-emerald-700 mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-5">
            {experience.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                  <h3 className="font-semibold text-emerald-700">{exp.position}</h3>
                  <div className="text-sm text-gray-500">
                    {formatDate(exp.startDate)}{' - '}{exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  </div>
                </div>
                <div className="text-gray-800 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-emerald-700 mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-5">
            {education.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                  <h3 className="font-semibold text-emerald-700">{edu.institution}</h3>
                  <div className="text-sm text-gray-500">
                    {formatDate(edu.startDate)}{' - '}{edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </div>
                </div>
                <div className="text-gray-800 mb-1">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                {edu.description && <p className="text-sm text-gray-600 leading-relaxed">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-emerald-700 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any, index: number) => (
              <span key={index} className="px-3 py-1.5 text-sm rounded-full bg-emerald-50 text-emerald-700 font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-semibold text-emerald-700 mb-3 uppercase tracking-wide">Projects</h2>
          <div className="space-y-5">
            {projects.map((project: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold text-emerald-700 mb-1">{project.title}</h3>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline text-sm">
                    {project.link}
                  </a>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default MinimalTemplate

