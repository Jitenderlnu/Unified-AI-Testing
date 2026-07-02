import { describe, it, expect } from 'vitest'
import {
  validateResponse,
  validateInput,
  UserSchema,
  TaskSchema,
  CommentSchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  CommentInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
} from './validation'

describe('Validation Schemas', () => {
  describe('validateInput - Login', () => {
    it('should validate correct login credentials', () => {
      const input = { email: 'user@example.com', password: 'password123' }
      expect(() => validateInput(LoginInputSchema, input)).not.toThrow()
    })

    it('should reject invalid email', () => {
      const input = { email: 'invalid-email', password: 'password123' }
      expect(() => validateInput(LoginInputSchema, input)).toThrow()
    })

    it('should reject missing password', () => {
      const input = { email: 'user@example.com', password: '' }
      expect(() => validateInput(LoginInputSchema, input)).toThrow()
    })

    it('should reject missing email', () => {
      const input = { email: '', password: 'password123' }
      expect(() => validateInput(LoginInputSchema, input)).toThrow()
    })
  })

  describe('validateInput - Register', () => {
    it('should validate correct registration data', () => {
      const input = {
        email: 'newuser@example.com',
        password: 'securePassword123!',
        name: 'John Doe',
      }
      expect(() => validateInput(RegisterInputSchema, input)).not.toThrow()
    })

    it('should reject password less than 8 characters', () => {
      const input = {
        email: 'newuser@example.com',
        password: 'short',
        name: 'John Doe',
      }
      expect(() => validateInput(RegisterInputSchema, input)).toThrow()
    })

    it('should reject name less than 2 characters', () => {
      const input = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'J',
      }
      expect(() => validateInput(RegisterInputSchema, input)).toThrow()
    })

    it('should reject invalid email format', () => {
      const input = {
        email: 'not-an-email',
        password: 'password123',
        name: 'John Doe',
      }
      expect(() => validateInput(RegisterInputSchema, input)).toThrow()
    })
  })

  describe('validateInput - Create Task', () => {
    it('should validate correct task creation', () => {
      const input = {
        title: 'New Task',
        description: 'Task description',
        priority: 'HIGH',
        dueDate: '2026-12-31T23:59:59Z',
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).not.toThrow()
    })

    it('should reject empty title', () => {
      const input = {
        title: '',
        description: 'Task description',
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).toThrow()
    })

    it('should reject invalid priority', () => {
      const input = {
        title: 'Task',
        priority: 'INVALID_PRIORITY',
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).toThrow()
    })

    it('should reject description exceeding 5000 characters', () => {
      const input = {
        title: 'Task',
        description: 'a'.repeat(5001),
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).toThrow()
    })

    it('should accept optional fields', () => {
      const input = { title: 'Minimal Task' }
      expect(() => validateInput(CreateTaskInputSchema, input)).not.toThrow()
    })
  })

  describe('validateInput - Comment', () => {
    it('should validate correct comment', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'This is a comment',
      }
      expect(() => validateInput(CommentInputSchema, input)).not.toThrow()
    })

    it('should validate comment with parent', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Reply to comment',
        parentId: '550e8400-e29b-41d4-a716-446655440001',
      }
      expect(() => validateInput(CommentInputSchema, input)).not.toThrow()
    })

    it('should reject empty content', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: '',
      }
      expect(() => validateInput(CommentInputSchema, input)).toThrow()
    })

    it('should reject invalid UUID', () => {
      const input = {
        taskId: 'not-a-uuid',
        content: 'Comment',
      }
      expect(() => validateInput(CommentInputSchema, input)).toThrow()
    })

    it('should reject content exceeding 5000 characters', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'a'.repeat(5001),
      }
      expect(() => validateInput(CommentInputSchema, input)).toThrow()
    })
  })

  describe('validateResponse - User', () => {
    it('should validate correct user response', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(UserSchema, data)).not.toThrow()
    })

    it('should reject user with invalid role', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'INVALID_ROLE',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(UserSchema, data)).toThrow()
    })

    it('should reject user with invalid status', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'INVALID_STATUS',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(UserSchema, data)).toThrow()
    })

    it('should reject user with invalid UUID', () => {
      const data = {
        id: 'not-a-uuid',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(UserSchema, data)).toThrow()
    })
  })

  describe('validateResponse - Task', () => {
    it('should validate correct task response', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task Title',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(TaskSchema, data)).not.toThrow()
    })

    it('should reject task with invalid status', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task Title',
        status: 'INVALID_STATUS',
        priority: 'HIGH',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(TaskSchema, data)).toThrow()
    })

    it('should reject task with negative version', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task Title',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        version: -1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(TaskSchema, data)).toThrow()
    })

    it('should accept optional fields', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task Title',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        version: 0,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        assigneeId: '550e8400-e29b-41d4-a716-446655440002',
        dueDate: '2026-12-31T23:59:59Z',
      }
      expect(() => validateResponse(TaskSchema, data)).not.toThrow()
    })
  })

  describe('validateResponse - Comment', () => {
    it('should validate correct comment response', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'This is a comment',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(CommentSchema, data)).not.toThrow()
    })

    it('should accept comment with parent', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Reply to comment',
        parentId: '550e8400-e29b-41d4-a716-446655440003',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(CommentSchema, data)).not.toThrow()
    })

    it('should reject comment with invalid taskId UUID', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        taskId: 'not-a-uuid',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Comment',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(CommentSchema, data)).toThrow()
    })
  })

  describe('updateTaskInputSchema', () => {
    it('should validate partial updates', () => {
      const input = {
        title: 'Updated Title',
        version: 2,
      }
      expect(() => validateInput(UpdateTaskInputSchema, input)).not.toThrow()
    })

    it('should accept null values for optional nullable fields', () => {
      const input = {
        assigneeId: null,
        dueDate: null,
        version: 2,
      }
      expect(() => validateInput(UpdateTaskInputSchema, input)).not.toThrow()
    })

    it('should reject missing version field', () => {
      const input = {
        title: 'Updated Title',
      }
      expect(() => validateInput(UpdateTaskInputSchema, input)).toThrow()
    })

    it('should reject negative version', () => {
      const input = {
        title: 'Updated Title',
        version: -1,
      }
      expect(() => validateInput(UpdateTaskInputSchema, input)).toThrow()
    })

    it('should validate all update fields', () => {
      const input = {
        title: 'New Title',
        description: 'New description',
        status: 'COMPLETED',
        priority: 'HIGHEST',
        assigneeId: '550e8400-e29b-41d4-a716-446655440001',
        dueDate: '2026-12-31T23:59:59Z',
        tags: ['urgent', 'important'],
        version: 5,
      }
      expect(() => validateInput(UpdateTaskInputSchema, input)).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should reject null values where not allowed', () => {
      const input = { email: null, password: 'password' }
      expect(() => validateInput(LoginInputSchema, input)).toThrow()
    })

    it('should handle very long valid strings', () => {
      const input = {
        title: 'a'.repeat(255),
        description: 'b'.repeat(5000),
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).not.toThrow()
    })

    it('should reject strings exceeding max length', () => {
      const input = {
        title: 'a'.repeat(256),
      }
      expect(() => validateInput(CreateTaskInputSchema, input)).toThrow()
    })

    it('should handle datetime validation', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Comment with valid date',
      }
      const taskData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        taskId: '550e8400-e29b-41d4-a716-446655440001',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Comment',
        createdAt: 'invalid-date',
        updatedAt: '2026-01-01T00:00:00Z',
      }
      expect(() => validateResponse(CommentSchema, taskData)).toThrow()
    })
  })
})
