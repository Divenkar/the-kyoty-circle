import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxomieiirwghktdxjwjf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94b21pZWlpcndnaGt0ZHhqd2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDcxNzYsImV4cCI6MjA4OTQ4MzE3Nn0.xOzCJn2ESnqc2--iyxY58Da8vZHtOw1szda-TlENBdo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
