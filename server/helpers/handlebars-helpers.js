const handlebars = require("handlebars")

// Helper to format dates
handlebars.registerHelper("formatDate", (dateString) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  })
})

// Helper to check if a value is less than or equal to another
handlebars.registerHelper("lte", (a, b) => a <= b)

// Helper to iterate n times
handlebars.registerHelper("times", (n, block) => {
  let accum = ""
  for (let i = 1; i <= n; i++) {
    accum += block.fn(i)
  }
  return accum
})

// Helper to check if a value exists
handlebars.registerHelper("if_exists", function (value, options) {
  if (value && value !== "") {
    return options.fn(this)
  }
  return options.inverse(this)
})

// Helper to join array values with a separator
handlebars.registerHelper("join", (array, separator) => {
  if (!Array.isArray(array)) return ""
  return array.join(separator)
})

module.exports = handlebars
