# Phase 2: Remaining Component Updates

**Date**: May 5, 2026  
**Status**: 🟡 20% Complete (6/30 components)  
**Build Status**: ✅ PASSING

---

## ✅ Completed Components (6/30)

### Batch 1: Core UI Components
1. ✅ Button.tsx
2. ✅ LoadingSpinner.tsx
3. ✅ Input.tsx
4. ✅ Card.tsx
5. ✅ Badge.tsx
6. ✅ EmptyState.tsx

---

## 📋 Remaining Components (24/30)

### Batch 2: Form Component (1 component)
**File**: `app/components/tickets/TicketSubmissionForm.tsx`

**Updates Needed**:
- Use `.input` class for all text inputs and textareas
- Use `.btn` classes for buttons
- Update colors to CSS variables
- Use design system spacing

**Pattern**:
```tsx
// Before
<input className="border-2 border-gray-300 rounded-lg px-4 py-2" />

// After
<input className="input" />
```

---

### Batch 3: Widget Components (13 components)

All widgets need similar updates:
- Use `.card` class for widget containers
- Update chart colors to use CSS variables
- Use design system spacing
- Update text colors

**Files**:
1. `app/components/widgets/WidgetContainer.tsx`
2. `app/components/widgets/WidgetHeader.tsx`
3. `app/components/widgets/WidgetGrid.tsx`
4. `app/components/widgets/TicketsByStatusWidget.tsx`
5. `app/components/widgets/TicketsByTechGroupWidget.tsx`
6. `app/components/widgets/TicketsByAlertLevelWidget.tsx`
7. `app/components/widgets/TicketsByRequestTypeWidget.tsx`
8. `app/components/widgets/TicketActivityWidget.tsx`
9. `app/components/widgets/TicketsByAlertConditionWidget.tsx`
10. `app/components/widgets/TicketsByPriorityWidget.tsx`
11. `app/components/widgets/TicketsByCategoryWidget.tsx`
12. `app/components/widgets/CustomerSatisfactionWidget.tsx`
13. `app/components/widgets/TicketTrendsWidget.tsx`

**Chart Color Updates**:
```tsx
// Before
colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

// After
colors: [
  'var(--primary-600)',
  'var(--success-600)',
  'var(--warning-600)',
  'var(--error-600)'
]
```

---

### Batch 4: Layout Components (3 components)

**Files**:
1. `app/components/layout/Sidebar.tsx`
2. `app/components/layout/TopNav.tsx`
3. `app/components/layout/EnterpriseLayout.tsx`

**Updates Needed**:
- Update navigation colors to CSS variables
- Use `.glass` class for glassmorphism effects
- Update hover states
- Use design system spacing

**Sidebar Pattern**:
```tsx
// Update active link color
style={{ 
  backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
  color: isActive ? 'var(--primary-700)' : 'var(--gray-700)'
}}
```

---

### Batch 5: Modal Components (2 components)

**Files**:
1. `app/components/dashboard/WidgetConfigModal.tsx`
2. `app/components/dashboard/WidgetEditModal.tsx`

**Updates Needed**:
- Use `.btn` classes for buttons
- Use `.input` classes for inputs
- Update modal backdrop color
- Use design system shadows

**Modal Pattern**:
```tsx
// Backdrop
<div 
  className="fixed inset-0 z-50"
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
>
  {/* Modal */}
  <div 
    className="card"
    style={{ boxShadow: 'var(--shadow-2xl)' }}
  >
```

---

### Batch 6: Dashboard Components (5 components)

**Files**:
1. `app/components/dashboard/StatisticsCards.tsx` (already updated - verify)
2. `app/components/dashboard/RecentTicketsWidget.tsx`
3. `app/components/dashboard/StatsPanel.tsx`
4. `app/components/dashboard/TicketDistributionChart.tsx`
5. `app/components/dashboard/TicketList.tsx`

**Updates Needed**:
- Use `.card` class
- Update chart colors
- Use `.badge` classes for status badges
- Update text colors to CSS variables

---

## 🎯 Quick Reference: Common Patterns

