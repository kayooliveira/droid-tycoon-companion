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
    expect(stack.className).toMatch(/z-toast/)
    expect(stack.className).toMatch(/max-w-\[360px\]/)
    expect(stack.className).toMatch(/pointer-events-none/)
  })

  it('renders variant data attribute and text action', () => {
    render(
      <ToastProvider>
        <PushOnMount
          message="Undo me"
          options={{
            variant: 'success',
            action: { label: 'Undo', onClick: () => {} },
          }}
        />
      </ToastProvider>,
    )
    expect(screen.getByText('Undo me').closest('[data-testid="toast-item"]')).toHaveAttribute(
      'data-toast-variant',
      'success',
    )
    expect(screen.getByTestId('toast-action')).toBeInTheDocument()
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
