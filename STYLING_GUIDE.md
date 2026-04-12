# ITSM Styling & Animation Guide

## Overview
This ITSM project uses **Tailwind CSS** with CSS custom properties (variables) for theming, providing a modern, themeable design system with support for dark mode. Components follow a **shadcn-style architecture** with CVA (Class Variance Authority) for composable variant-based styling.

---

## 1. CSS Framework: Tailwind CSS + CSS Variables

### Why This Approach?
- **Utility-first flexibility** with Tailwind CSS
- **Easy theming** via CSS custom properties (no build-time theme switching)
- **Dark mode support** via class-based dark mode strategy
- **Type-safe component variants** using CVA library

### Configuration Files
- **`tailwind.config.js`**: Extended theme with custom colors, shadows, fonts, spacing, z-index
- **`src/styles/tailwind.css`**: Base layer CSS variables definitions for light theme
- **`postcss.config.js`**: PostCSS with Tailwind nesting support

### Theme Variables Location
All color, font, shadow, and spacing values are defined in `src/styles/tailwind.css` under the `:root` selector:

```css
:root {
  /* Core Colors */
  --color-background: #FAFAFA;
  --color-foreground: #1F2937;
  --color-card: #FFFFFF;
  /* ... more variables ... */
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
  
  /* Border Radius */
  --radius: 0.5rem;
}
```

---

## 2. Color System

### Primary Color Palette

| Role | Hex Color | Usage |
|------|-----------|-------|
| **Primary** | `#005051` (Deep Teal-Green) | Main actions, highlights, focus states |
| **Primary Foreground** | `#FFFFFF` | Text on primary backgrounds |
| **Secondary** | `#2563EB` (Clear Blue) | Alternative actions, secondary CTAs |
| **Accent** | `#0891B2` (Bright Cyan) | Hover states, highlights |
| **Background** | `#FAFAFA` (Warm Off-White) | Page background |
| **Foreground** | `#1F2937` (Deep Charcoal) | Primary text color |

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| **Success** | Forest Green | `#059669` | Successful actions, positive feedback |
| **Warning** | Amber Orange | `#D97706` | Warnings, attention needed |
| **Error/Destructive** | Strong Red | `#DC2626` | Errors, deletions, critical alerts |

### UI Surface Colors

| Element | Color | Hex |
|---------|-------|-----|
| **Card** | Pure White | `#FFFFFF` |
| **Input** | Pure White | `#FFFFFF` |
| **Popover** | Pure White | `#FFFFFF` |
| **Muted** | Light Gray | `#F3F4F6` |
| **Border** | Light Gray | `#E5E7EB` |
| **Muted Foreground** | Medium Gray | `#6B7280` |

### CSS Implementation
All colors in components reference CSS custom properties:

```jsx
// Example from Button.jsx
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}
```

---

## 3. Typography System

### Font Families

```css
--font-heading: 'Inter', sans-serif      /* Headlines */
--font-body: 'Inter', sans-serif         /* Body text */
--font-caption: 'Inter', sans-serif      /* Captions/labels */
--font-data: 'JetBrains Mono', monospace /* Code, data display */
```

### Font Weights Available
- Regular: 400
- Medium: 500
- Semi-Bold: 600

### Font Sources
- **Inter**: Google Fonts (imported in `tailwind.css`)
- **JetBrains Mono**: Google Fonts (imported in `tailwind.css`)

---

## 4. Shadow & Elevation System

### Shadow Definitions

| Layer | CSS Value | Usage |
|-------|-----------|-------|
| **sm** (operations) | `0 1px 3px rgba(0, 0, 0, 0.1)` | Card hover, subtle elevation |
| **md** | `0 4px 6px rgba(0, 0, 0, 0.1)` | Popovers, dropdowns |
| **lg** (critical) | `0 10px 25px rgba(0, 0, 0, 0.15)` | Modals, important surfaces |

### Shadow Classes
```css
.operations-shadow { box-shadow: var(--shadow-sm); }
.critical-shadow   { box-shadow: var(--shadow-lg); }
```

### Usage in Components
```jsx
// DashboardCard uses shadow-sm by default
<div className={cn('rounded-lg p-4 shadow-sm', className)}>
  {/* content */}
</div>

// ChatbotWidget uses shadow-2xl for modal
<div className="fixed bottom-24 right-6 w-96 h-[600px] 
               bg-card rounded-lg shadow-2xl border border-border">
  {/* modal content */}
</div>
```

---

## 5. Border & Spacing System

