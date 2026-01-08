import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_LINK_API || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export async function getProjetos() {
  try {
    const res = await api.get('/github/user');
    
    return res.data;
  } catch(error) {
    console.error("Erro ao buscar projetos:", error);
    
    return [];
  }
}