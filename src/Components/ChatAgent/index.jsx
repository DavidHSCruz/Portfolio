import { useState, useRef, useEffect } from 'react';
import styles from './ChatAgent.module.css';
import { postChat } from 'services/agent';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { IoLogoWhatsapp } from "react-icons/io";
import ReactMarkdown from 'react-markdown';

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Olá! Sou o assistente virtual do David. Pergunte-me sobre o currículo, projetos ou habilidades dele!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Como entrar em contato?",
    "Quais as habilidades?",
    "Melhores projetos"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
    if(!isOpen) {
      setTimeout(() => {
        setShowTooltip(true);
      }, 5000);
      setTimeout(() => {
        setShowTooltip(false);
      }, 15000);
    }
  }, [messages, isOpen]);

  async function handleSend(e, write = true) {
    let userMsg = '';
    
    if(write) {
      e.preventDefault();
      if (!input.trim()) return;

      userMsg = input;
    }
    else userMsg = e;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const result = await postChat(userMsg);
    console.log(result);
    if (result) {
      setMessages(prev => [...prev, { role: 'agent', content: result }]);
    }
    else {
      setMessages(prev => [...prev, { role: 'agent', content: 'Desculpe, ocorreu um erro ao tentar responder. Tente novamente mais tarde.' }]);
    }

    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      {/* Botão flutuante para abrir/fechar */}
      <div className={styles.buttonWrapper}>
        <div className={`${styles.tooltip} ${showTooltip && !isOpen ? styles.visible : ''}`}>
          Pergunte algo sobre o David!
        </div>
        <button 
          className={`${styles.toggleButton} ${isOpen ? styles.hidden : ''}`}
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          aria-label="Abrir chat"
        >
          <IoLogoWhatsapp size={24} />
        </button>
      </div>

      {/* Janela do Chat */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <IoLogoWhatsapp />
            <span>Assistente Virtual</span>
          </div>
          <button className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Fechar chat">
            <FaTimes />
          </button>
        </div>

        <div className={styles.messagesArea}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.agentMessage}`}
            >
              <div className={styles.bubble}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.agentMessage}`}>
              <div className={styles.bubble}>
                <span className={styles.typingDot}>.</span>
                <span className={styles.typingDot}>.</span>
                <span className={styles.typingDot}>.</span>
              </div>
            </div>
          )}
          
          {messages.length === 1 && (
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button key={i} className={styles.suggestionChip} onClick={() => handleSend(s, false)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading || !input.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}