const Resume = require("../models/Resume")
const { validationResult } = require("express-validator")
const crypto = require("crypto")
const puppeteer = require("puppeteer")
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")

// @desc    Get all resumes
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 })
    res.json(resumes)
  } catch (err) {
    next(err)
  }
}

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this resume" })
    }

    res.json(resume)
  } catch (err) {
    next(err)
  }
}

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, template } = req.body

    const resume = await Resume.create({
      user: req.user.id,
      title,
      template: template || "modern",
      content: {
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          address: "",
          website: "",
          summary: "",
        },
        education: [],
        experience: [],
        skills: [],
        projects: [],
      },
    })

    res.status(201).json(resume)
  } catch (err) {
    next(err)
  }
}

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this resume" })
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    res.json(updatedResume)
  } catch (err) {
    next(err)
  }
}

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this resume" })
    }

    await resume.remove()

    res.json({ message: "Resume removed" })
  } catch (err) {
    next(err)
  }
}

// @desc    Create public link for resume
// @route   POST /api/resumes/:id/public
// @access  Private
exports.createPublicLink = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to share this resume" })
    }

    // Generate a unique public ID if it doesn't exist
    if (!resume.publicId) {
      resume.publicId = crypto.randomBytes(10).toString("hex")
      await resume.save()
    }

    res.json({ publicId: resume.publicId })
  } catch (err) {
    next(err)
  }
}

// @desc    Get public resume
// @route   GET /api/resumes/public/:id
// @access  Public
exports.getPublicResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ publicId: req.params.id })

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    res.json(resume)
  } catch (err) {
    next(err)
  }
}

