import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SERVICE_ROLE!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
