"use client"

import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropzoneProps {
  onFilesUploaded: (files: File[]) => void
}

export function Dropzone({ onFilesUploaded }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
      )
      if (files.length > 0) {
        setUploadedFile(files[0])
        onFilesUploaded(files)
      }
    },
    [onFilesUploaded]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        setUploadedFile(files[0])
        onFilesUploaded(files)
      }
    },
    [onFilesUploaded]
  )

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80",
        "cursor-pointer"
      )}
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      
      {uploadedFile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeFile()
            }}
            className="rounded-full p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Arrastra tu archivo Excel o CSV
            </p>
            <p className="text-xs text-muted-foreground">
              o haz clic para seleccionar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
