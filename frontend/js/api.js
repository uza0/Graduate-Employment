/**
 * JoinWork - API Client
 * Centralized API communication functions
 */

const API_BASE_URL = 'http://localhost:3000/api'; // Update based on backend choice

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data
 * @param {boolean} requiresAuth - Whether authentication is required
 * @returns {Promise} API response
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authentication token if required
  if (requiresAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add request body for POST/PUT requests
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Check if response is JSON
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    if (!response.ok) {
      const errorMsg = responseData.message || responseData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    // Re-throw with better error message
    if (error.message) {
      throw error;
    } else {
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
}

/**
 * Authentication API
 */
const authAPI = {
  login: (email, password) => {
    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    console.log('[API] Login request for email:', normalizedEmail);
    return apiRequest('/auth/login', 'POST', { email: normalizedEmail, password }, false);
  },

  signup: (userData) => {
    return apiRequest('/auth/signup', 'POST', userData, false);
  },

  logout: () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Simple redirect - works from any page location
    // If we're in pages directory, go to login.html in same directory
    // Otherwise, try to find the login page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
      // Replace current page with login.html
      window.location.href = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + 'login.html';
    } else {
      // Try common paths
      const possiblePaths = [
        'pages/login.html',
        'frontend/pages/login.html',
        '/frontend/pages/login.html',
        '../pages/login.html'
      ];
      
      // Try the first path (most common)
      window.location.href = possiblePaths[0];
    }
  },

  getCurrentUser: () => {
    return apiRequest('/auth/me');
  },
};

/**
 * Graduates API
 */
const graduatesAPI = {
  getProfile: (graduateId) => {
    return apiRequest(`/graduates/${graduateId}`);
  },

  getProfileByUser: (userId) => {
    return apiRequest(`/graduates/user/${userId}`);
  },

  createProfile: (data) => {
    return apiRequest('/graduates', 'POST', data);
  },

  updateProfile: (graduateId, data) => {
    return apiRequest(`/graduates/${graduateId}`, 'PUT', data);
  },

  search: (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/graduates/search?${queryParams}`);
  },
};

/**
 * Jobs API
 */
const jobsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/jobs?${queryParams}`);
  },

  getById: (jobId) => {
    return apiRequest(`/jobs/${jobId}`);
  },

  create: (jobData) => {
    return apiRequest('/jobs', 'POST', jobData);
  },

  update: (jobId, jobData) => {
    return apiRequest(`/jobs/${jobId}`, 'PUT', jobData);
  },

  delete: (jobId) => {
    return apiRequest(`/jobs/${jobId}`, 'DELETE');
  },

  apply: (jobId, coverLetter = '') => {
    return apiRequest(`/jobs/${jobId}/apply`, 'POST', { cover_letter: coverLetter });
  },

  getApplications: (jobId) => {
    return apiRequest(`/jobs/${jobId}/applications`);
  },

  saveJob: (jobId) => {
    return apiRequest(`/jobs/${jobId}/save`, 'POST');
  },

  getSavedJobs: () => {
    return apiRequest('/jobs/saved');
  },
};

/**
 * Applications API
 */
const applicationsAPI = {
  updateStatus: (applicationId, status) => {
    return apiRequest(`/applications/${applicationId}`, 'PUT', { status });
  },
};

/**
 * Companies API
 */
const companiesAPI = {
  getProfile: (companyId) => {
    return apiRequest(`/companies/${companyId}`);
  },

  getProfileByUser: (userId) => {
    return apiRequest(`/companies/user/${userId}`);
  },

  updateProfile: (companyId, data) => {
    return apiRequest(`/companies/${companyId}`, 'PUT', data);
  },

  getJobs: (companyId) => {
    return apiRequest(`/jobs?company_id=${companyId}`);
  },
};

/**
 * Workshops API
 */
const workshopsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/workshops?${queryParams}`);
  },

  getById: (workshopId) => {
    return apiRequest(`/workshops/${workshopId}`);
  },

  create: (workshopData) => {
    return apiRequest('/workshops', 'POST', workshopData);
  },

  update: (workshopId, workshopData) => {
    return apiRequest(`/workshops/${workshopId}`, 'PUT', workshopData);
  },

  delete: (workshopId) => {
    return apiRequest(`/workshops/${workshopId}`, 'DELETE');
  },

  register: (workshopId) => {
    return apiRequest(`/workshops/${workshopId}/register`, 'POST');
  },
};

/**
 * Analytics API (Ministry)
 */
const analyticsAPI = {
  getGraduateStats: () => {
    return apiRequest('/analytics/graduates');
  },

  getJobStats: () => {
    return apiRequest('/analytics/jobs');
  },

  getSkillsGap: () => {
    return apiRequest('/analytics/skills-gap');
  },

  getUniversityReports: () => {
    return apiRequest('/analytics/universities');
  },
};

/**
 * CV Generator API
 */
const cvAPI = {
  generate: (graduateId) => {
    return apiRequest(`/cv/generate/${graduateId}`);
  },

  exportPDF: (graduateId) => {
    // This might return a blob or redirect to PDF download
    return apiRequest(`/cv/export/${graduateId}`, 'GET', null, true);
  },
};

// Export API modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    authAPI,
    graduatesAPI,
    jobsAPI,
    companiesAPI,
    workshopsAPI,
    analyticsAPI,
    cvAPI,
  };
}

