import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Send, Search, MessageSquare, Bot, ArrowLeft, Sparkles, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const AdminPanel = () => {
  const [clients, setClients] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') { navigate('/chat'); return; }
      
      setUser({ ...session.user, profile });
      fetchAllData();
      setLoading(false);
    };
    checkAdmin();

    const profilesSub = supabase.channel('profiles_all').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData()).subscribe();
    const leadsSub = supabase.channel('leads_all').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchAllData()).subscribe();
    return () => { profilesSub.unsubscribe(); leadsSub.unsubscribe(); };
  }, []);

  const fetchAllData = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'client').neq('status', 'archived');
    const { data: leads } = await supabase.from('leads').select('*');

    const leadMap = {};
    (leads || []).forEach(l => { leadMap[l.email] = l; });

    const merged = (profiles || []).map(p => ({
      ...p,
      type: 'profile',
      lead: leadMap[p.email] || null
    }));

    const profileEmails = new Set(merged.map(p => p.email));
    (leads || []).forEach(l => {
      if (!profileEmails.has(l.email)) {
        merged.push({
          ...l,
          id: l.id,
          name: l.name,
          email: l.email,
          type: 'lead',
          lead: l
        });
      }
    });

    setClients(merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  };

  useEffect(() => {
    if (selectedItem) {
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedItem.id}),and(sender_id.eq.${selectedItem.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
        setMessages(data || []);
      };
      fetchMessages();

      const sub = supabase.channel(`chat_${selectedItem.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          if (payload.new.sender_id === selectedItem.id || payload.new.receiver_id === selectedItem.id) {
            setMessages(prev => [...prev, payload.new]);
          }
        }).subscribe();
      return () => { sub.unsubscribe(); };
    }
  }, [selectedItem, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedItem) return;
    const text = newMessage;
    setNewMessage('');
    await supabase.from('messages').insert([{ text, sender_id: user.id, receiver_id: selectedItem.id }]);
  };

  const filteredItems = clients.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-accent font-mono text-xs uppercase tracking-widest">Carregando...</div>;

  return (
    <div className="flex h-screen bg-primary overflow-hidden text-white font-sans">
      <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 bg-primary/30 flex flex-col h-full ${selectedItem ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30"><Bot className="w-5 h-5 text-accent" /></div>
            <div><h2 className="font-bold text-sm uppercase tracking-tight">Lume Studio</h2><p className="text-[10px] text-white/40 font-mono">ADMIN_SYSTEM</p></div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => navigate('/')} className="p-2 text-white/40 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
            <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="p-2 text-white/40 hover:text-red-400"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" placeholder="Buscar conversa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredItems.map(item => (
            <button key={item.id} onClick={() => { setSelectedItem(item); setShowLeadDetails(false); }} className={`w-full p-5 flex items-center gap-4 border-b border-white/5 transition-all hover:bg-white/5 ${selectedItem?.id === item.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'lead' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white'}`}>
                {item.type === 'lead' ? <Sparkles className="w-4 h-4" /> : <span className="font-bold text-xs uppercase">{(item.name || '?').charAt(0)}</span>}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm truncate">{item.name || 'Sem Nome'}</span>
                  {item.lead && <div className="p-1 bg-accent/20 rounded text-accent"><Sparkles className="w-3 h-3" /></div>}
                </div>
                <p className="text-[10px] text-white/30 truncate font-mono uppercase">{item.type === 'lead' ? 'ORÇAMENTO NOVO' : item.email}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className={`flex-1 flex flex-col bg-primary relative ${!selectedItem ? 'hidden md:flex' : 'flex'}`}>
        {selectedItem ? (
          <>
            <header className="p-6 border-b border-white/5 bg-primary/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedItem(null)} className="md:hidden p-2 text-white/40"><ArrowLeft className="w-5 h-5" /></button>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-accent border border-white/10">{(selectedItem.name || '?').charAt(0)}</div>
                <div><h3 className="font-bold text-sm uppercase tracking-widest">{selectedItem.name}</h3><p className="text-[10px] text-white/40 font-mono">{selectedItem.email}</p></div>
              </div>
              <div className="flex gap-2">
                {selectedItem.lead && (
                  <button onClick={() => setShowLeadDetails(!showLeadDetails)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${showLeadDetails ? 'bg-accent text-primary border-accent' : 'bg-white/5 text-white/40 border-white/10 hover:border-accent/50'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {showLeadDetails ? 'Fechar Orçamento' : 'Ver Orçamento'}
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar relative">
              {showLeadDetails && selectedItem.lead && (
                <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] -mr-16 -mt-16" />
                    <div className="flex items-center gap-3 text-accent"><Sparkles className="w-5 h-5" /><h3 className="text-sm font-bold uppercase tracking-widest">Resumo do Projeto</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Investimento</p><p className="font-bold text-sm text-accent">{selectedItem.lead.budget || 'Não informado'}</p></div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Serviços</p><p className="text-[10px] font-bold text-white/80 uppercase">{selectedItem.lead.services?.join(', ')}</p></div>
                    </div>
                    <div className="p-5 bg-black/20 rounded-2xl border border-white/5"><p className="text-[9px] uppercase tracking-widest text-white/30 mb-3">A Ideia</p><p className="text-xs leading-relaxed text-white/80 italic">"{selectedItem.lead.idea}"</p></div>
                  </div>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 space-y-4"><MessageSquare className="w-12 h-12" /><p className="text-[10px] uppercase tracking-[0.4em]">Inicie a conversa abaixo</p></div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex w-full ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-xl ${msg.sender_id === user.id ? 'bg-white/10 text-white rounded-br-sm border border-white/5' : 'bg-accent/10 text-accent rounded-bl-sm border border-accent/20'}`}>
                      {msg.text}
                      <div className="flex items-center justify-between gap-4 mt-2"><span className="text-[9px] opacity-30">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{msg.sender_id === user.id && <CheckCircle className="w-3 h-3 opacity-30" />}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-6 border-t border-white/5 bg-primary/50 backdrop-blur-xl">
              <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-3">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Escrever para ${selectedItem.name}...`} className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50" />
                <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 shadow-lg"><Send className="w-5 h-5 ml-1" /></button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 space-y-6"><div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center border border-accent/20"><MessageSquare className="w-10 h-10 text-accent" /></div><div className="space-y-2"><h2 className="text-xl font-bold uppercase tracking-[0.3em]">Painel de Controle</h2><p className="text-[10px] uppercase tracking-widest">Selecione uma conversa para começar</p></div></div>
        )}
      </main>

      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={() => { confirmConfig.onConfirm(); setConfirmConfig({ ...confirmConfig, isOpen: false }); }} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} />
    </div>
  );
};
