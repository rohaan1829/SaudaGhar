'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Card } from './Card'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  onClick?: () => void
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  hover = true,
  onClick 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      onClick={onClick}
    >
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  )
}

