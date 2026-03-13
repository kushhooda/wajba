import { createClient } from '@supabase/supabase-js'

const url = 'https://zmphaechgiujzdfejzvo.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcGhhZWNoZ2l1anpkZmVqenZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTE1MjMsImV4cCI6MjA4ODk4NzUyM30.Ub95IvVo1Kfupr1vKDHGvnadzn90s4E7k-G9fOjXq44'

export const supabase = createClient(url, key)
