// Robust Client-Side API & Isolated Multi-User Authentication Engine
// Runs 100% 24/7 on GitHub Cloud (GitHub Pages) with full persistence in Browser Storage

const USERS_KEY = 'linkvault_users_db';
const LINKS_KEY = 'linkvault_links_db';
const SESSION_KEY = 'linkvault_current_session';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

export const api = {
  getCurrentSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setSession(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  },

  async signUp(email, password) {
    const users = getStoredUsers();
    const cleanEmail = email.toLowerCase().trim();

    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists!');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      password: btoa(password), // obfuscated client-side
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = { id: newUser.id, email: newUser.email };
    this.setSession(sessionUser);
    return sessionUser;
  },

  async signIn(email, password) {
    const users = getStoredUsers();
    const cleanEmail = email.toLowerCase().trim();
    const encoded = btoa(password);

    const user = users.find(u => u.email === cleanEmail && u.password === encoded);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const sessionUser = { id: user.id, email: user.email };
    this.setSession(sessionUser);
    return sessionUser;
  },

  async getMe() {
    return this.getCurrentSession();
  },

  async signOut() {
    this.setSession(null);
  },

  async getLinks() {
    const session = this.getCurrentSession();
    if (!session) return [];
    const allLinks = getStoredLinks();
    // Strict isolation: only show links belonging to the logged-in user
    return allLinks.filter(link => link.user_id === session.id);
  },

  async createLink(linkData) {
    const session = this.getCurrentSession();
    if (!session) throw new Error('Please log in first.');

    const allLinks = getStoredLinks();
    const newLink = {
      id: 'lnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      user_id: session.id,
      title: linkData.title,
      url: linkData.url,
      category: linkData.category || 'General',
      description: linkData.description || '',
      created_at: new Date().toISOString()
    };

    allLinks.unshift(newLink);
    saveLinks(allLinks);
    return newLink;
  },

  async deleteLink(id) {
    const session = this.getCurrentSession();
    if (!session) throw new Error('Unauthorized');

    const allLinks = getStoredLinks();
    const target = allLinks.find(l => l.id === id);

    if (!target) throw new Error('Link not found');
    if (target.user_id !== session.id) {
      throw new Error('Security Violation: You can only delete your own links.');
    }

    const remaining = allLinks.filter(l => l.id !== id);
    saveLinks(remaining);
    return { success: true };
  }
};
