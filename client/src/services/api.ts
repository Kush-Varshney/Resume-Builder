import axios, { AxiosInstance } from "axios"

// Extend AxiosInstance type to include our custom methods
interface ExtendedAxiosInstance extends AxiosInstance {
  generatePdfFromHtml: (resumeId: string, html: string) => Promise<Blob>;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
}) as ExtendedAxiosInstance;

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Add a method to generate a PDF from HTML
api.generatePdfFromHtml = async (resumeId: string, html: string) => {
  const response = await api.post(`/resumes/${resumeId}/pdf-from-html`, { html }, {
    responseType: 'blob',
  });
  return response.data;
};

export default api
