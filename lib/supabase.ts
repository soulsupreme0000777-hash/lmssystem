import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dxprxwcmasozulmhrnek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cHJ4d2NtYXNvenVsbWhybmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDg0MjksImV4cCI6MjA4MTQ4NDQyOX0.46bw-hYrtr7LOWIW9ItG0sIDKwx5cz-sUSkUblCa5Uo';

export const supabase = createClient(supabaseUrl, supabaseKey);
