'use client'

import { useState, useRef } from 'react'
import { uploadProductImage } from '@/app/actions/products'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (url: string | null) => void
}

export function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    // Subir a Supabase
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const { error, url } = await uploadProductImage(formData)
    setUploading(false)

    if (error) {
      alert('Error al subir imagen: ' + error)
      setPreview(currentImage || null)
      return
    }

    onImageChange(url)
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Imagen del producto</label>
      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[200px]">
        {preview ? (
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sin imagen</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'Subiendo...' : 'Subir imagen'}
      </Button>
    </div>
  )
}