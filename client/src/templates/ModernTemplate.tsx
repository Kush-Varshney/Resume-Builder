import { Mail, Phone, Globe, MapPin, Award, Calendar } from "lucide-react"

interface ModernTemplateProps {
  resume: any
}

const ModernTemplate = ({ resume }: ModernTemplateProps) => {
  const { personalInfo, education, experience, skills, projects } = resume.content;
  const primaryColor = "#1e7f54"; // Fixed emerald green

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="p-8 font-sans text-secondary-800" style={{ "--primary-color": primaryColor } as React.CSSProperties}>
      {/* Header with subtle gradient background */}
      <header className="mb-8 pb-6" style={{ borderBottom: `3px solid ${primaryColor}` }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>{personalInfo.name}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-secondary-600 mb-4">
          {personalInfo.email && (
            <div className="flex items-center group">
              <Mail size={14} className="mr-1.5" style={{ color: primaryColor }} />
              <span style={{ transition: "color 0.2s" }} className="group-hover:text-primary-600">{personalInfo.email}</span>
            </div>
          )}
          
          {personalInfo.phone && (
            <div className="flex items-center group">
              <Phone size={14} className="mr-1.5" style={{ color: primaryColor }} />
              <span style={{ transition: "color 0.2s" }} className="group-hover:text-primary-600">{personalInfo.phone}</span>
            </div>
          )}
          
          {personalInfo.website && (
            <div className="flex items-center group">
              <Globe size={14} className="mr-1.5" style={{ color: primaryColor }} />
              <span style={{ transition: "color 0.2s" }} className="group-hover:text-primary-600">{personalInfo.website}</span>
            </div>
          )}
          
          {personalInfo.address && (
            <div className="flex items-center group">
              <MapPin size={14} className="mr-1.5" style={{ color: primaryColor }} />
              <span style={{ transition: "color 0.2s" }} className="group-hover:text-primary-600">{personalInfo.address}</span>
            </div>
          )}
        </div>
        
        {personalInfo.summary && (
          <p className="text-secondary-700 leading-relaxed" style={{ borderLeft: `3px solid ${primaryColor}`, paddingLeft: "0.5rem" }}>{personalInfo.summary}</p>
        )}
      </header>
      
      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2">
          {/* Experience Section */}
          {experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-secondary-800 pb-1 mb-4 inline-block"
                  style={{ borderBottom: `2px solid ${primaryColor}` }}>
                Professional Experience
              </h2>
              
              <div className="space-y-6">
                {experience.map((exp: any, index: number) => (
                  <div key={index} className="relative pl-5" 
                       style={{ 
                         position: 'relative',
                         borderLeft: `2px solid rgba(0,0,0,0.05)`
                       }}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium" style={{ color: primaryColor }}>{exp.position}</h3>
                      <div className="text-sm text-secondary-500 flex items-center">
                        <Calendar size={14} className="mr-1 inline" />
                        {formatDate(exp.startDate)}
                        {' - '}
                        {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                    
                    <div className="text-secondary-700 font-medium mb-2">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                    
                    <p className="text-sm text-secondary-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Projects Section */}
          {projects.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-secondary-800 pb-1 mb-4 inline-block"
                  style={{ borderBottom: `2px solid ${primaryColor}` }}>
                Projects
              </h2>
              
              <div className="space-y-5">
                {projects.map((project: any, index: number) => (
                  <div key={index} className="p-4 border border-secondary-100 rounded-md hover:border-primary-200 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium" style={{ color: primaryColor }}>{project.title}</h3>
                    </div>
                    
                    {project.link && (
                      <div className="text-sm mb-2">
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: primaryColor }}
                          className="hover:underline"
                        >
                          {project.link}
                        </a>
                      </div>
                    )}
                    
                    <p className="text-sm text-secondary-600 leading-relaxed">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Right Column */}
        <div>
          {/* Education Section */}
          {education.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-secondary-800 pb-1 mb-4 inline-block"
                  style={{ borderBottom: `2px solid ${primaryColor}` }}>
                Education
              </h2>
              
              <div className="space-y-5">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="p-4 bg-secondary-50 rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium" style={{ color: primaryColor }}>{edu.institution}</h3>
                      <div className="text-sm text-secondary-500 flex items-center">
                        <Calendar size={14} className="mr-1 inline" />
                        {formatDate(edu.startDate)}
                        {' - '}
                        {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </div>
                    </div>
                    
                    <div className="text-secondary-700 mb-1 font-medium">
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </div>
                    
                    {edu.description && (
                      <p className="text-sm text-secondary-600 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Skills Section */}
          {skills.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-secondary-800 pb-1 mb-4 inline-block"
                  style={{ borderBottom: `2px solid ${primaryColor}` }}>
                Skills
              </h2>
              
              <div className="space-y-3">
                {skills.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center mb-1">
                    <Award size={14} className="mr-2" style={{ color: primaryColor }} />
                    <span className="text-secondary-700 font-medium">{skill.name}</span>
                    <div className="ml-auto flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full mx-0.5 transition-all duration-300 ${
                            i < skill.level ? '' : 'bg-secondary-200'
                          }`}
                          style={i < skill.level ? { backgroundColor: primaryColor } : {}}
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
