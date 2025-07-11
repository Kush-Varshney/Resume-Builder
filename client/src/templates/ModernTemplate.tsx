import { Mail, Phone, Globe, MapPin, Award, Calendar } from "lucide-react"

interface ModernTemplateProps {
  resume: any
}

const ModernTemplate = ({ resume }: ModernTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-8 font-sans text-gray-800 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto print:shadow-none print:rounded-none print:p-0">
      {/* Header */}
      <header className="mb-10 pb-6 border-b-4 border-emerald-600">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-2 tracking-tight">{personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 text-base text-gray-600 mb-4">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={16} className="text-emerald-600" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={16} className="text-emerald-600" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe size={16} className="text-emerald-600" />
              <span>{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-emerald-600" />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>
        {personalInfo.summary && (
          <p className="text-gray-700 leading-relaxed border-l-4 border-emerald-400 pl-4 italic bg-emerald-50/50 dark:bg-emerald-900/10 py-2 rounded-md">{personalInfo.summary}</p>
        )}
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left/Main Column */}
        <div className="md:col-span-2 space-y-10">
          {/* Experience Section */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1">Professional Experience</h2>
              <div className="space-y-6">
                {experience.map((exp: any, index: number) => (
                  <div key={index} className="relative pl-5 border-l-2 border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                      <h3 className="font-semibold text-emerald-700">{exp.position}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} className="inline" />
                        {formatDate(exp.startDate)}{' - '}{exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                    <div className="text-gray-800 font-medium mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1">Projects</h2>
              <div className="space-y-5">
                {projects.map((project: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-emerald-300 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                      <h3 className="font-semibold text-emerald-700">{project.title}</h3>
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline text-sm"
                        >
                          {project.link}
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right/Sidebar Column */}
        <div className="space-y-10">
          {/* Education Section */}
          {education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1">Education</h2>
              <div className="space-y-5">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="p-4 bg-emerald-50/50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                      <h3 className="font-semibold text-emerald-700">{edu.institution}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} className="inline" />
                        {formatDate(edu.startDate)}{' - '}{edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </div>
                    </div>
                    <div className="text-gray-800 mb-1 font-medium">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                    {edu.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-emerald-700 mb-4 border-b-2 border-emerald-200 pb-1">Skills</h2>
              <div className="space-y-3">
                {skills.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center mb-1">
                    <Award size={16} className="mr-2 text-emerald-600" />
                    <span className="text-gray-800 font-medium">{skill.name}</span>
                    <div className="ml-auto flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full mx-0.5 ${i < skill.level ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;

