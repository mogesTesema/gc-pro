import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { IChat, IMessage } from '../../types';
import { PageLoading, Avatar, Spinner } from '../../components/common/index';
import { Send, ArrowLeft, MessageSquare, CheckCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const formatTime = (d: string) => {
  const date = new Date(d);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatPage: React.FC = () => {
  const { chatId: paramId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [chats, setChats] = useState<IChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(paramId);
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load chat list
  useEffect(() => {
    (async () => {
      try {
        const res = await chatAPI.getMy();
        setChats(res.data.chats || []);
      } catch { toast.error('Failed to load chats'); }
      finally { setChatsLoading(false); }
    })();
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChatId) return;
    setMsgsLoading(true);
    setMessages([]);
    setOtherTyping(false);
    (async () => {
      try {
        const [chatRes, msgsRes] = await Promise.all([
          chatAPI.getById(activeChatId),
          chatAPI.getMessages(activeChatId),
        ]);
        setActiveChat(chatRes.data.chat);
        setMessages(msgsRes.data.messages || []);
        socket?.emit('chat:join', activeChatId);
        socket?.emit('messages:read', activeChatId);
        setChats((prev) => prev.map((c) => c._id === activeChatId
          ? { ...c, unreadCount: { ...c.unreadCount, [user!._id]: 0 } } : c));
      } catch { toast.error('Failed to load messages'); }
      finally { setMsgsLoading(false); }
    })();
    return () => { socket?.emit('chat:leave', activeChatId); };
  }, [activeChatId, socket]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, otherTyping]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg: IMessage) => {
      if (msg.chatId === activeChatId) {
        setMessages((prev) => {
          // Replace optimistic message if from self, or append
          const filtered = prev.filter((m) => !m._id.startsWith('temp-'));
          return [...filtered, msg];
        });
        setChats((prev) => prev.map((c) => c._id === activeChatId ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt } : c));
        socket.emit('messages:read', activeChatId);
      } else {
        setChats((prev) => prev.map((c) => c._id === msg.chatId
          ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: { ...c.unreadCount, [user!._id]: (c.unreadCount?.[user!._id] || 0) + 1 } } : c));
      }
    };
    const onTyping   = (d: any) => { if (d.userId !== user?._id) setOtherTyping(true); };
    const onStopType = () => setOtherTyping(false);
    socket.on('message:received', onMsg);
    socket.on('chat:typing', onTyping);
    socket.on('chat:stop_typing', onStopType);
    return () => { socket.off('message:received', onMsg); socket.off('chat:typing', onTyping); socket.off('chat:stop_typing', onStopType); };
  }, [socket, activeChatId, user]);

  const sendMsg = async () => {
    if (!input.trim() || !activeChatId) return;
    const content = input.trim();
    setInput('');
    const temp: IMessage = { _id: `temp-${Date.now()}`, chatId: activeChatId, senderId: user as any, content, messageType: 'text', isRead: false, createdAt: new Date().toISOString() };
    setMessages((p) => [...p, temp]);
    if (socket?.connected) {
      socket.emit('message:send', { chatId: activeChatId, content });
    } else {
      try {
        await chatAPI.sendMessage(activeChatId, { content });
      } catch {
        toast.error('Send failed');
        setMessages((p) => p.filter((m) => m._id !== temp._id));
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && activeChatId) {
      socket.emit('chat:typing', activeChatId);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit('chat:stop_typing', activeChatId), 1500);
    }
  };

  const selectChat = (id: string) => { setActiveChatId(id); navigate(`/chat/${id}`, { replace: true }); };

  const otherUser = activeChat?.participants.find((p: any) => (p as any)._id !== user?._id) as any;
  const isOnline  = otherUser && onlineUsers.includes(otherUser._id ?? otherUser);

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Chat list ── */}
      <div className={`w-72 border-r flex flex-col shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b">
          <h2 className="font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? <div className="flex justify-center py-8"><Spinner size={22} /></div>
          : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <MessageSquare size={32} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-500">No conversations</p>
            </div>
          ) : chats.map((chat) => {
            const other = chat.participants.find((p: any) => (p as any)._id !== user?._id) as any;
            const unread = chat.unreadCount?.[user?._id || ''] || 0;
            return (
              <button key={chat._id} onClick={() => selectChat(chat._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b ${chat._id === activeChatId ? 'bg-blue-50' : ''}`}>
                <Avatar name={other?.name || 'User'} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">{other?.name || 'User'}</p>
                    {chat.lastMessageAt && <span className="text-xs text-gray-400 shrink-0 ml-1">{formatTime(chat.lastMessageAt)}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'No messages'}</p>
                    {unread > 0 && <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">{unread}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeChatId ? (
          <div className="text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
              <button onClick={() => { setActiveChatId(undefined); navigate('/chat', { replace: true }); }} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
                <ArrowLeft size={18} />
              </button>
              {otherUser && <>
                <Avatar name={otherUser?.name || 'User'} size="md" online={isOnline} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{otherUser?.name}</p>
                  <p className="text-xs text-gray-500">{isOnline ? '🟢 Online' : 'Offline'}{otherTyping && ' · typing…'}</p>
                </div>
              </>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
              {msgsLoading ? <div className="flex justify-center py-10"><Spinner size={24} /></div>
              : messages.length === 0 ? <div className="text-center text-gray-400 text-sm py-12">No messages yet. Say hello! 👋</div>
              : messages.map((msg) => {
                const isMine = (msg.senderId as any)?._id === user?._id || (msg.senderId as any) === user?._id;
                return (
                  <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && <Avatar name={(msg.senderId as any)?.name || 'U'} size="sm" />}
                    <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                        {isMine && (msg.isRead ? <CheckCheck size={11} className="text-blue-400" /> : <Check size={11} className="text-gray-300" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {otherTyping && (
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">{[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t bg-white">
              <div className="flex items-center gap-2">
                <input value={input} onChange={handleInput} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg())}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={sendMsg} disabled={!input.trim() || sending}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-40">
                  {sending ? <Spinner size={15} /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
