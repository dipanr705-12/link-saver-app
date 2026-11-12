// Unified API client: connects directly to the built-in LinkVault API

const TOKEN_KEY = 'linkvault_auth_token';

export const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  async request(path, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  },

  async signUp(email, password) {
    const res = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res.user;
  },

  async signIn(email, password) {
    const res = await this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res.user;
  },

  async getMe() {
    if (!this.getToken()) return null;
    try {
      const res = await this.request('/api/auth/me');
      return res.user;
    } catch {
      this.setToken(null);
      return null;
    }
  },

  async signOut() {
    try {
      await this.request('/api/auth/signout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  },

  async getLinks() {
    return await this.request('/api/links');
  },

  async createLink(linkData) {
    return await this.request('/api/links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },

  async deleteLink(id) {
    return await this.request(`/api/links/${id}`, {
      method: 'DELETE',
    });
  },
};
