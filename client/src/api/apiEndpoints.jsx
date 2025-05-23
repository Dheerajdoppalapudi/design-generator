const BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/users/register`,
    LOGIN: `${BASE_URL}/users/login`,
  },
  
  USER: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
  },
  
  ADMIN: {
    GET_ALL_USERS: `${BASE_URL}/users/admin/users`,
  },
  
  DESIGN: {
    PROCESS_DESCRIPTION: `${BASE_URL}/process`,
    SAVE_ANSWERS: `${BASE_URL}/answers`,
  }
};

export const apiRequest = async (url, method = 'GET', data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || 'Something went wrong!');
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error('API request error:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    };
  }
};

export const authServices = {
  register: async (userData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData);
  },
  
  login: async (credentials) => {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials);
  }
};

export const userServices = {
  getProfile: async (token) => {
    return await apiRequest(API_ENDPOINTS.USER.PROFILE, 'GET', null, token);
  },
  
  updateProfile: async (userData, token) => {
    return await apiRequest(API_ENDPOINTS.USER.UPDATE_PROFILE, 'PUT', userData, token);
  }
};

export const adminServices = {
  getAllUsers: async (token) => {
    return await apiRequest(API_ENDPOINTS.ADMIN.GET_ALL_USERS, 'GET', null, token);
  }
};

// Design services
export const designServices = {
  processDescription: async (description, token) => {
    return await apiRequest(API_ENDPOINTS.DESIGN.PROCESS_DESCRIPTION, 'POST', { description }, token);
  },
  
  saveAnswers: async (data, token) => {
    return await apiRequest(API_ENDPOINTS.DESIGN.SAVE_ANSWERS, 'POST', data, token);
  }
};