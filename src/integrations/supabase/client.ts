// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vuducrmijhgnwniaookg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZHVjcm1pamhnbnduaWFvb2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzI3NDcsImV4cCI6MjA1NTcwODc0N30.ipc1BrCIb-G6oJ14fXXIuxfeRpTvbU1FKCcHxh-mCe0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);