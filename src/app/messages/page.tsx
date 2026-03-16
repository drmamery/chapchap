'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, ArrowLeft, Phone, MoreVertical, Image as ImageIcon, Paperclip } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-001', shopName: 'TechZone Bouaké', shopLogo: null, lastMessage: 'Le Samsung est toujours disponible ?',
    lastTime: new Date(Date.now() - 5 * 60000).toISOString(), unread: 2,
    messages: [
      { id: 'm1', content: 'Bonjour ! Je suis intéressé par le Samsung Galaxy A55.', isOwn: true, time: new Date(Date.now() - 30 * 60000).toISOString() },
      { id: 'm2', content: 'Bonjour ! Oui, il est disponible. Nous avons 15 unités en stock.', isOwn: false, time: new Date(Date.now() - 25 * 60000).toISOString() },
      { id: 'm3', content: 'Quel est le délai de livraison pour Bouaké ?', isOwn: true, time: new Date(Date.now() - 20 * 60000).toISOString() },
      { id: 'm4', content: 'Livraison en 24h dans tout Bouaké. Nous livrons tous les jours !', isOwn: false, time: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: 'm5', content: 'Le Samsung est toujours disponible ?', isOwn: true, time: new Date(Date.now() - 5 * 60000).toISOString() },
    ],
  },
  {
    id: 'conv-002', shopName: 'Fashion Wax by Fatou', shopLogo: null, lastMessage: 'Oui je fais les mesures sur mesure !',
    lastTime: new Date(Date.now() - 2 * 3600000).toISOString(), unread: 0,
    messages: [
      { id: 'm6', content: 'Bonjour, vous faites la couture sur mesure ?', isOwn: true, time: new Date(Date.now() - 3 * 3600000).toISOString() },
      { id: 'm7', content: 'Oui je fais les mesures sur mesure ! Envoyez-moi vos mesures.', isOwn: false, time: new Date(Date.now() - 2 * 3600000).toISOString() },
    ],
  },
];

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_CONVERSATIONS[0].messages);
  const [isSending, setIsSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv: typeof MOCK_CONVERSATIONS[0]) => {
    setActiveConv(conv);
    setMessages(conv.messages);
    setShowList(false);
  };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);

    const newMsg = {
      id: `m-${Date.now()}`,
      content: message.trim(),
      isOwn: true,
      time: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `m-reply-${Date.now()}`,
        content: 'Merci pour votre message. Je vous réponds dans les plus brefs délais.',
        isOwn: false,
        time: new Date().toISOString(),
      }]);
    }, 1500);

    setIsSending(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversations list */}
            <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 flex flex-col ${!showList ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-display font-bold text-chapchap-secondary dark:text-white mb-3">Messages</h2>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Rechercher..." className="input pl-9 text-sm py-2" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 ${activeConv.id === conv.id ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-chapchap flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {conv.shopName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-chapchap-secondary dark:text-white">{conv.shopName}</span>
                        <span className="text-2xs text-chapchap-muted">{formatTimeAgo(conv.lastTime)}</span>
                      </div>
                      <p className="text-xs text-chapchap-muted truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-chapchap-primary text-white text-2xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 flex flex-col min-w-0 ${showList ? 'hidden md:flex' : 'flex'}`}>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-chapchap flex items-center justify-center text-white font-bold flex-shrink-0">
                  {activeConv.shopName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-chapchap-secondary dark:text-white">{activeConv.shopName}</p>
                  <p className="text-2xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> En ligne
                  </p>
                </div>
                <button className="btn-icon text-gray-400 hover:text-chapchap-primary p-2">
                  <Phone size={16} />
                </button>
                <button className="btn-icon text-gray-400 hover:text-chapchap-primary p-2">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isOwn && (
                      <div className="w-7 h-7 rounded-full bg-gradient-chapchap flex items-center justify-center text-white text-xs font-bold mr-2 mt-auto flex-shrink-0">
                        {activeConv.shopName[0]}
                      </div>
                    )}
                    <div className="max-w-[75%]">
                      <div className={msg.isOwn ? 'message-bubble-sent' : 'message-bubble-received'}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className={`text-2xs text-chapchap-muted mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                        {formatTimeAgo(msg.time)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-1 mr-1">
                    <button className="btn-icon text-gray-400 hover:text-chapchap-primary p-2">
                      <ImageIcon size={18} />
                    </button>
                    <button className="btn-icon text-gray-400 hover:text-chapchap-primary p-2">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                      }}
                      placeholder="Écrire un message..."
                      rows={1}
                      className="input resize-none py-3 pr-12 text-sm overflow-hidden"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isSending}
                    className="btn-primary p-3 rounded-xl flex-shrink-0 disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-2xs text-chapchap-muted mt-1.5 text-center">
                  💬 Messages chiffrés · Entrée pour envoyer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