### Border Radius
```
--radius: 0.5rem (8px - base value)
lg: calc(var(--radius))        /* 8px - primary */
md: calc(var(--radius) - 2px)  /* 6px - secondary */
sm: calc(var(--radius) - 4px)  /* 4px - smaller */
```

### Spacing Scale
Uses standard Tailwind spacing (4px base unit) with custom additions:
- `18`: 4.5rem (72px)
- `88`: 22rem (352px)

### Border Implementation
- **Default border color**: `var(--color-border)` (#E5E7EB)
- **Applied globally**: All elements get `@apply border-border` in base layer
- **Input/Form borders**: Border on focus becomes `focus-visible:ring-2 focus-visible:ring-ring`

---

## 6. Animation & Transition Patterns

### Available Animation Classes

#### Tailwind Built-in Animations
```jsx
// Spinning loader
<svg className="animate-spin -ml-1 mr-2 h-4 w-4" />

// Bouncing indicator
<div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />

// Pulsing indicator (like loading cursor)
<span className="inline-block w-1.5 h-3 bg-primary animate-pulse" />

// Slide-in animation with reveal
<div className="animate-in slide-in-from-bottom-4 duration-200" />
```

#### Custom Transition Classes (from `tailwind.css`)

```css
.nav-transition {
  @apply transition-all duration-250 ease-out;
}
/* Usage: Navigation items, submenu reveals, dropdowns */

.micro-interaction {
  @apply transition-all duration-150 ease-in-out;
}
/* Usage: Button hover/focus, input focus, quick state changes */

.spring-animation {
  transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Usage: Bouncy/playful animations (if needed) */
```

#### Standard Transitions Used in Components
```jsx
// Button hover states
transition-colors focus-visible:outline-none focus-visible:ring-2

// Form inputs
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2

// Interactive elements
hover:bg-accent hover:text-accent-foreground transition-colors

// Hover scale
hover:shadow-xl transition-all duration-200 hover:scale-110  /* Chatbot button */
```

### Animation Configuration (Tailwind Config)

```javascript
transitionDuration: {
  '150': '150ms',  /* micro-interactions */
  '250': '250ms',  /* nav transitions */
},

transitionTimingFunction: {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
},
```

### Animation Libraries

#### Framer Motion
- **Installed**: Yes (`framer-motion: ^10.16.4`)
- **Currently Used**: Minimal - available for future advanced animations
- **Use Case**: Complex staggered animations, gesture-driven interactions, page transitions

#### Tailwind CSS Animate Plugin
- **Plugin**: `tailwindcss-animate: ^1.0.7`
- **Currently Used**: Yes - for slide-in, fade, bounce animations
- **Classes**: `animate-in`, `animate-out`, `slide-in-*`, `fade-*`, etc.

---

## 7. Component Design Patterns

### Button Component Pattern (CVA-based)

**File**: `src/components/ui/Button.jsx`

```javascript
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        danger: "bg-error text-error-foreground hover:bg-error/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 rounded-md px-2 text-xs",
        sm: "h-9 rounded-md px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
  }
);
```

**Features**:
- Multiple semantic variants (success, warning, danger patterns)
- Multiple size options with responsive padding
- Automatic icon sizing based on button size
- Loading state with spinner animation
- Support for icon + label combinations

### Form Input Pattern

**File**: `src/components/ui/Input.jsx`

```jsx
<div className="space-y-2">
  <label className="text-sm font-medium leading-none">
    {label}
    {required && <span className="text-destructive ml-1">*</span>}
  </label>
  <input
    className="flex h-10 w-full rounded-md border border-input bg-background 
               px-3 py-2 text-sm ring-offset-background
               focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-ring focus-visible:ring-offset-2"
  />
  {error && <p className="text-sm font-medium text-destructive">{error}</p>}
</div>
```

**Patterns**:
- Consistent height (h-10)
- Rounded borders with light gray (#E5E7EB)
- Clear focus ring with deep teal
- Ring offset for focus state
- Error message styling in red
- Helper text in muted foreground

### Card Component Pattern

**File**: `src/components/ui/DashboardCard.jsx`

```jsx
<div className='rounded-lg p-4 shadow-sm'
     style={{ 
       backgroundColor: '#ffffff', 
       borderLeft: '6px solid #006853'  /* accent left border */
     }}>
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 text-2xl font-bold" style={{ color: '#005051' }}>
        {value}
      </div>
    </div>
  </div>
</div>
```

**Patterns**:
- White card background
- Subtle shadow (shadow-sm)
- Rounded corners (lg)
- 4px left border accent in primary color
- Clear hierarchy: title > large value > subtitle
- Flex layout for content distribution

### Select/Dropdown Pattern

**File**: `src/components/ui/Select.jsx`

- Full-featured select with search, clear, and multi-select support
- Uses Lucide icons (ChevronDown, Check, Search, X)
- Custom styling with Radix UI patterns
- Keyboard accessibility built-in
- Filter options dynamically based on search term

---

## 8. Focus & Accessibility Patterns

### Focus Ring Pattern
All interactive elements use a consistent pattern:

```css
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring              /* deep teal #005051 */
focus-visible:ring-offset-2          /* white offset */
```

### Error States

```css
error && "border-destructive focus-visible:ring-destructive"
error ? "text-destructive" : "text-foreground"
```

---

## 9. Dark Mode Support

**Strategy**: Class-based dark mode via Tailwind

```javascript
// tailwind.config.js
darkMode: ["class"]
```

To enable dark mode:
1. Add `dark` class to root element
2. Tailwind automatically provides dark variant classes
3. CSS variables in `:root` can be overridden in `@media (prefers-color-scheme: dark)` or `.dark {}` selector

**Current Status**: Framework in place but dark theme colors not yet defined in `tailwind.css`

---

## 10. Key Dependencies

### Animation & Styling Libraries
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.x | Utility CSS framework |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities (slide-in, fade, etc.) |
| `framer-motion` | ^10.16.4 | Advanced animations (currently unused) |
| `class-variance-authority` | ^0.7.1 | CVA for component variants |
| `tailwind-merge` | ^3.3.1 | Merge Tailwind classes without conflicts |
| `clsx` | ^2.1.1 | Conditional class joining |
| `lucide-react` | ^0.484.0 | Icon library |

### UI & Form Handling
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-slot` | ^1.2.3 | Polymorphic component support |
| `@tailwindcss/forms` | ^0.5.7 | Better form input styling |
| `react-hook-form` | ^7.55.0 | Efficient form state management |

---

## 11. Best Practices & Conventions

### Use CSS Variables for Theming
✅ **DO**: `bg-primary`, `text-foreground`, `border-border`

❌ **DON'T**: Hard-coded hex colors like `bg-[#005051]`

### Use Semantic Color Names
✅ **DO**: `bg-destructive`, `bg-success`, `bg-warning`

❌ **DON'T**: `bg-red-600`, `bg-green-600`, `bg-yellow-600`

### Animation Duration Conventions
- **150ms**: Micro-interactions (hover, focus)
- **250ms**: Navigation transitions, menu reveals
- **300-500ms**: Page transitions (use Framer Motion)

### Shadow Elevation Hierarchy
- **shadow-sm**: Cards, subtle elevation
- **shadow-md**: Popovers, dropdowns
- **shadow-lg/shadow-2xl**: Modals, critical surfaces

### Spacing & Padding Conventions
- **p-4**: Standard card/container padding
- **space-y-2**: Standard vertical spacing between form elements
- **gap-2, gap-4**: Standard gaps in flex containers

---

## 12. Color Usage Examples

### Primary Actions
```jsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Create Ticket
</button>
```

### Secondary Actions
```jsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  View Details
</button>
```

### Status Badges
```jsx
<div className="bg-success text-success-foreground px-3 py-1 rounded">
  Resolved
</div>
```

### Destructive Actions
```jsx
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>
```

### Ghost/Outline Buttons
```jsx
<button className="border border-input hover:bg-accent hover:text-accent-foreground">
  Cancel
</button>
```

---

## 13. Summary Table

| Aspect | Technology | Key Pattern |
|--------|-----------|------------|
| **CSS Framework** | Tailwind CSS + CSS Variables | Utility-first with themeable variables |
| **Animations** | Tailwind animate + custom transitions | 150ms micro, 250ms nav, 300-500ms page |
| **Colors** | CSS variables + semantic naming | Primary (#005051), Success, Warning, Error |
| **Components** | Shadcn style with CVA | Variant-based, composable, accessible |
| **Shadows** | 3-level system (sm, md, lg) | Consistent elevation hierarchy |
| **Typography** | Inter + JetBrains Mono | 400/500/600 weights, variable fonts |
| **Icons** | Lucide React | Consistent sizing with button variants |
| **Forms** | React Hook Form + custom inputs | Accessible, clear error states |
| **Dark Mode** | Class-based (prepared) | Not yet configured |

