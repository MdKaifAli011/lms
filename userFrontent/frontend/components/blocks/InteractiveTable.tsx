'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Search, ArrowUp, ArrowDown, Download, Eye } from 'lucide-react'

interface Column {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  type?: 'text' | 'number' | 'date' | 'badge'
}

interface InteractiveTableProps {
  data: any[]
  columns: Column[]
  title?: string
  description?: string
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  exportable?: boolean
  maxHeight?: string
  className?: string
}

export function InteractiveTable({
  data,
  columns,
  title,
  description,
  searchable = true,
  filterable = true,
  sortable = true,
  exportable = true,
  maxHeight = '400px',
  className,
}: InteractiveTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = columns.some(col => {
          const value = row[col.key]
          return value && String(value).toLowerCase().includes(searchLower)
        })
        if (!matchesSearch) return false
      }

      // Column filters
      for (const [colKey, filterValue] of Object.entries(filters)) {
        if (filterValue) {
          const value = row[colKey]
          if (!value || !String(value).toLowerCase().includes(filterValue.toLowerCase())) {
            return false
          }
        }
      }

      return true
    })
  }, [data, searchTerm, filters, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // String comparison
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [filteredData, sortColumn, sortDirection, sortable])

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return

    if (sortColumn === columnKey) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Handle filter change
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Export to CSV
  const exportToCSV = () => {
    if (!exportable) return

    const headers = columns.map(col => col.title).join(',')
    const rows = sortedData.map(row => 
      columns.map(col => {
        const value = row[col.key]
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value || '').replace(/"/g, '""')
        return strValue.includes(',') ? `"${strValue}"` : strValue
      }).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    
    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${title || 'table'}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Render cell content based on type
  const renderCell = (column: Column, value: any) => {
    if (value === null || value === undefined) return '-'

    switch (column.type) {
      case 'badge':
        return (
          <Badge variant="secondary" className="capitalize">
            {String(value)}
          </Badge>
        )
      case 'number':
        return <span className="font-mono">{Number(value).toLocaleString()}</span>
      case 'date':
        try {
          const date = new Date(value)
          return <span className="font-mono">{date.toLocaleDateString()}</span>
        } catch {
          return String(value)
        }
      default:
        return String(value)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description || searchable || filterable) && (
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1 break-words">{description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {exportable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters - Responsive Layout */}
          <div className="flex flex-col gap-3 mt-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            )}

            {filterable && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                {columns
                  .filter(col => col.filterable)
                  .map(column => (
                    <div key={column.key} className="flex items-center gap-2 min-w-0">
                      <label className="text-xs sm:text-sm font-medium whitespace-nowrap min-w-fit">
                        {column.title}:
                      </label>
                      <Input
                        placeholder={`Filter ${column.title}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="h-8 w-24 sm:w-32 text-xs sm:text-sm"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div 
          className="overflow-auto border border-border rounded-lg"
          style={{ maxHeight }}
        >
          <table className="w-full min-w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-medium text-xs sm:text-sm border-b border-border",
                      sortable && column.sortable && "cursor-pointer hover:bg-muted/80 transition-colors"
                    )}
                    onClick={() => sortable && column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                      <span className="truncate">{column.title}</span>
                      {sortable && column.sortable && (
                        <div className="flex flex-col flex-shrink-0">
                          <ArrowUp
                            className={cn(
                              "w-3 h-3",
                              sortColumn === column.key && sortDirection === 'asc'
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          />
                          <ArrowDown
                            className={cn(
                              "w-3 h-3 -mt-1",
                              sortColumn === column.key && sortDirection === 'desc'
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 sm:py-8 text-center text-muted-foreground border-b border-border"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8" />
                      <p className="text-sm sm:text-base">No data available</p>
                      {(searchTerm || Object.keys(filters).some(key => filters[key])) && (
                        <p className="text-xs sm:text-sm">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <div className="truncate min-w-0">
                          {renderCell(column, row[column.key])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats - Responsive */}
        {sortedData.length !== data.length && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-border bg-muted/30">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing {sortedData.length} of {data.length} results
              {searchTerm && ` for "${searchTerm}"`}
              {Object.entries(filters).filter(([_, value]) => value).length > 0 && (
                <span>
                  {' '}with {Object.entries(filters).filter(([_, value]) => value).length} filter(s)
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
