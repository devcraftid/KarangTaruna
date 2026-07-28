import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, ShieldAlert, Monitor, Smartphone, Globe } from 'lucide-react'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginActivity() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    fetchLogs()

    const subscription = supabase
      .channel('auth_logs_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auth_logs' }, payload => {
        setLogs(current => [payload.new, ...current].slice(0, 50)) // Keep last 50
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('auth_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setLogs(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-rose-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login Activity</h1>
          <p className="text-muted-foreground">
            Pantau log akses sistem untuk keamanan (Realtime).
          </p>
        </div>
      </div>

      <Card className="border-rose-100 dark:border-rose-900 shadow-sm">
        <CardHeader className="bg-rose-50/50 dark:bg-rose-950/20 pb-4 border-b">
          <CardTitle className="flex items-center text-rose-900 dark:text-rose-100">
            <ShieldAlert className="w-5 h-5 mr-2" /> Log Keamanan Terbaru
          </CardTitle>
          <CardDescription>
            Catatan aktivitas login dan percobaan masuk ke dasbor. (Langsung tersambung ke database).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Waktu Login</TableHead>
                  <TableHead>Email Akun</TableHead>
                  <TableHead>Alamat IP</TableHead>
                  <TableHead>Perangkat</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{log.email || 'Tidak Diketahui'}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        <Globe className="w-3 h-3 text-muted-foreground" /> {log.ip_address}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate max-w-[200px]" title={log.device_info}>
                        {log.device_info?.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span className="truncate">{log.device_info || 'Unknown Device'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        log.status === 'Success' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada aktivitas login yang tercatat.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
