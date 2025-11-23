export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  redirect?: string;
}

class ApiService {
  // Get auth token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Signup
  async signup(data: SignupData): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Login
  async login(data: LoginData): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    
    // Store token and user data if login successful
    if (result.success && result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/user`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Get list of doctors (public)
  async getDoctors(): Promise<{ success: boolean; doctors?: any[]; count?: number }> {
    const response = await fetch(`${API_URL}/doctors`);
    return response.json();
  }

  // Get single doctor by id (protected)
  async getDoctorById(id: string): Promise<{ success: boolean; doctor?: any }> {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Create appointment (protected)
  async createAppointment(payload: {
    doctorName: string;
    patientName: string;
    email: string;
    date: string;
    time: string;
    reason?: string;
  }): Promise<{ success: boolean; message?: string; appointment?: any }> {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // Validate token by calling /user endpoint
  async validateAuth(): Promise<boolean> {
    try {
      const res = await this.getCurrentUser();
      return !!res && res.success === true;
    } catch (err) {
      return false;
    }
  }

  // Logout
  logout(): void {
    const user = this.getUser();
    if (user) {
      // Import storage service dynamically to avoid circular dependency
      try {
        const { storageService } = require('./storage');
        storageService.clearUserData(user.id);
      } catch (error) {
        console.error('Failed to clear user data:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get user from localStorage
  getUser(): { id: string; name: string; email: string; role: string } | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
