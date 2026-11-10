import { cleanup, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, ToastViewport, useToast } from './ToastProvider'

function PushOnMount({
  message,
  options,
}: {
  message: string
  options?: Parameters<ReturnType<typeof useToast>['push']>[1]
}) {
  const { push } = useToast()
  useEffect(() => {
    push(message, options)
  }, [message, options, push])
  return null
}

describe('ToastProvider', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders in-flow toast slot above tab bar', () => {
    render(
      <ToastProvider>
        <PushOnMount message="Hello" options={{ variant: 'info' }} />
        <ToastViewport />
      </ToastProvider>,
    )
    const stack = screen.getByTestId('toast-stack')
    expect(stack.className).toMatch(/toast-slot/)
    expect(stack).not.toHaveAttribute('hidden')
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
        <ToastViewport />
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
        <ToastViewport />
      </ToastProvider>,
    )
    expect(screen.getByText('Failed').closest('[data-testid="toast-item"]')).toHaveAttribute(
      'aria-live',
      'assertive',
    )
  })
})
