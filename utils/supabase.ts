import { createClient } from "@supabase/supabase-js"

// Debug logging for environment variables
console.log("==== SUPABASE ENV VARS DEBUG ====");
console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("URL first 10 chars:", process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + "...");
}
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("ANON_KEY first 5 chars:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + "...");
}
console.log("==============================");

// Type for our matrix data
export type MatrixDataRow = Record<string, string>

// Type for feature entries
export interface Feature {
  name: string
  priority: string
  risk: string
  confidence: string
  data: string
  size: string
  timing: string
  recommendation: string
}

// Create a single instance of the Supabase client for the browser
let supabaseClient: ReturnType<typeof createClient> | null = null

// Initialize the Supabase client (client-side)
export const getSupabaseClient = () => {
  // For debugging, reset the client to force new creation
  supabaseClient = null
  
  if (supabaseClient) return supabaseClient

  // Check if we're in a browser environment and have the necessary env vars
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.log("Creating Supabase client with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + "...");
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return supabaseClient
  }

  // Provide more detailed error message about which variables are missing
  const missingVars = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  
  const errorMsg = `Supabase client could not be initialized. Missing environment variables: ${missingVars.join(", ")}. 
  Make sure to create a .env.local file with these variables.`
  
  // Log to console but don't throw an error
  console.warn(errorMsg)
  
  // Return a dummy client that won't throw errors
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column?: string, { ascending }: { ascending?: boolean } = { ascending: true }) => 
          Promise.resolve({
            data: [],
            error: {
              message: errorMsg
            }
          }),
        eq: () => ({
          single: () => Promise.resolve({
            data: null, 
            error: {
              message: errorMsg,
              code: "dummy_error"
            }
          })
        })
      }),
      upsert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      insert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      delete: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      })
    })
  } as any
}

// Create a server-side Supabase client (for API routes)
export const getServerSupabaseClient = () => {
  // For server-side, we create a new client each time to avoid sharing state
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  // Provide more detailed error message about which variables are missing
  const missingVars = []
  if (!process.env.SUPABASE_URL) missingVars.push("SUPABASE_URL")
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")
  
  const errorMsg = `Server Supabase client could not be initialized. Missing environment variables: ${missingVars.join(", ")}. 
  Make sure to create a .env.local file with these variables.`
  
  // Log to console but don't throw an error
  console.warn(errorMsg)
  
  // Return a dummy client that won't throw errors
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column?: string, { ascending }: { ascending?: boolean } = { ascending: true }) => 
          Promise.resolve({
            data: [],
            error: {
              message: errorMsg
            }
          }),
        eq: () => ({
          single: () => Promise.resolve({
            data: null, 
            error: {
              message: errorMsg,
              code: "dummy_error"
            }
          })
        })
      }),
      upsert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      insert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      delete: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      })
    })
  } as any
}

