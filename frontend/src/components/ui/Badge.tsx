import React from 'react'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

const statusVariants: Record<string, BadgeProps['variant']> = {
  'Applied': 'info',
  'OA Received': 'warning',
  'OA Completed': 'warning',
  'Interview': 'purple',
  'Offer': 'success',
  'Rejected': 'danger',
  'Withdrawn': 'default',
}

export const getStatusVariant = (status: string): BadgeProps['variant'] => {
  return statusVariants[status] || 'default'
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

export default Badge