'use client';

import { useEffect, useState, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSend, 
  LuUser, 
  LuShieldCheck, 
  LuCircle, 
  LuMessagesSquare, 
  LuUsers, 
  LuChevronRight 
} from 'react-icons/lu';

interface Props {
  params: Promise<{ locale: string }>;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

interface ChatSession {
  socketId: string;
  username: string;
  locale: string;
  joinedAt: string;
  messages: Message[];
}

export default function AdminCSPage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale: rawLocale } = use(params);

  // State Manajemen Admin
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Inisialisasi Koneksi Socket sebagai Admin/Agent
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        role: 'agent', // Memberitahu server bahwa ini adalah akun admin/agen
        username: 'Agent Support'
      }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      // Minta data semua list chat aktif dari lowdb saat pertama konek
      socketRef.current?.emit('get_all_sessions');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Mendengarkan pembaruan data seluruh sesi dari server lowdb
    socketRef.current.on('update_sessions', (updatedSessions: ChatSession[]) => {
      setSessions(updatedSessions);
    });

    // Mendengarkan jika ada pesan masuk baru dari user mana saja
    socketRef.current.on('receive_message', (data: { socketId: string; message: Message }) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.socketId === data.socketId) {
            return {
              ...session,
              messages: [...session.messages, data.message]
            };
          }
          return session;
        })
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Auto-scroll saat ganti user atau ada pesan baru masuk
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionId, sessions]);

  // Cari data sesi user yang sedang diklik/aktif saat ini
  const activeSession = sessions.find((s) => s.socketId === activeSessionId);

  // 2. Fungsi Mengirim Balasan Chat dari Admin
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId) return;

    const agentMessage: Message = {
      id: Math.random().toString(),
      sender: 'agent',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update UI Lokal Admin Instan
    setSessions((prev) =>
      prev.map((session) => {
        if (session.socketId === activeSessionId) {
          return { ...session, messages: [...session.messages, agentMessage] };
        }
        return session;
      })
    );

    // Kirim balasan ke server agar diteruskan ke user & dicatat di db.json
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_agent_message', {
        targetSocketId: activeSessionId,
        text: inputText
      });
    }

    setInputText('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem', display: 'flex', gap: '1rem', height: 'calc(100vh - 40px)', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 📁 SIDEBAR: DAFTAR USER YANG SEDANG CHAT */}
      <div style={{ width: '320px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
            <LuUsers size={18} />
            <h2 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>Antrean Chat CS</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: isConnected ? '#f0fdf4' : '#fff1f2', padding: '0.25rem 0.5rem', borderRadius: '99px', border: `1px solid ${isConnected ? '#bbf7d0' : '#fecdd3'}` }}>
            <LuCircle size={6} fill={isConnected ? '#10b981' : '#ef4444'} color="transparent" />
            <span style={{ fontSize: '0.6rem', fontWeight: '700', color: isConnected ? '#15803d' : '#be123c' }}>
              {isConnected ? 'Server Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* List Antrean User */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '2rem' }}>Belum ada pelanggan yang chat...</div>
          ) : (
            sessions.map((session) => {
              const isSelected = session.socketId === activeSessionId;
              const lastMsg = session.messages[session.messages.length - 1]?.text || 'Baru bergabung...';
              return (
                <button
                  key={session.socketId}
                  onClick={() => setActiveSessionId(session.socketId)}
                  style={{ width: '100%', border: 'none', textAlign: 'left', padding: '0.75rem', borderRadius: '10px', backgroundColor: isSelected ? '#eff6ff' : 'transparent', borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                >
                  <div style={{ overflow: 'hidden', flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: isSelected ? '#1e40af' : '#0f172a' }}>{session.username}</span>
                      <span style={{ fontSize: '0.6rem', backgroundColor: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', color: '#475569' }}>{session.locale}</span>
                    </div>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastMsg}</p>
                  </div>
                  <LuChevronRight size={14} style={{ color: isSelected ? '#2563eb' : '#cbd5e1' }} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 💬 MAIN CHAT PANEL: RUANG BALAS CHAT */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {activeSession ? (
          <>
            {/* Header Informasi Ruang Obrolan User Aktif */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuUser size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>Melayani: {activeSession.username}</h3>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>ID Koneksi: {activeSession.socketId}</p>
              </div>
            </div>

            {/* Kontainer Isi Balon Chat (Scrollable) */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#fafafa' }}>
              <AnimatePresence initial={false}>
                {activeSession.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-end' : 'flex-start', width: '100%' }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isAgent ? <LuShieldCheck size={10} style={{ color: '#2563eb' }} /> : <LuUser size={10} />}
                        {isAgent ? 'You (Agent Support)' : activeSession.username}
                      </span>
                      <div style={{ maxWidth: '75%', padding: '0.65rem 0.95rem', borderRadius: isAgent ? '14px 14px 2px 14px' : '14px 14px 14px 2px', backgroundColor: isAgent ? '#2563eb' : '#ffffff', color: isAgent ? '#ffffff' : '#1e293b', fontSize: '0.85rem', lineHeight: '1.45', wordBreak: 'break-word', border: isAgent ? 'none' : '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#cbd5e1', marginTop: '0.2rem' }}>{msg.timestamp}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Balas Pesan */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Balas pesan ke ${activeSession.username}...`}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{ width: '42px', height: '42px', backgroundColor: !inputText.trim() ? '#cbd5e1' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !inputText.trim() ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
              >
                <LuSend size={14} />
              </button>
            </form>
          </>
        ) : (
          /* Tampilan Default saat belum ada antrean user yang diklik */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '0.5rem' }}>
            <LuMessagesSquare size={36} style={{ color: '#cbd5e1' }} />
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Silakan pilih antrean pelanggan di sebelah kiri untuk mulai membalas chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}