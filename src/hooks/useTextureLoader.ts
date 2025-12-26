/**
 * Hook for loading texture files via file picker.
 * Creates blob URLs from selected image files.
 */
export function useTextureLoader() {
  /**
   * Opens a file picker for images and returns a blob URL.
   * @returns Promise resolving to blob URL string, or null if cancelled
   */
  const pickTexture = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      // Create hidden file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'

      // Handle file selection
      input.onchange = () => {
        const file = input.files?.[0]
        if (file) {
          const blobUrl = URL.createObjectURL(file)
          resolve(blobUrl)
        } else {
          resolve(null)
        }
        // Clean up input element
        input.remove()
      }

      // Handle cancel (user closes picker without selecting)
      input.oncancel = () => {
        resolve(null)
        input.remove()
      }

      // Append to body and trigger click
      document.body.appendChild(input)
      input.click()
    })
  }

  return { pickTexture }
}
