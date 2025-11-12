# Login Navigation Fix - Testing Guide

## Prerequisites
✅ Backend server running on: http://localhost:8000
✅ Frontend server running on: http://localhost:5174

## Test Scenarios

### 1. CRITICAL PATH: Successful Login Flow

**Steps:**
1. Open browser and navigate to: http://localhost:5174/login
2. Open Browser DevTools (F12) and go to Console tab
3. Enter valid credentials:
   - Email: [your test email]
   - Password: [your test password]
4. Click "Sign in" button

**Expected Results:**
- ✅ Console logs should show:
  ```
  Attempting login with: [email]
  AuthContext: Sending login request...
  AuthContext: Login response received: {statusCode: 200, data: {...}, message: "User logged In Successfully"}
  AuthContext: Tokens stored in localStorage
  AuthContext: User state updated: {user object}
  Login successful, navigating to home page...
  ```
- ✅ Page should redirect to home page (http://localhost:5174/)
- ✅ Home page should load with user data
- ✅ No error messages displayed

**Verify in DevTools:**
1. Go to Application tab → Local Storage → http://localhost:5174
2. Check for:
   - ✅ `accessToken` key with JWT token value
   - ✅ `refreshToken` key with JWT token value

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 2. ERROR HANDLING: Invalid Credentials

**Steps:**
1. Navigate to: http://localhost:5174/login
2. Open Console (F12)
3. Enter invalid credentials:
   - Email: test@invalid.com
   - Password: wrongpassword
4. Click "Sign in"

**Expected Results:**
- ✅ Console shows:
  ```
  Attempting login with: test@invalid.com
  AuthContext: Sending login request...
  AuthContext: Login error: [error details]
  Login failed: [error message]
  ```
- ✅ Red error message displayed on page
- ✅ User stays on login page (no navigation)
- ✅ No tokens stored in localStorage

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 3. ERROR HANDLING: Empty Form Fields

**Steps:**
1. Navigate to: http://localhost:5174/login
2. Leave email and password fields empty
3. Try to click "Sign in"

**Expected Results:**
- ✅ Browser's built-in validation prevents form submission
- ✅ "Please fill out this field" message appears
- ✅ No API call made (check Network tab)

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 4. ERROR HANDLING: Backend Server Offline

**Steps:**
1. Stop the backend server (Ctrl+C in backend terminal)
2. Navigate to: http://localhost:5174/login
3. Enter any credentials
4. Click "Sign in"

**Expected Results:**
- ✅ Console shows network error
- ✅ Error message displayed: "An unexpected error occurred. Please try again."
- ✅ User stays on login page
- ✅ Loading state clears after error

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

**After test:** Restart backend server with `cd Backend; npm run dev`

---

### 5. NAVIGATION: Home Page After Login

**Steps:**
1. Ensure you're logged in (complete Test #1)
2. Verify you're on home page (http://localhost:5174/)
3. Check page content

**Expected Results:**
- ✅ Home page displays "Welcome to R24 News" header
- ✅ Latest articles are loaded and displayed
- ✅ Categories section is visible
- ✅ No console errors
- ✅ Navigation bar shows user is logged in

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 6. NAVIGATION: Browser Back Button

**Steps:**
1. After successful login (on home page)
2. Click browser's back button

**Expected Results:**
- ✅ Should NOT go back to login page (due to `replace: true`)
- ✅ Should go to previous page before login (if any)
- ✅ User remains authenticated

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 7. EDGE CASE: Malformed Email

**Steps:**
1. Navigate to: http://localhost:5174/login
2. Enter malformed email: "notanemail"
3. Enter any password
4. Try to submit

**Expected Results:**
- ✅ Browser validation shows "Please include an '@' in the email address"
- ✅ Form doesn't submit

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 8. UI/UX: Loading State

**Steps:**
1. Navigate to: http://localhost:5174/login
2. Enter valid credentials
3. Observe button during submission

**Expected Results:**
- ✅ Button text changes to "Signing in..."
- ✅ Button becomes disabled (opacity reduced)
- ✅ Cannot click button multiple times
- ✅ Loading state clears after response

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 9. UI/UX: Password Visibility Toggle

**Steps:**
1. Navigate to: http://localhost:5174/login
2. Enter password
3. Click eye icon

**Expected Results:**
- ✅ Password becomes visible as plain text
- ✅ Icon changes from eye to eye-slash
- ✅ Click again to hide password
- ✅ Icon changes back to eye

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 10. FULL FLOW: Logout and Re-login

**Steps:**
1. Ensure you're logged in
2. Navigate to profile or find logout button
3. Click logout
4. Verify redirect to login page
5. Login again with same credentials

**Expected Results:**
- ✅ Logout clears tokens from localStorage
- ✅ Redirects to login page
- ✅ Can successfully login again
- ✅ Redirects to home page after re-login

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 11. PROTECTED ROUTES: Access After Login

**Steps:**
1. After successful login, navigate to:
   - http://localhost:5174/dashboard
   - http://localhost:5174/profile
   - http://localhost:5174/articles/new

**Expected Results:**
- ✅ All protected routes are accessible
- ✅ Pages load without errors
- ✅ User data is available in all pages

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

### 12. TOKEN PERSISTENCE: Page Refresh

**Steps:**
1. Login successfully
2. Refresh the page (F5)
3. Check if user remains logged in

**Expected Results:**
- ✅ User stays logged in after refresh
- ✅ Tokens persist in localStorage
- ✅ User data is fetched from `/users/current-user`
- ✅ No redirect to login page

**Status:** [ ] PASS [ ] FAIL
**Notes:** _______________________

---

## Network Tab Verification

### Successful Login Request:
1. Open DevTools → Network tab
2. Login with valid credentials
3. Find the POST request to `/api/v1/users/login`

**Check:**
- ✅ Status: 200 OK
- ✅ Response contains:
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": {...},
      "accessToken": "...",
      "refreshToken": "..."
    },
    "message": "User logged In Successfully"
  }
  ```

---

## Summary Checklist

- [ ] All 12 test scenarios completed
- [ ] No console errors during normal flow
- [ ] Navigation works correctly
- [ ] Error handling works as expected
- [ ] Tokens are properly stored and used
- [ ] UI/UX elements function correctly
- [ ] Protected routes are accessible after login

---

## Common Issues & Solutions

### Issue: "Network Error" or "Failed to fetch"
**Solution:** Ensure backend server is running on port 8000

### Issue: CORS errors in console
**Solution:** Check backend CORS configuration in app.js

### Issue: "Invalid refresh token" errors
**Solution:** Clear localStorage and login again

### Issue: Page doesn't redirect after login
**Solution:** Check console logs for errors, verify the fixes are applied

### Issue: Home page shows loading spinner forever
**Solution:** Check if articles API endpoint is working, check Network tab

---

## Debug Commands

### Check if tokens are stored:
```javascript
// Run in browser console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### Clear tokens manually:
```javascript
// Run in browser console
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
location.reload();
```

### Check current user state:
```javascript
// Run in browser console after login
fetch('http://localhost:8000/api/v1/users/current-user', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(r => r.json())
.then(console.log);
```

---

## Test Results Summary

**Date:** _______________
**Tester:** _______________

**Total Tests:** 12
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Critical Issues Found:**
1. _______________________
2. _______________________
3. _______________________

**Minor Issues Found:**
1. _______________________
2. _______________________

**Overall Status:** [ ] READY FOR PRODUCTION [ ] NEEDS FIXES
