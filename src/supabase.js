import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psvwekacszawmdazwfup.supabase.co'
const supabaseKey = 'sb_publishable_733v8Ur9499M2Xc98jSbLg_rJ1TJ54Z'

export const supabase = createClient(supabaseUrl, supabaseKey)