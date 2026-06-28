import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://mdcoxcwtgveczzvbjwzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY294Y3d0Z3ZlY3p6dmJqd3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDE4MTQsImV4cCI6MjA5NjcxNzgxNH0.CsfMpWulQPrizMRyzZVleSC17nIHtZVO2Ru_8H7kQgs'
);
