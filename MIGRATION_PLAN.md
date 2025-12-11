# Migration Plan: Architecture Migration from temp/src to src

## Overview
This document outlines a comprehensive migration plan to adopt the improved architecture from `temp/src` into the main `src` directory. The temp project demonstrates better separation of concerns, error handling, state management, and overall code organization.

---

## Table of Contents
1. [Architecture Comparison](#architecture-comparison)
2. [Migration Phases](#migration-phases)
3. [Detailed Migration Steps](#detailed-migration-steps)
4. [Testing Strategy](#testing-strategy)
5. [Rollback Plan](#rollback-plan)

---

## Architecture Comparison

### Key Differences

| Aspect | Current (`src/`) | Target (`temp/src/`) |
|--------|------------------|----------------------|
| **State Management** | Basic Zustand slices (order, app, modal) | Enhanced with payment slice + state machine |
| **Hooks Organization** | Single `usePaymentProcessing` hook | Modular hooks in `hooks/payment/` directory |
| **WebSocket** | `util/websocketManager.ts` (direct usage) | `services/websocketService.ts` (service class) |
| **Error Handling** | Basic try-catch | Comprehensive `utils/errorHandling.ts` |
| **Navigation** | Direct `navigate()` calls | Centralized `utils/navigation.ts` |
| **Configuration** | Direct `import.meta.env` access | Validated `config/env.ts` |
| **Logging** | `console.log/error` | Structured `util/logger.ts` |
| **Payment Utils** | Basic utilities | Advanced utilities (retry, validation, locks) |
| **Constants** | Hardcoded values | Centralized `constants/payment.ts` |
| **Components** | Basic components | ErrorBoundary, PaymentGuard, AppHealthMonitor |
| **Testing** | No setup | Vitest with test utilities |
| **Pages** | CashPayPage, MobilePayPage, LoyaltyPayPage | QueueWaitingPage, WashingInProgressPage, ErrorPage |

---

## Migration Phases

### Phase 1: Foundation & Infrastructure (Low Risk)
**Goal**: Set up foundational utilities and infrastructure without changing business logic.

**Estimated Time**: 2-3 days

**Steps**:
1. Add logging utility
2. Add error handling utilities
3. Add configuration management
4. Add navigation utilities
5. Add payment constants
6. Add payment utilities

**Risk Level**: ⚠️ Low - These are additive changes that don't affect existing functionality.

---

### Phase 2: State Management Enhancement (Medium Risk)
**Goal**: Enhance state management with payment slice and state machine.

**Estimated Time**: 2-3 days

**Steps**:
1. Add payment state machine
2. Add payment slice to store
3. Update store with order expiry logic
4. Migrate existing state usage

**Risk Level**: ⚠️ Medium - Requires careful migration of existing state usage.

---

### Phase 3: Service Layer Refactoring (Medium Risk)
**Goal**: Refactor WebSocket management into a service class.

**Estimated Time**: 1-2 days

**Steps**:
1. Create WebSocketService class
2. Update main.tsx to use WebSocketService
3. Remove old GlobalWebSocketManager component
4. Update components using WebSocket

**Risk Level**: ⚠️ Medium - WebSocket is critical for real-time updates.

---

### Phase 4: Hooks Refactoring (High Risk)
**Goal**: Break down monolithic `usePaymentProcessing` into modular hooks.

**Estimated Time**: 3-4 days

**Steps**:
1. Create `hooks/payment/useOrderCreation.ts`
2. Create `hooks/payment/usePaymentWebSocket.ts`
3. Create `hooks/payment/useQueueManagement.ts`
4. Create `hooks/payment/useRobotStart.ts`
5. Create `hooks/payment/usePaymentFlow.ts`
6. Update payment pages to use new hooks
7. Remove old `usePaymentProcessing.ts`

**Risk Level**: ⚠️ High - This affects core payment flow logic.

---

### Phase 5: Component Enhancements (Low-Medium Risk)
**Goal**: Add new components and enhance existing ones.

**Estimated Time**: 2-3 days

**Steps**:
1. Add ErrorBoundary component
2. Add PaymentGuard component
3. Add AppHealthMonitor component
4. Update main.tsx to use new components
5. Remove NavigationHandler component (if replaced)

**Risk Level**: ⚠️ Low-Medium - New components add safety without breaking existing flow.

---

### Phase 6: Page Updates & New Pages (Medium Risk)
**Goal**: Update existing pages and add new pages from temp project.

**Estimated Time**: 2-3 days

**Steps**:
1. Review and update existing pages
2. Add QueueWaitingPage (if needed)
3. Add WashingInProgressPage (if needed)
4. Add ErrorPage (separate from ErrorPaymentPage)
5. Update routing in main.tsx
6. Remove unused pages (CashPayPage, MobilePayPage, LoyaltyPayPage if not needed)

**Risk Level**: ⚠️ Medium - Page changes affect user experience.

---

### Phase 7: Testing Setup (Low Risk)
**Goal**: Add testing infrastructure.

**Estimated Time**: 1-2 days

**Steps**:
1. Install Vitest and testing dependencies
2. Create test setup files
3. Create test utilities
4. Add example tests
5. Update package.json scripts

**Risk Level**: ⚠️ Low - Testing is additive.

---

### Phase 8: Cleanup & Optimization (Low Risk)
**Goal**: Remove unused code and optimize.

**Estimated Time**: 1 day

**Steps**:
1. Remove unused components
2. Remove unused utilities
3. Update imports
4. Run linter and fix issues
5. Update documentation

**Risk Level**: ⚠️ Low - Cleanup phase.

---

## Detailed Migration Steps

### Phase 1: Foundation & Infrastructure

#### Step 1.1: Add Logger Utility
**File**: `src/util/logger.ts`
- Copy from `temp/src/util/logger.ts`
- No dependencies on other new code
- Can be used immediately to replace console.log calls

**Action Items**:
- [ ] Copy `temp/src/util/logger.ts` to `src/util/logger.ts`
- [ ] Replace `console.log` calls with `logger.info/debug`
- [ ] Replace `console.error` calls with `logger.error`
- [ ] Replace `console.warn` calls with `logger.warn`

**Files to Update**:
- All files using console.log/error/warn

---

#### Step 1.2: Add Error Handling Utilities
**File**: `src/utils/errorHandling.ts`
- Copy from `temp/src/utils/errorHandling.ts`
- Depends on logger (from Step 1.1)

**Action Items**:
- [ ] Create `src/utils/` directory
- [ ] Copy `temp/src/utils/errorHandling.ts` to `src/utils/errorHandling.ts`
- [ ] Update imports to use logger from `src/util/logger.ts`
- [ ] Gradually replace error handling in API services

**Files to Update**:
- `src/api/services/payment/index.ts`
- `src/api/services/program/index.ts`
- Any components with error handling

---

#### Step 1.3: Add Configuration Management
**File**: `src/config/env.ts`
- Copy from `temp/src/config/env.ts`
- Validates environment variables at startup
- Throws errors if required vars are missing

**Action Items**:
- [ ] Create `src/config/` directory
- [ ] Copy `temp/src/config/env.ts` to `src/config/env.ts`
- [ ] Update `src/main.tsx` to import `./config/env` (before other imports)
- [ ] Update all `import.meta.env` usages to use `env` from config
- [ ] Verify all environment variables are properly set

**Files to Update**:
- `src/main.tsx` (add import)
- `src/util/websocketManager.ts` (use env.WS_URL)
- `src/api/axiosConfig/index.ts` (use env.API_URL)
- Any other files using `import.meta.env`

---

#### Step 1.4: Add Navigation Utilities
**File**: `src/utils/navigation.ts`
- Copy from `temp/src/utils/navigation.ts`
- Centralizes navigation logic with logging

**Action Items**:
- [ ] Copy `temp/src/utils/navigation.ts` to `src/utils/navigation.ts`
- [ ] Update imports to use logger
- [ ] Gradually replace direct `navigate()` calls with utility functions

**Files to Update**:
- All pages using `navigate()`
- Components with navigation logic

---

#### Step 1.5: Add Payment Constants
**File**: `src/constants/payment.ts`
- Copy from `temp/src/constants/payment.ts`
- Centralizes payment-related constants

**Action Items**:
- [ ] Create `src/constants/` directory
- [ ] Copy `temp/src/constants/payment.ts` to `src/constants/payment.ts`
- [ ] Replace hardcoded values in hooks/pages with constants

**Files to Update**:
- `src/hooks/usePaymentProcessing.ts` (replace hardcoded intervals)
- Any pages with payment-related constants

---

#### Step 1.6: Add Payment Utilities
**File**: `src/util/paymentUtils.ts`
- Copy from `temp/src/util/paymentUtils.ts`
- Provides retry logic, validation, locks, timer management

**Action Items**:
- [ ] Copy `temp/src/util/paymentUtils.ts` to `src/util/paymentUtils.ts`
- [ ] Update imports to use error handling utilities
- [ ] Gradually integrate into payment flow

**Files to Update**:
- Payment hooks (use retry logic)
- Payment pages (use validation utilities)

---

### Phase 2: State Management Enhancement

#### Step 2.1: Add Payment State Machine
**File**: `src/state/paymentStateMachine.ts`
- Copy from `temp/src/state/paymentStateMachine.ts`
- Defines payment states and valid transitions

**Action Items**:
- [ ] Create `src/state/` directory (at root level, not in components)
- [ ] Copy `temp/src/state/paymentStateMachine.ts` to `src/state/paymentStateMachine.ts`
- [ ] Review state definitions and adjust if needed

---

#### Step 2.2: Add Payment Slice
**File**: `src/components/state/payment/paymentSlice.ts`
- Copy from `temp/src/components/state/payment/paymentSlice.ts`
- Adds payment state management to Zustand store

**Action Items**:
- [ ] Create `src/components/state/payment/` directory
- [ ] Copy `temp/src/components/state/payment/paymentSlice.ts` to `src/components/state/payment/paymentSlice.ts`
- [ ] Update imports to use payment state machine from `src/state/paymentStateMachine.ts`

---

#### Step 2.3: Update Store
**File**: `src/components/state/store.ts`
- Update to include payment slice and order expiry logic

**Action Items**:
- [ ] Read current `src/components/state/store.ts`
- [ ] Read `temp/src/components/state/store.ts`
- [ ] Merge payment slice into store
- [ ] Add order expiry logic from temp version
- [ ] Update StoreState type to include PaymentSlice
- [ ] Test that existing functionality still works

**Breaking Changes**:
- Store state shape changes (adds paymentState, paymentError, etc.)
- Need to update all components using store

---

#### Step 2.4: Migrate Existing State Usage
**Action Items**:
- [ ] Search for all `useStore()` usages
- [ ] Update to use new payment state properties
- [ ] Replace manual state management with payment state machine
- [ ] Test each component after migration

**Files to Review**:
- All pages
- All hooks
- Components using store

---

### Phase 3: Service Layer Refactoring

#### Step 3.1: Create WebSocketService
**File**: `src/services/websocketService.ts`
- Copy from `temp/src/services/websocketService.ts`
- Refactors WebSocket into a service class

**Action Items**:
- [ ] Create `src/services/` directory
- [ ] Copy `temp/src/services/websocketService.ts` to `src/services/websocketService.ts`
- [ ] Update imports to use:
  - `src/util/websocketManager.ts` (globalWebSocketManager)
  - `src/components/state/store.ts` (useStore)
  - `src/util/logger.ts` (logger)
  - `src/components/state/order/orderSlice.ts` (EOrderStatus)

---

#### Step 3.2: Update main.tsx
**File**: `src/main.tsx`
- Replace GlobalWebSocketManager with WebSocketService.initialize()

**Action Items**:
- [ ] Remove `GlobalWebSocketManager` import and component
- [ ] Add `WebSocketService` import
- [ ] Call `WebSocketService.initialize()` before ReactDOM.render
- [ ] Remove `<GlobalWebSocketManager />` from Root component

**Before**:
```tsx
import { GlobalWebSocketManager } from "./components/globalWebSocketManager/GlobalWebSocketManager.tsx";

function Root() {
  return (
    <>
      <GlobalWebSocketManager />
      <Outlet />
    </>
  );
}
```

**After**:
```tsx
import { WebSocketService } from "./services/websocketService.ts";

WebSocketService.initialize();

function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
```

---

#### Step 3.3: Remove Old Component
**Action Items**:
- [ ] Delete `src/components/globalWebSocketManager/GlobalWebSocketManager.tsx`
- [ ] Verify no other files import it

---

#### Step 3.4: Update Components Using WebSocket
**Action Items**:
- [ ] Search for components directly using `globalWebSocketManager`
- [ ] Verify they work with the new service (service handles everything automatically)
- [ ] Remove any manual WebSocket setup if present

---

### Phase 4: Hooks Refactoring

#### Step 4.1: Create useOrderCreation Hook
**File**: `src/hooks/payment/useOrderCreation.ts`
- Copy from `temp/src/hooks/payment/useOrderCreation.ts`

**Action Items**:
- [ ] Create `src/hooks/payment/` directory
- [ ] Copy `temp/src/hooks/payment/useOrderCreation.ts`
- [ ] Update imports:
  - `src/api/services/payment` (createOrder)
  - `src/components/state/store.ts` (useStore)
  - `src/state/paymentStateMachine.ts` (PaymentState)
  - `src/util/logger.ts` (logger)
  - `src/api/types/program` (IProgram)

---

#### Step 4.2: Create usePaymentWebSocket Hook
**File**: `src/hooks/payment/usePaymentWebSocket.ts`
- Copy from `temp/src/hooks/payment/usePaymentWebSocket.ts`

**Action Items**:
- [ ] Copy `temp/src/hooks/payment/usePaymentWebSocket.ts`
- [ ] Update imports to match project structure
- [ ] Verify WebSocket integration works

---

#### Step 4.3: Create useQueueManagement Hook
**File**: `src/hooks/payment/useQueueManagement.ts`
- Copy from `temp/src/hooks/payment/useQueueManagement.ts`

**Action Items**:
- [ ] Copy `temp/src/hooks/payment/useQueueManagement.ts`
- [ ] Update imports
- [ ] Verify queue logic matches requirements

---

#### Step 4.4: Create useRobotStart Hook
**File**: `src/hooks/payment/useRobotStart.ts`
- Copy from `temp/src/hooks/payment/useRobotStart.ts`

**Action Items**:
- [ ] Copy `temp/src/hooks/payment/useRobotStart.ts`
- [ ] Update imports
- [ ] Verify robot start logic

---

#### Step 4.5: Create usePaymentFlow Hook
**File**: `src/hooks/payment/usePaymentFlow.ts`
- Copy from `temp/src/hooks/payment/usePaymentFlow.ts`
- This is the main hook that orchestrates other hooks

**Action Items**:
- [ ] Copy `temp/src/hooks/payment/usePaymentFlow.ts`
- [ ] Update all imports
- [ ] Verify it integrates all other payment hooks correctly

---

#### Step 4.6: Update Payment Pages
**Files**: 
- `src/pages/CardPayPage.tsx`
- `src/pages/CashPayPage.tsx` (if still used)
- `src/pages/MobilePayPage.tsx` (if still used)
- `src/pages/LoyaltyPayPage.tsx` (if still used)

**Action Items**:
- [ ] Replace `usePaymentProcessing` with `usePaymentFlow`
- [ ] Update to use new hook return values
- [ ] Update to use payment state machine states
- [ ] Test each page thoroughly

**Example Migration**:
```tsx
// Before
import { usePaymentProcessing } from '../hooks/usePaymentProcessing';

const { handleBack, paymentSuccess, ... } = usePaymentProcessing(EPaymentMethod.CARD);

// After
import { usePaymentFlow } from '../hooks/payment/usePaymentFlow';

const { handleBack, paymentSuccess, paymentState, ... } = usePaymentFlow(EPaymentMethod.CARD);
```

---

#### Step 4.7: Remove Old Hook
**Action Items**:
- [ ] Verify all pages migrated
- [ ] Delete `src/hooks/usePaymentProcessing.ts`
- [ ] Search for any remaining imports

---

### Phase 5: Component Enhancements

#### Step 5.1: Add ErrorBoundary Component
**File**: `src/components/ErrorBoundary.tsx`
- Copy from `temp/src/components/ErrorBoundary.tsx`

**Action Items**:
- [ ] Copy `temp/src/components/ErrorBoundary.tsx`
- [ ] Update imports to use `src/util/logger.ts`
- [ ] Wrap app in main.tsx with ErrorBoundary

**Update main.tsx**:
```tsx
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider theme="light">
      <Suspense fallback="...is loading">
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  </ErrorBoundary>
);
```

---

#### Step 5.2: Add PaymentGuard Component
**File**: `src/components/guards/PaymentGuard.tsx`
- Copy from `temp/src/components/guards/PaymentGuard.tsx`

**Action Items**:
- [ ] Create `src/components/guards/` directory
- [ ] Copy `temp/src/components/guards/PaymentGuard.tsx`
- [ ] Update imports:
  - `src/components/state/store.ts` (useStore)
  - `src/util/logger.ts` (logger)
- [ ] Note: Import path might need adjustment (temp uses `../state/store.ts`)

**Update main.tsx routes**:
```tsx
{
  path: "/success",
  element: (
    <PaymentGuard>
      <SuccessPaymentPage />
    </PaymentGuard>
  ),
},
```

---

#### Step 5.3: Add AppHealthMonitor Component
**File**: `src/components/appHealth/AppHealthMonitor.tsx`
- Copy from `temp/src/components/appHealth/AppHealthMonitor.tsx`

**Action Items**:
- [ ] Create `src/components/appHealth/` directory
- [ ] Copy `temp/src/components/appHealth/AppHealthMonitor.tsx`
- [ ] Update imports:
  - `src/util/logger.ts` (logger)
  - `src/config/env.ts` (getRefreshInterval)
  - `src/components/state/store.ts` (useStore)
  - `src/utils/navigation.ts` (navigateToMain)
  - `src/components/state/order/orderSlice.ts` (EOrderStatus)

**Update main.tsx Root component**:
```tsx
import { AppHealthMonitor } from "./components/appHealth/AppHealthMonitor.tsx";

function Root() {
  return (
    <>
      <ModalProvider />
      <AppHealthMonitor />
      <Outlet />
    </>
  );
}
```

---

#### Step 5.4: Update main.tsx
**Action Items**:
- [ ] Add ErrorBoundary wrapper
- [ ] Add AppHealthMonitor to Root
- [ ] Add PaymentGuard to protected routes
- [ ] Remove NavigationHandler if replaced by AppHealthMonitor

---

#### Step 5.5: Remove Old Components (if applicable)
**Action Items**:
- [ ] Check if NavigationHandler is still needed
- [ ] Remove if replaced by AppHealthMonitor
- [ ] Verify no broken imports

---

### Phase 6: Page Updates & New Pages

#### Step 6.1: Review Existing Pages
**Action Items**:
- [ ] Compare each page in `src/pages/` with `temp/src/pages/`
- [ ] Identify differences
- [ ] Plan updates needed

**Pages to Review**:
- MainPage.tsx
- SingleProgramPage.tsx
- CardPayPage.tsx
- CashPayPage.tsx (check if still needed)
- MobilePayPage.tsx (check if still needed)
- LoyaltyPayPage.tsx (check if still needed)
- SuccessPaymentPage.tsx
- ErrorPaymentPage.tsx
- InstructionPage.tsx

---

#### Step 6.2: Add QueueWaitingPage
**File**: `src/pages/QueueWaitingPage.tsx`
- Copy from `temp/src/pages/QueueWaitingPage.tsx` (if exists)

**Action Items**:
- [ ] Check if QueueWaitingPage exists in temp
- [ ] Copy if needed
- [ ] Update imports
- [ ] Add route in main.tsx

---

#### Step 6.3: Add WashingInProgressPage
**File**: `src/pages/WashingInProgressPage.tsx`
- Copy from `temp/src/pages/WashingInProgressPage.tsx` (if exists)

**Action Items**:
- [ ] Check if WashingInProgressPage exists in temp
- [ ] Copy if needed
- [ ] Update imports
- [ ] Add route in main.tsx

---

#### Step 6.4: Add ErrorPage
**File**: `src/pages/ErrorPage.tsx`
- Copy from `temp/src/pages/ErrorPage.tsx` (if exists)
- Separate from ErrorPaymentPage

**Action Items**:
- [ ] Check if ErrorPage exists in temp
- [ ] Copy if needed
- [ ] Update imports
- [ ] Add route in main.tsx
- [ ] Ensure it's different from ErrorPaymentPage

---

#### Step 6.5: Update Routing
**File**: `src/main.tsx`
- Update routes to match temp project structure

**Action Items**:
- [ ] Compare routes with temp/src/main.tsx
- [ ] Add new routes (queue-waiting, washing, error)
- [ ] Wrap protected routes with PaymentGuard
- [ ] Remove unused routes if pages are removed

---

#### Step 6.6: Remove Unused Pages (if applicable)
**Action Items**:
- [ ] Verify which pages are actually used
- [ ] Remove CashPayPage, MobilePayPage, LoyaltyPayPage if not needed
- [ ] Update routes accordingly

---

### Phase 7: Testing Setup

#### Step 7.1: Install Testing Dependencies
**Action Items**:
- [ ] Check `temp/package.json` for testing dependencies
- [ ] Install Vitest, @testing-library/react, @testing-library/jest-dom
- [ ] Update package.json

**Dependencies to Add**:
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
```

---

#### Step 7.2: Create Test Setup Files
**Files**:
- `src/test/setup.ts`
- `src/test/utils.tsx`
- `src/vitest.d.ts`

**Action Items**:
- [ ] Create `src/test/` directory
- [ ] Copy `temp/src/test/setup.ts`
- [ ] Copy `temp/src/test/utils.tsx` (if exists)
- [ ] Copy `temp/src/vitest.d.ts`
- [ ] Update vite.config.ts to include Vitest configuration

---

#### Step 7.3: Add Test Scripts
**File**: `package.json`

**Action Items**:
- [ ] Add test scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

#### Step 7.4: Create Example Tests
**Action Items**:
- [ ] Copy `temp/src/components/ErrorBoundary.test.tsx` (if exists)
- [ ] Create simple test for a utility function
- [ ] Verify test setup works

---

### Phase 8: Cleanup & Optimization

#### Step 8.1: Remove Unused Code
**Action Items**:
- [ ] Search for unused imports
- [ ] Remove unused components
- [ ] Remove unused utilities
- [ ] Remove unused types

---

#### Step 8.2: Update Imports
**Action Items**:
- [ ] Run linter
- [ ] Fix import order
- [ ] Fix unused imports
- [ ] Ensure consistent import paths

---

#### Step 8.3: Run Linter
**Action Items**:
- [ ] Run `npm run lint`
- [ ] Fix all linting errors
- [ ] Fix all warnings

---

#### Step 8.4: Update Documentation
**Action Items**:
- [ ] Update README.md with new architecture
- [ ] Document new hooks
- [ ] Document new components
- [ ] Document testing setup

---

## Testing Strategy

### Unit Tests
- Test utility functions (logger, error handling, payment utils)
- Test hooks in isolation
- Test state management slices

### Integration Tests
- Test payment flow end-to-end
- Test WebSocket integration
- Test navigation flows

### Manual Testing Checklist
- [ ] Payment flow works correctly
- [ ] WebSocket updates work
- [ ] Error handling displays properly
- [ ] Navigation guards work
- [ ] App health monitor functions
- [ ] All pages render correctly
- [ ] State persists correctly

---

## Rollback Plan

### Before Starting Migration
1. **Create Git Branch**: `git checkout -b migration/architecture-upgrade`
2. **Create Backup Tag**: `git tag backup/pre-migration`
3. **Document Current State**: Note any known issues

### If Issues Arise During Migration
1. **Commit Current Progress**: `git commit -m "WIP: Migration phase X"`
2. **Identify Issue**: Document what broke
3. **Fix or Rollback**:
   - If fixable: Fix and continue
   - If critical: `git reset --hard backup/pre-migration`

### After Successful Migration
1. **Merge to Main**: After thorough testing
2. **Keep Backup Tag**: Don't delete backup tag for 1-2 weeks

---

## Risk Mitigation

### High-Risk Areas
1. **Payment Flow (Phase 4)**: Core business logic
   - **Mitigation**: Test thoroughly in staging, have rollback ready
2. **State Management (Phase 2)**: Affects all components
   - **Mitigation**: Migrate incrementally, test each component

### Medium-Risk Areas
1. **WebSocket Service (Phase 3)**: Real-time updates critical
   - **Mitigation**: Test WebSocket connection thoroughly
2. **Page Updates (Phase 6)**: User-facing changes
   - **Mitigation**: Test all user flows

### Low-Risk Areas
1. **Infrastructure (Phase 1)**: Additive changes
2. **Testing (Phase 7)**: Additive changes
3. **Cleanup (Phase 8)**: Non-functional changes

---

## Success Criteria

### Phase Completion Criteria
- [ ] All tests pass
- [ ] No console errors
- [ ] Linter passes
- [ ] Manual testing successful
- [ ] Code review approved

### Overall Migration Success
- [ ] All phases completed
- [ ] Application functions identically or better
- [ ] Code quality improved (measured by linting, test coverage)
- [ ] Documentation updated
- [ ] Team trained on new architecture

---

## Timeline Estimate

| Phase | Estimated Time | Cumulative |
|-------|---------------|------------|
| Phase 1: Foundation | 2-3 days | 2-3 days |
| Phase 2: State Management | 2-3 days | 4-6 days |
| Phase 3: Service Layer | 1-2 days | 5-8 days |
| Phase 4: Hooks Refactoring | 3-4 days | 8-12 days |
| Phase 5: Components | 2-3 days | 10-15 days |
| Phase 6: Pages | 2-3 days | 12-18 days |
| Phase 7: Testing | 1-2 days | 13-20 days |
| Phase 8: Cleanup | 1 day | 14-21 days |

**Total Estimated Time**: 2-3 weeks (assuming 1 developer, full-time)

---

## Notes

### Important Considerations
1. **Don't Migrate Everything at Once**: Follow phases sequentially
2. **Test After Each Phase**: Don't proceed until phase is stable
3. **Keep temp/ Folder**: Don't delete until migration is complete and verified
4. **Document Changes**: Keep notes on any deviations from temp project
5. **Review Differences**: Some differences between projects may be intentional

### Questions to Resolve Before Migration
1. Are CashPayPage, MobilePayPage, LoyaltyPayPage still needed?
2. Are there any customizations in current project that shouldn't be overwritten?
3. Are there any API differences that need to be accounted for?
4. Are there any business logic differences between projects?

---

## Next Steps

1. **Review this plan** with the team
2. **Resolve questions** listed above
3. **Set up development environment** for migration
4. **Create migration branch** and backup tag
5. **Begin Phase 1** when ready

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Author**: Migration Plan Generator

