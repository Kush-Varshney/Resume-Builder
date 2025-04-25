const express = require("express")
const { check } = require("express-validator")
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  createPublicLink,
  getPublicResume,
  generatePDF,
  generatePublicPDF,
  generatePDFFromHTML,
} = require("../controllers/resumes")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get all resumes
router.get("/", protect, getResumes)

// Get single resume
router.get("/:id", protect, getResume)

// Create new resume
router.post("/", [protect, check("title", "Title is required").not().isEmpty()], createResume)

// Update resume
router.put("/:id", protect, updateResume)

// Delete resume
router.delete("/:id", protect, deleteResume)

// Create public link
router.post("/:id/public", protect, createPublicLink)

// Get public resume
router.get("/public/:id", getPublicResume)

// Generate PDF
router.get("/:id/pdf", protect, generatePDF)

// Generate PDF from HTML (frontend-rendered)
router.post("/:id/pdf-from-html", protect, generatePDFFromHTML)

// Generate public PDF
router.get("/public/:id/pdf", generatePublicPDF)

module.exports = router
