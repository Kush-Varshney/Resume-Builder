interface ClassicTemplateProps {
  resume: any
}

const ClassicTemplate = ({ resume }: ClassicTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-8 font-serif bg-white rounded-2xl shadow-lg max-w-3xl mx-auto text-gray-800 print:shadow-none print:rounded-none print:p-0">
      {/* Header */}
      <header className="text-center mb-10 pb-6 border-b-4 border-emerald-600">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-2 tracking-tight">{personalInfo.name}</h1>
        <div className="flex flex-wrap justify-center gap-3 text-base text-gray-600 mb-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.website && <span>• {personalInfo.website}</span>}
          {personalInfo.address && <span>• {personalInfo.address}</span>}
        </div>
        {personalInfo.summary && <p className="mt-4 text-gray-700 max-w-2xl mx-auto italic bg-emerald-50/50 dark:bg-emerald-900/10 py-2 px-4 rounded-md border-l-4 border-emerald-400">{personalInfo.summary}</p>}
      </header>

      {/* Experience Section */}
      {experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1 uppercase tracking-wider">Professional Experience</h2>
          <div className="space-y-6">
            {experience.map((exp: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                  <h3 className="font-bold text-emerald-700 text-lg">{exp.position}</h3>
                  <div className="text-sm text-gray-500 italic">
                    {formatDate(exp.startDate)}{' - '}{exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  </div>
                </div>
                <div className="font-semibold text-gray-700 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1 uppercase tracking-wider">Education</h2>
          <div className="space-y-6">
            {education.map((edu: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                  <h3 className="font-bold text-emerald-700 text-lg">{edu.institution}</h3>
                  <div className="text-sm text-gray-500 italic">
                    {formatDate(edu.startDate)}{' - '}{edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </div>
                </div>
                <div className="font-semibold text-gray-700 mb-1">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                {edu.description && <p className="text-gray-600 text-sm leading-relaxed">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1 uppercase tracking-wider">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any, index: number) => (
              <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold shadow-sm">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1 uppercase tracking-wider">Projects</h2>
          <div className="space-y-6">
            {projects.map((project: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                  <h3 className="font-bold text-emerald-700 text-lg">{project.title}</h3>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline text-sm">
                      {project.link}
                    </a>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ClassicTemplate

