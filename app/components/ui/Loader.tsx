'use client'

import { motion } from 'framer-motion'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white' | 'gray'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const variantClasses = {
  primary: 'border-primary-600 border-t-primary-600',
  white: 'border-white border-t-white',
  gray: 'border-gray-400 border-t-gray-400',
}

export function Loader({ size = 'md', variant = 'primary', className = '' }: LoaderProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`${sizeClasses[size]} ${variantClasses[variant]} border-2 border-t-transparent rounded-full ${className}`}
    />
  )
}

