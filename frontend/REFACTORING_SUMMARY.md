# Frontend Component Structure Refactoring

## Overview
This document outlines the improved component structure for the YieldBase frontend application.

## New Structure

```
Frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── properties/
│   │   ├── page.tsx              # Properties listing
│   │   └── [id]/page.tsx         # Property detail
│   ├── yield-calculator/
│   │   └── page.tsx              # Yield calculator
│   └── ...
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   └── Navigation.tsx        # Navigation menu (extracted from Header)
│   ├── properties/               # Property-related components
│   │   ├── PropertyImageGallery.tsx
│   │   └── PropertyEnquiryForm.tsx
│   ├── ui/                       # Reusable UI components
│   │   └── carousel.tsx
│   ├── Header.tsx                # Site header
│   ├── Footer.tsx                # Site footer
│   ├── PropertyCard.tsx          # Property card component
│   └── EnquiryModal.tsx          # Enquiry modal
│
├── hooks/                        # Custom React hooks
│   ├── useProperties.ts          # Property data fetching hooks
│   ├── useImageHandling.ts       # Image handling logic
│   └── useEnquiryForm.ts         # Enquiry form logic
│
├── lib/                          # Utility libraries
│   ├── constants.ts              # Shared constants
│   ├── imageUtils.ts             # Image utility functions
│   ├── formatUtils.ts            # Formatting utilities
│   ├── getProperties.ts          # Property data fetching
│   └── utils.ts                  # General utilities
│
└── types/                        # TypeScript types
    └── property.ts               # Property type definitions
```

## Key Improvements

### 1. **Constants Centralization** (`lib/constants.ts`)
- ✅ All fallback images in one place
- ✅ API configuration centralized
- ✅ Navigation links defined once
- ✅ Magic numbers extracted (DAILY_CALCULATION_LIMIT, ITEMS_PER_PAGE)

### 2. **Image Utilities** (`lib/imageUtils.ts`)
- ✅ `normalizeImageUrl()` - Converts relative to absolute URLs
- ✅ `getFallbackImage()` - Gets unique fallback per property
- ✅ `getFallbackImageSet()` - Creates multiple fallback images
- ✅ `processPropertyImages()` - Processes image arrays
- ✅ Eliminates code duplication across components

### 3. **Formatting Utilities** (`lib/formatUtils.ts`)
- ✅ `formatPrice()` - Currency formatting
- ✅ `formatCurrency()` - Custom currency formatting
- ✅ `formatPercentage()` - Percentage formatting
- ✅ Reusable across all components

### 4. **Custom Hooks** (`hooks/`)
- ✅ `useProperties()` - Fetch and manage properties list
- ✅ `useProperty()` - Fetch single property by ID
- ✅ `useImageHandling()` - Image state and error handling
- ✅ `useEnquiryForm()` - Form state and submission logic
- ✅ Separates business logic from UI components

### 5. **Component Organization**
- ✅ Feature-based folders (`components/properties/`, `components/layout/`)
- ✅ Reusable components extracted (Navigation, PropertyImageGallery, PropertyEnquiryForm)
- ✅ Clear separation of concerns

## Migration Status

### ✅ Completed
- [x] Created `lib/constants.ts` with shared constants
- [x] Created `lib/imageUtils.ts` with image utilities
- [x] Created `lib/formatUtils.ts` with formatting utilities
- [x] Created `hooks/useProperties.ts` for property fetching
- [x] Created `hooks/useImageHandling.ts` for image handling
- [x] Created `hooks/useEnquiryForm.ts` for form handling
- [x] Created `components/properties/PropertyImageGallery.tsx`
- [x] Created `components/properties/PropertyEnquiryForm.tsx`
- [x] Created `components/layout/Navigation.tsx`
- [x] Updated `components/Header.tsx` to use Navigation component
- [x] Updated `components/PropertyCard.tsx` to use shared utilities
- [x] Updated `lib/getProperties.ts` to use shared utilities

### 🔄 In Progress / TODO
- [ ] Update `app/page.tsx` to use `useProperties` hook
- [ ] Update `app/properties/page.tsx` to use `useProperties` hook
- [ ] Update `app/properties/[id]/page.tsx` to use new hooks and components
- [ ] Update `components/EnquiryModal.tsx` to use `PropertyEnquiryForm`
- [ ] Update `app/yield-calculator/page.tsx` to use constants
- [ ] Extract shared UI components (Button, Input, Modal base)
- [ ] Add error boundaries
- [ ] Add loading states components

## Benefits

1. **Reduced Code Duplication**
   - Image handling logic centralized
   - Formatting functions reusable
   - Constants defined once

2. **Better Maintainability**
   - Clear file organization
   - Single source of truth for constants
   - Easier to find and update code

3. **Improved Testability**
   - Hooks can be tested independently
   - Utility functions are pure functions
   - Components are more focused

4. **Enhanced Reusability**
   - Components can be easily reused
   - Hooks can be shared across pages
   - Utilities work everywhere

5. **Type Safety**
   - All utilities are properly typed
   - Hooks have clear interfaces
   - Components have explicit props

## Next Steps

1. Continue migrating pages to use new hooks
2. Extract more shared UI components
3. Add comprehensive error handling
4. Add loading state components
5. Consider adding a state management solution if needed
6. Add unit tests for hooks and utilities

