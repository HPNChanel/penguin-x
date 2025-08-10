import React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface AccessibleTableProps<T> {
  data: T[]
  columns: Column<T>[]
  caption?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnId: string) => void
  className?: string
  loading?: boolean
  empty?: React.ReactNode
  'aria-label'?: string
}

export function AccessibleTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  sortBy,
  sortDirection,
  onSort,
  className,
  loading = false,
  empty,
  'aria-label': ariaLabel,
  ...props
}: AccessibleTableProps<T>) {
  const { t } = useTranslation()

  const getSortIcon = (columnId: string) => {
    if (sortBy === columnId) {
      return sortDirection === 'asc' ? ArrowUp : ArrowDown
    }
    return ArrowUpDown
  }

  const getSortLabel = (columnId: string, columnHeader: string) => {
    if (sortBy === columnId) {
      const direction = sortDirection === 'asc' ? 'ascending' : 'descending'
      return `${columnHeader}, sorted ${direction}`
    }
    return `Sort by ${columnHeader}`
  }

  if (loading) {
    return (
      <div className="w-full" role="status" aria-live="polite">
        <div className="rounded-md border">
          <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
            {caption && (
              <caption className="mt-4 text-sm text-muted-foreground">
                {caption}
              </caption>
            )}
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <th 
                    key={column.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    style={{ width: column.width }}
                  >
                    <div className="animate-pulse bg-muted h-4 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.id} className="p-4 align-middle">
                      <div className="animate-pulse bg-muted h-4 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="sr-only">{t('a11y.loading')}</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full">
        {empty || (
          <div className="text-center py-8 text-muted-foreground">
            {t('states.empty.noResults')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <table 
          className={cn("w-full caption-bottom text-sm", className)} 
          role="table"
          aria-label={ariaLabel || t('a11y.tableCaption', { count: data.length })}
          {...props}
        >
          {caption && (
            <caption className="mt-4 text-sm text-muted-foreground">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b transition-colors hover:bg-muted/50" role="row">
              {columns.map((column) => (
                <th 
                  key={column.id}
                  scope="col"
                  className={cn(
                    "h-12 px-4 align-middle font-medium text-muted-foreground",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right",
                    (!column.align || column.align === 'left') && "text-left"
                  )}
                  style={{ width: column.width }}
                  role="columnheader"
                  aria-sort={
                    sortBy === column.id 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : column.sortable ? 'none' : undefined
                  }
                >
                  {column.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-auto p-0 font-medium hover:bg-transparent focus-visible-ring",
                        column.align === 'center' && "justify-center",
                        column.align === 'right' && "justify-end"
                      )}
                      onClick={() => onSort(column.id)}
                      aria-label={getSortLabel(column.id, column.header)}
                    >
                      <span>{column.header}</span>
                      {React.createElement(getSortIcon(column.id), {
                        className: "ml-2 h-4 w-4",
                        'aria-hidden': true
                      })}
                    </Button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                className="border-b transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
                role="row"
              >
                {columns.map((column) => {
                  const value = column.accessorKey ? item[column.accessorKey] : ''
                  const cellContent = column.cell ? column.cell(item) : value
                  
                  return (
                    <td 
                      key={column.id}
                      className={cn(
                        "p-4 align-middle",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                      role="cell"
                    >
                      {cellContent}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Screen reader announcement for table info */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {t('a11y.tableCaption', { count: data.length })}
        {sortBy && (
          <span>
            {t('a11y.sortBy', { 
              field: columns.find(col => col.id === sortBy)?.header || sortBy 
            })}
          </span>
        )}
      </div>
    </div>
  )
}

// Example usage component for reference
export function ExampleUsage() {
  const [sortBy, setSortBy] = React.useState<string>('')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnId)
      setSortDirection('asc')
    }
  }

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  ]

  const columns: Column<typeof sampleData[0]>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      align: 'center',
      cell: (item) => (
        <span 
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            item.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}
        >
          {item.status}
        </span>
      ),
    },
  ]

  return (
    <AccessibleTable
      data={sampleData}
      columns={columns}
      caption="User management table"
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      aria-label="Users list with sortable columns"
    />
  )
}
