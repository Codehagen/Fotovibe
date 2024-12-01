"use client"

import { useState, useEffect } from "react"
import { UserRole } from "@/lib/types"
import { getMediaForOrder, uploadMedia, downloadMedia } from "@/lib/media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MediaManagerProps {
  orderId: string
  userRole: UserRole
}

export function MediaManager({ orderId, userRole }: MediaManagerProps) {
  const [media, setMedia] = useState<Array<{ id: string, name: string, type: string }>>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchMedia = async () => {
      const orderMedia = await getMediaForOrder(orderId)
      setMedia(orderMedia)
    }
    fetchMedia()
  }, [orderId])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      await uploadMedia(orderId, file)
      const updatedMedia = await getMediaForOrder(orderId)
      setMedia(updatedMedia)
      setUploading(false)
    }
  }

  const handleDownload = async (mediaId: string) => {
    await downloadMedia(mediaId)
  }

  const canUpload = userRole === "PHOTOGRAPHER" || userRole === "EDITOR" || userRole === "ADMIN"
  const canDownload = userRole === "USER" || userRole === "ADMIN"

  return (
    <div className="space-y-4">
      {canUpload && (
        <div>
          <Input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p>Uploading...</p>}
        </div>
      )}
      <ul className="space-y-2">
        {media.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <span>{item.name}</span>
            {canDownload && (
              <Button onClick={() => handleDownload(item.id)}>Download</Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

