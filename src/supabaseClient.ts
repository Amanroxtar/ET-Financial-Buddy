import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ntorbpcpiotatscsuiox.supabase.co";
const supabaseAnonKey = "sb_publishable_YWco5pcS06K4PJgXe6uGsw_RHHP6N0m";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
