import axios from 'axios';

const api = axios.create({
  baseURL: 'https://portfolio-api-8n5s.onrender.com/' || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export function postChat(message) {
  return api.post('/chat', { message }).then(res => res.data);
}