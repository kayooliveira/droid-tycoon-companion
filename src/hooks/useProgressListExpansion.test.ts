import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  areAllExpanded,
  buildExpandedMap,
  useProgressListExpansion,
} from './useProgressListExpansion'

const STEPS = [1, 2, 3]

describe('buildExpandedMap', () => {
  it('defaults all steps to expanded', () => {
    expect(buildExpandedMap(STEPS, true)).toEqual({ 1: true, 2: true, 3: true })
  })
})

describe('useProgressListExpansion', () => {
  it('starts expanded when persisted preference is true', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', true, vi.fn()),
    )
    expect(result.current.allExpanded).toBe(true)
    expect(result.current.isExpanded(2)).toBe(true)
  })

  it('starts collapsed when persisted preference is false', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', false, vi.fn()),
    )
    expect(result.current.allExpanded).toBe(false)
    expect(result.current.isExpanded(1)).toBe(false)
  })

  it('toggleAll collapses and persists false', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', true, persist),
    )
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(false)
    expect(persist).toHaveBeenCalledWith(false)
  })

  it('toggleAll expands and persists true after collapse', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', false, persist),
    )
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(true)
    expect(persist).toHaveBeenCalledWith(true)
  })

  it('toggleAll collapses when only some steps are expanded', () => {
    const persist = vi.fn()
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', true, persist),
    )
    act(() => result.current.toggleOne(2))
    expect(result.current.allExpanded).toBe(false)
    act(() => result.current.toggleAll())
    expect(result.current.allExpanded).toBe(false)
    expect(result.current.anyExpanded).toBe(false)
    expect(persist).toHaveBeenCalledWith(false)
  })

  it('individual toggle still works when list starts expanded', () => {
    const { result } = renderHook(() =>
      useProgressListExpansion(STEPS, 'path-1', true, vi.fn()),
    )
    act(() => result.current.toggleOne(2))
    expect(result.current.isExpanded(2)).toBe(false)
    expect(result.current.isExpanded(1)).toBe(true)
    expect(areAllExpanded(STEPS, { 1: true, 2: false, 3: true })).toBe(false)
  })
})
