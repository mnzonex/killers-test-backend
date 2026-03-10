// Supabase Configuration Template
// Replace with your real Supabase URL and Key
const SUPABASE_URL = 'https://qvytyninfmuykjbhhnbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eXR5bmluZm11eWtqYmhobmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTA1NTcsImV4cCI6MjA4ODcyNjU1N30.2KnhpHbDAE2C1wnBYSf_cwNrYQw7nKng6x-cZwSbFbk';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;

