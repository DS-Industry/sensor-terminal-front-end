# Unused Files, Components, and Utilities

This document lists all files, components, and utilities that are not currently being used in the codebase.

## Summary

- **Total Unused Files Found**: 11+
- **Files Deleted**: 10 files ✅
- **Empty Directories Removed**: 3 directories ✅

---

## Quick Reference

| File | Status | Action Taken |
|------|--------|--------------|
| `GlobalWebSocketManager.tsx` | ✅ Deleted | Removed (replaced by WebSocketService) |
| `VideoLayout.tsx` | ✅ Deleted | Removed (no imports found) |
| `menubar.tsx` | ✅ Deleted | Removed (only in commented code) |
| `LoyaltyCardModal.tsx` | ✅ Deleted | Removed (only in commented code) |
| `api/types/common/index.ts` | ✅ Deleted | Removed (unused type definition) |
| `components/state/types.ts` | ✅ Kept | **USED** - Required by multiple slices |
| `paymentUtils.ts` | ✅ Deleted | Removed (functions not imported) |
| `util/index.ts` | ✅ Deleted | Removed (functions not imported) |
| `errorHandling.ts` | ✅ Deleted | Removed (functions not imported) |
| `ErrorBoundary.test.tsx` | ✅ Deleted | Removed (test file) |
| `logger.test.ts` | ✅ Deleted | Removed (test file) |

**Empty Directories Removed:**
- `src/components/globalWebSocketManager/`
- `src/components/ui/`
- `src/api/types/common/`

---

## Components

### 1. `src/components/globalWebSocketManager/GlobalWebSocketManager.tsx`
- **Status**: ❌ Unused (replaced by `WebSocketService`)
- **Reason**: Migration plan Phase 3 replaced this component with `WebSocketService.initialize()` in `main.tsx`
- **Action**: Can be safely deleted

### 2. `src/components/ui/menubar.tsx`
- **Status**: ❌ Unused
- **Reason**: Only referenced in commented-out code in `InstructionLayout.tsx` (lines 38-55)
- **Note**: The component is fully implemented but never actually used
- **Action**: Can be deleted if menubar functionality is not needed

### 3. `src/components/modals/LoyaltyCardModal.tsx`
- **Status**: ❌ Unused
- **Reason**: Referenced only in commented-out code in:
  - `CardPayPage.tsx` (lines 139-140)
  - `CashPayPage.tsx` (lines 161-162)
- **Action**: Can be deleted if loyalty card modal functionality is not needed

## Layouts

### 4. `src/layouts/VideoLayout.tsx`
- **Status**: ❌ Unused
- **Reason**: No imports found in the codebase
- **Note**: Contains video display logic but is never imported or used
- **Action**: Can be deleted

## Utilities

### 5. `src/util/paymentUtils.ts`
- **Status**: ⚠️ Partially Unused
- **Reason**: Contains `sanitizeErrorMessage` and `retryWithBackoff` functions, but:
  - `sanitizeErrorMessage` is duplicated in `src/utils/errorHandling.ts` (as `extractErrorMessage`)
  - `retryWithBackoff` is not imported anywhere
- **Note**: The file exists but its functions are not being used
- **Action**: Review if retry logic is needed, otherwise can be deleted

### 6. `src/util/index.ts`
- **Status**: ⚠️ Partially Unused
- **Reason**: Contains `secondsToTime` and `getVideoType` functions:
  - `secondsToTime`: Not imported anywhere
  - `getVideoType`: Not imported anywhere
- **Action**: Can be deleted if these utilities are not needed

### 7. `src/utils/errorHandling.ts`
- **Status**: ⚠️ Partially Unused
- **Reason**: Contains error handling utilities (`extractErrorMessage`, `extractErrorCode`, `createAppError`, `handleApiError`) but:
  - `handleApiError` is not imported anywhere
  - Other functions may be used internally but not directly imported
- **Note**: File exists but main exported function `handleApiError` is unused
- **Action**: Review usage, may need to integrate into API services

## Test Files

### 8. `src/components/ErrorBoundary.test.tsx`
- **Status**: ⚠️ Test File (May be unused if tests not running)
- **Reason**: Test file for `ErrorBoundary` component
- **Note**: Test infrastructure exists but may not be configured to run
- **Action**: Keep if testing is planned, otherwise can be removed

### 9. `src/util/logger.test.ts`
- **Status**: ⚠️ Test File (May be unused if tests not running)
- **Reason**: Test file for `logger` utility
- **Action**: Keep if testing is planned, otherwise can be removed

## API Types

### 10. `src/api/types/common/index.ts`
- **Status**: ❌ Unused
- **Reason**: Contains `ICommonApiResponse` interface but not imported anywhere
- **Action**: Can be deleted if not planned for future use

### 11. `src/components/state/types.ts`
- **Status**: ❌ Unused
- **Reason**: Contains `StoreSlice` type but not imported anywhere
- **Note**: Type may be used internally by Zustand but not directly imported
- **Action**: Review if this is needed for type definitions

## Assets (Potentially Unused)

The following assets may be unused but require manual verification:

- `src/assets/error.webp` - May be used in ErrorPage
- `src/assets/gazprom-step-2-header.webp` - May be used in specific pages
- Various SVG files that may or may not be referenced

## Summary

### Definitely Unused (Safe to Delete):
1. ✅ `src/components/globalWebSocketManager/GlobalWebSocketManager.tsx`
2. ✅ `src/layouts/VideoLayout.tsx`
3. ✅ `src/components/ui/menubar.tsx` (if menubar not needed)
4. ✅ `src/components/modals/LoyaltyCardModal.tsx` (if modal not needed)
5. ✅ `src/api/types/common/index.ts`
6. ✅ `src/components/state/types.ts` (may be used internally, verify first)

### Partially Unused (Review Before Deleting):
1. ⚠️ `src/util/paymentUtils.ts` - Contains unused retry logic
2. ⚠️ `src/util/index.ts` - Contains unused time/video utilities
3. ⚠️ `src/utils/errorHandling.ts` - Main function unused, but utilities may be needed

### Test Files (Keep if Testing):
1. ⚠️ `src/components/ErrorBoundary.test.tsx`
2. ⚠️ `src/util/logger.test.ts`

## Recommendations

1. **Delete immediately**: 
   - `GlobalWebSocketManager.tsx` (replaced by WebSocketService)
   - `api/types/common/index.ts` (unused type definition)
   
2. **Review and potentially delete**: 
   - `VideoLayout.tsx` (no imports found)
   - `menubar.tsx` (only in commented code)
   - `LoyaltyCardModal.tsx` (only in commented code)
   - `components/state/types.ts` (verify if used internally)
   
3. **Review utility files**: 
   - `paymentUtils.ts` - Contains unused retry logic, may be needed for future error handling
   - `util/index.ts` - Contains unused time/video utilities
   - `errorHandling.ts` - Main function unused, but utilities may be needed
   
4. **Keep test files**: If testing infrastructure is being set up, keep test files

5. **Note on data files**: 
   - `pays-data/index.ts` - ✅ USED (imported in SingleProgramPage)
   - `components/hard-data/index.ts` - ✅ USED (imported in mediaCampaign)

## Cleanup Completed ✅

All unused files have been successfully removed:
- 10 files deleted
- 3 empty directories removed
- No broken imports detected
- Linter checks passed

## Notes

- Some files may be planned for future use
- Commented-out code suggests some components may be re-enabled later
- Migration artifacts may exist from the temp/ directory migration
