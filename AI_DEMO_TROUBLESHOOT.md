# AI Demo Page Troubleshooting Guide

## Issue: Blank page when accessing http://localhost:5173/ai-demo

## Quick Fix Steps:

### Step 1: Check Browser Console
1. Open http://localhost:5173/ai-demo in your browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Look for any red error messages

### Step 2: Most Common Issues

#### Issue A: Missing AI Component Files
**Error:** `Cannot find module './components/AIComponents/...`

**Solution:** Check if these files exist:
- `frontend/src/components/AIComponents/PriceAdvisor.jsx`
- `frontend/src/components/AIComponents/MarketInsights.jsx`
- `frontend/src/components/AIComponents/NegotiationAssistant.jsx`
- `frontend/src/components/AIComponents/AIProviderSelector.jsx`

#### Issue B: Import Error in AIProviderSelector
**Error:** `useState is not a function` or similar

**Fix:** The AIProviderSelector has a wrong import on line 1

Current (wrong):
```javascript
import { useState, useEffect } from 'prop-types';
```

Should be:
```javascript
import { useState, useEffect } from 'react';
```

#### Issue C: Missing api export
**Error:** `aiAPI is not defined`

**Check:** `frontend/src/api.js` should export `aiAPI`

### Step 3: Quick Test

Try accessing these pages:
1. http://localhost:5173/ (Home - should work)
2. http://localhost:5173/login (Login - should work)
3. http://localhost:5173/price-analytics (Price Analytics - should work)
4. http://localhost:5173/ai-demo (AI Demo - currently broken?)

### Step 4: Check Server Status

In your terminal running `npm run dev`, look for:
- ✅ Green "ready" message
- ❌ Red error messages
- ⚠️ Yellow warnings

### Step 5: Manual test

Open browser console and type:
```javascript
console.log('React loaded:', !!window.React)
```

If it shows `false`, React isn't loading properly.

## Immediate Fix

I'll fix the AIProviderSelector import error now...
