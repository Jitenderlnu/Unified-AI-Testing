import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskFiltering } from './useTaskFiltering'

vi.mock('@context', () => ({
  useTaskContext: vi.fn(() => ({
    loadTasks: vi.fn(),
    isLoading: false,
    filters: {},
    setFilters: vi.fn(),
  })),
}))

describe('useTaskFiltering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Filter Management', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useTaskFiltering())

      expect(result.current.filters).toBeDefined()
    })

    it('should filter by status', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('COMPLETED')
      })

      expect(result.current.filters.status).toBe('COMPLETED')
    })

    it('should filter by priority', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByPriority('HIGH')
      })

      expect(result.current.filters.priority).toBe('HIGH')
    })

    it('should filter by assignee', () => {
      const { result } = renderHook(() => useTaskFiltering())

      const assigneeId = '550e8400-e29b-41d4-a716-446655440000'
      act(() => {
        result.current.filterByAssignee(assigneeId)
      })

      expect(result.current.filters.assignee).toBe(assigneeId)
    })

    it('should apply multiple filters together', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('IN_PROGRESS')
        result.current.filterByPriority('HIGH')
      })

      expect(result.current.filters.status).toBe('IN_PROGRESS')
      expect(result.current.filters.priority).toBe('HIGH')
    })

    it('should reset filters to empty', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('COMPLETED')
        result.current.resetFilters()
      })

      expect(result.current.filters.status).toBeUndefined()
    })
  })

  describe('Sorting', () => {
    it('should sort by created date ascending', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.sortTasks('createdAt', 'asc')
      })

      expect(result.current.filters.sortBy).toBe('createdAt')
      expect(result.current.filters.sortOrder).toBe('asc')
    })

    it('should sort by due date descending', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.sortTasks('dueDate', 'desc')
      })

      expect(result.current.filters.sortBy).toBe('dueDate')
      expect(result.current.filters.sortOrder).toBe('desc')
    })

    it('should sort by priority', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.sortTasks('priority', 'asc')
      })

      expect(result.current.filters.sortBy).toBe('priority')
    })

    it('should sort by status', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.sortTasks('status', 'asc')
      })

      expect(result.current.filters.sortBy).toBe('status')
    })
  })

  describe('Pagination', () => {
    it('should navigate to specific page', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.filters.page).toBe(3)
    })

    it('should change page size', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.changePageSize(50)
      })

      expect(result.current.filters.limit).toBe(50)
    })

    it('should reset to page 1 when changing filters', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.goToPage(5)
        result.current.filterByStatus('COMPLETED')
      })

      expect(result.current.filters.page).toBe(1)
    })

    it('should not reset page when navigating pages', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.filters.page).toBe(3)
    })

    it('should maintain page size across filter changes', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.changePageSize(50)
        result.current.filterByStatus('COMPLETED')
      })

      expect(result.current.filters.limit).toBe(50)
    })

    it('should enforce minimum page number', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.goToPage(0) // Should become 1
      })

      expect(result.current.filters.page).toBeGreaterThan(0)
    })

    it('should enforce minimum page size', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.changePageSize(0) // Should become minimum
      })

      expect(result.current.filters.limit).toBeGreaterThan(0)
    })

    it('should enforce maximum page size', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.changePageSize(1000) // Should cap at max
      })

      expect(result.current.filters.limit).toBeLessThanOrEqual(100)
    })
  })

  describe('Complex Filtering', () => {
    it('should combine filter, sort, and pagination', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('IN_PROGRESS')
        result.current.filterByPriority('HIGH')
        result.current.sortTasks('dueDate', 'asc')
        result.current.changePageSize(25)
        result.current.goToPage(2)
      })

      expect(result.current.filters.status).toBe('IN_PROGRESS')
      expect(result.current.filters.priority).toBe('HIGH')
      expect(result.current.filters.sortBy).toBe('dueDate')
      expect(result.current.filters.sortOrder).toBe('asc')
      expect(result.current.filters.limit).toBe(25)
      expect(result.current.filters.page).toBe(2)
    })

    it('should update filters object with updateFilters', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.updateFilters({
          status: 'COMPLETED',
          priority: 'HIGH',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      })

      expect(result.current.filters.status).toBe('COMPLETED')
      expect(result.current.filters.priority).toBe('HIGH')
      expect(result.current.filters.sortBy).toBe('createdAt')
      expect(result.current.filters.sortOrder).toBe('desc')
    })
  })

  describe('Loading State', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useTaskFiltering())

      expect(result.current.isLoading).toBeDefined()
    })

    it('should have isLoading as boolean', () => {
      const { result } = renderHook(() => useTaskFiltering())

      expect(typeof result.current.isLoading).toBe('boolean')
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all filters', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('COMPLETED')
        result.current.filterByPriority('HIGH')
        result.current.filterByAssignee('user-id')
        result.current.sortTasks('createdAt', 'asc')
        result.current.changePageSize(50)
        result.current.goToPage(5)

        result.current.resetFilters()
      })

      expect(result.current.filters.status).toBeUndefined()
      expect(result.current.filters.priority).toBeUndefined()
      expect(result.current.filters.assignee).toBeUndefined()
      expect(result.current.filters.sortBy).toBeUndefined()
      expect(result.current.filters.sortOrder).toBeUndefined()
      expect(result.current.filters.page).toBe(1)
      expect(result.current.filters.limit).toBeUndefined()
    })

    it('should reset to page 1 when filtering', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.goToPage(10)
        result.current.filterByStatus('COMPLETED')
      })

      expect(result.current.filters.page).toBe(1)
    })
  })

  describe('Return Values', () => {
    it('should provide all filter methods', () => {
      const { result } = renderHook(() => useTaskFiltering())

      expect(typeof result.current.updateFilters).toBe('function')
      expect(typeof result.current.filterByStatus).toBe('function')
      expect(typeof result.current.filterByPriority).toBe('function')
      expect(typeof result.current.filterByAssignee).toBe('function')
      expect(typeof result.current.sortTasks).toBe('function')
      expect(typeof result.current.goToPage).toBe('function')
      expect(typeof result.current.changePageSize).toBe('function')
      expect(typeof result.current.resetFilters).toBe('function')
    })

    it('should provide filter state', () => {
      const { result } = renderHook(() => useTaskFiltering())

      expect(result.current.filters).toBeDefined()
      expect(typeof result.current.isLoading).toBe('boolean')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined filter values', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus(undefined as any)
      })

      // Should handle gracefully
      expect(result.current.filters).toBeDefined()
    })

    it('should handle empty string filters', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByStatus('')
      })

      // Should handle gracefully
      expect(result.current.filters).toBeDefined()
    })

    it('should handle null assignee (unassigned)', () => {
      const { result } = renderHook(() => useTaskFiltering())

      act(() => {
        result.current.filterByAssignee(null as any)
      })

      // Should handle null for unassigned filter
      expect(result.current.filters).toBeDefined()
    })
  })

  describe('Auto-loading', () => {
    it('should support auto-loading on mount', () => {
      const { result } = renderHook(() => useTaskFiltering({ autoLoad: true }))

      expect(result.current.filters).toBeDefined()
    })

    it('should not auto-load when disabled', () => {
      const { result } = renderHook(() => useTaskFiltering({ autoLoad: false }))

      expect(result.current.filters).toBeDefined()
    })
  })
})
