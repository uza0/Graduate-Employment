/**
 * JoinWork - Utility Functions
 * Helper functions for common operations
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
function formatDateTime(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: IQD)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'IQD') {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
function validatePassword(password) {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  return { isValid: true, message: '' };
}

/**
 * Parse skills string into array
 * @param {string} skillsString - Comma-separated skills string
 * @returns {Array<string>} Array of skills
 */
function parseSkills(skillsString) {
  if (!skillsString) return [];
  return skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

/**
 * Format skills array into string
 * @param {Array<string>} skills - Array of skills
 * @returns {string} Comma-separated skills string
 */
function formatSkills(skills) {
  if (!skills || !Array.isArray(skills)) return '';
  return skills.join(', ');
}

/**
 * Theme helpers - Unified Dark Mode System
 */
function getSavedTheme() {
  return localStorage.getItem('theme');
}

function applyTheme(theme) {
  const html = document.documentElement;
  const body = document.body;
  const useDark = theme === 'dark';
  
  // Apply dark mode class to both html and body for maximum compatibility
  html.classList.toggle('dark-mode', useDark);
  body.classList.toggle('dark-mode', useDark);
  body.classList.toggle('theme-dark', useDark); // Keep for backward compatibility
  
  // Save theme preference
  localStorage.setItem('theme', useDark ? 'dark' : 'light');
  
  // Update UI elements
  updateThemeToggleLabel(useDark);
  updateDarkModeIcon(useDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark-mode') || 
                 document.body.classList.contains('dark-mode');
  applyTheme(isDark ? 'light' : 'dark');
}

function updateThemeToggleLabel(isDark) {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }
}

function initTheme() {
  const saved = getSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
  initThemeToggle();
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
    // set initial label
    const isDark = document.documentElement.classList.contains('dark-mode');
    updateThemeToggleLabel(isDark);
  }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', initTheme);

/**
 * Dark Mode Functions (for header button)
 */
function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark-mode') || 
                 document.body.classList.contains('dark-mode') ||
                 document.body.classList.contains('theme-dark');
  applyTheme(isDark ? 'light' : 'dark');
  updateDarkModeIcon(!isDark);
}

function initDarkMode() {
  const saved = getSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
  updateDarkModeIcon(theme === 'dark');
}

function updateDarkModeIcon(isDark) {
  const icon = document.getElementById('dark-mode-icon');
  if (icon) {
    icon.textContent = isDark ? '☀️' : '🌙';
    icon.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

/**
 * Role-Based Access Control (frontend guard)
 * requiredRoles: array of allowed roles ['graduate', 'company', 'ministry']
 */
function enforceRole(requiredRoles) {
  const userDataRaw = localStorage.getItem('userData');
  if (!userDataRaw) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const user = JSON.parse(userDataRaw);
    if (!user.role || !requiredRoles.includes(user.role)) {
      console.warn('[RBAC] Unauthorized role. Expected:', requiredRoles, 'Got:', user.role);
      window.location.href = 'access-denied.html';
    }
  } catch (e) {
    console.error('[RBAC] Failed to parse userData', e);
    window.location.href = 'login.html';
  }
}

/**
 * Get user role from localStorage
 * @returns {string|null} User role or null
 */
function getUserRole() {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user.role;
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/frontend/pages/login.html';
  }
}

/**
 * Show loading spinner
 * @param {HTMLElement} container - Container element
 */
function showLoading(container) {
  container.innerHTML = `
    <div class="text-center" style="padding: 2rem;">
      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      <p style="margin-top: 1rem; color: var(--color-text-medium);">Loading...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

/**
 * Show error message
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 */
function showError(container, message) {
  container.innerHTML = `
    <div class="alert alert-error">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

/**
 * Show success message
 * @param {HTMLElement} container - Container element
 * @param {string} message - Success message
 */
function showSuccess(container, message) {
  container.innerHTML = `
    <div class="alert alert-success">
      <strong>Success:</strong> ${message}
    </div>
  `;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get query parameters from URL
 * @returns {object} Object with query parameters
 */
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Set query parameter in URL
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 */
function setQueryParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

