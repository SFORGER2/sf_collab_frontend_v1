# Sidebar Toggle - Testing Guide

## How to Test the Fix

### Test 1: ERP Section Navigation
1. Open the sidebar
2. Click on "ERP" to expand it
3. Click on "Tasks" subitem
4. **Expected Result**: ERP section stays expanded, you navigate to Tasks page
5. **Bug if**: ERP section collapses after clicking Tasks

### Test 2: My Startups Section Navigation (Builder Role)
1. Switch to Builder role
2. Click on "My Startups" to expand it
3. Click on "My Applications" subitem
4. **Expected Result**: My Startups section stays expanded
5. Click on "My Work" subitem
6. **Expected Result**: My Startups section still stays expanded
7. **Bug if**: My Startups collapses when navigating between subitems

### Test 3: Vision Section Manual Toggle Persistence
1. Click on "Vision" to expand it
2. Navigate to ERP → Tasks
3. **Expected Result**: Both Vision AND ERP sections are expanded
4. Click on Vision chevron to collapse it manually
5. Navigate to Ideation page (which is in Vision section)
6. **Expected Result**: Vision stays COLLAPSED (respects your manual close)
7. **Bug if**: Vision auto-expands when you visit Ideation

### Test 4: Multiple Sections Open Simultaneously
1. Expand "Vision" section
2. Expand "ERP" section
3. Expand "My Startups" section
4. Navigate between different pages
5. **Expected Result**: All three sections stay expanded
6. **Bug if**: Opening one section closes another

### Test 5: Role-Specific Links
1. Switch between roles (Member → Builder → Founder)
2. Notice different sidebar items for each role
3. Navigate within role-specific sections
4. **Expected Result**: Correct section stays expanded for each role
5. **Bug if**: Wrong section expands or sections collapse unexpectedly

## Debug Console Commands

If you need to debug, open browser console and run:

```javascript
// Check current expanded items
console.log('Expanded Items:', document.querySelector('.sidebar')?.__reactFiber$?.return?.memoizedState);

// Check which items user has manually toggled
console.log('User Toggled Items:', /* tracked in component state */);

// Check current context ID
console.log('Current Context:', window.location.pathname);
```

## Common Issues and Solutions

### Issue: Section collapses when clicking subitem
**Cause**: `getCurrentContext` returning wrong ID
**Check**: Look at browser console for context ID changes
**Fix**: Verify route is properly defined in links configuration

### Issue: Manual toggle not persisting
**Cause**: `userToggledItems` not being tracked
**Check**: Verify toggleExpand function is being called
**Fix**: Ensure chevron onClick calls toggleExpand

### Issue: Multiple sections closing unexpectedly
**Cause**: Auto-expand logic overwriting expandedItems
**Check**: Verify prevContextIdRef is preventing re-triggers
**Fix**: Ensure useEffect dependencies are correct

## Route Mapping Reference

### General Member Routes
- Dashboard (id: 1): `/dashboard`
- Startups (id: 3): `/discover-startups`, `/my-startups`, `/register-startup`, `/saved-startups`
- Vision (id: 4): `/ideation`, `/saved-ideas`, `/knowledge`, `/newsletter`
- ERP (id: 5): `/erp/execution`, `/erp/tasks`, `/erp/warnings`, `/erp/admin-settings`
- Social (id: 6): `/posts`, `/connections`, `/discover-users`
- Learning (id: 7): `/knowledge`, `/mentors`, `/mentor-dashboard`, `/my-mentorship-requests`, `/newsletter`
- AI Tools (id: 8): `/ai-dashboard`, `/logo-generator`, `/business-plan`, etc.
- Tools (id: 9): `/tools-dashboard`, `/calculator`, `/pdf-signing`, `/notes`
- Wallet (id: 10): `/wallet`, `/store`, `/leaderboard`, `/marketplace`

### Builder-Specific Routes
- My Startups (id: 5): `/builder/my-startups`, `/builder/my-applications`, `/builder/my-work`, `/invitations`
- ERP (id: 11): All `/erp/*` routes

### Founder-Specific Routes
- Manage (id: 4): `/founder/my-applications`, `/founder/my-team`, `/founder/manage-tasks`
- ERP (id: 11): All `/erp/*` routes

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Smooth navigation experience
✅ User preferences respected
✅ Multiple sections can be open
✅ No unexpected collapses