// @desc    Generate PDF for resume
// @route   GET /api/resumes/:id/pdf
// @access  Private
exports.generatePDF = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this resume" })
    }

    // Convert Mongoose document to plain object if needed
    const resumeData = resume.toObject ? resume.toObject() : resume;
    
    console.log('PDF Generation - Resume Data Structure:');
    console.log(`Template: ${resumeData.template}`);
    console.log(`Education array check: ${Array.isArray(resumeData.content.education)}`);
    console.log(`Education length: ${resumeData.content.education ? resumeData.content.education.length : 0}`);
    
    if (resumeData.content.education && resumeData.content.education.length > 0) {
      console.log('First education item:', JSON.stringify(resumeData.content.education[0], null, 2));
    }
    
    // Create a template context with guaranteed array structures
    const templateContext = {
      ...resumeData,
      content: {
        ...resumeData.content,
        personalInfo: resumeData.content.personalInfo || {},
        education: Array.isArray(resumeData.content.education) ? resumeData.content.education : [],
        experience: Array.isArray(resumeData.content.experience) ? resumeData.content.experience : [],
        skills: Array.isArray(resumeData.content.skills) ? resumeData.content.skills : [],
        projects: Array.isArray(resumeData.content.projects) ? resumeData.content.projects : []
      },
      // Add count variables for debugging in templates
      educationCount: (resumeData.content.education || []).length,
      experienceCount: (resumeData.content.experience || []).length,
      skillsCount: (resumeData.content.skills || []).length,
      projectsCount: (resumeData.content.projects || []).length
    };
    
    console.log(`Template context education count: ${templateContext.educationCount}`);
    
    // Read the appropriate template file
    const templatePath = path.join(__dirname, '../templates', `${resumeData.template || 'modern'}.hbs`);
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    
    // Register helper for date formatting
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });
    
    // Compile the template
    const template = handlebars.compile(templateHtml);
    const html = template(templateContext);
    
    // For debugging: save the HTML content
    const debugPath = path.join(__dirname, '../debug');
    if (!fs.existsSync(debugPath)) {
      fs.mkdirSync(debugPath);
    }
    fs.writeFileSync(path.join(debugPath, `resume-${resumeData._id}.html`), html);
    
    // Generate PDF from HTML
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Take a screenshot for debugging
    await page.screenshot({ 
      path: path.join(debugPath, `resume-${resumeData._id}.png`),
      fullPage: true 
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=${resume.title.replace(/\s+/g, "_")}.pdf`)

    // Send PDF
    res.send(pdf)
  } catch (error) {
    console.error('Error generating PDF:', error);
    next(error)
  }
}

// @desc    Generate PDF for public resume
// @route   GET /api/resumes/public/:id/pdf
// @access  Public
exports.generatePublicPDF = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ publicId: req.params.id })

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Convert Mongoose document to plain JavaScript object
    const plainResume = JSON.parse(JSON.stringify(resume));

    // Log detailed resume data to debug content issues
    console.log('Resume data for public PDF generation:', {
      _id: plainResume._id,
      template: plainResume.template,
      personalInfo: {
        name: plainResume.content.personalInfo.name,
        email: plainResume.content.personalInfo.email,
      },
      education: {
        count: plainResume.content.education ? plainResume.content.education.length : 0,
        firstItem: plainResume.content.education && plainResume.content.education.length > 0 ? 
          plainResume.content.education[0].institution : 'none'
      },
      experience: {
        count: plainResume.content.experience ? plainResume.content.experience.length : 0,
      },
      skills: {
        count: plainResume.content.skills ? plainResume.content.skills.length : 0,
      }
    });

    // Register Handlebars helpers
    handlebars.registerHelper('formatDate', function(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });
    
    handlebars.registerHelper('times', function(n, block) {
      let accum = '';
      for(let i = 1; i <= n; ++i)
        accum += block.fn(i);
      return accum;
    });
    
    handlebars.registerHelper('lte', function(a, b) {
      return a <= b;
    });
    
    // Add debug helpers
    handlebars.registerHelper('debug', function(context) {
      console.log('Template context at render time:', context);
      return '';
    });

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    const page = await browser.newPage()

    // Load the template based on resume.template
    const templatePath = path.join(__dirname, `../templates/${resume.template}.hbs`)
    const templateHtml = fs.readFileSync(templatePath, "utf8")
    const template = handlebars.compile(templateHtml)
    
    // Create context with top-level properties that match the template's expected structure
    const templateContext = {
      personalInfo: plainResume.content.personalInfo || {},
      education: Array.isArray(plainResume.content.education) ? plainResume.content.education : [],
      experience: Array.isArray(plainResume.content.experience) ? plainResume.content.experience : [],
      skills: Array.isArray(plainResume.content.skills) ? plainResume.content.skills : [],
      projects: Array.isArray(plainResume.content.projects) ? plainResume.content.projects : [],
      educationCount: plainResume.content.education ? plainResume.content.education.length : 0
    };
    
    console.log('Public PDF template context check:', {
      hasEducation: Array.isArray(templateContext.education),
      educationLength: templateContext.education.length,
    });
    
    const html = template(templateContext);

    // For debugging, save the generated HTML
    const debugFolder = path.join(__dirname, '../../debug');
    if (!fs.existsSync(debugFolder)) {
      fs.mkdirSync(debugFolder);
    }
    const timestamp = Date.now();
    fs.writeFileSync(path.join(debugFolder, `debug-public-html-${timestamp}.html`), html);
    
    await page.setContent(html, { waitUntil: "networkidle0" })
    
    // Wait to ensure content renders
    await page.waitForTimeout(500);

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in",
      },
    })

    await browser.close()

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=${resume.title.replace(/\s+/g, "_")}.pdf`)

    // Send PDF
    res.send(pdf)
  } catch (err) {
    console.error("Public PDF generation error:", err);
    next(err)
  }
}

// @desc    Generate PDF from HTML provided by frontend
// @route   POST /api/resumes/:id/pdf-from-html
// @access  Private
exports.generatePDFFromHTML = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this resume" })
    }

    // Get HTML from request body
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ message: "HTML content is required" });
    }

    console.log('Generating PDF from frontend HTML');

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content directly from the frontend
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in",
      },
    });

    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${resume.title.replace(/\s+/g, "_")}.pdf`);

    // Send PDF
    res.send(pdf);
  } catch (err) {
    console.error("PDF generation from HTML error:", err);
    next(err);
  }
}
