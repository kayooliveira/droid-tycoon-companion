import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  areAllExpanded,
  buildExpandedMap,
  useProgressListExpansion,
} from './useProgressListExpansion'

const STEPS = [1, 2, 3]
const CURRENT = 2

describe('buildExpandedMap', () => {
  it('defaults all steps to expanded', () => {
    expect(buildExpandedMap(STEPS, true)).toEqual({ 1: true, 2: true, 3: true })
  })
})

describe('useProgressListExpansion', () => {
  it('opens the current rebirth step on load', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, true, vi.fn()),
    )
    expect(result.current.allExpanded).toBe(false)
    expect(result.current.isExpanded(2)).toBe(true)
    expect(result.current.isExpanded(1)).toBe(false)
  })

  it('opens the current step regardless of persisted preference', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, false, vi.fn()),
    )
    expect(result.current.allExpanded).toBe(false)
    expect(result.current.isExpanded(2)).toBe(true)
    expect(result.current.isExpanded(1)).toBe(false)
  })

  it('toggleAll collapses and persists false', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, true, persist),
    )
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(false)
    expect(persist).toHaveBeenCalledWith(false)
  })

  it('toggleAll expands and persists true after collapse', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, false, persist),
    )
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(true)
    expect(persist).toHaveBeenCalledWith(true)
  })

  it('toggleAll collapses when only some steps are expanded', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, true, persist),
    )
    act(() => result.current.toggleOne(2))
    expect(result.current.allExpanded).toBe(false)
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(false)
    expect(result.current.anyExpanded).toBe(false)
    expect(persist).toHaveBeenCalledWith(false)
  })

  it('individual toggle still works when current step starts open', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', CURRENT, true, vi.fn()),
    )
    act(() => result.current.toggleOne(2))
    expect(result.current.isExpanded(2)).toBe(false)
    expect(result.current.isExpanded(1)).toBe(false)
    expect(areAllExpanded(STEPS, { 1: false, 2: false, 3: false })).toBe(false)
  })
})
