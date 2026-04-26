import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Send, Search, MessageSquare, Bot, ArrowLeft } from 'lucide-react';

export const AdminPanel = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
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
        
      if (profile?.role !== 'admin') {
        navigate('/chat');
        return;
      }
      
      setUser({ ...session.user, profile });
      fetchClients();
      setLoading(false);
    };

    checkAdmin();

    // Subscribe to new clients
    const clientsChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchClients();
      })
      .subscribe();

    // Subscribe to new messages globally to update unread status or refresh current chat
    const messagesChannel = supabase
      .channel('public:messages_admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        // If message is from/to currently selected client, append it
        if (selectedClient && (payload.new.sender_id === selectedClient.id || payload.new.receiver_id === selectedClient.id)) {
          setMessages(prev => [...prev, payload.new]);
        }
        // Always refresh clients list to update "last message" sorting if we implement it
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [navigate, selectedClient]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
      
    if (data) setClients(data);
  };

  const selectClient = async (client) => {
    setSelectedClient(client);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${client.id},receiver_id.eq.${client.id}`)
      .order('created_at', { ascending: true });
      
    if (data) setMessages(data);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedClient) return;

    const text = newMessage;
    setNewMessage('');

    await supabase.from('messages').insert([{
      text,
      sender_id: user.id,
      receiver_id: selectedClient.id
    }]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-accent">Carregando Painel Admin...</div>;

  return (
    <div className="flex h-screen bg-primary overflow-hidden text-white">
      
      {/* Sidebar: Lista de Clientes */}
      <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 bg-primary/30 flex-col h-full ${selectedClient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-bold tracking-tight">Lume Admin</h2>
              <p className="text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors" title="Voltar ao Site">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-red-400 transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.map(client => (
            <button 
              key={client.id}
              onClick={() => selectClient(client)}
              className={`w-full p-4 flex items-center gap-4 text-left border-b border-white/5 transition-all hover:bg-white/5 ${selectedClient?.id === client.id ? 'bg-white/5 border-l-2 border-l-accent' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-sm">{client.name ? client.name.charAt(0).toUpperCase() : client.email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{client.name || 'Cliente Sem Nome'}</h3>
                <p className="text-xs text-white/40 truncate">{client.email}</p>
              </div>
            </button>
          ))}
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-white/40 text-sm flex flex-col items-center gap-2">
              <Users className="w-8 h-8 opacity-50" />
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content: Chat View */}
      <main className={`flex-1 flex flex-col h-full bg-primary relative ${!selectedClient ? 'hidden md:flex' : 'flex'}`}>
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <MessageSquare className="w-16 h-16 text-white/20" />
            <h2 className="text-xl font-bold">Selecione um cliente</h2>
            <p className="text-white/50 text-sm max-w-xs">Escolha uma conversa no menu lateral para visualizar as mensagens e responder.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-white/5 bg-primary/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedClient(null)} className="md:hidden text-white/50 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-bold text-lg">{selectedClient.name || 'Cliente'}</h2>
                  <p className="text-xs text-white/40">{selectedClient.email}</p>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-white/30 text-sm mt-10">
                  Nenhuma mensagem ainda. Envie a primeira mensagem.
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isAdmin = msg.sender_id === user.id;
                  return (
                    <div key={msg.id || i} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isAdmin 
                          ? 'bg-white/10 text-white rounded-br-sm border border-white/5' 
                          : 'bg-accent/10 text-accent rounded-bl-sm border border-accent/20'
                      }`}>
                        {msg.text}
                        <span className={`block text-[10px] mt-2 ${isAdmin ? 'text-white/30' : 'text-accent/50'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <footer className="p-6 border-t border-white/5 bg-primary/50 backdrop-blur-md">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Responder para ${selectedClient.name?.split(' ')[0] || 'cliente'}...`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-primary transition-all disabled:opacity-50 disabled:hover:bg-accent/20 disabled:hover:text-accent"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};
