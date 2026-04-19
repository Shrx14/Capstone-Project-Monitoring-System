import { useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function ReplaceAttachmentForm({ updateId, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!file) {
      toast.error('Please choose a file first')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      await axiosInstance.patch(`/updates/${updateId}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Attachment replaced successfully')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to replace attachment. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Replace Attachment</h3>
        <p className="mt-1 text-sm text-neutral-400">
          Upload a new file to replace your current attachment.
        </p>
      </div>

      <div>
        <label htmlFor="replace-file" className="mb-1 block text-sm text-neutral-300">
          New file
        </label>
        <input
          id="replace-file"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-200"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {submitting ? 'Replacing...' : 'Replace'}
        </button>
      </div>
    </form>
  )
}

export default ReplaceAttachmentForm
