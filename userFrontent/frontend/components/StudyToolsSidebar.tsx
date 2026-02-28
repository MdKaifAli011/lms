'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  StickyNote, 
  Bot, 
  BookOpen, 
  Bookmark, 
  Settings,
  Share2,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface StudyToolsSidebarProps {
  user?: {
    name?: string
    role?: string
    avatar?: string
  }
}

export function StudyToolsSidebar({ user }: StudyToolsSidebarProps) {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Auto-expand on desktop after a delay when hovering
  useEffect(() => {
    if (isMobile) return

    let timeoutId: NodeJS.Timeout
    if (isHovering) {
      timeoutId = setTimeout(() => {
        setIsExpanded(true)
      }, 150) // Small delay for smooth transition
    } else {
      timeoutId = setTimeout(() => {
        setIsExpanded(false)
      }, 300) // Slightly longer delay when leaving
    }

    return () => clearTimeout(timeoutId)
  }, [isHovering, isMobile])

  const studyTools = [
    {
      icon: StickyNote,
      label: 'Take Notes',
      onClick: () => console.log('Take Notes clicked'),
    },
    {
      icon: Bot,
      label: 'Ask AI Tutor',
      onClick: () => console.log('Ask AI Tutor clicked'),
      variant: 'default' as const,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      icon: BookOpen,
      label: 'Flashcards',
      onClick: () => console.log('Flashcards clicked'),
    },
    {
      icon: Bookmark,
      label: 'Bookmark',
      onClick: () => console.log('Bookmark clicked'),
    },
  ]

  const quickActions = [
    {
      icon: Share2,
      label: 'Share',
      onClick: () => console.log('Share clicked'),
    },
    {
      icon: HelpCircle,
      label: 'Help',
      onClick: () => console.log('Help clicked'),
    },
  ]

  const displayName = user?.name || 'User'
  const userRole = user?.role || 'Student'
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Mobile: Bottom navigation bar - responsive, safe-area aware, proper touch targets
  if (isMobile) {
    const mobileTools = [
      {
        icon: StickyNote,
        label: 'Notes',
        onClick: () => console.log('Take Notes clicked'),
        isActive: false,
      },
      {
        icon: Bot,
        label: 'AI Tutor',
        onClick: () => console.log('Ask AI Tutor clicked'),
        isPrimary: true,
      },
      {
        icon: BookOpen,
        label: 'Cards',
        onClick: () => console.log('Flashcards clicked'),
        isActive: false,
      },
      {
        icon: Bookmark,
        label: 'Saved',
        onClick: () => console.log('Bookmark clicked'),
        isActive: false,
      },
      {
        icon: Settings,
        label: 'More',
        onClick: () => console.log('More/Settings clicked'),
        isActive: false,
      },
    ]

    return (
      <nav
        role="navigation"
        aria-label="Study tools"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[100]',
          'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-900/90',
          'border-t border-gray-200 dark:border-gray-800',
          'shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.25)]'
        )}
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex items-stretch justify-around gap-0 min-h-[48px] py-1">
          {mobileTools.map((tool, index) => {
            const Icon = tool.icon
            const isPrimary = tool.isPrimary
            const isActive = tool.isActive

            const content = (
              <>
                {isPrimary ? (
                  <div className="flex flex-1 items-center justify-center min-w-0 -mt-4">
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-xl transition-transform active:scale-95 select-none',
                        'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700',
                        'shadow-md shadow-blue-600/25 dark:shadow-blue-600/35',
                        'w-11 h-11 min-w-[44px] min-h-[44px]'
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-0.5 min-h-[40px] py-1">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                        isActive
                          ? 'text-primary dark:text-blue-400 bg-primary/10 dark:bg-blue-500/10'
                          : 'text-muted-foreground dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {tool.label && (
                      <span
                        className={cn(
                          'text-[10px] font-medium leading-tight truncate max-w-[52px] text-center',
                          isActive
                            ? 'text-primary dark:text-blue-400 font-semibold'
                            : 'text-muted-foreground dark:text-gray-400'
                        )}
                      >
                        {tool.label}
                      </span>
                    )}
                  </div>
                )}
              </>
            )

            return (
              <button
                key={index}
                type="button"
                onClick={tool.onClick}
                className={cn(
                  'flex-1 flex items-center justify-center min-w-0 min-h-[40px]',
                  'transition-transform duration-150 active:scale-[0.97]',
                  'touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900'
                )}
                aria-label={tool.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {content}
              </button>
            )
          })}
        </div>
      </nav>
    )
  }

  // Desktop: Right sidebar with hover-to-expand
  return (
    <aside
      className={cn(
        'sticky self-start top-[80px] sm:top-[96px] h-[calc(100vh-80px)] sm:h-[calc(100vh-96px)] z-40',
        'bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800',
        'transition-all duration-300 ease-in-out',
        'flex flex-col flex-shrink-0',
        'shadow-sm',
        isExpanded ? 'w-64 shadow-lg' : 'w-16'
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Study Tools Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="p-3 space-y-2">
          {/* Header - Only show when expanded */}
          {isExpanded && (
            <>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider px-2 py-1">
                Study Tools
              </h3>
              <Separator className="my-2" />
            </>
          )}

          {/* Study Tools */}
          <div className="space-y-1">
            {studyTools.map((tool, index) => {
              const Icon = tool.icon
              const isAITutor = tool.label === 'Ask AI Tutor'

              return (
                <Button
                  key={index}
                  variant={tool.variant || 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-auto py-2.5 px-2',
                    'text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-colors duration-200',
                    tool.className,
                    !isExpanded && 'justify-center px-0',
                    isAITutor && !isExpanded && 'bg-blue-600 hover:bg-blue-700'
                  )}
                  onClick={tool.onClick}
                  title={!isExpanded ? tool.label : undefined}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0', 
                    isAITutor && (isExpanded ? 'text-white' : 'text-white')
                  )} />
                  {isExpanded && (
                    <span className={cn('text-sm font-normal', isAITutor && 'text-white')}>
                      {tool.label}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions - Only show when expanded */}
          {isExpanded && (
            <>
              <div className="pt-4">
                <Separator className="my-2" />
              </div>
              <div className="space-y-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-2.5 px-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                      onClick={action.onClick}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-normal">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Profile Section - Always visible at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-500 dark:border-blue-600">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userRole}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => console.log('Settings clicked')}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10 border-2 border-blue-500 dark:border-blue-600">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  )
}
