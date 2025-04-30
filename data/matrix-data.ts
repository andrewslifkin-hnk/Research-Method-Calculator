// This file contains the decision matrix data as a simple exportable constant
// To update the data, simply edit this file directly

export type MatrixDataRow = {
  Priority: string
  Risk: string
  Confidence: string
  Data: string
  Size: string
  Timing: string
  Recommendation: string
  [key: string]: string // Allow for additional fields
}

// The matrix data is stored directly in the code for simplicity
export const MATRIX_DATA: MatrixDataRow[] = [
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "S",
    Timing: "Start",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
]

// Helper functions for working with the matrix data

// Get unique values for a specific column
export function getUniqueValues(column: string): string[] {
  const values = new Set<string>()

  MATRIX_DATA.forEach((row) => {
    // Handle case-insensitive column matching
    const actualColumn = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase()) || column

    if (row[actualColumn]) {
      values.add(row[actualColumn].trim())
    }
  })

  return Array.from(values)
}

// Get recommendation based on feature attributes
export function getRecommendation(
  priority: string,
  risk: string,
  confidence: string,
  data: string,
  size: string,
  timing: string,
): string[] {
  // Case-insensitive exact match function
  const exactMatch = (field1: string, field2: string) => {
    return field1.toLowerCase().trim() === field2.toLowerCase().trim()
  }

  // Handle special case where confidence is "No data"
  const isNoDataConfidence = confidence.toLowerCase().includes("no data")

  // Try to find an exact match based on all criteria
  const fullMatch = MATRIX_DATA.find(
    (row) =>
      exactMatch(row.Priority, priority) &&
      exactMatch(row.Risk, risk) &&
      exactMatch(row.Confidence, confidence) &&
      (isNoDataConfidence || exactMatch(row.Data, data)) &&
      exactMatch(row.Size, size) &&
      exactMatch(row.Timing, timing),
  )

  if (fullMatch) {
    return [fullMatch.Recommendation]
  }

  // If no full match, try to find a match based on Priority, Risk, and Confidence
  const prcMatch = MATRIX_DATA.find(
    (row) =>
      exactMatch(row.Priority, priority) &&
      exactMatch(row.Risk, risk) &&
      exactMatch(row.Confidence, confidence) &&
      (isNoDataConfidence || exactMatch(row.Data, data)),
  )

  if (prcMatch) {
    return [prcMatch.Recommendation]
  }

  // If no PRC match, try to find a match based on Size and Timing
  const stMatch = MATRIX_DATA.find((row) => exactMatch(row.Size, size) && exactMatch(row.Timing, timing))

  if (stMatch) {
    return [stMatch.Recommendation]
  }

  // If no match found, return a default
  return ["No recommendation found"]
}

// Method descriptions for the recommendations
export const methodDescriptions = {
  "Unmoderated test": "Remote testing without a moderator, allowing users to complete tasks at their own pace",
  "Pre-post analysis": "Comparing metrics before and after a feature launch to measure impact",
  "Monitor with Analytics": "Using analytics tools to track user behavior and feature performance",
  "Exploratory research": "Open-ended research to discover user needs and pain points",
  "UX research & A/B test":
    "In-depth user research combined with comparing two versions of a feature to determine which performs better",
  "Proceed without Testing": "Move forward with implementation without additional research or testing",
}
