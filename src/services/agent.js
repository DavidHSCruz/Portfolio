import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_LINK_API || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export async function postChat(message) {
  if (!message) return null;

  try {
    const res = await api.post('/chat', { message });

    return {
      statusCode: res.status,
      content: res.data
    };
  } catch (error) {
    if (error.status === 429) {
      return {
        statusCode: error.status,
        content: `Me desculpe,

nesse momento trabalho voluntariamente para o David 🤯 e, infelizmente meu expediente por hoje acabou, mas você pode me chamar novamente amanhã ou então entrar em contato diretamente com ele: 👋`
      };
    }
    console.log("Erro ao processar mensagem:", error);

    return null;
  }
}