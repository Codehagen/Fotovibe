export async function getMediaForOrder(orderId: string) {
  // TODO: Implement actual media retrieval
  return [
    { id: "1", name: "photo1.jpg", type: "image/jpeg" },
    { id: "2", name: "photo2.jpg", type: "image/jpeg" },
  ]
}

export async function uploadMedia(orderId: string, file: File) {
  // TODO: Implement actual media upload
  console.log(`Uploading ${file.name} for order ${orderId}`)
}

export async function downloadMedia(mediaId: string) {
  // TODO: Implement actual media download
  console.log(`Downloading media ${mediaId}`)
}

