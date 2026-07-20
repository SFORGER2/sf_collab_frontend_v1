# Accessibility Guidelines for Developers

## Overview

This document provides guidelines for ensuring accessibility (a11y) in our React application. Following these guidelines helps us achieve WCAG 2.1 Level AA compliance and create an inclusive experience for all users.

## Core Principles

1. **Semantic HTML**: Use proper HTML elements for their intended purpose
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Screen Reader Support**: Provide proper ARIA attributes and labels
4. **Visual Accessibility**: Maintain sufficient color contrast and focus indicators
5. **Testing**: Test with accessibility tools and screen readers

## Component Development Guidelines

### 1. Use Semantic Elements

**DO:**
```jsx
<button onClick={handleClick}>Submit</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
```

**DON'T:**
```jsx
<div onClick={handleClick}>Submit</div>
<div className="navigation">...</div>
<div className="main-content">...</div>
```

### 2. Form Accessibility

**Always associate labels with inputs:**
```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

**Provide error messages with aria-describedby:**
```jsx
<input 
  id="password"
  aria-invalid={hasError}
  aria-describedby={hasError ? "password-error" : undefined}
/>
{hasError && (
  <p id="password-error" className="error">Password is required</p>
)}
```

**Mark required fields:**
```jsx
<label htmlFor="name">
  Name <span aria-hidden="true">*</span>
</label>
<input 
  id="name" 
  required 
  aria-required="true" 
/>
```

### 3. Button and Link Accessibility

**Icon-only buttons need aria-label:**
```jsx
<button aria-label="Close dialog">
  <XIcon />
</button>
```

**Links should have descriptive text:**
```jsx
// Good
<a href="/about">About our company</a>

// Avoid
<a href="/about">Click here</a>
```

### 4. ARIA Attributes

**Use ARIA live regions for dynamic content:**
```jsx
<div aria-live="polite" aria-atomic="true">
  {notification && <Notification message={notification} />}
</div>
```

**Communicate state changes:**
```jsx
<button 
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
>
  Menu
</button>
```

### 5. Keyboard Navigation

**Handle keyboard events for custom components:**
```jsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  onClick={handleClick}
>
  Custom Button
</div>
```

**Implement focus trap in modals:**
```jsx
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    firstElement?.focus()
    
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }
}, [isOpen])
```

### 6. Image Accessibility

**Provide descriptive alt text:**
```jsx
<img src="logo.png" alt="Company logo" />
```

**Use empty alt for decorative images:**
```jsx
<img src="decoration.png" alt="" />
```

**Complex images need long descriptions:**
```jsx
<img 
  src="chart.png" 
  alt="Revenue growth chart showing 20% increase"
  longdesc="/charts/revenue-description.html"
/>
```

### 7. Focus Management

**Ensure visible focus indicators:**
```jsx
// Tailwind provides focus-visible utilities
<button className="focus-visible:ring-2 focus-visible:ring-blue-500">
  Click me
</button>
```

**Restore focus after closing modals:**
```jsx
const triggerRef = useRef(null)

const openModal = () => {
  triggerRef.current = document.activeElement
  setIsOpen(true)
}

const closeModal = () => {
  setIsOpen(false)
  triggerRef.current?.focus()
}
```

### 8. Heading Structure

**Maintain proper heading hierarchy:**
```jsx
// One h1 per page
<h1>Page Title</h1>

// Sequential heading levels
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Don't skip levels
// Bad: h1 → h3 (missing h2)
// Good: h1 → h2 → h3
```

## Testing Checklist

Before marking a component as complete, verify:

- [ ] Component uses semantic HTML elements
- [ ] All interactive elements are keyboard accessible
- [ ] Form inputs have associated labels
- [ ] Error messages are associated with inputs via aria-describedby
- [ ] Icon-only buttons have aria-label
- [ ] Images have appropriate alt text
- [ ] Focus indicators are visible
- [ ] Component passes eslint-plugin-jsx-a11y checks
- [ ] Component passes jest-axe tests (if applicable)

## Tools

### Linting
```bash
npm run lint
```

### Accessibility Testing
```bash
npm run test:a11y
```

### Manual Testing
- Test with keyboard only (Tab, Enter, Escape, Arrow keys)
- Test with screen reader (NVDA, JAWS, or VoiceOver)
- Check color contrast with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility Documentation](https://react.dev/learn/accessibility)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [eslint-plugin-jsx-a11y Rules](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

## Common Patterns

### Accessible Modal
```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Accessible Dropdown
```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button aria-haspopup="true" aria-expanded={isOpen}>
      Menu
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Option 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Accessible Form Field
```jsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="focus-visible:ring-2"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" className="text-sm text-red-500">
      Please enter a valid email
    </p>
  )}
</div>
```

## Getting Help

If you're unsure about accessibility implementation:
1. Check existing Radix UI components for patterns
2. Consult this document
3. Run eslint to catch common issues
4. Ask the team for guidance on complex cases
