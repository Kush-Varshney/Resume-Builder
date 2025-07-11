# Resume Builder

---

## 📖 Introduction

**Resume Builder** is a modern, full-stack web application for creating professional, visually appealing resumes in minutes. Features include live preview, multiple templates, PDF export, public sharing, and secure authentication.

---

## 🚀 Features

* 📝 Interactive Resume Builder: Live preview and intuitive editing
* 🎨 Multiple Templates: Choose from modern, classic, and minimal templates
* 📄 PDF Export: Download your resume as a polished PDF (WYSIWYG)
* 🔗 Public Resume Links: Share your resume via a unique public URL
* 🔒 Secure Authentication: JWT-based sign up, login, and profile management
* 🌐 Responsive UI: Mobile-friendly, modern design (React + Tailwind CSS)
* 🗄️ RESTful API Backend: Node.js, Express, MongoDB for robust data management
* 👤 Profile Management: Manage multiple resumes per user
* ♿ Accessibility: Keyboard navigation, screen reader support

---

## 🏗️ Tech Stack

**Frontend:**

* React.js (TypeScript)
* Tailwind CSS
* React Router
* Axios
* React Hot Toast

**Backend:**

* Node.js, Express.js
* MongoDB, Mongoose
* Handlebars (PDF templates)
* Puppeteer (PDF generation)
* JWT, bcrypt
* Helmet, CORS, Express Rate Limit

---

## 🗂️ Folder Structure

```
Resume-Builder/
│
├── README.md
├── .gitignore
├── package.json
│
├── client/
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── App.tsx
│       ├── index.tsx
│       ├── index.css
│       ├── components/
│       │   ├── LoadingSpinner.tsx
│       │   ├── Navbar.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── ResumeForm.tsx
│       │   ├── ResumePreview.tsx
│       │   └── TemplateSelector.tsx
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   ├── ResumeContext.tsx
│       │   └── ThemeContext.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Login.tsx
│       │   ├── NotFound.tsx
│       │   ├── PublicResume.tsx
│       │   ├── Register.tsx
│       │   └── ResumeEditor.tsx
│       ├── services/
│       │   └── api.ts
│       └── templates/
│           ├── ClassicTemplate.tsx
│           ├── MinimalTemplate.tsx
│           └── ModernTemplate.tsx
│
├── server/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── controllers/
│   │   ├── auth.js
│   │   └── resumes.js
│   ├── helpers/
│   │   └── handlebars-helpers.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── resumes.js
│   └── templates/
│       ├── classic.hbs
│       ├── minimal.hbs
│       └── modern.hbs
```

---

## ⚡ Getting Started

```bash
# Clone the repository
git clone https://github.com/Kush-Varshney/Resume-Builder.git
cd Resume-Builder

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Environment Variables

* Copy `.env.example` to `.env` in both `client/` and `server/`, and fill in your values.

### Running the App

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

* Client: http://localhost:3000
* Server: http://localhost:5000

---

## 🌐 Environment Variables Example

```
# ==== Server (Node.js/Express) ====
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=1d
NODE_ENV=development

# ==== Client (React) ====
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🛠️ Scripts

### Client (React)

* `npm run dev` — Start development server
* `npm run build` — Build for production
* `npm run start` — Start production server
* `npm run lint` — Lint code

### Server (Express)

* `npm run dev` — Start backend with hot reload (nodemon)
* `npm run start` — Start production server

---

## 🚀 Deployment

* **Frontend:** Deployable to Vercel, Netlify, or any Node.js host.
* **Backend:** Deployable to Render, Heroku, Railway, or any Node.js server. Ensure environment variables are set in your deployment environment.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a pull request

---

## 👤 Author

**Kush Varshney**  
B.Tech CSE | Full Stack Developer  
[Portfolio](https://kushvarshney.vercel.app/) • [GitHub](https://github.com/Kush-Varshney) • [LinkedIn](https://www.linkedin.com/in/kush-varshney-490baa250/)

---

## 📄 License

This project is licensed under the MIT License.
