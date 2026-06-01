import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nzkwkrzkrxzkkgqiruoq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3drcnprcnh6a2tncWlydW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjIwNjIsImV4cCI6MjA5NTYzODA2Mn0.GCXQHlbRBYg0gUAzzNsfeDsrwMdJL-i3VwCZNE737cI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);