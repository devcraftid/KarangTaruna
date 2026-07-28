import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { Loader2, Users, ShieldAlert, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function ManajemenUser() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const ROLES = [
    'admin',
    'ketua',
    'wakil_ketua',
    'sekretaris',
    'bendahara',
    'koordinator',
    'admin_media',
    'admin_umkm',
    'panitia',
    'pembina',
    'anggota'
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, newRole: string) => {
    if (userId === profile?.id) {
      toast.error('Anda tidak dapat mengubah role Anda sendiri!')
      return
    }
    
    setSavingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        
      if (error) throw error
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Role berhasil diperbarui!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Hak Akses</h1>
          <p className="text-muted-foreground">
            Atur *Role* pengguna untuk mengontrol akses fitur Dasbor.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2" /> Data Pengguna Aplikasi</CardTitle>
          <CardDescription>Ubah peran (Role) pengguna sesuai dengan jabatan mereka di organisasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Email / No. HP</TableHead>
                  <TableHead>Role Saat Ini</TableHead>
                  <TableHead className="w-[200px]">Ubah Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      Tidak ada data pengguna.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-indigo-700" />
                            </div>
                          )}
                          {user.full_name || 'Tanpa Nama'}
                          {user.id === profile?.id && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold ml-2">ANDA</span>}
                        </div>
                      </TableCell>
                      <TableCell>{user.email || user.phone_number || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.id !== profile?.id ? (
                          <div className="flex items-center gap-2">
                            <Select value={user.role} onValueChange={(val) => updateRole(user.id, val)} disabled={savingId === user.id}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map(r => (
                                  <SelectItem key={r} value={r} className="text-xs">{r.toUpperCase()}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {savingId === user.id && <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Tidak bisa ubah sendiri</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
