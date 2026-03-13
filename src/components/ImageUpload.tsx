import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (url: string) => void
}

const ImageUpload = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
    toast.success('Image uploaded!')
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="relative w-28 h-28 rounded-xl overflow-hidden group border border-white/10">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-white hover:text-brand transition-colors"
              title="Change image"
            >
              <Image size={18} />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-white hover:text-red-400 transition-colors"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 hover:border-brand/40 hover:bg-brand/5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="text-brand animate-spin" />
              <span className="text-[10px] text-white/30 font-mono">Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={18} className="text-white/30" />
              <span className="text-[10px] text-white/30 font-mono">Add photo</span>
              <span className="text-[9px] text-white/20 font-mono">Max 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default ImageUpload
