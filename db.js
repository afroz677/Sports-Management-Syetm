import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'vk0976';

export const supabase = createClient(supabaseUrl, supabaseKey);