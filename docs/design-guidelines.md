# Design Guidelines - Clean Flat Design

**Last Updated:** 2025-12-05
**Design System:** Clean Flat Design
**Status:** ✅ Active

## Overview

Simplified dashboard UI with clean flat design principles. Removed heavy animated gradients in favor of subtle, professional aesthetic matching modern SaaS applications.

## Design Philosophy

**Core Concept:** Clean, minimal, professional interface with subtle shadows and selective color accents.

**Visual Direction:** Inspired by modern SaaS platforms (like DataPulse) - light backgrounds, white cards, minimal decoration, clear hierarchy.

## Color Palette

### Background
- Primary: `linear-gradient(to bottom, #f8f9fc 0%, #eef1f7 100%)`
- Light gray gradient for subtle depth without distraction

### Cards & Surfaces
- White: `#ffffff`
- Border: `#e5e7eb` (gray-200)
- Hover border: `#d1d5db` (gray-300)

### Text Colors
- Primary: `#111827` (gray-900)
- Secondary: `#374151` (gray-700)
- Muted: `#6b7280` (gray-500)

### Accent Colors
- Primary CTA: `#10b981` (green-500)
- Primary Hover: `#059669` (green-600)
- Link/Active: `#6366f1` (indigo-500)
- Focus Ring: `rgba(99, 102, 241, 0.1)`

### Status Colors
- Success/Paid: Background `#d1fae5`, Text `#065f46`
- Warning/Medium: Background `#fef3c7`, Text `#92400e`
- Error/Unpaid: Background `#fee2e2`, Text `#991b1b`

### Stat Card Borders
- Purple: `#6366f1`
- Blue: `#3b82f6`
- Green: `#10b981`
- Red: `#ef4444`

## Typography

### Fonts
- Primary: Inter (400, 500, 600, 700, 800, 900)
- Fallback: system-ui stack

### Headings
- Font weight: 800
- Color: #111827
- Letter spacing: -0.02em

### Body Text
- Regular: #374151
- Muted: #6b7280

### Labels
- Uppercase, tracking-wider
- Font size: 0.75rem
- Font weight: 700

## Components

### Cards
```css
background: white;
border: 1px solid #e5e7eb;
border-radius: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
```

### Buttons
- Default: White background, gray border
- Primary: Green (#10b981)

### Badges
- Font weight: 600
- Padding: 4px 12px
- Border radius: Full (pill shape)

### Tables
- White background
- Alternating row colors (#f9fafb)
- Clean borders (#f3f4f6)

## Shadows
- Cards: `0 2px 8px rgba(0, 0, 0, 0.06)`
- Hover: `0 4px 16px rgba(0, 0, 0, 0.08)`

## Accessibility
- WCAG 2.1 AA compliant
- Clear focus states (#6366f1)
- Reduced motion support

## Files Modified
- `/views/layout.ejs` - Core design system
- `/views/orders.ejs` - Daily orders page
- `/views/debts.ejs` - Debt overview page
- `/views/stats.ejs` - Statistics page

## Changelog

### 2025-12-05 - Complete Design Simplification
- Removed heavy animated gradient background
- Replaced with light gray gradient (#f8f9fc to #eef1f7)
- Changed all glass components to white cards
- Updated color palette to professional grays
- Simplified badge colors (green, yellow, red backgrounds)
- Removed backdrop-filter effects
- Simplified shadows (subtle, flat)
- Updated navigation to white with light border
- Changed text colors to dark grays
- Made stat card borders solid colors
- Simplified all hover effects
- Updated focus states to indigo ring
- Removed all heavy animations

### Previous Versions
See [design-251205-glassmorphism-flat-enhancement.md](design-251205-glassmorphism-flat-enhancement.md) for glassmorphism design history.
