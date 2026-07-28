// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { MessagesSquare, Plus, Loader2, Trash2, Pin, MessageCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function ForumDiskusi() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // State untuk komentar
  const [activePost, setActivePost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [newComment, setNewComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)

  const [formData, setFormData] = useState({
    judul: '',
    isi_konten: '',
    kategori: 'Umum'
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:created_by(full_name, avatar_url)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          profiles:created_by(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        
      if (error) throw error
      setComments(prev => ({ ...prev, [postId]: data || [] }))
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleComments = (postId: string) => {
    if (activePost === postId) {
      setActivePost(null)
    } else {
      setActivePost(postId)
      if (!comments[postId]) {
        fetchComments(postId)
      }
    }
  }

  const handleSavePost = async () => {
    if (!formData.judul || !formData.isi_konten) return
    setSaving(true)
    try {
      const payload = {
        ...formData,
        created_by: profile?.id
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([payload])
        .select(`*, profiles:created_by(full_name, avatar_url)`)
      
      if (error) throw error
      if (data) setPosts([data[0], ...posts])
      
      setIsOpen(false)
      setFormData({ judul: '', isi_konten: '', kategori: 'Umum' })
      toast.success('Diskusi berhasil dibuat!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveComment = async (postId: string) => {
    if (!newComment.trim()) return
    setSavingComment(true)
    try {
      const payload = {
        post_id: postId,
        isi_komentar: newComment,
        created_by: profile?.id
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .insert([payload])
        .select(`*, profiles:created_by(full_name, avatar_url)`)
      
      if (error) throw error
      if (data) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data[0]]
        }))
      }
      
      setNewComment('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSavingComment(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Hapus diskusi ini?')) return
    try {
      const { error } = await supabase.from('forum_posts').delete().eq('id', id)
      if (error) throw error
      setPosts(posts.filter(p => p.id !== id))
      toast.success('Diskusi dihapus')
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  
  const togglePin = async (id: string, currentPin: boolean) => {
    try {
      const { error } = await supabase.from('forum_posts').update({ is_pinned: !currentPin }).eq('id', id)
      if (error) throw error
      fetchPosts() // Re-fetch to sort properly
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <MessagesSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forum Diskusi</h1>
            <p className="text-muted-foreground">
              Ruang rembuk digital untuk pengurus dan panitia kegiatan.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Plus className="w-4 h-4 mr-2" /> Buat Topik Baru</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mulai Diskusi Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Kategori Topik</Label>
                <Select value={formData.kategori} onValueChange={(val) => setFormData({...formData, kategori: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Umum">Umum</SelectItem>
                    <SelectItem value="Event">Event / Acara</SelectItem>
                    <SelectItem value="Voting">Voting / Jajak Pendapat</SelectItem>
                    <SelectItem value="Evaluasi">Evaluasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Diskusi</Label>
                <Input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Ide konsep 17 Agustusan..." />
              </div>
              <div className="space-y-2">
                <Label>Isi Pendapat / Pertanyaan</Label>
                <Textarea 
                  className="min-h-[120px]"
                  value={formData.isi_konten} 
                  onChange={e => setFormData({...formData, isi_konten: e.target.value})} 
                  placeholder="Silakan utarakan pemikiran Anda..." 
                />
              </div>

              <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={handleSavePost} disabled={saving || !formData.judul || !formData.isi_konten}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessagesSquare className="w-4 h-4 mr-2" />} Posting Diskusi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <p className="text-muted-foreground">Belum ada topik diskusi yang dibuat.</p>
          </div>
        ) : posts.map((post) => (
          <Card key={post.id} className={`overflow-hidden transition-all ${post.is_pinned ? 'border-indigo-300 dark:border-indigo-700 shadow-md' : 'hover:border-slate-300'}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {post.kategori}
                  </span>
                  {post.is_pinned && (
                    <span className="flex items-center text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 mr-1" /> Pinned
                    </span>
                  )}
                </div>
                
                {/* Aksi hanya untuk pembuat atau admin (simulasi: bisa diakses semua sementara ini) */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${post.is_pinned ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => togglePin(post.id, post.is_pinned)}>
                    <Pin className="w-4 h-4" />
                  </Button>
                  {(profile?.id === post.created_by || profile?.role === 'admin') && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <CardTitle className="text-xl">{post.judul}</CardTitle>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-700" />
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {post.profiles?.full_name || 'Pengguna Tidak Dikenal'}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{post.isi_konten}</p>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 flex flex-col items-stretch pt-4">
              <Button variant="ghost" className="w-full flex items-center justify-center text-slate-500" onClick={() => toggleComments(post.id)}>
                <MessageCircle className="w-4 h-4 mr-2" /> 
                {activePost === post.id ? 'Tutup Komentar' : 'Lihat / Balas Komentar'}
              </Button>
              
              {/* Bagian Komentar (Collapsible) */}
              {activePost === post.id && (
                <div className="w-full mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {/* List Komentar */}
                  <div className="space-y-3">
                    {comments[post.id]?.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-2">Belum ada komentar. Jadilah yang pertama!</p>
                    ) : (
                      comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-white dark:bg-slate-950 p-3 rounded-lg border">
                          {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold">{comment.profiles?.full_name || 'Anonim'}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleString('id-ID')}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{comment.isi_komentar}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Input Komentar Baru */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Tulis balasan Anda..." 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      onKeyDown={e => { if(e.key === 'Enter') handleSaveComment(post.id) }}
                    />
                    <Button onClick={() => handleSaveComment(post.id)} disabled={savingComment || !newComment.trim()}>
                      {savingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim'}
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
