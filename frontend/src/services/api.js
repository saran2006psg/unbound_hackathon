const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.apiKey = localStorage.getItem('apiKey') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('apiKey', key);
  }

  clearApiKey() {
    this.apiKey = '';
    localStorage.removeItem('apiKey');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  async validateApiKey() {
    return this.request('/api/auth/validate');
  }

  // Users
  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async getAllUsers() {
    return this.request('/api/users');
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUserCredits(userId, credits) {
    return this.request(`/api/users/${userId}/credits`, {
      method: 'PUT',
      body: JSON.stringify({ credits }),
    });
  }

  // Commands
  async submitCommand(commandText) {
    return this.request('/api/commands', {
      method: 'POST',
      body: JSON.stringify({ command_text: commandText }),
    });
  }

  async getCommandHistory() {
    return this.request('/api/commands/history');
  }

  // Rules
  async getAllRules() {
    return this.request('/api/rules');
  }

  async createRule(ruleData) {
    return this.request('/api/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  async deleteRule(ruleId) {
    return this.request(`/api/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async validateRegex(pattern) {
    return this.request('/api/rules/validate', {
      method: 'POST',
      body: JSON.stringify({ pattern }),
    });
  }

  // Audit
  async getAuditLogs() {
    return this.request('/api/audit');
  }
}

export default new ApiService();
