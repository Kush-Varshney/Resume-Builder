export interface Resume {
  _id: string
  title: string
  template: string
  content: {
    personalInfo: {
      name: string
      email: string
      phone: string
      address: string
      website: string
      summary: string
    }
    education: {
      institution: string
      degree: string
      fieldOfStudy: string
      startDate: string
      endDate: string
      description: string
    }[]
    experience: {
      company: string
      position: string
      location: string
      startDate: string
      endDate: string
      description: string
    }[]
    skills: {
      name: string
      level: number
    }[]
    projects: {
      title: string
      description: string
      link: string
    }[]
  }
}