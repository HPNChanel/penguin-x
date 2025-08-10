import { describe, it, expect } from 'vitest'
import { 
  htmlSanitizer,
  sanitizeHtml,
  sanitizeUserInput,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeForDisplay,
  sanitizeJsonValues 
} from './sanitization'

describe('HTML Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('allows safe HTML tags in basic mode', () => {
      const html = '<p>Hello <strong>world</strong>!</p>'
      const result = sanitizeHtml(html, 'basic')
      
      expect(result.clean).toBe('<p>Hello <strong>world</strong>!</p>')
      expect(result.modified).toBe(false)
    })

    it('removes dangerous script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHtml(html, 'basic')
      
      expect(result.clean).toBe('<p>Hello</p>')
      expect(result.modified).toBe(true)
      expect(result.clean).not.toContain('script')
    })

    it('removes dangerous attributes', () => {
      const html = '<img src="image.jpg" onerror="alert(\'xss\')" alt="Image">'
      const result = sanitizeHtml(html, 'extended')
      
      expect(result.clean).toContain('src="image.jpg"')
      expect(result.clean).toContain('alt="Image"')
      expect(result.clean).not.toContain('onerror')
      expect(result.modified).toBe(true)
    })

    it('removes all HTML in strict mode', () => {
      const html = '<p>Hello <strong>world</strong>!</p>'
      const result = sanitizeHtml(html, 'strict')
      
      expect(result.clean).not.toContain('<p>')
      expect(result.clean).not.toContain('<strong>')
      expect(result.clean).toContain('Hello')
      expect(result.clean).toContain('world')
    })

    it('removes all HTML in none mode', () => {
      const html = '<div><p>Hello <strong>world</strong>!</p></div>'
      const result = sanitizeHtml(html, 'none')
      
      expect(result.clean).toBe('Hello world!')
      expect(result.modified).toBe(true)
    })
  })

  describe('sanitizeUserInput', () => {
    it('removes all HTML from user input', () => {
      const input = 'Hello <script>alert("xss")</script> world!'
      const result = sanitizeUserInput(input)
      
      expect(result).toBe('Hello  world!')
      expect(result).not.toContain('<script>')
    })

    it('escapes special characters', () => {
      const input = 'Test & "quotes" and <brackets>'
      const result = sanitizeUserInput(input)
      
      expect(result).toContain('&amp;')
      expect(result).toContain('&quot;')
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('trims whitespace', () => {
      const input = '  hello world  '
      const result = sanitizeUserInput(input)
      
      expect(result).toBe('hello world')
    })
  })

  describe('sanitizeRichText', () => {
    it('allows extended HTML formatting', () => {
      const html = '<h1>Title</h1><p>Paragraph with <a href="https://example.com">link</a></p>'
      const result = sanitizeRichText(html)
      
      expect(result.clean).toContain('<h1>')
      expect(result.clean).toContain('<p>')
      expect(result.clean).toContain('<a href="https://example.com">')
    })

    it('removes dangerous content from rich text', () => {
      const html = '<h1>Title</h1><script>alert("xss")</script><p>Content</p>'
      const result = sanitizeRichText(html)
      
      expect(result.clean).toContain('<h1>Title</h1>')
      expect(result.clean).toContain('<p>Content</p>')
      expect(result.clean).not.toContain('<script>')
      expect(result.modified).toBe(true)
    })
  })

  describe('sanitizeUrl', () => {
    it('allows safe HTTPS URLs', () => {
      const url = 'https://example.com/path'
      const result = sanitizeUrl(url)
      
      expect(result).toBe('https://example.com/path')
    })

    it('allows safe HTTP URLs', () => {
      const url = 'http://example.com'
      const result = sanitizeUrl(url)
      
      expect(result).toBe('http://example.com/')
    })

    it('allows mailto URLs', () => {
      const url = 'mailto:user@example.com'
      const result = sanitizeUrl(url)
      
      expect(result).toBe('mailto:user@example.com')
    })

    it('rejects javascript URLs', () => {
      const url = 'javascript:alert("xss")'
      const result = sanitizeUrl(url)
      
      expect(result).toBeNull()
    })

    it('rejects data URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>'
      const result = sanitizeUrl(url)
      
      expect(result).toBeNull()
    })

    it('handles relative URLs', () => {
      const url = '/path/to/resource'
      const result = sanitizeUrl(url)
      
      expect(result).toBe('/path/to/resource')
    })

    it('adds https to plain domains', () => {
      const url = 'example.com'
      const result = sanitizeUrl(url)
      
      expect(result).toBe('https://example.com/')
    })

    it('handles empty or invalid URLs', () => {
      expect(sanitizeUrl('')).toBeNull()
      expect(sanitizeUrl('not-a-url')).toBeDefined()
      expect(sanitizeUrl('http://')).toBeNull()
    })
  })

  describe('sanitizeForDisplay', () => {
    it('sanitizes HTML for safe display', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>'
      const result = sanitizeForDisplay(html)
      
      expect(result).toBe('<p>Safe content</p>')
    })
  })

  describe('sanitizeJsonValues', () => {
    it('sanitizes string values in JSON objects', () => {
      const obj = {
        title: 'Safe title',
        description: '<script>alert("xss")</script>Normal text',
        count: 42,
        active: true
      }
      
      const result = sanitizeJsonValues(obj, 'strict')
      
      expect(result.title).toBe('Safe title')
      expect(result.description).toBe('Normal text')
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
    })

    it('sanitizes nested objects', () => {
      const obj = {
        user: {
          name: 'John<script>alert("xss")</script>',
          email: 'john@example.com'
        },
        tags: ['tag1<script>', 'tag2', 'tag3']
      }
      
      const result = sanitizeJsonValues(obj, 'strict')
      
      expect(result.user.name).toBe('John')
      expect(result.user.email).toBe('john@example.com')
      expect(result.tags[0]).toBe('tag1')
      expect(result.tags[1]).toBe('tag2')
    })

    it('handles null and undefined values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroValue: 0
      }
      
      const result = sanitizeJsonValues(obj)
      
      expect(result.nullValue).toBeNull()
      expect(result.undefinedValue).toBeUndefined()
      expect(result.emptyString).toBe('')
      expect(result.zeroValue).toBe(0)
    })

    it('sanitizes object keys', () => {
      const obj = {
        'normal_key': 'value',
        'key<script>': 'dangerous key',
        'safe-key': 'another value'
      }
      
      const result = sanitizeJsonValues(obj)
      
      expect(result['normal_key']).toBe('value')
      expect(result['key']).toBe('dangerous key')
      expect(result['safe-key']).toBe('another value')
      expect(result['key<script>']).toBeUndefined()
    })
  })

  describe('htmlSanitizer utility methods', () => {
    it('checks if content is safe', () => {
      const safeContent = '<p>Hello world</p>'
      const unsafeContent = '<p>Hello</p><script>alert("xss")</script>'
      
      expect(htmlSanitizer.isSafe(safeContent, 'basic')).toBe(true)
      expect(htmlSanitizer.isSafe(unsafeContent, 'basic')).toBe(false)
    })

    it('provides sanitization statistics', () => {
      const content = '<p>Hello</p><script>alert("xss")</script>'
      const stats = htmlSanitizer.getSanitizationStats(content, 'basic')
      
      expect(stats.originalLength).toBeGreaterThan(stats.cleanLength)
      expect(stats.bytesRemoved).toBeGreaterThan(0)
      expect(stats.modified).toBe(true)
      expect(stats.safetyLevel).toBe('basic')
      expect(stats.timestamp).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty strings', () => {
      expect(sanitizeHtml('', 'basic').clean).toBe('')
      expect(sanitizeUserInput('')).toBe('')
      expect(sanitizeUrl('')).toBeNull()
    })

    it('handles null and undefined inputs', () => {
      expect(sanitizeHtml(null as any, 'basic').clean).toBe('')
      expect(sanitizeHtml(undefined as any, 'basic').clean).toBe('')
      expect(sanitizeUserInput(null as any)).toBe('')
      expect(sanitizeUrl(null as any)).toBeNull()
    })

    it('handles non-string inputs', () => {
      expect(sanitizeHtml(123 as any, 'basic').clean).toBe('')
      expect(sanitizeUserInput(123 as any)).toBe('')
      expect(sanitizeUrl(123 as any)).toBeNull()
    })

    it('handles very long inputs', () => {
      const longString = '<p>' + 'a'.repeat(10000) + '</p>'
      const result = sanitizeHtml(longString, 'basic')
      
      expect(result.clean).toContain('<p>')
      expect(result.clean.length).toBeGreaterThan(10000)
    })

    it('handles complex nested HTML', () => {
      const complexHtml = `
        <div>
          <h1>Title</h1>
          <p>Paragraph with <a href="https://example.com">link</a></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2 with <strong>bold</strong> text</li>
          </ul>
          <script>alert("xss")</script>
          <img src="image.jpg" onerror="alert('xss')" alt="Image">
        </div>
      `
      
      const result = sanitizeHtml(complexHtml, 'extended')
      
      expect(result.clean).toContain('<div>')
      expect(result.clean).toContain('<h1>Title</h1>')
      expect(result.clean).toContain('<a href="https://example.com">link</a>')
      expect(result.clean).toContain('<ul>')
      expect(result.clean).toContain('<strong>bold</strong>')
      expect(result.clean).not.toContain('<script>')
      expect(result.clean).not.toContain('onerror')
      expect(result.modified).toBe(true)
    })
  })
})
