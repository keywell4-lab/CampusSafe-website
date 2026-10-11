/* ==========================================
   CAMPUSSAFE - SUPABASE CONNECTION
   Connects CampusSafe to its online database
   ========================================== */

import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Your Supabase Project URL
const SUPABASE_URL = "https://arcgngrjhtwczmvpktxd.supabase.co";

// Your Supabase Publishable API Key
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Gfuwy0dReYdovkf9MD9NYg_Q4123CKH";

// Create the Supabase connection
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("CampusSafe database connection initialized.");