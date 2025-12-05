# Design Code Reference - Quick Copy-Paste Guide

**For Developers**: Quick reference for common design patterns

---

## Glass Components

### Standard Glass Card
```html
<div class="glass-card p-6">
  <!-- Content here -->
</div>
```

### Strong Glass Container (Tables)
```html
<div class="glass-strong rounded-2xl overflow-hidden">
  <!-- Table or important content -->
</div>
```

### Glass Button
```html
<button class="glass-btn px-4 py-2 rounded-xl">
  Button Text
</button>
```

### Glass Input
```html
<input type="text" class="glass-input px-4 py-2 rounded-xl" />
```

---

## Stat Cards

### Basic Stat Card
```html
<div class="glass-card p-6 stat-gradient-purple">
  <div class="flex items-center justify-between mb-4">
    <div class="stat-icon">📊</div>
    <div class="text-right">
      <div class="text-sm font-medium text-glass-muted">Label</div>
      <div class="text-3xl font-bold text-glass mt-1">Value</div>
    </div>
  </div>
</div>
```

### Gradient Classes Available
- `stat-gradient-purple` - Purple overlay
- `stat-gradient-blue` - Blue overlay
- `stat-gradient-green` - Green overlay
- `stat-gradient-red` - Red overlay

---

## Badges

### Paid Badge
```html
<span class="badge-paid px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1">
  <span>✓</span> Paid
</span>
```

### Unpaid Badge
```html
<span class="badge-unpaid px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1">
  <span>✗</span> Unpaid
</span>
```

### Debt Level Badges
```html
<!-- Low Debt -->
<span class="debt-badge-low px-4 py-2 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>✓</span> Amount
</span>

<!-- Medium Debt -->
<span class="debt-badge-medium px-4 py-2 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>⚡</span> Amount
</span>

<!-- High Debt -->
<span class="debt-badge-high px-4 py-2 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>⚠️</span> Amount
</span>
```

### Payment Rate Badges
```html
<!-- Excellent -->
<span class="rate-badge-excellent px-3 py-1.5 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>⭐</span> 80%
</span>

<!-- Good -->
<span class="rate-badge-good px-3 py-1.5 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>👍</span> 70%
</span>

<!-- Poor -->
<span class="rate-badge-poor px-3 py-1.5 text-sm font-bold rounded-full inline-flex items-center gap-2">
  <span>⚠️</span> 50%
</span>
```

---

## Tables

### Glass Table Structure
```html
<div class="glass-strong rounded-2xl overflow-hidden">
  <div class="overflow-x-auto">
    <table class="min-w-full">
      <thead>
        <tr class="border-b border-white border-opacity-20">
          <th class="px-6 py-4 text-left text-xs font-semibold text-glass-muted uppercase tracking-wider">
            Header
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="glass-table-row">
          <td class="px-6 py-4 text-sm text-glass">Cell</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Sortable Header
```html
<th class="sortable-header px-6 py-4 text-left text-xs font-semibold text-glass-muted uppercase tracking-wider"
    onclick="sortTable('column_name')">
  Header Name
</th>
```

---

## Typography

### Page Header
```html
<div class="mb-8">
  <h1 class="text-4xl sm:text-5xl font-bold text-glass mb-2">Page Title</h1>
  <p class="text-glass-muted text-lg">Subtitle or description</p>
</div>
```

### Section Header
```html
<div class="mb-6">
  <h2 class="text-3xl font-bold text-glass mb-2">Section Title</h2>
  <p class="text-glass-muted">Section description</p>
</div>
```

### Text Classes
- `text-glass` - White text with shadow (primary)
- `text-glass-muted` - Muted white text (secondary)

---

## Layouts

### Responsive Grid (Stat Cards)
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <!-- Cards here -->
</div>
```

### Flex Header with Actions
```html
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
  <div>
    <h1 class="text-4xl sm:text-5xl font-bold text-glass mb-2">Title</h1>
    <p class="text-glass-muted">Description</p>
  </div>
  <div class="flex items-center space-x-2 sm:space-x-3">
    <!-- Buttons here -->
  </div>
</div>
```

---

## Empty States

### Standard Empty State
```html
<div class="p-12 text-center">
  <div class="text-6xl mb-4">🍱</div>
  <div class="text-glass text-lg font-medium">Primary message</div>
  <div class="text-glass-muted text-sm mt-2">Secondary message</div>
</div>
```

### Success Empty State
```html
<div class="p-12 text-center">
  <div class="text-7xl mb-4 pulse-icon">🎉</div>
  <div class="text-glass text-xl font-bold mb-2">Success message</div>
  <div class="text-glass-muted text-base">Description</div>
</div>
```

---

## Icons

### Stat Icon Box
```html
<div class="stat-icon">📊</div>
```

