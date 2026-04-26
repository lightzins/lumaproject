import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Send, Search, MessageSquare, Bot, ArrowLeft, Sparkles, Trash2, CheckCircle } from 'lucide-react';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'leads'
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Can be client or lead
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
      fetchLeads();
      setLoading(false);
    };

    checkAdmin();

    // Subscriptions
    const clientsChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchClients())
      .subscribe();

    const leadsChannel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages_admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (selectedItem && activeTab === 'chats' && (payload.new.sender_id === selectedItem.id || payload.new.receiver_id === selectedItem.id)) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [navigate, selectedItem, activeTab]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    if (data) setClients(data);
  };

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
  };

  const selectItem = async (item) => {
    setSelectedItem(item);
    if (activeTab === 'chats') {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${item.id},receiver_id.eq.${item.id}`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedItem || activeTab !== 'chats') return;

    const text = newMessage;
    setNewMessage('');

    await supabase.from('messages').insert([{
      text,
      sender_id: user.id,
      receiver_id: selectedItem.id
    }]);
  };

  const handleRemoveLead = async (id) => {
    if (!confirm('Deseja remover este orçamento?')) return;
    await supabase.from('leads').delete().eq('id', id);
    setSelectedItem(null);
    fetchLeads();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredItems = (activeTab === 'chats' ? clients : leads).filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-accent font-mono tracking-widest uppercase text-xs">Carregando Painel Admin...</div>;

  return (
    <div className="flex h-screen bg-primary overflow-hidden text-white font-sans">
      
      {/* Sidebar */}
      <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 bg-primary/30 flex-col h-full ${selectedItem ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-bold tracking-tight text-sm uppercase">Lume Studio</h2>
              <p className="text-[10px] text-white/40 font-mono">ADMIN_SYSTEM</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-black/20 m-4 rounded-xl border border-white/5">
          <button 
            onClick={() => { setActiveTab('chats'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-accent text-primary shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Conversas
          </button>
          <button 
            onClick={() => { setActiveTab('leads'); setSelectedItem(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-accent text-primary shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Orçamentos
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder={`Buscar ${activeTab === 'chats' ? 'cliente' : 'projeto'}...`} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredItems.map(item => (
            <button 
              key={item.id}
              onClick={() => selectItem(item)}
              className={`w-full p-5 flex items-center gap-4 text-left border-b border-white/5 transition-all hover:bg-white/5 ${selectedItem?.id === item.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeTab === 'leads' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white'}`}>
                <span className="font-bold text-xs uppercase">{(item.name || item.email || '?').charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-xs truncate uppercase tracking-wide">{item.name || 'Sem Nome'}</h3>
                  <span className="text-[8px] font-mono opacity-30">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-white/40 truncate mt-1">{item.email}</p>
                {activeTab === 'leads' && (
                  <div className="flex gap-1 mt-2">
                    {item.services?.slice(0, 2).map(s => (
                      <span key={s} className="text-[7px] bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase font-bold">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-white/20 text-[10px] uppercase tracking-[0.2em] flex flex-col items-center gap-4">
              <Search className="w-8 h-8 opacity-10" />
              <p>Nenhum resultado encontrado.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-full bg-primary relative ${!selectedItem ? 'hidden md:flex' : 'flex'}`}>
        {!selectedItem ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
              <Bot className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">Painel de Controle</h2>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.3em]">Selecione uma conversa para começar</p>
            </div>
          </div>
        ) : (
          <>
            <header className="px-4 md:px-8 py-4 md:py-5 border-b border-white/5 bg-primary/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <button onClick={() => setSelectedItem(null)} className="md:hidden text-white/50 hover:text-white flex-shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeTab === 'leads' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white'}`}>
                    <span className="font-bold text-xs md:text-sm uppercase">{(selectedItem.name || '?').charAt(0)}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="font-bold text-xs md:text-sm uppercase tracking-wider truncate">{selectedItem.name || 'Cliente'}</h2>
                    <p className="text-[8px] md:text-[10px] text-white/40 font-mono uppercase truncate">{selectedItem.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {activeTab === 'chats' ? (
                  <button 
                    onClick={() => { if(confirm('Encerrar esta conversa?')) setSelectedItem(null); }}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Encerrar</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRemoveLead(selectedItem.id)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remover</span>
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
              {activeTab === 'leads' ? (
                <div className="max-w-2xl mx-auto w-full">
                  <div className="bg-white/5 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-4 md:p-10 space-y-5 md:space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] -mr-16 -mt-16" />
                    
                    <div className="flex items-center gap-3 md:gap-4 text-accent">
                      <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
                      <h3 className="text-sm md:text-xl font-bold uppercase tracking-widest">Resumo do Projeto</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30 mb-1 md:mb-2">Cliente</p>
                        <p className="font-bold text-sm md:text-base">{selectedItem.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30 mb-1 md:mb-2">Email</p>
                        <p className="font-mono text-[10px] md:text-sm break-all">{selectedItem.email}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">Serviços Solicitados</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.services?.map(s => (
                          <span key={s} className="px-3 md:px-4 py-1.5 bg-accent/20 text-accent rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-accent/20">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 md:p-6 bg-black/20 rounded-2xl border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">A Ideia</p>
                      <p className="text-xs md:text-sm leading-relaxed text-white/80">{selectedItem.idea}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[9px] md:text-[10px] text-white/20 font-mono">RECEBIDO_EM: {new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 space-y-4">
                      <MessageSquare className="w-12 h-12" />
                      <p className="text-[10px] uppercase tracking-[0.4em]">Inicie a conversa abaixo</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isAdmin = msg.sender_id === user.id;
                      return (
                        <div key={msg.id || i} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl p-5 text-sm leading-relaxed shadow-xl ${
                            isAdmin 
                              ? 'bg-white/10 text-white rounded-br-sm border border-white/5' 
                              : 'bg-accent/10 text-accent rounded-bl-sm border border-accent/20'
                          }`}>
                            {msg.text}
                            <div className="flex items-center justify-between gap-4 mt-3">
                              <span className={`text-[9px] font-mono ${isAdmin ? 'text-white/20' : 'text-accent/40'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isAdmin && <CheckCircle className="w-3 h-3 text-accent/40" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {activeTab === 'chats' && (
              <footer className="p-8 border-t border-white/5 bg-primary/50 backdrop-blur-xl">
                <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Responder para ${selectedItem.name?.split(' ')[0] || 'cliente'}...`}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-accent text-primary flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-lg"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              </footer>
            )}
          </>
        )}
      </main>
    </div>
  );
};
