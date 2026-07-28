-- SCHEMA UPDATE FASE 6
-- Menghubungkan Lomba (competitions) dengan Acara (events)

ALTER TABLE public.competitions 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- Catatan:
-- Semua data Lomba yang ada sebelumnya akan memiliki event_id = null (tidak memiliki acara).
-- Anda bisa masuk ke dasbor admin (Acara & Lomba > Lomba) dan mengedit lomba tersebut
-- untuk memilih acara yang sesuai.
