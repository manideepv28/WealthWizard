import { User, InsertUser } from "@shared/schema";

const STORAGE_KEY = 'fundtracker_user';

export class AuthService {
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static async login(email: string, password: string): Promise<User> {
    // Simulate API call with stored users
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  static async register(userData: InsertUser): Promise<User> {
    const users = this.getStoredUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: Date.now(), // Simple ID generation
      ...userData,
      createdAt: new Date(),
    };

    users.push(newUser);
    localStorage.setItem('fundtracker_users', JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    return newUser;
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private static getStoredUsers(): User[] {
    try {
      const users = localStorage.getItem('fundtracker_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }
}
