import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scsjeuneadnnxpeneoae.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjc2pldW5lYWRubnhwZW5lb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODA5ODcsImV4cCI6MjA4MTA1Njk4N30.70N_gI0GmBztPoBwgmVi8jxNIaAABwqk1m1wdbKOXzQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      evict_after: 120,
    },
  },
});
