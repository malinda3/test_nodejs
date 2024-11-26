import fs from 'fs';

async function registration(regUrl, username) {
    try {
        const response = await fetch(regUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username })
        });
    
        if (!response.ok) {
          throw new Error(`Ошибка при регистрации. HTTP статус: ${response.status}`);
        }
        const responseData = await response.json();
        return responseData
      } catch (error) {
        console.error("Ошибка при логине:", error);
        throw error; 
      }
}
//console.log(registration('http://94.103.91.4:5000/auth/registration', 'malindac'))

async function login(authUrl, username) {
    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка при логине. HTTP статус: ${response.status}`);
      }
      const responseData = await response.json();
      return responseData.token
    } catch (error) {
      console.error("Ошибка при логине:", error);
      throw error; 
    }
  }

  async function getClients(clientUrl, token, limit, offset) {
    try {
      const response = await fetch(`${clientUrl}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
        }
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка при получении клиентов. HTTP статус: ${response.status}`);
      }
  
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      throw error;
    }
  }

  async function getStatus(statusUrl, token, userIds) {
    try {
      const response = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"userIds": userIds})
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка при получении статусов. HTTP статус: ${response.status}`);
      }
      const responseData = await response.json();
      return responseData
    } catch (error) {
      console.error("Ошибка при получении статусов:", error);
      throw error; 
    }
  }

const token = await login('http://94.103.91.4:5000/auth/login', 'malindac');
const clients = await getClients('http://94.103.91.4:5000/clients', token, 1000, 0);
const userIds = clients.map(client => client.id);
const statuses = await getStatus('http://94.103.91.4:5000/clients', token, userIds);

const result = clients.map(client => {
    const status = statuses.find(status => status.id === client.id);
    return {
      ...client,status: status ? status.status : '-'
    };
  });

const resultJson = JSON.stringify(result, null, 2);

fs.writeFileSync('result.json', resultJson, 'utf8');


