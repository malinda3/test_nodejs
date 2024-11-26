import fs from 'fs';

class API {
  constructor(baseUrl) {
    if(API.instance) {
      return API.instance
    }
    this.baseUrl = baseUrl;
    API.instance = this;
  }

  async request(endpoint, method = 'GET', body = null, headers = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        console.log(`API: Error while request HTTP STATUS:${response.status}`, errorResponse);
        throw new Error(errorResponse.message || 'Unknown error');
      }
      return await response.json();
    } catch (error) {
      console.log(`API: Error while getting endpoint ${endpoint}`, error);
      throw error;
    }
  }
}

class AuthService {
  constructor(api) {
    if (AuthService.instance) {
      return AuthService.instance;
    }
    this.api = api;
    AuthService.instance = this;
  }
  async register(username) {
    return await this.api.request('/auth/registration', 'POST', { username });
  }
  async login(username) {
    const response = await this.api.request('/auth/login', 'POST', { username });
    return response.token;
  }
  }

  class ClientService {
    constructor(api) {
      if (ClientService.instance) {
        return ClientService.instance;
      }
      this.api = api;
      this.token = null;
      ClientService.instance = this; 
    }
    setToken(token) {
      this.token = token;
    }
    async getClients(limit, offset) {
      if (!this.token) {
        console.log('ClientService: No token');
      }
      return await this.api.request(
        `/clients?limit=${limit}&offset=${offset}`,
        'GET',
        null,
        {Authorization: this.token}
      );
    }
    
    async getStatuses(userIds) {
      if (this.token) {
        console.log('ClientService: No token');
      }

      return await this.api.request(
        '/clients',
        'POST',
        {userIds},
        {Authorization: this.token}
      );
    }
  }

  (async () => {
    const baseURL = 'http://94.103.91.4:5000';
    const api = new API(baseURL);

    const authService = new AuthService(api);
    const clientService = new ClientService(api);
    try {
    const username = 'myveryte13stuser'
    await authService.register(username);
    const token = await authService.login(username);
    clientService.setToken(`${token}`);
    const clients = await clientService.getClients(1000, 0);
    const userIds = clients.map(client => client.id);
    const statuses = await clientService.getStatuses(userIds);
    const result = clients.map(client => {
      const status = statuses.find(status => status.id === client.id);
      return {
        ...client,
        status: status ? status.status : '',
      };
    });
    const resultJson = JSON.stringify(result, null, 2);
    fs.writeFileSync('result2.json', resultJson, 'utf-8');
    console.log('Result saved to result2.json');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
