import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './ToastProvider'

function PushOnMount({
  message,
  options,
}: {
  message: string
  options?: Parameters<ReturnType<typeof useToast>['push']>[1]
}) {
  const { push } = useToast()
  push(message, options)
  return null
}

describe('ToastProvider', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders stack at top with safe-area padding class', () => {
    render(
      <ToastProvider>
        <PushOnMount message="Hello" options={{ variant: 'info' }} />
      </ToastProvider>,
    )
    const stack = screen.getByTestId('toast-stack')
    expect(stack.className).toMatch(/safe-area-inset-top/)
    expect(stack.className).toMatch(/top-\[/)
  })

  it('renders variant data attribute and progress for undo toasts', () => {
    render(
      <ToastProvider>
        <PushOnMount
          message="Undo me"
          options={{
            variant: 'neutral',
            action: { label: 'Undo', onClick: () => {} },
            showProgress: true,
          }}
        />
      </ToastProvider>,
    )
    expect(screen.getByText('Undo me').closest('[data-testid="toast-item"]')).toHaveAttribute(
      'data-toast-variant',
      'neutral',
    )
    expect(screen.getByTestId('toast-progress-track')).toBeInTheDocument()
  })

  it('uses assertive live region for error variant', () => {
    render(
      <ToastProvider>
        <PushOnMount message="Failed" options={{ variant: 'error' }} />
      </ToastProvider>,
    )
    expect(screen.getByText('Failed').closest('[data-testid="toast-item"]')).toHaveAttribute(
      'aria-live',
      'assertive',
    )
  })
})
