# Compose Window Refactor Plan

## Changes Needed:

1. **Remove old state**:
   - Remove `isComposing` 
   - Remove `editingDraftId`
   
2. **Use new state**:
   - `composeWindows` array - tracks all open compose windows
   - `activeComposeId` - which window is focused
   
3. **Update ComposeWindow**:
   - Accept `windowId`, `draftId`, `isMinimized` props
   - Add minimize/maximize buttons in header
   - Handle close by removing from composeWindows array
   
4. **Add MinimizedCompose component**:
   - Shows at bottom right as small bars
   - Click to restore (set isMinimized to false)
   
5. **Render logic**:
   - Map over composeWindows
   - Show full ComposeWindow if !isMinimized
   - Show MinimizedCompose if isMinimized
   
6. **FIFO queue**:
   - When creating 5th minimized window, remove first minimized one
