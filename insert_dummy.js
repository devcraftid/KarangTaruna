import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envPath = '.env'
const envContent = fs.readFileSync(envPath, 'utf8')
const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/)
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1].trim() : ''
const supabaseKey = supabaseKeyMatch ? supabaseKeyMatch[1].trim() : ''

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertDummy() {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert([
      { 
        email: 'admin@karangtaruna.id', 
        status: 'Success', 
        device_info: 'Windows / Chrome', 
        ip_address: '114.125.10.15' 
      },
      { 
        email: 'anggota@karangtaruna.id', 
        status: 'Failed', 
        device_info: 'iOS / Safari', 
        ip_address: '103.111.45.22' 
      }
    ])
  
  if (error) console.error("Error inserting:", error)
  else console.log("Inserted dummy data successfully!")
}

insertDummy()
