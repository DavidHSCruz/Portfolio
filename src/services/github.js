import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_LINK_API || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export function getProjetos() {
  return api.get('/github/user').then(res => res.data);
}