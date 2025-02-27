
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://scyvurlnvjmzbnsdiozf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjeXZ1cmxudmptemJuc2Rpb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODI4OTUsImV4cCI6MjA1NjI1ODg5NX0.rHesiF5l6KTpaRPeYUJwItn_X9xVPU7cVZmyjmRYs_o";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