### Recommended Icons
- 📊 Statistics/Total
- 💰 Money/Amount
- ✓ Success/Paid
- ✗ Error/Unpaid
- 🍱 Food/Orders
- 🎉 Success/Celebration
- 💸 Debt/Payment
- ⚠️ Warning
- ⚡ Medium priority
- ⭐ Excellent
- 👍 Good

---

## Custom CSS (Add to page `<style>`)

### Badge Styles
```css
/* Paid/Success Badge */
.badge-paid {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: rgb(16, 185, 129);
  backdrop-filter: blur(10px);
}

/* Unpaid/Error Badge */
.badge-unpaid {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.25) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: rgb(239, 68, 68);
  backdrop-filter: blur(10px);
}
```

### Stat Card Gradients
```css
.stat-gradient-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%);
}

.stat-gradient-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
}

.stat-gradient-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
}

.stat-gradient-red {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
}
```

### Table Row Styles
```css
.glass-table-row {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glass-table-row:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.01);
}
```

### Icon Box
```css
.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

### Pulse Animation
```css
@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pulse-icon {
  animation: iconPulse 2s ease-in-out infinite;
}
```

---

## JavaScript Patterns

### Format VND Currency
```javascript
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
```

### Render Badge with Logic
```javascript
// Paid/Unpaid
const badge = order.paid
  ? '<span class="badge-paid px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>✓</span> Paid</span>'
  : '<span class="badge-unpaid px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>✗</span> Unpaid</span>';

// Debt Level
let badgeClass = 'debt-badge-low';
let icon = '✓';
if (debt > 100000) {
  badgeClass = 'debt-badge-high';
  icon = '⚠️';
} else if (debt > 50000) {
  badgeClass = 'debt-badge-medium';
  icon = '⚡';
}

// Payment Rate
let rateClass = 'rate-badge-excellent';
let icon = '⭐';
if (rate < 80) {
  rateClass = 'rate-badge-good';
  icon = '👍';
}
if (rate < 60) {
  rateClass = 'rate-badge-poor';
  icon = '⚠️';
}
```

### Table Sorting
```javascript
function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'desc';
  }

  // Update header indicators
  document.querySelectorAll('.sortable-header').forEach(header => {
    header.classList.remove('sorted-asc', 'sorted-desc');
  });

  const activeHeader = document.querySelector(`[onclick="sortTable('${column}')"]`);
  if (activeHeader) {
    activeHeader.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
  }

  renderTable();
}
```

---

## Responsive Patterns

### Responsive Text Size
```html
<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">Title</h1>
```

### Responsive Padding
```html
<div class="p-4 sm:p-6 lg:p-8">Content</div>
```

### Responsive Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Items -->
</div>
```

### Responsive Flex Direction
```html
<div class="flex flex-col sm:flex-row gap-4">
  <!-- Items -->
</div>
```

### Hide/Show on Breakpoints
```html
<!-- Hide on mobile, show on sm+ -->
<span class="hidden sm:inline">Full text</span>

<!-- Show on mobile, hide on sm+ -->
<span class="sm:hidden">Short</span>
```

---

## Common Combinations

### Action Button Group
```html
<div class="flex items-center space-x-2 sm:space-x-3">
  <button class="glass-btn px-4 py-2 rounded-xl text-sm sm:text-base">
    ← Prev
  </button>
  <input type="date" class="glass-input px-4 py-2 rounded-xl text-sm sm:text-base" />
  <button class="glass-btn px-4 py-2 rounded-xl text-sm sm:text-base">
    Next →
  </button>
</div>
```

### Stat Card with Icon + Gradient
```html
<div class="glass-card p-6 stat-gradient-blue">
  <div class="flex items-center justify-between mb-4">
    <div class="stat-icon">💰</div>
    <div class="text-right">
      <div class="text-sm font-medium text-glass-muted">Total Amount</div>
      <div class="text-3xl font-bold text-glass mt-1" id="totalAmount">-</div>
    </div>
  </div>
</div>
```

### Table Row with Badge
```html
<tr class="glass-table-row">
  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-glass">User Name</td>
  <td class="px-6 py-4 text-sm text-glass">Order Details</td>
  <td class="px-6 py-4 whitespace-nowrap">
    <span class="badge-paid px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1">
      <span>✓</span> Paid
    </span>
  </td>
</tr>
```

---

## Quick Tips

### Do's
- ✅ Use glass classes for containers
- ✅ Add gradient overlays to stat cards
- ✅ Include icons with badges
- ✅ Use responsive utilities (sm:, lg:)
- ✅ Add hover effects to interactive elements
- ✅ Use text-glass for readable white text

### Don'ts
- ❌ Stack too many glass layers
- ❌ Forget -webkit- prefix for Safari
- ❌ Use extreme opacity values
- ❌ Neglect hover/focus states
- ❌ Sacrifice readability for aesthetics
- ❌ Use color alone (always add icons/text)

---

**Quick Reference For**: Developers implementing glassmorphism design
**Based On**: `/docs/design-guidelines.md` and actual implementation
**Last Updated**: December 4, 2025
