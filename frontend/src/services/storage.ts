/**
 * Storage Service for persisting patient data across sessions
 * This service handles localStorage operations for profile, health records, and other patient data
 */

interface HealthRecord {
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  bloodSugar: string;
  heartRate: string;
  lastUpdated: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
}

class StorageService {
  private getStorageKey(userId: string, key: string): string {
    return `mediflow_${userId}_${key}`;
  }

  // Health Records
  saveHealthRecords(userId: string, data: HealthRecord): void {
    try {
      const key = this.getStorageKey(userId, 'health_records');
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save health records:', error);
    }
  }

  getHealthRecords(userId: string): HealthRecord | null {
    try {
      const key = this.getStorageKey(userId, 'health_records');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load health records:', error);
      return null;
    }
  }

  // User Profile Extended Data
  saveProfileData(userId: string, data: Partial<UserProfile>): void {
    try {
      const key = this.getStorageKey(userId, 'profile_data');
      const existing = this.getProfileData(userId) || {};
      const updated = { ...existing, ...data };
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save profile data:', error);
    }
  }

  getProfileData(userId: string): UserProfile | null {
    try {
      const key = this.getStorageKey(userId, 'profile_data');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load profile data:', error);
      return null;
    }
  }

  // Clear user-specific data (call on logout)
  clearUserData(userId: string): void {
    try {
      const healthKey = this.getStorageKey(userId, 'health_records');
      const profileKey = this.getStorageKey(userId, 'profile_data');
      localStorage.removeItem(healthKey);
      localStorage.removeItem(profileKey);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  // Clear all user data (for complete logout)
  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('mediflow_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}

export const storageService = new StorageService();
