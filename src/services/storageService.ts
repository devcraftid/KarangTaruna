import { supabase } from '@/lib/supabase'

export const storageService = {
  /**
   * Upload a file to a specific Supabase storage bucket and return the public URL.
   * @param bucket The name of the bucket (e.g. 'news', 'gallery')
   * @param file The File object from an input element
   * @returns The public URL string of the uploaded file
   */
  uploadFile: async (bucket: string, file: File): Promise<string> => {
    try {
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw uploadError
      }

      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Gagal mengunggah file. Pastikan ukuran file tidak terlalu besar dan tipe file didukung.')
    }
  }
}