// Check if Supabase is available
export async function isSupabaseAvailable() {
  try {
    const supabase = getSupabaseClient()
    // Try a simple query to check if Supabase is working
    const { error } = await supabase.from("matrix_data").select("count", { count: "exact", head: true })

    if (error) {
      console.warn("Supabase not available:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.warn("Error checking Supabase availability:", error)
    return false
  }
}

// Helper function to get matrix data from Supabase
export async function getMatrixDataFromSupabase() {
  try {
    const supabase = getSupabaseClient()

    // Get the matrix data
    const { data, error } = await supabase.from("matrix_data").select("*").order("id", { ascending: true })

    if (error) {
      console.warn("Error fetching matrix data from Supabase:", error.message)
      return {
        data: [],
        success: false,
        source: "none",
        error: error.message
      }
    }

    // Get the last updated timestamp
    const { data: metaData, error: metaError } = await supabase
      .from("matrix_metadata")
      .select("last_updated")
      .eq("id", 1)
      .single()

    if (metaError && metaError.code !== "PGRST116") {
      console.warn("Error fetching matrix metadata:", metaError.message)
    }

    return {
      data: data || [],
      lastUpdated: metaData?.last_updated || new Date().toISOString(),
      success: true,
      source: "supabase",
    }
  } catch (error) {
    console.error("Failed to get data from Supabase:", error)
    return {
      data: [],
      success: false,
      source: "none",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Helper function to save matrix data to Supabase
export async function saveMatrixDataToSupabase(data: MatrixDataRow[]) {
  try {
    const supabase = getServerSupabaseClient()
    const now = new Date().toISOString()

    // Begin a transaction
    // First, delete all existing data
    const { error: deleteError } = await supabase.from("matrix_data").delete().neq("id", 0) // Ensure we have a condition to avoid deleting everything by accident

    if (deleteError) {
      console.warn("Error deleting existing matrix data:", deleteError.message)
      return {
        success: false,
        error: deleteError.message
      }
    }

    // Then insert the new data
    const { error: insertError } = await supabase.from("matrix_data").insert(
      data.map((row, index) => ({
        ...row,
        id: index + 1, // Add an ID for each row
      })),
    )

    if (insertError) {
      console.warn("Error inserting new matrix data:", insertError.message)
      return {
        success: false,
        error: insertError.message
      }
    }

    // Update the last_updated timestamp
    const { error: updateError } = await supabase.from("matrix_metadata").upsert({ id: 1, last_updated: now })

    if (updateError) {
      console.warn("Error updating matrix metadata:", updateError.message)
      // Continue anyway since the data was inserted successfully
    }

    return {
      success: true,
      lastUpdated: now,
      message: "Data saved to Supabase successfully",
    }
  } catch (error) {
    console.error("Failed to save data to Supabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Helper function to save feature entries to Supabase
export async function saveFeaturesToSupabase(features: Feature[]) {
  try {
    const supabase = getServerSupabaseClient()
    // Insert new feature entries
    const { error } = await supabase.from("features").insert(features)
    
    if (error) {
      console.warn("Error saving features to Supabase:", error.message)
      return {
        success: false,
        error: error.message,
        message: "Failed to save features to Supabase"
      }
    }
    
    return {
      success: true,
      message: "Features saved to Supabase successfully",
    }
  } catch (error) {
    console.error("Failed to save features to Supabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Exception while saving features to Supabase"
    }
  }
}

// Helper function to get all features from Supabase
export async function getFeaturesFromSupabase() {
  try {
    console.log("getFeaturesFromSupabase called");
    
    // First, check if Supabase is available
    const supabaseAvailable = await isSupabaseAvailable().catch((err) => {
      console.error("Error in isSupabaseAvailable:", err);
      return false;
    });
    
    if (!supabaseAvailable) {
      console.warn("Supabase is not available, using sample features");
      // Import and use sample features if Supabase is not available
      const { SAMPLE_FEATURES } = await import('./mock-data');
      return {
        data: SAMPLE_FEATURES,
        success: true,
        source: "sample_data",
      };
    }
    
    console.log("Supabase is available, trying to fetch features");
    const supabase = getSupabaseClient();
    
    // Direct attempt to check if features table exists
    console.log("Testing features table existence...");
    try {
      const { count, error: countError } = await supabase
        .from("features")
        .select("*", { count: "exact", head: true });
        
      if (countError) {
        console.error("Error checking features table:", countError.message);
        console.error("Error details:", countError);
        
        // Table might not exist or no permissions
        if (countError.message.includes("does not exist") || 
            countError.message.includes("permission denied")) {
          console.warn("Features table does not exist or no permissions");
          
          const { SAMPLE_FEATURES } = await import('./mock-data');
          return {
            data: SAMPLE_FEATURES,
            success: true,
            source: "sample_data_no_table",
            error: countError.message
          };
        }
      } else {
        console.log("Features table exists, found count:", count);
      }
    } catch (tableCheckError) {
      console.error("Exception checking features table:", tableCheckError);
    }
    
    // Proceed with normal query if table check didn't error out
    console.log("Attempting to fetch all features from table");
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.warn("Error fetching features from Supabase:", error.message);
      console.error("Error details:", error);
      
      // Try to use sample features if there's an error
      try {
        const { SAMPLE_FEATURES } = await import('./mock-data');
        console.log("Using sample features due to Supabase error");
        return {
          data: SAMPLE_FEATURES,
          success: true,
          source: "sample_data_fallback",
          error: error.message
        };
      } catch (mockError) {
        console.error("Could not load sample features:", mockError);
        return {
          data: [],
          success: false,
          source: "none",
          error: error.message
        };
      }
    }
    
    // If we have no data from Supabase, use sample data
    if (!data || data.length === 0) {
      try {
        const { SAMPLE_FEATURES } = await import('./mock-data');
        console.log("Using sample features due to empty Supabase result (found", (data || []).length, "features)");
        return {
          data: SAMPLE_FEATURES,
          success: true,
          source: "sample_data_fallback",
        };
      } catch (mockError) {
        console.error("Could not load sample features:", mockError);
      }
    }
    
    console.log("Successfully fetched", data?.length || 0, "features from Supabase");
    return {
      data: data || [],
      success: true,
      source: "supabase",
    }
  } catch (error) {
    console.error("Failed to get features from Supabase:", error)
    
    // Try to use sample features as a last resort
    try {
      const { SAMPLE_FEATURES } = await import('./mock-data');
      console.log("Using sample features as fallback after error");
      return {
        data: SAMPLE_FEATURES,
        success: true,
        source: "sample_data_fallback_error",
      };
    } catch (mockError) {
      console.error("Could not load sample features:", mockError);
      // Return a failure response
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
