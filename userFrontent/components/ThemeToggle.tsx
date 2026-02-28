'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  const updateTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = stored || (prefersDark ? 'dark' : 'light')
    updateTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    updateTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="h-9 w-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
        disabled
      >
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      className="h-9 w-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      )}
    </Button>
  )
}
