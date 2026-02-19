'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ===== ANIMATION VARIANTS =====
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// ===== ENHANCED CARD COMPONENT =====
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  onClick?: () => void
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover = false, gradient = false, onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
        onClick={onClick}
        className={cn(
          'bg-white rounded-2xl border border-gray-100',
          'shadow-sm hover:shadow-md transition-all duration-300',
          gradient && 'bg-gradient-to-br from-white to-gray-50/50',
          onClick && 'cursor-pointer',
          className
        )}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

// ===== STAT CARD WITH TRENDS =====
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'teal' | 'amber' | 'green' | 'blue' | 'purple' | 'red'
  delay?: number
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'teal',
  delay = 0 
}: StatCardProps) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      gradient: 'from-teal-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      gradient: 'from-amber-500/10 to-transparent',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      gradient: 'from-blue-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      gradient: 'from-purple-500/10 to-transparent',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      gradient: 'from-red-500/10 to-transparent',
    },
  }

  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-gray-100',
        'shadow-sm hover:shadow-lg transition-all duration-300 p-5'
      )}
    >
      {/* Gradient accent */}
      <div className={cn('absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl', colors.gradient)} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: delay + 0.2 }}
            className={cn('p-2.5 rounded-xl', colors.bg)}
          >
            <span className={colors.icon}>{icon}</span>
          </motion.div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.1 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          {value}
        </motion.p>
        
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                trend.isPositive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===== ENHANCED BUTTON =====
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md hover:shadow-lg',
      secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

// ===== ENHANCED INPUT =====
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-gray-200',
              'bg-white text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-300 focus:ring-red-500/20 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ===== ENHANCED TEXTAREA =====
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-gray-200',
            'bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
            'transition-all duration-200 resize-none',
            error && 'border-red-300 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ===== SKELETON LOADER =====
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circle' | 'rect' | 'card'
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-20 w-full rounded-xl',
    card: 'h-48 w-full rounded-2xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn('bg-gray-200', variants[variant], className)}
    />
  )
}

// ===== LOADING SKELETON GRID =====
export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" className="h-32" />
      ))}
    </div>
  )
}

// ===== PAGE TRANSITION WRAPPER =====
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ===== EMPTY STATE =====
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
      >
        <span className="text-gray-400">{icon}</span>
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </motion.div>
  )
}

// ===== BADGE =====
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  )
}

// ===== MODAL =====
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden',
              sizes[size]
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ===== WELCOME GREETING =====
export function WelcomeGreeting({ name }: { name: string }) {
  const hour = new Date().getHours()
  let greeting = 'Good evening'
  let emoji = '🌙'
  
  if (hour < 12) {
    greeting = 'Good morning'
    emoji = '☀️'
  } else if (hour < 17) {
    greeting = 'Good afternoon'
    emoji = '🌤️'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h1 className="text-2xl font-bold text-gray-900">
        {greeting}, {name.split(' ')[0]} {emoji}
      </h1>
      <p className="text-gray-500 mt-1">
        Here&apos;s what&apos;s happening at E&apos;Nauwi today
      </p>
    </motion.div>
  )
}

// ===== QUICK ACTION BUTTON =====
interface QuickActionProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  href?: string
  color?: 'teal' | 'amber' | 'blue' | 'purple'
}

export function QuickAction({ icon, label, onClick, href, color = 'teal' }: QuickActionProps) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  }

  const Component = href ? 'a' : 'button'

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Component
        href={href}
        onClick={onClick}
        className={cn(
          'flex flex-col items-center justify-center p-4 rounded-xl',
          'transition-all duration-200',
          colorMap[color]
        )}
      >
        <span className="mb-2">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </Component>
    </motion.div>
  )
}

// ===== TAB COMPONENT =====
interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === tab.id
              ? 'text-teal-700'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: 'spring', duration: 0.3 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export { AnimatePresence, motion }
