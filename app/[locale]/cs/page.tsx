'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Link } from '@/i18n/routing';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuArrowLeft, 
  LuSend, 
  LuUser, 
  LuShieldCheck, 
  LuCircle, 
  LuMessagesSquare,
  LuLogIn
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

export default function CustomerServicePage({ params }: Props) {
  const { locale: rawLocale } = use(params);
  const locale = (rawLocale || 'en') as 'id' | 'en' | 'es' | 'tl';

  // State Manajemen User & Chat
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Kamus Bahasa Lokalisasi
  const t = {
    id: { 
      title: "Pusat Bantuan", 
      sub: "Tanyakan apa saja seputar pencairan Worldcoin Anda.", 
      placeholder: "Ketik pesan Anda di sini...", 
      back: "Kembali", 
      statusOnline: "Agen Online", 
      statusOffline: "Menghubungkan...",
      loginTitle: "Mulai Obrolan",
      loginSub: "Silakan masukkan nama Anda sebelum terhubung dengan CS kami.",
      loginLabel: "Nama Lengkap / Username",
      loginPlace: "Contoh: Budi Santoso",
      loginBtn: "Masuk Ruang Obrolan"
    },
    en: { 
      title: "Support Center", 
      sub: "Ask anything about your Worldcoin cash out.", 
      placeholder: "Type your message here...", 
      back: "Back", 
      statusOnline: "Agent Online", 
      statusOffline: "Connecting...",
      loginTitle: "Start Chat",
      loginSub: "Please enter your name before connecting with our CS.",
      loginLabel: "Full Name / Username",
      loginPlace: "e.g., John Doe",
      loginBtn: "Join Chat Room"
    },
    es: { 
      title: "Centro de Soporte", 
      sub: "Pregunte lo que sea sobre su retiro de Worldcoin.", 
      placeholder: "Escriba su mensaje aquí...", 
      back: "Volver", 
      statusOnline: "Agente en Línea", 
      statusOffline: "Conectando...",
      loginTitle: "Iniciar Chat",
      loginSub: "Por favor, ingrese su nombre antes de conectarse con soporte.",
      loginLabel: "Nombre Completo",
      loginPlace: "Ej: Juan Pérez",
      loginBtn: "Entrar al Chat"
    },
    tl: { 
      title: "Tulong Center", 
      sub: "Magtanong tungkol sa iyong pag-withdraw ng Worldcoin.", 
      placeholder: "I-type ang mensahe rito...", 
      back: "Bumalik", 
      statusOnline: "Online ang Ahente", 
      statusOffline: "Kumokonekta...",
      loginTitle: "Simulan ang Chat",
      loginSub: "Mangyaring ilagay ang iyong pangalan bago kumonekta sa aming CS.",
      loginLabel: "Buong Pangalan",
      loginPlace: "Hal: Juan Dela Cruz",
      loginBtn: "Pumasok sa Chat"
    }
  }[locale];

  // 1. Inisialisasi Koneksi Socket.io setelah User memasukkan nama (isJoined = true)
  useEffect(() => {
    if (!isJoined) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'wss://api.world-convert.com'; 
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      // 💡 Mengirim nama ke backend agar bisa ditangkap dan disimpan ke Lowdb
      auth: {
        username: username,
        locale: locale
      }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'agent',
            text: locale === 'id' ? `Halo ${username}! Ada yang bisa kami bantu mengenai transaksi Anda hari ini?` : `Hello ${username}! How can we help you with your transaction today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('receive_message', (data: { text: string; sender: 'agent' }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: data.sender,
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJoined, locale]);

  // 2. Auto-scroll ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Submit Form Login Nama
  const handleJoinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      setIsJoined(true);
    }
  };

  // 4. Fungsi Mengirim Pesan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);

    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', {
        text: inputText,
        username: username, // Mengirimkan nama user di tiap payload pesan jika dibutuhkan backend
        locale: locale,
        timestamp: new Date()
      });
    }

    setInputText('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Tombol Kembali Ringkas */}
      <div style={{ marginBottom: '0.75rem' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <LuArrowLeft size={14} />
          {t.back}
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isJoined ? (
          /* ==========================================
             🔒 FORM LOGIN NAMA (SEBELUM CHAT)
             ========================================== */
          <motion.div
            key="login-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
          >
            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <LuUser size={24} />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{t.loginTitle}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 1.5rem 0', lineHeight: '1.4' }}>{t.loginSub}</p>

            <form onSubmit={handleJoinChat}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.loginLabel}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.loginPlace}
                  maxLength={25}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
                />
              </div>

              <button
                type="submit"
                disabled={username.trim().length < 2}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: username.trim().length < 2 ? '#cbd5e1' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: username.trim().length < 2 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)', transition: 'background-color 0.2s' }}
              >
                <LuLogIn size={16} />
                {t.loginBtn}
              </button>
            </form>
          </motion.div>
        ) : (
          /* ==========================================
             💬 RUANG CHAT UTAMA (SETELAH LOGIN)
             ========================================== */
          <motion.div
            key="chat-room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
          >
            {/* Header Info Room */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px 16px 4px 4px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuMessagesSquare size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{t.title}</h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, marginTop: '0.1rem' }}>{t.sub}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: isConnected ? '#f0fdf4' : '#fff1f2', padding: '0.3rem 0.6rem', borderRadius: '99px', border: `1px solid ${isConnected ? '#bbf7d0' : '#fecdd3'}` }}>
                <LuCircle size={8} fill={isConnected ? '#10b981' : '#ef4444'} color="transparent" />
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: isConnected ? '#15803d' : '#be123c' }}>
                  {isConnected ? t.statusOnline : t.statusOffline}
                </span>
              </div>
            </div>

            {/* Ruang Chat Box */}
            <div style={{ flex: 1, backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', borderRadius: '0 0 16px 16px', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isMe ? <LuUser size={10} /> : <LuShieldCheck size={10} style={{ color: '#2563eb' }} />}
                        {isMe ? username : 'Agent Support'}
                      </span>
                      
                      <div style={{ maxWidth: '80%', padding: '0.65rem 0.95rem', borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px', backgroundColor: isMe ? '#2563eb' : '#f1f5f9', color: isMe ? '#ffffff' : '#1e293b', fontSize: '0.88rem', lineHeight: '1.45', wordBreak: 'break-word' }}>
                        {msg.text}
                      </div>
                      
                      <span style={{ fontSize: '0.6rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                        {msg.timestamp}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Formulir Input Pesan */}
            <form onSubmit={handleSendMessage} style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.placeholder}
                disabled={!isConnected}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', backgroundColor: isConnected ? '#ffffff' : '#f8fafc' }}
              />
              <button
                type="submit"
                disabled={!isConnected || !inputText.trim()}
                style={{ width: '46px', height: '46px', backgroundColor: (!isConnected || !inputText.trim()) ? '#cbd5e1' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isConnected || !inputText.trim()) ? 'not-allowed' : 'pointer' }}
              >
                <LuSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}