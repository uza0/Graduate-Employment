/**
 * JoinWork - Authentication Module
 * Handles authentication state and user session
 */

// This file is for additional auth utilities if needed
// Main auth functions are in api.js (authAPI)

/**
 * Initialize authentication check on page load
 */
function initAuth() {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login if not on login/signup pages
    const currentPage = window.location.pathname;
    const publicPages = ['/login.html', '/signup.html', '/index.html', '/'];
    
    const isPublicPage = publicPages.some(page => currentPage.includes(page));
    
    if (!isPublicPage) {
      window.location.href = '/frontend/pages/login.html';
    }
  }
}

/**
 * Get current user data from localStorage
 * @returns {object|null} User object or null
 */
function getCurrentUser() {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check (graduate, company, ministry)
 * @returns {boolean} True if user has the role
 */
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

/**
 * Require specific role, redirect if not authorized
 * @param {string} role - Required role
 */
function requireRole(role) {
  if (!hasRole(role)) {
    alert('You do not have permission to access this page.');
    window.location.href = '/frontend/pages/dashboard.html';
  }
}

// Initialize auth on page load
if (typeof window !== 'undefined') {
  // Only run on pages that need auth (not login/signup)
  const currentPage = window.location.pathname;
  if (!currentPage.includes('login.html') && !currentPage.includes('signup.html')) {
    // Uncomment if you want automatic redirect
    // initAuth();
  }
}

