import React, { memo, useMemo, useCallback, useState } from 'react'
import { FixedSizeList as List, areEqual } from 'react-window'
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react'

// Types
interface Column {
  key: string
  label: string
  width?: number
  minWidth?: number
  maxWidth?: number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface VirtualizedTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  error?: string | null
  title?: string
  description?: string
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  itemHeight?: number
  overscan?: number
  className?: string
  onRowClick?: (row: any, index: number) => void
}

interface SortState {
  key: string | null
  direction: 'asc' | 'desc'
}

// Row component for virtualization
interface RowProps {
  index: number
  style: React.CSSProperties
  data: {
    items: any[]
    columns: Column[]
    onRowClick?: (row: any, index: number) => void
  }
}

const Row = memo<RowProps>(({ index, style, data }) => {
  const { items, columns, onRowClick } = data
  const item = items[index]
  
  const handleClick = useCallback(() => {
    onRowClick?.(item, index)
  }, [item, index, onRowClick])
  
  return (
    <div
      style={style}
      className={`flex items-center border-b hover:bg-muted/50 cursor-pointer transition-colors ${
        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
      }`}
      onClick={handleClick}
    >
      {columns.map((column, colIndex) => {
        const value = item[column.key]
        const content = column.render ? column.render(value, item) : value
        
        return (
          <div
            key={column.key}
            className={`flex items-center px-4 py-2 text-sm ${
              column.align === 'center' ? 'justify-center' :
              column.align === 'right' ? 'justify-end' : 'justify-start'
            }`}
            style={{
              width: column.width || 150,
              minWidth: column.minWidth || 100,
              maxWidth: column.maxWidth || 300,
              flexShrink: 0
            }}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}, areEqual)

Row.displayName = 'VirtualizedRow'

// Header component
interface HeaderProps {
  columns: Column[]
  sortState: SortState
  onSort: (key: string) => void
}

const Header = memo<HeaderProps>(({ columns, sortState, onSort }) => {
  return (
    <div className="flex items-center border-b bg-muted/30 font-medium">
      {columns.map((column) => (
        <div
          key={column.key}
          className={`flex items-center px-4 py-3 text-sm ${
            column.align === 'center' ? 'justify-center' :
            column.align === 'right' ? 'justify-end' : 'justify-start'
          }`}
          style={{
            width: column.width || 150,
            minWidth: column.minWidth || 100,
            maxWidth: column.maxWidth || 300,
            flexShrink: 0
          }}
        >
          <span className="truncate">{column.label}</span>
          {column.sortable && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 w-6 p-0"
              onClick={() => onSort(column.key)}
            >
              {sortState.key === column.key ? (
                sortState.direction === 'asc' ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
})

Header.displayName = 'VirtualizedHeader'

// Main virtualized table component
export const VirtualizedTable = memo<VirtualizedTableProps>(({
  data,
  columns,
  loading = false,
  error = null,
  title,
  description,
  searchable = true,
  filterable = true,
  sortable = true,
  itemHeight = 50,
  overscan = 5,
  className = '',
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(item =>
          String(item[key]).toLowerCase().includes(filterValue.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortState.key) {
      result.sort((a, b) => {
        const aValue = a[sortState.key!]
        const bValue = b[sortState.key!]
        
        let comparison = 0
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }
        
        return sortState.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, filters, sortState])

  // Handlers
  const handleSort = useCallback((key: string) => {
    if (!sortable) return
    
    setSortState(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [sortable])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({})
    setSortState({ key: null, direction: 'asc' })
  }, [])

  // Row data for virtualization
  const listData = useMemo(() => ({
    items: processedData,
    columns,
    onRowClick
  }), [processedData, columns, onRowClick])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Failed to load data
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {processedData.length} of {data.length} items
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        {(searchable || filterable) && (
          <div className="flex flex-col gap-4">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Column Filters */}
            {filterable && (
              <div className="flex flex-wrap gap-2">
                {columns
                  .filter(col => col.filterable)
                  .map(column => (
                    <div key={column.key} className="flex items-center gap-2">
                      <label className="text-sm font-medium">{column.label}:</label>
                      <Input
                        placeholder={`Filter ${column.label.toLowerCase()}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ))}
                
                {(searchTerm || Object.values(filters).some(Boolean)) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-96 border rounded-b-lg overflow-hidden">
          {/* Header */}
          <Header
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
          />

          {/* Virtualized Content */}
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height - 50} // Subtract header height
                width={width}
                itemCount={processedData.length}
                itemSize={itemHeight}
                itemData={listData}
                overscanCount={overscan}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </CardContent>
    </Card>
  )
})

VirtualizedTable.displayName = 'VirtualizedTable'

// Grid version for more complex layouts
interface VirtualizedGridProps {
  data: any[][]
  columnCount: number
  rowHeight?: number
  columnWidth?: number
  loading?: boolean
  error?: string | null
  className?: string
  renderCell?: (rowIndex: number, columnIndex: number, value: any) => React.ReactNode
}

export const VirtualizedGrid = memo<VirtualizedGridProps>(({
  data,
  columnCount,
  rowHeight = 50,
  columnWidth = 150,
  loading = false,
  error = null,
  className = '',
  renderCell
}) => {
  const Cell = memo(({ rowIndex, columnIndex, style }: any) => {
    const cellData = data[rowIndex]?.[columnIndex]
    const content = renderCell ? renderCell(rowIndex, columnIndex, cellData) : cellData
    
    return (
      <div
        style={style}
        className="flex items-center justify-center border-r border-b bg-background hover:bg-muted/50 transition-colors"
      >
        {content}
      </div>
    )
  })

  Cell.displayName = 'GridCell'

  if (loading) {
    return (
      <div className={`h-96 ${className}`}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`h-96 flex items-center justify-center text-destructive ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <div className={`h-96 border rounded ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            height={height}
            width={width}
            rowCount={data.length}
            columnCount={columnCount}
            rowHeight={rowHeight}
            columnWidth={columnWidth}
            overscanRowCount={2}
            overscanColumnCount={1}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  )
})

VirtualizedGrid.displayName = 'VirtualizedGrid'
