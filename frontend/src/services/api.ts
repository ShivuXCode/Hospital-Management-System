export const API_URL = import.meta.env.VITE_API_URL || '/api';

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

  // Get authenticated doctor's profile
  async getDoctorProfile(): Promise<{ 
    success: boolean; 
    doctor?: { 
      _id: string; 
      userId: string; 
      name: string; 
      email: string; 
      specialization: string; 
      consultationTypes: string[]; 
      assignedNurses?: any[];
    }; 
    message?: string 
  }> {
    const response = await fetch(`${API_URL}/doctors/me`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Get list of patients (Doctor, Nurse, Admin only)
  async getPatients(): Promise<{ success: boolean; patients?: any[]; count?: number }> {
    const response = await fetch(`${API_URL}/patients`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ADMIN: Get nurses with assigned doctors
  async getNurses(): Promise<{ success: boolean; nurses?: any[]; count?: number; message?: string }> {
    const response = await fetch(`${API_URL}/nurses`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ADMIN: Assign a doctor to a nurse (max 2 per nurse)
  async assignDoctorToNurse(nurseId: string, doctorId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_URL}/nurses/assign-doctor`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ nurseId, doctorId }),
    });
    return response.json();
  }

  // ADMIN: Unassign a doctor from a nurse
  async unassignDoctorFromNurse(nurseId: string, doctorId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_URL}/nurses/unassign-doctor`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ nurseId, doctorId }),
    });
    return response.json();
  }

  // ADMIN: Clear all doctor-nurse assignments
  async clearAllDoctorNurseAssignments(): Promise<{ success: boolean; message?: string; result?: { doctorsUpdated: number; nursesUpdated: number } }> {
    const response = await fetch(`${API_URL}/nurses/assignments`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Get single doctor by id (protected)
  async getDoctorById(id: string): Promise<{ success: boolean; doctor?: any }> {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getDoctorReviews(doctorId: string): Promise<{ success: boolean; reviews?: any[] }> {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/reviews`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getDoctorReviewForAppointment(
    doctorId: string,
    appointmentId: string
  ): Promise<{ success: boolean; review?: any }> {
    const params = new URLSearchParams({ appointmentId });
    const response = await fetch(`${API_URL}/doctors/${doctorId}/reviews/mine?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async submitDoctorReview(
    doctorId: string,
    payload: { rating: number; comment?: string; appointmentId: string }
  ): Promise<{ success: boolean; review?: any; operation?: 'created' | 'updated'; message?: string }> {
    const response = await fetch(`${API_URL}/doctors/${doctorId}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // Create appointment (protected)
  async createAppointment(payload: {
    doctorName: string;
    patientName: string;
    email: string;
    phone?: string;
    department?: string;
    consultationType?: string;
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

  // Get appointments (role-aware)
  async getAppointments(options?: { expired?: boolean }): Promise<{ success: boolean; appointments?: any[]; count?: number; message?: string }> {
    const params = new URLSearchParams();
    if (options?.expired !== undefined) {
      params.set('expired', String(options.expired));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}/appointments${query}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Get prescriptions for a patient with optional expiry filter
  async getPatientPrescriptions(
    userId: string,
    options?: { expired?: boolean }
  ): Promise<{ success: boolean; prescriptions?: any[]; count?: number; message?: string }> {
    const params = new URLSearchParams();
    if (options?.expired !== undefined) {
      params.set('expired', String(options.expired));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}/patients/${userId}/prescriptions${query}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // PRESCRIPTIONS: role-aware list (Doctor: own; Nurse: assigned doctors; Admin: all)
  async getPrescriptions(options?: { patientId?: string }): Promise<{ success: boolean; prescriptions?: any[]; message?: string }>{
    const params = new URLSearchParams();
    if (options?.patientId) params.set('patientId', options.patientId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}/prescriptions${query}`, { headers: this.getAuthHeaders() });
    return response.json();
  }

  async createPrescription(payload: {
    patientId: string;
    doctorName: string;
    validUntil: string;
    diagnosis?: string;
    notes?: string;
    medicines: Array<{ name: string; dosage?: string; duration?: string; instructions?: string }>;
  }): Promise<{ success: boolean; prescription?: any; message?: string }>{
    const response = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async updatePrescription(id: string, payload: {
    doctorName?: string;
    validUntil?: string;
    diagnosis?: string;
    notes?: string;
    medicines?: Array<{ name: string; dosage?: string; duration?: string; instructions?: string }>;
  }): Promise<{ success: boolean; prescription?: any; message?: string }>{
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async deletePrescription(id: string): Promise<{ success: boolean; message?: string }>{
    const response = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getPatientHealthTracker(
    userId: string
  ): Promise<{
    success: boolean;
    healthTracker?: {
      height: number | null;
      weight: number | null;
      bloodPressure?: string | null;
      sugarLevel?: number | null;
      bmi?: number | null;
      lastUpdated?: string | null;
    };
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/patients/${userId}/health-tracker`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async updatePatientHealthTracker(
    userId: string,
    payload: {
      height?: number;
      weight?: number;
      bloodPressure?: string;
      sugarLevel?: number;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    healthTracker?: {
      height: number | null;
      weight: number | null;
      bloodPressure?: string | null;
      sugarLevel?: number | null;
      bmi?: number | null;
      lastUpdated?: string | null;
    };
  }> {
    const response = await fetch(`${API_URL}/patients/${userId}/health-tracker`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async getPatientDashboard(
    userId: string
  ): Promise<{
    success: boolean;
    dashboard?: {
      upcomingAppointmentsCount: number;
      activePrescriptionsCount: number;
      pendingBillsCount: number;
      recentHealthRecord: {
        lastUpdated: string | null;
        bloodPressure?: string | null;
        sugarLevel?: number | null;
        weight?: number | null;
        bmi?: number | null;
      } | null;
      recentActivity?: Array<{
        id: string;
        type: string;
        title: string;
        description?: string;
        status?: string;
        date?: string;
      }>;
    };
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/patients/${userId}/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // Update appointment (e.g., status or notes)
  async updateAppointment(id: string, payload: { status?: string; notes?: string }): Promise<{ success: boolean; appointment?: any; message?: string }> {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  // Nurse confirm appointment
  async nurseConfirmAppointment(appointmentId: string): Promise<{ success: boolean; appointment?: any; message?: string }> {
    const response = await fetch(`${API_URL}/nurses/appointments/${appointmentId}/confirm`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
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

  // Change password
  async changePassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_URL}/user/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return response.json();
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

  // ANALYTICS: Patients
  async getAnalyticsPatients(): Promise<{
    success: boolean;
    analytics?: {
      total: number;
      daily: { count: number };
      weekly: { count: number; trend: Array<{ date: string; count: number }> };
      monthly: { count: number; trend: Array<{ date: string; count: number }>; monthsTrend?: Array<{ month: string; value: number }> };
    };
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/analytics/patients`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ANALYTICS: Revenue
  async getAnalyticsRevenue(): Promise<{
    success: boolean;
    analytics?: {
      total: number;
      daily: { total: number };
      weekly: { total: number; trend: Array<{ date: string; total: number }> };
      monthly: { total: number; trend: Array<{ date: string; total: number }>; monthsTrend?: Array<{ month: string; total: number }> };
    };
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/analytics/revenue`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ANALYTICS: Performance
  async getAnalyticsPerformance(): Promise<{
    success: boolean;
    analytics?: {
      doctors: Array<{ doctorId: string; name: string; specialization?: string | null; totalReviews: number; averageRating: number; ratingDistribution: Record<string, number> }>;
      nurses: Array<{ nurseId: string; name: string; totalReviews: number; averageRating: number; ratingDistribution: Record<string, number> }>;
    };
    message?: string;
  }> {
    const response = await fetch(`${API_URL}/analytics/performance`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
