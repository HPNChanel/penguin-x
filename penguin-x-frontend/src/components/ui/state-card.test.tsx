import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateCard, LoadingCard, ErrorCard, EmptyCard } from './state-card'

describe('StateCard', () => {
  it('renders loading state correctly', () => {
    render(<StateCard state="loading" />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Please wait while we fetch your data.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders error state correctly', () => {
    render(<StateCard state="error" />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We encountered an error while loading your data.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders empty state correctly', () => {
    render(<StateCard state="empty" />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
    expect(screen.getByText('There is no data to display at the moment.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('does not render when state is success', () => {
    const { container } = render(<StateCard state="success" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders custom title and description', () => {
    render(
      <StateCard 
        state="error" 
        title="Custom Error"
        description="Custom error description"
      />
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Custom error description')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', async () => {
    const handleRetry = vi.fn()
    render(<StateCard state="error" onRetry={handleRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
    
    await userEvent.click(retryButton)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('renders custom retry label', () => {
    const handleRetry = vi.fn()
    render(
      <StateCard 
        state="error" 
        onRetry={handleRetry} 
        retryLabel="Retry Loading"
      />
    )
    
    expect(screen.getByRole('button', { name: /retry loading/i })).toBeInTheDocument()
  })

  it('renders custom actions', () => {
    render(
      <StateCard 
        state="empty" 
        actions={<button>Custom Action</button>}
      />
    )
    
    expect(screen.getByRole('button', { name: /custom action/i })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<StateCard state="loading" className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('applies custom aria-live', () => {
    render(<StateCard state="loading" aria-live="assertive" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders with custom icon', () => {
    const CustomIcon = () => <svg data-testid="custom-icon">Custom</svg>
    render(<StateCard state="loading" icon={<CustomIcon />} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('has proper accessibility attributes for retry button', () => {
    const handleRetry = vi.fn()
    render(
      <StateCard 
        state="error" 
        onRetry={handleRetry}
        description="Network error occurred"
      />
    )
    
    const retryButton = screen.getByRole('button', { name: /try again.*network error occurred/i })
    expect(retryButton).toHaveClass('focus-visible-ring')
  })
})

describe('Convenience Components', () => {
  it('LoadingCard renders with loading state', () => {
    render(<LoadingCard />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('ErrorCard renders with error state', () => {
    render(<ErrorCard />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('EmptyCard renders with empty state', () => {
    render(<EmptyCard />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('convenience components accept additional props', () => {
    const handleRetry = vi.fn()
    render(<ErrorCard onRetry={handleRetry} title="Custom Error" />)
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
