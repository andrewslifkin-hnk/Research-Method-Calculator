import { Feature } from './supabase';

// Sample features for development
export const SAMPLE_FEATURES: Feature[] = [
  {
    name: "Search Functionality",
    priority: "Must have",
    risk: "Medium",
    confidence: "Conclusive data",
    data: "Qualitative and/or Quantitative Data",
    size: "M",
    timing: "Start",
    recommendation: "Quantitative A/B Test and/or Deep Qualitative Research",
  },
  {
    name: "User Profile Management",
    priority: "Should have",
    risk: "Low",
    confidence: "Inconclusive data",
    data: "Qualitative and/or Quantitative Data",
    size: "S",
    timing: "Half",
    recommendation: "Optional Validation (Quantitative or Qualitative)",
  },
  {
    name: "Payment Integration",
    priority: "Must have",
    risk: "High",
    confidence: "No data",
    data: "No Research",
    size: "L",
    timing: "End",
    recommendation: "Quantitative A/B Test and/or Deep Qualitative Research",
  },
  {
    name: "Social Sharing",
    priority: "Could have",
    risk: "Low",
    confidence: "Conclusive data",
    data: "Qualitative and/or Quantitative Data",
    size: "XS",
    timing: "Half",
    recommendation: "Optional Validation + Focus groups",
  },
  {
    name: "Notification System",
    priority: "Should have",
    risk: "Medium",
    confidence: "Inconclusive data",
    data: "Qualitative and/or Quantitative Data",
    size: "M",
    timing: "Start",
    recommendation: "Targeted Qualitative Research",
  }
]; 