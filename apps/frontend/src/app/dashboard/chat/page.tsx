'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Send, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Suspense } from 'react';

const bridePhotos = ['https://randomuser.me/api/portraits/women/44.jpg','https://randomuser.me/api/portraits/women/68.jpg','https://randomuser.me/api/portraits/women/12.jpg','https://randomuser.me/api/portraits/women/29.jpg'];
const groomPhotos  = ['https://randomuser.me/api/portraits/men/32.jpg','https://randomuser.me/api/portraits/men/75.jpg','https://randomuser.me/api/portraits/men/18.jpg','https://randomuser.me/api/portraits/men/51.jpg'];

function getAvatar(idx: number, role?: string) {
  const pool = role === 'BRIDE' ? bridePhotos : groomPhotos;
  return pool[idx % pool.length];
}

function ChatContent() {
  const { user, accessToken } = useAuthStore();
  const searchParams = useSearchParams();
  const initialPartnerId = searchParams.get('partner') || searchParams.get('userId');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialPartnerId ? parseInt(initialPartnerId) : null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(!!initialPartnerId);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/chat/conversations') as any,
  });

  const { data: chatData } = useQuery({
    queryKey: ['chat', selectedUserId],
    queryFn: () => api.get(`/chat/${selectedUserId}?limit=50`) as any,
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    if (chatData) {
      const msgs = (chatData as any)?.data?.messages || [];
      setMessages(msgs);
    }
  }, [chatData]);

  useEffect(() => {
    if (!accessToken) return;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const s = io(`${socketUrl}/chat`, { auth: { token: accessToken } });
    s.on('new_message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });
    s.on('message_sent', (msg: any) => setMessages(prev => [...prev, msg]));
    s.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2500);
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text || !socket || !selectedUserId) return;
    socket.emit('send_message', { receiverId: selectedUserId, message: text });
    setMessage('');
  };

  const selectConversation = (userId: number) => {
    setSelectedUserId(userId);
    setMessages([]);
    setMobileShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const convList: any[] = ((conversations as any)?.data || []).filter((c: any) =>
    !search || c.partner?.profile?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const selectedConv = ((conversations as any)?.data || []).find((c: any) => c.partnerId === selectedUserId);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] rounded-2xl overflow-hidden border border-orange-100 bg-white shadow-sm">

      {/* Conversation list */}
      <div className={`${mobileShowChat ? 'hidden' : 'flex'} md:flex w-full md:w-72 lg:w-80 border-r border-orange-100 flex-col bg-white shrink-0`}>
        <div className="px-4 py-4 border-b border-orange-50">
          <h2 className="heading-calligraphy text-xl font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 text-xs bg-cream-100 border border-orange-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-300" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
              <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Send an interest first to start chatting</p>
            </div>
          ) : convList.map((conv: any, idx: number) => {
            const isActive = selectedUserId === conv.partnerId;
            return (
              <button key={conv.partnerId} onClick={() => selectConversation(conv.partnerId)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
                  isActive ? 'bg-primary-50 border-r-2 border-primary-500' : 'hover:bg-cream-100 border-r-2 border-transparent'
                }`}>
                <div className="relative shrink-0">
                  <img src={getAvatar(idx, conv.partner?.role)} alt=""
                    className="w-11 h-11 rounded-full object-cover border-2 border-orange-100" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white pulse-dot" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                      {conv.partner?.profile?.name || conv.partner?.email?.split('@')[0] || `User #${conv.partnerId}`}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage || 'Start chatting…'}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {selectedUserId ? (
        <div className={`${mobileShowChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-3 bg-white">
            <button onClick={() => setMobileShowChat(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="relative shrink-0">
              <img src={getAvatar(0, selectedConv?.partner?.role)} alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-100" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {selectedConv?.partner?.profile?.name || `User #${selectedUserId}`}
              </p>
              <p className="text-xs font-medium text-green-500">{isTyping ? 'typing…' : 'Online'}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gradient-to-b from-cream-100/60 to-white">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">Send a message to begin your conversation</p>
              </div>
            )}
            {messages.map((msg: any, i: number) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isMe ? 'msg-in-right' : 'msg-in-left'}`}>
                  {!isMe && (
                    <img src={getAvatar(0, selectedConv?.partner?.role)}
                      className="w-7 h-7 rounded-full object-cover border border-orange-100 shrink-0 self-end mr-2 mb-1" alt="" />
                  )}
                  <div className="max-w-[72%] sm:max-w-[58%]">
                    <div className={`px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-orange-100'
                    }`}>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                    <p className={`text-[10px] mt-1 text-gray-400 ${isMe ? 'text-right' : ''}`}>
                      {msg.createdAt ? formatRelativeTime(msg.createdAt) : 'now'}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing bubble */}
            {isTyping && (
              <div className="flex items-end gap-2 msg-in-left">
                <img src={getAvatar(0, selectedConv?.partner?.role)}
                  className="w-7 h-7 rounded-full object-cover border border-orange-100 shrink-0" alt="" />
                <div className="bg-white border border-orange-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  {[0, 1, 2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-orange-100 bg-white">
            <div className="flex items-center gap-2">
              <input ref={inputRef} value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                className="flex-1 px-4 py-2.5 bg-cream-100 border border-orange-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all"
                placeholder="Type a message…" />
              <button onClick={sendMessage} disabled={!message.trim()}
                className="w-11 h-11 bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-colors shadow-sm shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-cream-100/20">
          <h3 className="heading-calligraphy text-2xl font-semibold text-gray-700 mb-2">Start a Conversation</h3>
          <p className="text-sm text-gray-400 max-w-xs">Select a conversation or send an interest to a profile to begin chatting.</p>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
