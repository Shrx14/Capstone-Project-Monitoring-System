import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function UpdateForm({ projectId, onClose, onSuccess }) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFileName, setSelectedFileName] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const fileField = register('file')

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('projectId', projectId)
      formData.append('text', data.text)
      if (data.file?.[0]) formData.append('file', data.file[0])

      await axiosInstance.post('/updates', formData, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      toast.success('Update submitted successfully!')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit update')
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Submit Progress Update</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Progress Description</label>
          <textarea
            {...register('text', { required: 'Description is required', maxLength: { value: 3000, message: 'Max 3000 characters' } })}
            rows={5}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="Describe your progress this week..."
          />
          {errors.text && <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">
            Attachment <span className="text-neutral-500">(optional — PDF, DOCX, PNG, JPG · max 10MB)</span>
          </label>
          <div className="rounded-xl border-2 border-dashed border-white/15 p-4 text-center hover:border-white/30 transition">
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              {...fileField}
              onChange={(e) => {
                fileField.onChange(e)
                setSelectedFileName(e.target.files?.[0]?.name || '')
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <p className="text-sm text-neutral-500">
                {selectedFileName ? (
                  <span className="font-medium text-white">{selectedFileName}</span>
                ) : (
                  <>Click to select a file</>
                )}
              </p>
            </label>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2 h-2 rounded-full bg-neutral-800">
              <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:opacity-60 transition">
            {isSubmitting ? 'Submitting...' : 'Submit Update'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/10 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateForm
