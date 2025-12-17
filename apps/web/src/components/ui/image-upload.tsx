import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ImageFolder = 'seminars' | 'archives' | 'community' | 'profiles' | 'general'

interface ImageUploadProps {
  folder: ImageFolder
  value?: string
  onChange: (url: string) => void
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
  disabled?: boolean
}

export function ImageUpload({
  folder,
  value,
  onChange,
  className,
  aspectRatio = 'video',
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  }

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      // Validate client-side
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('JPG, PNG, WebP形式のみ対応しています')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ファイルサイズは5MB以下にしてください')
      }

      // Upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'アップロードに失敗しました')
      }

      onChange(result.data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }, [folder, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className={cn('relative rounded-lg overflow-hidden border', aspectClasses[aspectRatio])}>
          <Image
            src={value}
            alt="アップロード画像"
            fill
            className="object-cover"
          />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={disabled ? undefined : handleClick}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            aspectClasses[aspectRatio],
            'flex flex-col items-center justify-center gap-2',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            !disabled && 'cursor-pointer hover:border-primary hover:bg-muted/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">アップロード中...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                クリックまたはドラッグ&ドロップ
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP (最大5MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
