import apiClient from './apiClient';
import { formatLocalizedValue, getLocalizedDisplayName } from './displayValue';

const normalizeCurrentUser = (user) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const normalizedName = getLocalizedDisplayName(user);
  const normalizedUsername = formatLocalizedValue(user.username || user.userName || user.loginName);
  const normalizedEmail = formatLocalizedValue(user.emailAddress || user.email);
  const normalizedRole = formatLocalizedValue(user.role || user.roleName || user.userRole) || 'Admin';

  return {
    ...user,
    name: normalizedName || user.name || normalizedUsername || normalizedEmail || 'Unknown user',
    fullName: normalizedName || user.fullName || '',
    displayName: normalizedName || user.displayName || '',
    username: normalizedUsername || user.username || user.userName || '',
    userName: normalizedUsername || user.userName || user.username || '',
    email: normalizedEmail || user.email || '',
    emailAddress: normalizedEmail || user.emailAddress || user.email || '',
    role: normalizedRole,
    initials: user.initials || normalizedName?.split(' ').map((part) => part?.[0]).filter(Boolean).join('').slice(0, 2).toUpperCase(),
  };
};

const userService = {
  getAll: async () => {
    const res = await apiClient.get('/users');
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? normalizeCurrentUser(JSON.parse(user)) : null;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default userService;
