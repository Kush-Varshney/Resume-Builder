# Resume Builder

A full-stack application for creating, managing, and sharing professional resumes.

## Features

- User authentication (register, login, logout)
- Create and manage multiple resumes
- Choose from different resume templates
- Edit resume content with a user-friendly interface
- Real-time preview of resume
- Download resume as PDF
- Share resume with a public link
- Dark mode support

## Tech Stack

### Frontend
- React
- React Router
- Context API for state management
- Tailwind CSS for styling
- Axios for API requests
- React Hot Toast for notifications

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Puppeteer for PDF generation
- Handlebars for PDF templates

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   \`\`\`
   git clone https://github.com/yourusername/resume-builder.git
   cd resume-builder
   \`\`\`

2. Install dependencies
   \`\`\`
   npm run install-all
   \`\`\`

3. Create a `.env` file in the root directory based on `.env.example`

4. Start the development server
   \`\`\`
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
resume-builder/
├── client/                 # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source files
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── templates/      # Resume templates
│   │   └── ...
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── templates/          # Handlebars templates for PDF
│   └── ...
└── ...
\`\`\`

## Deployment

This application can be deployed to platforms like Heroku, Vercel, or any other hosting service that supports Node.js applications.

## License

This project is licensed under the MIT License.
