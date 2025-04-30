export function parseCSV(csvText: string, debug = false) {
  if (!csvText || csvText.trim() === "") {
    console.error("Empty CSV text received")
    return []
  }

  try {
    if (debug) {
      console.log("Raw CSV text (first 100 chars):", csvText.substring(0, 100))
    }

    // Try different line ending strategies
    let lines: string[] = []

    // First try with standard line endings
    lines = csvText.split(/\r?\n/)

    if (lines.length <= 1) {
      // If that didn't work, try with just \n
      lines = csvText.split("\n")
    }

    if (lines.length <= 1) {
      // If that still didn't work, try with just \r
      lines = csvText.split("\r")
    }

    if (debug) {
      console.log("CSV split into", lines.length, "lines")
      console.log("First line:", lines[0])
      if (lines.length > 1) console.log("Second line:", lines[1])
    }

    if (lines.length === 0) {
      console.error("No lines found in CSV")
      return []
    }

    // Parse headers
    const headers = parseCSVLine(lines[0], debug)

    if (debug) {
      console.log("Parsed headers:", headers)
    }

    const result = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = parseCSVLine(lines[i], debug)

      if (debug && i === 1) {
        console.log("First row values:", values)
      }

      // Skip rows that don't have enough values
      if (values.length < 2) {
        if (debug) console.warn(`Skipping row ${i + 1}: not enough values`)
        continue
      }

      const entry: Record<string, string> = {}

      // Handle case where values might be fewer than headers
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        if (headers[j]) {
          entry[headers[j]] = values[j] || ""
        }
      }

      if (Object.keys(entry).length > 0) {
        result.push(entry)
      }
    }

    if (debug) {
      console.log("Parsed", result.length, "rows")
      if (result.length > 0) {
        console.log("First row:", result[0])
      }
    }

    return result
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw new Error(`Failed to parse CSV data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function parseCSVLine(line: string, debug = false): string[] {
  if (!line || line.trim() === "") return []

  if (debug) {
    console.log("Parsing line:", line)
  }

  // Try a simpler approach first - just split by comma
  // This works for many simple CSVs
  if (!line.includes('"')) {
    const values = line.split(",").map((v) => v.trim())
    if (debug) {
      console.log("Simple split result:", values)
    }
    return values
  }

  // For more complex CSVs with quotes, use a more robust approach
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes (two double quotes in a row)
        current += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add the last field
  result.push(current.trim())

  // Remove surrounding quotes from each field
  const finalResult = result.map((field) => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.substring(1, field.length - 1)
    }
    return field
  })

  if (debug) {
    console.log("Complex parse result:", finalResult)
  }

  return finalResult
}
