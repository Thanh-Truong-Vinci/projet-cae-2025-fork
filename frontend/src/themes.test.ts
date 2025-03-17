import { describe, test, expect } from 'vitest'
import theme from './themes'

describe('Theme Configuration', () => {
  test('theme is created correctly', () => {
    expect(theme).toBeDefined()
    expect(theme).toHaveProperty('palette')
  })

  test('has correct primary color', () => {
    expect(theme.palette.primary).toBeDefined()
    expect(theme.palette.primary.main).toBe('#008000')
  })

  test('has correct secondary color', () => {
    expect(theme.palette.secondary).toBeDefined()
    expect(theme.palette.secondary.main).toBe('#3bf048')
  })

  test('inherits default MUI theme properties', () => {
    // Check some default properties that should be inherited
    expect(theme.breakpoints).toBeDefined()
    expect(theme.typography).toBeDefined()
    expect(theme.spacing).toBeDefined()
  })

  test('color palette generates expected derived colors', () => {
    // Primary color should have auto-generated light and dark variants
    expect(theme.palette.primary).toHaveProperty('light')
    expect(theme.palette.primary).toHaveProperty('dark')

    // Secondary color should have auto-generated light and dark variants
    expect(theme.palette.secondary).toHaveProperty('light')
    expect(theme.palette.secondary).toHaveProperty('dark')
  })
})
