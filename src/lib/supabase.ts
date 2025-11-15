import { createClient } from '@supabase/supabase-js'

// ============================================
// PASTE YOUR SUPABASE CREDENTIALS HERE
// ============================================
const supabaseUrl = 'https://jeqjjplfvjarthcebnqo.supabase.co'  // e.g., 'https://xxxxxxxxxxxxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcWpqcGxmdmphcnRoY2VibnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODg0NjAsImV4cCI6MjA3ODQ2NDQ2MH0.VRrNtWfqrhMczCp7lwpNumNZWH8zose8YjO6q0wroJs' // Your anon/public key
// ============================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
