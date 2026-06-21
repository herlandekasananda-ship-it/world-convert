'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation'; // 🚀 Menggunakan next/navigation murni untuk Client Component
import { 
  LuCheck, 
  LuX, 
  LuLoader, 
  LuRefreshCw, 
  LuUser, 
  LuCoins, 
  LuGlobe
} from 'react-icons/lu';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyz.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Transaksi {
  id: string;
  created_at: string;
  locale: string;
  mata_uang: string;
  metode_bayar: string;
  nama_bank: string;
  nama_pemilik: string;
  nomor_rekening: string;
  jumlah_wld: number;
  estimasi_lokal: number;
  status: 'pending' | 'sukses' | 'gagal';
}

export default function AdminTransaksiPage() {
  // 🚀 Mengambil parameter locale secara aman di sisi client Next.js 15
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'id';

  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transaksi')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setTransaksiList(data as Transaksi[]);
        setErrorMsg('');
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Gagal memuat data dari database.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    const channel = supabase
      .channel('realtime-admin-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi' }, () => {
        fetchTransactions();
      })
      .subscribe();

    const interval = setInterval(fetchTransactions, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setTransaksiList(data as Transaksi[]);
      setErrorMsg('');
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, nextStatus: 'sukses' | 'gagal') => {
    const konfirmasi = confirm(`Apakah Anda yakin ingin mengubah status transaksi ini menjadi ${nextStatus.toUpperCase()}?`);
    if (!konfirmasi) return;

    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;
      alert(`Transaksi berhasil di-update menjadi ${nextStatus}!`);
      handleManualRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) alert("Gagal merubah status: " + err.message);
    }
  };

  const formatLokal = (val: number, code: string) => {
    const config: Record<string, string> = { IDR: 'id-ID', EUR: 'de-DE', PHP: 'en-PH', USD: 'en-US' };
    return new Intl.NumberFormat(config[code] || 'en-US', {
      minimumFractionDigits: code === 'IDR' ? 0 : 2,
      maximumFractionDigits: code === 'IDR' ? 0 : 2,
    }).format(val);
  };

  const filteredData = transaksiList.filter(tx => filterStatus === 'all' ? true : tx.status === filterStatus);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.03em' }}>
              Panel Admin Pencairan Worldcoin
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Manajemen realtime permintaan penarikan dana global customer untuk region ({locale}).
            </p>
          </div>
          <button 
            onClick={handleManualRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* CONTROLLER & FILTER BUTTONS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'sukses', 'gagal'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer',
                backgroundColor: filterStatus === status ? '#0f172a' : '#ffffff',
                color: filterStatus === status ? '#ffffff' : '#475569',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                borderWidth: '1px', borderStyle: 'solid', borderColor: filterStatus === status ? '#0f172a' : '#e2e8f0'
              }}
            >
              {status} ({status === 'all' ? transaksiList.length : transaksiList.filter(t => t.status === status).length})
            </button>
          ))}
        </div>

        {/* MAIN DATA TABLE PANEL */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Customer & Negara</th>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Tujuan Pembayaran</th>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Jumlah WLD</th>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Estimasi Kirim</th>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Aksi Kelola</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode='popLayout'>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <LuLoader size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#2563eb' }} />
                        <span>Membuka enkripsi data transaksi...</span>
                      </td>
                    </tr>
                  ) : errorMsg ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#ef4444', fontWeight: '700' }}>
                        Gagal Sinkronisasi DB! <br />
                        <span style={{ fontWeight: '400', fontSize: '0.85rem', color: '#64748b' }}>{errorMsg}</span>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                        Tidak ditemukan permintaan transaksi dengan status ini.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((tx) => (
                      <motion.tr 
                        key={tx.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}
                      >
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                              <LuUser size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{tx.nama_pemilik}</div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem' }}>
                                <LuGlobe size={10} /> Region ({tx.locale})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>
                            {tx.nama_bank}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                            <code style={{ fontSize: '0.85rem', backgroundColor: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '4px', color: '#0f172a', fontWeight: '600' }}>
                              {tx.nomor_rekening}
                            </code>
                          </div>
                          <small style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'capitalize' }}>Method: {tx.metode_bayar.replace('_', ' ')}</small>
                        </td>

                        <td style={{ padding: '1rem', fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <LuCoins size={14} style={{ color: '#b45309' }} />
                            {tx.jumlah_wld} WLD
                          </div>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: '#16a34a', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                            {tx.mata_uang} {formatLokal(tx.estimasi_lokal, tx.mata_uang)}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Bersih tanpa potongan</span>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
                            backgroundColor: tx.status === 'sukses' ? '#dcfce7' : tx.status === 'gagal' ? '#fee2e2' : '#fef9c3',
                            color: tx.status === 'sukses' ? '#15803d' : tx.status === 'gagal' ? '#b91c1c' : '#a16207'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: tx.status === 'sukses' ? '#16a34a' : tx.status === 'gagal' ? '#ef4444' : '#eab308' }} />
                            {tx.status}
                          </span>
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {tx.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button 
                                onClick={() => updateStatus(tx.id, 'sukses')}
                                style={{ border: 'none', backgroundColor: '#10b981', color: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <LuCheck size={14} /> Sukses
                              </button>
                              <button 
                                onClick={() => updateStatus(tx.id, 'gagal')}
                                style={{ border: 'none', backgroundColor: '#ef4444', color: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <LuX size={14} /> Tolak
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', paddingRight: '0.5rem' }}>Sudah Diproses</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}