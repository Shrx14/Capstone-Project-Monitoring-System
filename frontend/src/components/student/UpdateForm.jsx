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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('projectId', projectId)
      formData.append('text', data.text)

      if (data.file?.[0]) {
        formData.append('file', data.file[0])
      }

      await axiosInstance.post('/updates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      <h2 className="mb-4 text-xl font-bold text-blue-900">Submit Progress Update</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Progress Description</label>
          <textarea
            {...register('text', {
              required: 'Description is required',
              maxLength: { value: 3000, message: 'Max 3000 characters' },
            })}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
            placeholder="Describe your progress this week..."
          />
          {errors.text && <p className="mt-1 text-xs text-red-600">{errors.text.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Attachment <span className="text-slate-400">(optional — PDF, DOCX, PNG, JPG · max 10MB)</span>
          </label>
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center">
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              {...register('file')}
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <p className="text-sm text-slate-500">
                {selectedFileName ? (
                  <span className="font-medium text-blue-900">{selectedFileName}</span>
                ) : (
                  <>Click to select a file or drag and drop</>
                )}
              </p>
            </label>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-900 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Update'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateForm
