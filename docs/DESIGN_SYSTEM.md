# SwiftTriage Design System Documentation

**Version**: 2.0  
**Last Updated**: May 5, 2026  
**Status**: Phase 1 Complete

---

## Overview

The SwiftTriage Design System provides a comprehensive set of design tokens, components, and guidelines to ensure consistency, accessibility, and professional quality across the entire application.

---

## 🎨 Color System

### Primary Brand Colors
Professional blues that convey trust, stability, and technology expertise.

```css
--primary-900: #0A2540  /* Deep Navy - Headers, emphasis */
--primary-800: #0D3A5F  /* Dark Blue */
--primary-700: #104E7E  /* Medium Blue */
--primary-600: #1565C0  /* Primary Blue - Main CTA, links */
--primary-500: #1976D2  /* Bright Blue - Hover states */
--primary-400: #42A5F5  /* Light Blue - Accents */
--primary-300: #90CAF9  /* Pale Blue - Backgrounds */
--primary-200: #BBDEFB  /* Very Light Blue */
--primary-100: #E3F2FD  /* Almost White Blue */
```

**Usage**:
- Primary-600: Main CTAs, primary buttons, links
- Primary-700: Button hover states, active states
- Primary-100: Light backgrounds, hover backgrounds

### Success Colors
Green palette for positive actions and success states.

```css
--success-700: #1B5E20
--success-600: #2E7D32  /* Primary success color */
--success-500: #43A047
--success-400: #66BB6A  /* Low urgency tickets */
```

**Usage**:
- Success-600: Success buttons, positive alerts
- Success-400: Low urgency indicators, completed states

### Warning Colors
Orange palette for warnings and medium-priority items.

```css
--warning-700: #E65100
--warning-600: #F57C00  /* High urgency tickets */
--warning-500: #FF9800
--warning-400: #FFA726  /* Medium urgency tickets */
```

**Usage**:
- Warning-600: High urgency indicators
- Warning-400: Medium urgency indicators, warnings

### Error Colors
Red palette for errors and critical states.

```css
--error-700: #B71C1C
--error-600: #C62828   /* Critical urgency tickets */
--error-500: #E53935   /* Error messages */
--error-400: #EF5350
```

**Usage**:
- Error-600: Critical urgency indicators
- Error-500: Error messages, destructive actions

### Neutral Grays
Comprehensive gray scale for text, borders, and backgrounds.

```css
--gray-900: #1A202C  /* Primary text */
--gray-800: #2D3748  /* Headings */
--gray-700: #4A5568  /* Body text */
--gray-600: #718096  /* Secondary text */
--gray-500: #A0AEC0  /* Disabled text */
--gray-400: #CBD5E0  /* Borders */
--gray-300: #E2E8F0  /* Light borders */
--gray-200: #EDF2F7  /* Backgrounds */
--gray-100: #F7FAFC  /* Page background */
--white: #FFFFFF     /* Pure white */
```

**Usage**:
- Gray-900: Primary body text
- Gray-700: Secondary text, labels
- Gray-400: Borders, dividers
- Gray-100: Page backgrounds

---

## 📝 Typography

### Font Families

**Headings**: Inter (Google Fonts)
- Modern, professional sans-serif
- Excellent readability at all sizes
- Used by: Stripe, GitHub, Figma

**Body Text**: Open Sans (Google Fonts)
- Highly legible for long-form content
- Friendly and approachable
- Used by: WordPress, Mozilla, Google

**Monospace**: JetBrains Mono (Google Fonts)
- Code snippets, ticket IDs
- Excellent for technical content

```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Open Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale (Fluid Typography)

Responsive font sizes that scale smoothly across devices.

| Token | Min Size | Max Size | Usage |
|-------|----------|----------|-------|
| `--text-xs` | 12px | 14px | Captions, labels |
| `--text-sm` | 14px | 16px | Small text, metadata |
| `--text-base` | 16px | 18px | Body text (default) |
| `--text-lg` | 18px | 20px | Large body text |
| `--text-xl` | 20px | 24px | Subheadings |
| `--text-2xl` | 24px | 30px | Section headings |
| `--text-3xl` | 30px | 36px | Page headings |
| `--text-4xl` | 36px | 48px | Hero headings |
| `--text-5xl` | 48px | 60px | Display headings |

### Font Weights

```css
--font-normal: 400    /* Body text */
--font-medium: 500    /* Emphasis */
--font-semibold: 600  /* Subheadings, buttons */
--font-bold: 700      /* Headings */
--font-extrabold: 800 /* Strong emphasis */
--font-black: 900     /* Display text */
```

### Line Heights

```css
--leading-tight: 1.25     /* Headings */
--leading-snug: 1.375     /* Subheadings */
--leading-normal: 1.5     /* Body text (default) */
--leading-relaxed: 1.625  /* Long-form content */
--leading-loose: 2        /* Spacious layouts */
```

---

## 📏 Spacing System

8px base grid for consistent spacing throughout the application.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--space-0` | 0 | 0px | No spacing |
| `--space-1` | 0.25rem | 4px | Tight spacing |
| `--space-2` | 0.5rem | 8px | Small gaps |
| `--space-3` | 0.75rem | 12px | Input padding |
| `--space-4` | 1rem | 16px | Standard spacing |
| `--space-5` | 1.25rem | 20px | Medium spacing |
| `--space-6` | 1.5rem | 24px | Large spacing |
| `--space-8` | 2rem | 32px | Section spacing |
| `--space-10` | 2.5rem | 40px | Large sections |
| `--space-12` | 3rem | 48px | Major sections |
| `--space-16` | 4rem | 64px | Page sections |
| `--space-20` | 5rem | 80px | Hero sections |
| `--space-24` | 6rem | 96px | Large hero sections |

---

## 🔲 Border Radius

Consistent corner rounding for visual hierarchy.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--radius-sm` | 0.25rem | 4px | Small elements |
| `--radius-md` | 0.375rem | 6px | Badges, tags |
| `--radius-lg` | 0.5rem | 8px | Buttons, inputs |
| `--radius-xl` | 0.75rem | 12px | Cards, modals |
| `--radius-2xl` | 1rem | 16px | Large cards |
| `--radius-3xl` | 1.5rem | 24px | Hero sections |
| `--radius-full` | 9999px | Full | Pills, avatars |

---

## 🌑 Shadow System

Elevation levels for depth and hierarchy.

| Token | Usage | Example |
|-------|-------|---------|
| `--shadow-xs` | Subtle borders | Dividers |
| `--shadow-sm` | Slight elevation | Hover states |
| `--shadow-md` | Standard cards | Default cards |
| `--shadow-lg` | Elevated cards | Hover cards |
| `--shadow-xl` | Modals | Dialogs |
| `--shadow-2xl` | Popovers | Dropdowns |
| `--shadow-inner` | Inset elements | Pressed buttons |

**Examples**:
```css
/* Standard card */
box-shadow: var(--shadow-md);

/* Hover state */
box-shadow: var(--shadow-lg);

/* Modal */
box-shadow: var(--shadow-2xl);
```

---

## ⚡ Transitions

Smooth, consistent animations.

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--transition-fast` | 150ms | ease-in-out | Quick interactions |
| `--transition-base` | 200ms | ease-in-out | Standard (default) |
| `--transition-slow` | 300ms | ease-in-out | Complex animations |
| `--transition-slower` | 500ms | ease-in-out | Page transitions |

**Usage**:
```css
/* Button hover */
transition: all var(--transition-base);

/* Modal fade in */
transition: opacity var(--transition-slow);
```

---

## 🎯 Component Classes

### Buttons

Pre-built button styles for common use cases.

```html
<!-- Primary Button -->
<button class="btn btn-primary">Submit Ticket</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancel</button>

<!-- Success Button -->
<button class="btn btn-success">Approve</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>
```

**States**:
- Default: Gradient background with shadow
- Hover: Lift effect (translateY -1px)
- Active: Press effect (translateY 0)
- Disabled: 50% opacity, no pointer events

### Cards

```html
<div class="card">
  <div class="p-6">
    <!-- Card content -->
  </div>
</div>
```

**Features**:
- White background
- Medium shadow (--shadow-md)
- Hover: Lift effect + larger shadow
- Border radius: --radius-xl

### Inputs

```html
<input type="text" class="input" placeholder="Enter text..." />

<!-- Error state -->
<input type="text" class="input error" />
```

**States**:
- Default: Gray border
- Hover: Darker border
- Focus: Primary border + focus ring
- Error: Red border + red focus ring

### Badges

```html
<span class="badge badge-success">Completed</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Critical</span>
<span class="badge badge-info">Info</span>
```

---

## 🎨 Utility Classes

### Glassmorphism

```html
<div class="glass">
  <!-- Frosted glass effect -->
</div>
```

### Gradient Text

```html
<h1 class="gradient-text">SwiftTriage</h1>
```

### Hide Scrollbar

```html
<div class="hide-scrollbar overflow-auto">
  <!-- Content with hidden scrollbar -->
</div>
```

---

## ♿ Accessibility

### Focus States

All interactive elements have visible focus indicators:
- 2px solid outline in primary-600
- 2px offset for clarity
- Rounded corners for consistency

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Screen Reader Support

- Semantic HTML elements
- ARIA labels where needed
- Proper heading hierarchy
- Alt text for images

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Fluid Typography

All text sizes use `clamp()` for smooth scaling:
```css
font-size: clamp(min, preferred, max);
```

---

## 🚀 Usage Examples

### Hero Section

```html
<section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
  <div class="container mx-auto px-6">
    <h1 class="text-5xl font-black mb-4">AI-Powered IT Support</h1>
    <p class="text-xl mb-8">That Never Sleeps</p>
    <button class="btn btn-primary">Get Started</button>
  </div>
</section>
```

### Card with Shadow

```html
<div class="card p-6 hover:shadow-lg transition-all">
  <h3 class="text-2xl font-bold mb-4">Recent Tickets</h3>
  <p class="text-gray-700">View your latest support requests</p>
</div>
```

### Form Input

```html
<div class="mb-4">
  <label class="block text-sm font-semibold mb-2">Email</label>
  <input 
    type="email" 
    class="input" 
    placeholder="you@example.com"
  />
</div>
```

---

## 📦 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Color system defined
- [x] Typography system implemented
- [x] Spacing scale established
- [x] Shadow system created
- [x] Transition system defined
- [x] Component classes built
- [x] Utility classes added
- [x] Accessibility features included

### Phase 2: Components (Next)
- [ ] Update all buttons to use new classes
- [ ] Refactor cards with new styles
- [ ] Update form inputs
- [ ] Implement badges consistently
- [ ] Add loading states
- [ ] Create empty states

### Phase 3: Pages (Future)
- [ ] Redesign home page
- [ ] Update login page
- [ ] Enhance dashboard
- [ ] Improve ticket submission
- [ ] Create ticket detail page

---

## 🎓 Best Practices

1. **Use Design Tokens**: Always use CSS variables instead of hardcoded values
2. **Maintain Consistency**: Stick to the defined spacing scale
3. **Test Accessibility**: Check color contrast and keyboard navigation
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Performance**: Minimize custom CSS, leverage utility classes
6. **Documentation**: Update this guide when adding new patterns

---

## 📚 Resources

- **Figma Design File**: [Coming Soon]
- **Component Library**: [Coming Soon]
- **Style Guide**: This document
- **Accessibility Guide**: docs/ACCESSIBILITY.md (Coming Soon)

---

**Questions or Suggestions?**  
Contact the design team or open an issue in the repository.

---

**Version History**:
- v2.0 (May 5, 2026): Complete design system overhaul
- v1.0 (Initial): Basic Tailwind setup
