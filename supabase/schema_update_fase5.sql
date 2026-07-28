-- SCHEMA UPDATE FASE 5
-- Penambahan fitur Forum Diskusi Internal Pengurus

-- 1. Forum Posts (Diskusi)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    isi_konten TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'Umum',
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Forum Comments (Komentar)
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    isi_komentar TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Pengurus can view posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Pengurus can insert posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Pengurus can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admin can delete posts" ON public.forum_posts FOR DELETE USING (public.get_auth_role() IN ('admin', 'sekretaris') OR auth.uid() = created_by);

CREATE POLICY "Pengurus can view comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Pengurus can insert comments" ON public.forum_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Pengurus can delete own comments" ON public.forum_comments FOR DELETE USING (public.get_auth_role() IN ('admin', 'sekretaris') OR auth.uid() = created_by);
