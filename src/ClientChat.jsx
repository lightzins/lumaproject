import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { Send, LogOut, ArrowLeft, Bot, User as UserIcon } from 'lucide-react';

export const ClientChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role === 'admin') {
        navigate('/admin');
        return;
      }
      
      setUser({ ...session.user, profile });
      fetchMessages(session.user.id);
      setLoading(false);
    };

    checkUser();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchMessages = async (userId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });
      
    if (data) setMessages(data);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([{
      text,
      sender_id: user.id,
      receiver_id: null // Message to admin
    }]);

    if (error) {
      alert("Erro ao enviar: " + error.message);
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center text-accent">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="bg-primary border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 relative">
              <Bot className="w-5 h-5 text-accent" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-primary" />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight">Equipe Lume</h1>
              <p className="text-white/40 text-xs flex items-center gap-1">
                Atendimento online
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors" title="Sair">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 mt-20">
            <Bot className="w-16 h-16 text-white/20" />
            <p className="text-white/50 max-w-sm">
              Envie uma mensagem abaixo para iniciar seu atendimento. Nossa equipe responderá em breve.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isMe 
                    ? 'bg-accent text-primary rounded-br-sm' 
                    : 'bg-white/5 border border-white/10 text-white rounded-bl-sm'
                }`}>
                  {msg.text}
                  <span className={`block text-[10px] mt-2 ${isMe ? 'text-primary/60' : 'text-white/30'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="bg-primary/50 border-t border-white/5 p-4 md:p-6 backdrop-blur-xl">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-16 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
};
