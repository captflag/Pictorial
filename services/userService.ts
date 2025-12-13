import { User, UserHistory } from '../types';

const STORAGE_KEY = 'pictorial_users';
const SESSION_KEY = 'pictorial_current_user';

const getUsers = (): Record<string, User> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const userService = {
  login: async (email: string): Promise<User> => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    const user = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("User not found");
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  signup: async (name: string, email: string, userClass: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    if (Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already exists");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      class: userClass,
      xp: 0,
      streak: 1,
      history: [],
      joinedDate: new Date().toISOString()
    };

    users[newUser.id] = newUser;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  updateUser: (user: User) => {
    const users = getUsers();
    users[user.id] = user;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  addHistory: (userId: string, activity: Omit<UserHistory, 'id' | 'date'>) => {
    const users = getUsers();
    const user = users[userId];
    if (user) {
      const newHistory: UserHistory = {
        ...activity,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };
      // Add to beginning, keep max 50 items
      user.history = [newHistory, ...user.history].slice(0, 50);
      user.xp += (activity.score || 10); // Base XP for any activity
      
      users[userId] = user;
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  }
};