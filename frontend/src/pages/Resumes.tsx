import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Download, Trash2, FileUp } from 'lucide-react'
import { resumesApi } from '@/api/resumes'
import { ResumeVersion } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'

const Resumes = () => {
  const [resumes, setResumes] = useState<ResumeVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState('')
  const [resumeNotes, setResumeNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchResumes = async () => {
    setIsLoading(true)
    try {
      const data = await resumesApi.getAll()
      setResumes(data.sort((a, b) => b.version - a.version))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }

    setError(null)
    setPendingFile(file)
    setResumeName(file.name.replace('.pdf', ''))
    setResumeNotes('')
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    setIsUploading(true)
    try {
      await resumesApi.upload(pendingFile, resumeName, resumeNotes)
      fetchResumes()
      setPendingFile(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (resume: ResumeVersion) => {
    try {
      await resumesApi.download(resume._id, resume.version)
    } catch (err) {
      setError('Download failed. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      try {
        await resumesApi.delete(id)
        fetchResumes()
      } catch (err) {
        console.error(err)
      } finally {
        setDeletingId(null)
      }
    } else {
      setDeletingId(id)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="text-gray-500 text-sm mt-1">{resumes.length} versions uploaded</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Upload Resume
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : resumes.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <FileUp className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">No resumes uploaded yet</p>
          <p className="text-gray-500 text-sm mt-1">Click to upload your first resume (PDF only)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  v{resume.version}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {resume.name || `Resume Version ${resume.version}`}
              </p>
              {resume.notes && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resume.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(resume)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
                <button
                  onClick={() => handleDelete(resume._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    deletingId === resume._id
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={deletingId === resume._id ? 'Click again to confirm' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload details modal */}
      <Modal
        isOpen={!!pendingFile}
        onClose={() => setPendingFile(null)}
        title="Resume Details"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{pendingFile?.name}</span>
          </div>
          <Input
            label="Resume name"
            placeholder="e.g. SDE Resume - Backend Focus"
            value={resumeName}
            onChange={e => setResumeName(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="e.g. Used for product-based companies"
            value={resumeNotes}
            onChange={e => setResumeNotes(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setPendingFile(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              isLoading={isUploading}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Resumes