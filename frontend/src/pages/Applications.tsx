import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Briefcase, Trash2, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { applicationsApi } from '@/api/applications'
import { Application } from '@/types'
import { APPLICATION_SOURCES, APPLICATION_STATUSES } from '@/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import Badge, { getStatusVariant } from '@/components/ui/Badge'

const applicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  source: z.string().min(1, 'Source is required'),
  status: z.string().min(1, 'Status is required'),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

const sourceOptions = APPLICATION_SOURCES.map(s => ({ value: s, label: s }))
const statusOptions = APPLICATION_STATUSES.map(s => ({ value: s, label: s }))

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [search, setSearch] = useState('')
  const limit = 10

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { status: 'Applied' },
  })

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await applicationsApi.getAll({
        page,
        limit,
        status: filterStatus || undefined,
        source: filterSource || undefined,
      })
      setApplications(res.data)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [page, filterStatus, filterSource])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const openCreateModal = () => {
    setEditingApp(null)
    reset({ status: 'Applied', company: '', role: '', source: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (app: Application) => {
    setEditingApp(app)
    setValue('company', app.company)
    setValue('role', app.role)
    setValue('source', app.source)
    setValue('status', app.status)
    setIsModalOpen(true)
  }

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (editingApp) {
        await applicationsApi.update(editingApp._id, { status: data.status })
      } else {
        await applicationsApi.create(data)
      }
      setIsModalOpen(false)
      fetchApplications()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      try {
        await applicationsApi.delete(id)
        fetchApplications()
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

  const totalPages = Math.ceil(total / limit)

  const filteredApplications = applications.filter(app =>
    search
      ? app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase())
      : true
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total applications</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search company or role..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterSource}
          onChange={e => { setFilterSource(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Sources</option>
          {APPLICATION_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No applications yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first job application to get started</p>
            <Button onClick={openCreateModal} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Add Application
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{app.company}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{app.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{app.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={app.status} variant={getStatusVariant(app.status)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            deletingId === app._id
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={deletingId === app._id ? 'Click again to confirm' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Edit Application' : 'Add Application'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Company"
            placeholder="Google"
            error={errors.company?.message}
            disabled={!!editingApp}
            {...register('company')}
          />
          <Input
            label="Role"
            placeholder="Software Engineer Intern"
            error={errors.role?.message}
            disabled={!!editingApp}
            {...register('role')}
          />
          <Select
            label="Source"
            options={sourceOptions}
            placeholder="Select source"
            error={errors.source?.message}
            disabled={!!editingApp}
            {...register('source')}
          />
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingApp ? 'Update' : 'Add Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Applications