### Color Variables
```tsx
// Text Colors
color: 'var(--gray-900)'  // Primary text
color: 'var(--gray-700)'  // Body text
color: 'var(--gray-600)'  // Secondary text
color: 'var(--gray-500)'  // Disabled text

// Brand Colors
color: 'var(--primary-600)'  // Primary actions
color: 'var(--success-600)'  // Success states
color: 'var(--warning-600)'  // Warnings
color: 'var(--error-600)'    // Errors

// Background Colors
backgroundColor: 'var(--gray-100)'  // Page background
backgroundColor: 'var(--gray-200)'  // Card background
backgroundColor: 'var(--primary-100)'  // Light primary
```

### Component Classes
```tsx
// Buttons
className="btn btn-primary"
className="btn btn-secondary"
className="btn btn-success"
className="btn btn-danger"

// Inputs
className="input"
className="input error"  // Error state

// Cards
className="card"

// Badges
className="badge badge-success"
className="badge badge-warning"
className="badge badge-error"
className="badge badge-info"
```

### Spacing
```tsx
// Padding
style={{ padding: 'var(--space-4)' }}  // 16px
style={{ padding: 'var(--space-6)' }}  // 24px

// Margin
style={{ margin: 'var(--space-4)' }}   // 16px
style={{ marginBottom: 'var(--space-6)' }}  // 24px

// Gap
style={{ gap: 'var(--space-3)' }}  // 12px
```

### Shadows
```tsx
style={{ boxShadow: 'var(--shadow-md)' }}  // Default card
style={{ boxShadow: 'var(--shadow-lg)' }}  // Hover state
style={{ boxShadow: 'var(--shadow-2xl)' }}  // Modal
```

---

## 🚀 Implementation Strategy

### Option 1: Batch by Type (Recommended)
Complete one batch at a time:
1. Form component (30 min)
2. Widget components (1.5 hours)
3. Layout components (45 min)
4. Modal components (30 min)
5. Dashboard components (30 min)

**Total**: ~3.5 hours

### Option 2: High-Impact First
Focus on most visible components:
1. Layout components (Sidebar, TopNav)
2. Dashboard components
3. Widget components
4. Form component
5. Modal components

### Option 3: Quick Wins
Update simplest components first:
1. Form component
2. Modal components
3. Dashboard components
4. Layout components
5. Widget components

---

## 📊 Progress Tracking

### Completion Checklist
- [x] Core UI Components (6/6) - 100%
- [ ] Form Components (0/1) - 0%
- [ ] Widget Components (0/13) - 0%
- [ ] Layout Components (0/3) - 0%
- [ ] Modal Components (0/2) - 0%
- [ ] Dashboard Components (0/5) - 0%

**Overall**: 6/30 (20%)

---

## 🎓 Tips for Remaining Work

1. **Use Find & Replace**: Search for hardcoded colors and replace with CSS variables
2. **Test Incrementally**: Build after each batch to catch errors early
3. **Follow Patterns**: Use the 6 completed components as reference
4. **Check Documentation**: Refer to `docs/DESIGN_SYSTEM.md` for token names
5. **Maintain Consistency**: Use the same patterns across similar components

---

## 📚 Resources

- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Globals CSS**: `app/globals.css`
- **Completed Examples**: `app/components/ui/` (Button, Input, Card, Badge, EmptyState, LoadingSpinner)
- **Phase 1 Summary**: `docs/PHASE_1_COMPLETION_SUMMARY.md`
- **Phase 2 Progress**: `docs/PHASE_2_PROGRESS.md`

---

## 🐛 Common Issues & Solutions

### Issue: Tailwind classes not working
**Solution**: Use CSS variables with inline styles instead
```tsx
// Instead of: className="text-blue-600"
// Use: style={{ color: 'var(--primary-600)' }}
```

### Issue: TypeScript errors with CSS variables
**Solution**: Use bracket notation for Tailwind arbitrary values
```tsx
// Instead of: className="text-[var(--primary-600)]"
// Use: style={{ color: 'var(--primary-600)' }}
```

### Issue: Build errors after updates
**Solution**: Check for:
- Missing imports
- Incorrect prop types
- Syntax errors in JSX

---

## ✅ Success Criteria

Phase 2 is complete when:
- [ ] All 30 components updated
- [ ] Build passes without errors
- [ ] All colors use CSS variables
- [ ] All component classes used where applicable
- [ ] Visual consistency verified
- [ ] No TypeScript errors

---

**Last Updated**: May 5, 2026 17:05 UTC  
**Next Batch**: TicketSubmissionForm (Batch 2)
