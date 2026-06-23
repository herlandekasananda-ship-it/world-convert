'use client';

import { useEffect, useState, use, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 
import { createClient } from '@supabase/supabase-js';

import { 
  LuArrowLeft, 
  LuCoins, 
  LuWallet, 
  LuCopy, 
  LuCheck, 
  LuX, 
  LuTrendingUp, 
  LuDollarSign,
  LuChevronDown,
  LuGlobe,
  LuMessageSquare,
  LuStar,
  LuClock,
  LuShieldCheck
} from 'react-icons/lu';


// Fallback untuk berjaga-jaga jika import fi bermasalah, jika menggunakan lucide/lu silakan disesuaikan
import { FiCheckCircle as CheckIcon, FiAlertCircle as AlertIcon } from 'react-icons/fi';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyz.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Props {
  params: Promise<{ locale: string }>;
}

interface CustomAlert {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface PaymentOption {
  value: string;
  label: string;
  brandName: string; 
}

interface LiveNotification {
  name: string;
  country: string;
  flag: string;
  wldAmount: number;
  timeAgo: { id: string; en: string; es: string; tl: string };
  method: string;
}

export default function PencairanPage({ params }: Props) {
  // Unwrapping params menggunakan React.use()
  const resolvedParams = use(params);
  const locale = (resolvedParams?.locale || 'en') as 'id' | 'en' | 'es' | 'tl';
  
  const [wldLocalPrice, setWldLocalPrice] = useState<number>(0);
  const [wldPriceUSD, setWldPriceUSD] = useState<number>(0);
  const [jumlahWld, setJumlahWld] = useState<string>('');
  
  const [namaBank, setNamaBank] = useState<string>('');
  const [namaPemilik, setNamaPemilik] = useState<string>('');
  const [nomorRekening, setNomorRekening] = useState<string>('');

  const [metodeBayar, setMetodeBayar] = useState<string>('');
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<CustomAlert>({ show: false, type: 'success', message: '' });
  const [showStepModal, setShowStepModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const [activeNotification, setActiveNotification] = useState<LiveNotification | null>(null);
  const [currentTransaksiId, setCurrentTransaksiId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const myWalletAddress = "nitayunitaa"; 

  // ── 30 LIVE NOTIFICATION ITEMS ──
  const liveNotificationsList: LiveNotification[] = [
    { name: "Ahmad S.", country: "Indonesia", flag: "🇮🇩", wldAmount: 12.5, method: "DANA", timeAgo: { id: "Baru saja", en: "Just now", es: "Ahora mismo", tl: "Kani-kanina lang" } },
    { name: "Maria Santos", country: "Philippines", flag: "🇵🇭", wldAmount: 24.0, method: "GCash", timeAgo: { id: "1 menit lalu", en: "1 min ago", es: "Hace 1 min", tl: "1 min ang nakalipas" } },
    { name: "Carlos M.", country: "Spain", flag: "🇪🇸", wldAmount: 8.0, method: "Revolut", timeAgo: { id: "2 menit lalu", en: "2 mins ago", es: "Hace 2 min", tl: "2 min ang nakalipas" } },
    { name: "John Doe", country: "United States", flag: "🇺🇸", wldAmount: 50.0, method: "PayPal", timeAgo: { id: "3 menit lalu", en: "3 mins ago", es: "Hace 3 min", tl: "3 min ang nakalipas" } },
    { name: "Budi Santoso", country: "Indonesia", flag: "🇮🇩", wldAmount: 18.2, method: "Bank BCA", timeAgo: { id: "3 menit lalu", en: "3 mins ago", es: "Hace 3 min", tl: "3 min ang nakalipas" } },
    { name: "Juan dela Cruz", country: "Philippines", flag: "🇵🇭", wldAmount: 15.0, method: "Maya", timeAgo: { id: "4 menit lalu", en: "4 mins ago", es: "Hace 4 min", tl: "4 min ang nakalipas" } },
    { name: "Alejandro G.", country: "Spain", flag: "🇪🇸", wldAmount: 32.4, method: "Bizum", timeAgo: { id: "5 menit lalu", en: "5 mins ago", es: "Hace 5 min", tl: "5 min ang nakalipas" } },
    { name: "Siti Rahma", country: "Indonesia", flag: "🇮🇩", wldAmount: 7.5, method: "OVO", timeAgo: { id: "6 menit lalu", en: "6 mins ago", es: "Hace 6 min", tl: "6 min ang nakalipas" } },
    { name: "Sarah Jenkins", country: "United States", flag: "🇺🇸", wldAmount: 110.0, method: "Stripe", timeAgo: { id: "7 menit lalu", en: "7 mins ago", es: "Hace 7 min", tl: "7 min ang nakalipas" } },
    { name: "Dindo M.", country: "Philippines", flag: "🇵🇭", wldAmount: 43.0, method: "GCash", timeAgo: { id: "8 menit lalu", en: "8 mins ago", es: "Hace 8 min", tl: "8 min ang nakalipas" } },
    { name: "Rian H.", country: "Indonesia", flag: "🇮🇩", wldAmount: 22.0, method: "Bank Mandiri", timeAgo: { id: "9 menit lalu", en: "9 mins ago", es: "Hace 9 min", tl: "9 min ang nakalipas" } },
    { name: "Mateo S.", country: "Spain", flag: "🇪🇸", wldAmount: 14.5, method: "Revolut", timeAgo: { id: "11 menit lalu", en: "11 mins ago", es: "Hace 11 min", tl: "11 min ang nakalipas" } },
    { name: "Dewi Utami", country: "Indonesia", flag: "🇮🇩", wldAmount: 9.3, method: "GoPay", timeAgo: { id: "12 menit lalu", en: "12 mins ago", es: "Hace 12 min", tl: "12 min ang nakalipas" } },
    { name: "Michael K.", country: "United States", flag: "🇺🇸", wldAmount: 65.0, method: "PayPal", timeAgo: { id: "14 menit lalu", en: "14 mins ago", es: "Hace 14 min", tl: "14 min ang nakalipas" } },
    { name: "Princess L.", country: "Philippines", flag: "🇵🇭", wldAmount: 19.0, method: "Maya", timeAgo: { id: "16 menit lalu", en: "16 mins ago", es: "Hace 16 min", tl: "16 min ang nakalipas" } },
    { name: "Lucia F.", country: "Spain", flag: "🇪🇸", wldAmount: 5.5, method: "Bizum", timeAgo: { id: "18 menit lalu", en: "18 mins ago", es: "Hace 18 min", tl: "18 min ang nakalipas" } },
    { name: "Eko Prasetyo", country: "Indonesia", flag: "🇮🇩", wldAmount: 38.0, method: "Bank BRI", timeAgo: { id: "19 menit lalu", en: "19 mins ago", es: "Hace 19 min", tl: "19 min ang nakalipas" } },
    { name: "David L.", country: "United States", flag: "🇺🇸", wldAmount: 85.2, method: "Stripe", timeAgo: { id: "21 menit lalu", en: "21 mins ago", es: "Hace 21 min", tl: "21 min ang nakalipas" } },
    { name: "Mark G.", country: "Philippines", flag: "🇵🇭", wldAmount: 30.0, method: "GCash", timeAgo: { id: "23 menit lalu", en: "23 mins ago", es: "Hace 23 min", tl: "23 min ang nakalipas" } },
    { name: "Javier R.", country: "Spain", flag: "🇪🇸", wldAmount: 75.0, method: "SEPA Bank", timeAgo: { id: "25 menit lalu", en: "25 mins ago", es: "Hace 25 min", tl: "25 min ang nakalipas" } },
    { name: "Andi Wijaya", country: "Indonesia", flag: "🇮🇩", wldAmount: 100.0, method: "Bank BCA", timeAgo: { id: "27 menit lalu", en: "27 mins ago", es: "Hace 27 min", tl: "27 min ang nakalipas" } },
    { name: "Robert H.", country: "United States", flag: "🇺🇸", wldAmount: 15.0, method: "PayPal", timeAgo: { id: "29 menit lalu", en: "29 mins ago", es: "Hace 29 min", tl: "29 min ang nakalipas" } },
    { name: "Angelica B.", country: "Philippines", flag: "🇵🇭", wldAmount: 11.5, method: "Maya", timeAgo: { id: "32 menit lalu", en: "32 mins ago", es: "Hace 32 min", tl: "32 min ang nakalipas" } },
    { name: "Elena P.", country: "Spain", flag: "🇪🇸", wldAmount: 21.0, method: "Revolut", timeAgo: { id: "35 menit lalu", en: "35 mins ago", es: "Hace 35 min", tl: "35 min ang nakalipas" } },
    { name: "Hendra S.", country: "Indonesia", flag: "🇮🇩", wldAmount: 14.0, method: "LinkAja", timeAgo: { id: "38 menit lalu", en: "38 mins ago", es: "Hace 38 min", tl: "38 min ang nakalipas" } },
    { name: "Emily W.", country: "United States", flag: "🇺🇸", wldAmount: 145.0, method: "Stripe", timeAgo: { id: "41 menit lalu", en: "41 mins ago", es: "Hace 41 min", tl: "41 min ang nakalipas" } },
    { name: "Reynaldo C.", country: "Philippines", flag: "🇵🇭", wldAmount: 55.0, method: "GCash", timeAgo: { id: "44 menit lalu", en: "44 mins ago", es: "Hace 44 min", tl: "44 min ang nakalipas" } },
    { name: "Sofia N.", country: "Spain", flag: "🇪🇸", wldAmount: 17.5, method: "Bizum", timeAgo: { id: "48 menit lalu", en: "48 mins ago", es: "Hace 48 min", tl: "48 min ang nakalipas" } },
    { name: "Mega Putri", country: "Indonesia", flag: "🇮🇩", wldAmount: 26.5, method: "DANA", timeAgo: { id: "52 menit lalu", en: "52 mins ago", es: "Hace 52 min", tl: "52 min ang nakalipas" } },
    { name: "James T.", country: "United States", flag: "🇺🇸", wldAmount: 90.0, method: "PayPal", timeAgo: { id: "56 menit lalu", en: "56 mins ago", es: "Hace 56 min", tl: "56 min ang nakalipas" } }
  ];

  // ── 10 TESTIMONIAL / REVIEWS ITEMS ──
  const testimoniList = [
    {
      name: "Rian Hidayat",
      flag: "🇮🇩",
      date: "2026-06-22",
      wld: "45 WLD",
      rating: 5,
      comment: {
        id: "Gokil instan banget! Awalnya ragu coba mencairkan 45 WLD, ikuti petunjuk step by step-nya, dalam 5 menit saldo langsung masuk ke Mandiri. Sangat direkomendasikan!",
        en: "Insanely instant! Was skeptical at first to cash out 45 WLD, followed the step-by-step guide, and within 5 minutes funds arrived in my bank account. Highly recommended!",
        es: "¡Increíblemente instantáneo! Tenía dudas al principio para retirar 45 WLD, seguí la guía paso a paso y en 5 minutos los fondos llegaron. ¡Muy recomendado!",
        tl: "Napakabilis! Noong una nag-aalinlangan ako mag-cash out ng 45 WLD, sinunod ko lang ang step-by-step guide, sa loob ng 5 minuto pumasok agad sa account ko. Rekomendado!"
      }
    },
    {
      name: "Maria Santos",
      flag: "🇵🇭",
      date: "2026-06-21",
      wld: "24 WLD",
      rating: 5,
      comment: {
        id: "Sangat mudah digunakan di Filipina. Mencairkan koin lewat GCash sangat mulus. Terima kasih untuk rate transparan tinggi ini.",
        en: "Super easy to use here in the Philippines. Cashing out through GCash is so smooth. Thank you for the high transparent live rates.",
        es: "Súper fácil de usar aquí en Filipinas. Retirar a través de GCash fue muy fluido. Gracias por las tarifas altas y transparentes.",
        tl: "Napakadaling gamitin dito sa Pilipinas. Ang pag-withdraw gamit ang GCash ay napaka-smooth. Salamat sa mataas at transparent na live rates."
      }
    },
    {
      name: "Carlos Mendoza",
      flag: "🇪🇸",
      date: "2026-06-20",
      wld: "18 WLD",
      rating: 5,
      comment: {
        id: "Proses transfer lewat Revolut sangat cepat dan tanpa kendala biaya admin tersembunyi. Sangat profesional.",
        en: "The transaction via Revolut was fast and completely free of hidden fee issues. Very professional setup.",
        es: "La transacción a través de Revolut fue rápida y completamente libre de tarifas ocultas. Un sistema muy profesional.",
        tl: "Ang transaksyon sa pamamagitan ng Revolut ay mabilis at walang nakatagong bayarin. Napakapropesyonal ng sistema."
      }
    },
    {
      name: "Budi Santoso",
      flag: "🇮🇩",
      date: "2026-06-19",
      wld: "76 WLD",
      rating: 5,
      comment: {
        id: "Metode kliring otomatis lewat DANA benar-benar memotong waktu tunggu admin. Cuma nunggu verifikasi hash block sebentar, uang langsung masuk.",
        en: "The automated clearing route via DANA really cuts down administrative wait time. Just waited a bit for block verification, and funds cleared.",
        es: "La ruta de liquidación automatizada a través di DANA realmente reduce el tiempo de espera. Proceso de red muy transparente.",
        tl: "Ang automated clearing network via DANA ay napakabilis. Walang hassle sa paghihintay ng manual na approval."
      }
    },
    {
      name: "Sarah Jenkins",
      flag: "🇺🇸",
      date: "2026-06-18",
      wld: "50 WLD",
      rating: 5,
      comment: {
        id: "Sistem payout Stripe bekerja dengan baik untuk akun US saya. Kurs konversi disinkronkan langsung dari feed oracle utama. Bagus!",
        en: "Stripe payout infrastructure works perfectly fine for my US account. Rate conversions are directly synchronized with the oracle feed.",
        es: "La infraestructura de Stripe funcionó perfectamente para mi cuenta estadounidense. Tarifas justas en tiempo real.",
        tl: "Gumagana nang maayos ang Stripe payout para sa aking US account. Walang labis na conversion fees."
      }
    },
    {
      name: "Juan dela Cruz",
      flag: "🇵🇭",
      date: "2026-06-16",
      wld: "35 WLD",
      rating: 5,
      comment: {
        id: "Awalnya saya takut salah memasukkan nomor Maya wallet saya, tapi panduan modal 8 langkah sangat jelas membantu pemula.",
        en: "I was worried about inputting my Maya wallet details incorrectly, but the 8-step walkthrough dialog is exceptionally clear for beginners.",
        es: "Tenía miedo de equivocarme con mi billetera Maya, pero el diálogo paso a paso guía de manera excelente a los principiantes.",
        tl: "Nangangamba ako nung una sa pag-input ng Maya wallet details ko, pero ang 8-step guide ay napakalinaw para sa mga nagsisimula."
      }
    },
    {
      name: "Alejandro Gómez",
      flag: "🇪🇸",
      date: "2026-06-15",
      wld: "12 WLD",
      rating: 5,
      comment: {
        id: "Pencairan retail kecil 12 WLD diproses secepat transaksi besar melalui Bizum. Integrasi API yang solid.",
        en: "Small retail distribution of 12 WLD cleared just as fast as major balances through the Bizum instant rail. Solid API integration.",
        es: "La liquidación pequeña de 12 WLD se procesó tan rápido como los saldos grandes a través de Bizum. Integración sólida.",
        tl: "Ang maliit na withdrawal ng 12 WLD ay mabilis ding naproseso gamit ang Bizum. Maayos ang system integration."
      }
    },
    {
      name: "Siti Rahma",
      flag: "🇮🇩",
      date: "2026-06-13",
      wld: "105 WLD",
      rating: 5,
      comment: {
        id: "Mencairkan semua sisa grant bulanan saya (105 koin) ke Bank BCA. Pengiriman transparan tanpa potongan tersembunyi yang aneh-aneh.",
        en: "Liquidated all my remaining accumulated monthly grants directly to my BCA bank account. Honest rates with no strange deductions.",
        es: "Retiré todas mis subvenciones mensuales acumuladas a mi cuenta bancaria. Tarifas honestas sin deducciones extrañas.",
        tl: "I-cash out ko ang lahat ng aking naipong grant sa aking BCA account. Transparent ang buong detalye."
      }
    },
    {
      name: "Michael Chang",
      flag: "🇺🇸",
      date: "2026-06-12",
      wld: "90 WLD",
      rating: 5,
      comment: {
        id: "Jalur pertukaran lintas batas ini memotong birokrasi penukaran exchange konvensional. PayPal terisi penuh dalam hitungan menit.",
        en: "This cross-border payment utility cuts out traditional exchange bureau bottlenecks. PayPal balance fully populated within minutes.",
        es: "Este canal de pago elimina los cuellos de botella de los exchanges tradicionales. Fondos recibidos con rapidez.",
        tl: "Ang cross-border interface na ito ay nagpapadali ng lahat kumpara sa mga tradisyunal na crypto exchange. Napakabilis."
      }
    },
    {
      name: "Princess Lumaban",
      flag: "🇵🇭",
      date: "2026-06-10",
      wld: "40 WLD",
      rating: 5,
      comment: {
        id: "Ulasan di komunitas facebook ternyata terbukti asli. Dana instan dikirim ke GCash dengan aman. Sangat puas dengan layanannya.",
        en: "The community vouch logs are proven true. Instant funds sent securely straight to my mobile GCash number. Extremely satisfied.",
        es: "Se demuestra que los registros de la comunidad son ciertos. Fondos enviados de forma segura a mi GCash. Muy satisfecho.",
        tl: "Ang mga ulat sa komunidad ay napatunayang totoo. Instant na pondo ang pumasok sa aking GCash. Sobrang satisfied ako."
      }
    }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const showRandomNotification = () => {
      const randomIndex = Math.floor(Math.random() * liveNotificationsList.length);
      setActiveNotification(liveNotificationsList[randomIndex]);
      setTimeout(() => { setActiveNotification(null); }, 4000);
    };
    const initialTimeout = setTimeout(showRandomNotification, 3000);
    const interval = setInterval(showRandomNotification, 9000);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrencyConfig = () => {
    switch (locale) {
      case 'id': return { code: 'IDR', symbol: 'Rp ', localeCode: 'id-ID', fallbackPrice: 48500 };
      case 'es': return { code: 'EUR', symbol: '€', localeCode: 'de-DE', fallbackPrice: 2.95 };
      case 'tl': return { code: 'PHP', symbol: '₱', localeCode: 'en-PH', fallbackPrice: 185 };
      default: return { code: 'USD', symbol: '$', localeCode: 'en-US', fallbackPrice: 3.15 };
    }
  };

  const currency = getCurrencyConfig();

  const getPaymentOptions = (): PaymentOption[] => {
    switch (locale) {
      case 'id':
        return [
          { value: 'dana_gopay', brandName: 'E-Wallet (DANA, OVO, GoPay, LinkAja)', label: 'Pencarian instan ke akun e-wallet digital Anda' },
          { value: 'bank_transfer', brandName: 'Transfer Rekening Bank', label: 'BCA, Mandiri, BRI, BNI, dan bank nasional lainnya' }
        ];
      case 'es':
        return [
          { value: 'sepa_revolut', brandName: 'SEPA / Revolut Transfer', label: 'Instant SEPA bank routing or Revolut payment' },
          { value: 'paypal', brandName: 'PayPal Gateway', label: 'International balance deposit' },
          { value: 'crypto', brandName: 'Crypto Wallet Transfer', label: 'USDT / USDC stablecoins (Multi-network)' }
        ];
      case 'tl':
        return [
          { value: 'gcash', brandName: 'GCash / Maya E-Wallet', label: 'Direct mobile wallet disbursement' },
          { value: 'ph_bank', brandName: 'Local Philippine Bank', label: 'BDO, BPI, or Metrobank commercial wire' }
        ];
      default:
        return [
          { value: 'paypal_stripe', brandName: 'PayPal / Stripe Transfer', label: 'Global secure modern processing network' },
          { value: 'swift', brandName: 'SWIFT International Wire', label: 'Global standard wire settlement' },
          { value: 'crypto_cashout', brandName: 'Crypto Settlement (USDT)', label: 'Instant enterprise wallet payment' }
        ];
    }
  };

  const paymentOptions = getPaymentOptions();
  const selectedOption = paymentOptions.find(opt => opt.value === metodeBayar);

  const getInputConfiguration = () => {
    const config = {
      bankLabel: "Bank / Platform Name",
      bankPlaceholder: "e.g., Bank Name or Wallet Type",
      ownerLabel: "Account Owner Full Name",
      ownerPlaceholder: "Enter legal full name",
      numLabel: "Account / Identification Number",
      numPlaceholder: "Enter card, account, or phone number"
    };

    if (locale === 'id') {
      if (metodeBayar === 'dana_gopay') {
        config.bankLabel = "Penyedia E-Wallet";
        config.bankPlaceholder = "Misal: DANA, OVO, GoPay";
        config.ownerLabel = "Nama Pemilik Akun (Sesuai Aplikasi)";
        config.ownerPlaceholder = "Masukkan nama terdaftar";
        config.numLabel = "Nomor Handphone E-Wallet";
        config.numPlaceholder = "Contoh: 081234567xxx";
      } else if (metodeBayar === 'bank_transfer') {
        config.bankLabel = "Nama Bank Terdaftar";
        config.bankPlaceholder = "Misal: BCA, Mandiri, BRI";
        config.ownerLabel = "Nama Pemilik Rekening (Sesuai KTP)";
        config.ownerPlaceholder = "Masukkan nama lengkap";
        config.numLabel = "Nomor Rekening Tujuan";
        config.numPlaceholder = "Masukkan digit tanpa spasi/tanda baca";
      }
    } 
    return config;
  };

  const dynamicInput = getInputConfiguration();
  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ show: true, type, message });
    setTimeout(() => setAlertState(prev => ({ ...prev, show: false })), 5000);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchMarketPrice = async () => {
      if (document.hidden) return; 
      try {
        const res = await fetch(`/api/prices?currency=${currency.code}`, { signal: controller.signal });
        if (!res.ok) throw new Error('API Error');
        const prices = await res.json();
        setWldPriceUSD(prices.priceInUSD);
        setWldLocalPrice(prices.priceInLocal);
        setIsLoadingPrice(false);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setWldLocalPrice(currency.fallbackPrice);
          setIsLoadingPrice(false);
        }
      }
    };

    fetchMarketPrice();
    const marketInterval = setInterval(fetchMarketPrice, 60000);
    return () => { controller.abort(); clearInterval(marketInterval); };
  }, [locale, currency.code, currency.fallbackPrice]);

  useEffect(() => {
    if (!currentTransaksiId) return;
    const channel = supabase
      .channel(`realtime-transaksi-${currentTransaksiId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transaksi', filter: `id=eq.${currentTransaksiId}` }, (payload) => {
        const updatedData = payload.new;
        if (updatedData.status === 'sukses') {
          setIsSubmitting(false); 
          setCurrentTransaksiId(null); 
          triggerAlert('success', locale === 'id' ? "Pencairan Berhasil! Dana dikirim ke rekening Anda." : "Cash out complete! Funds have been sent.");
          setJumlahWld(''); setNamaBank(''); setNamaPemilik(''); setNomorRekening(''); setMetodeBayar('');
        } else if (updatedData.status === 'gagal') {
          setIsSubmitting(false);
          setCurrentTransaksiId(null);
          triggerAlert('error', locale === 'id' ? "Transaksi ditolak oleh admin." : "Transaction rejected by admin.");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentTransaksiId, locale]);

  const handleCopy = () => {
    navigator.clipboard.writeText(myWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabel = (key: string) => {
    const dictionary: Record<string, Record<string, string>> = {
      title: { id: "Pencairan Worldcoin", en: "Worldcoin Cash Out", es: "Retiro de Worldcoin", tl: "Worldcoin Cash Out" },
      content: { id: "Likuidasi aset kripto WLD Anda menjadi mata uang fiat lokal secara real-time dan aman.", en: "Convert your WLD coins into local currency safely and instantly.", es: "Convierta sus monedas WLD a su moneda local al instante.", tl: "I-convert ang iyong WLD koin sa lokal na pera nang mabilis." },
      btnKembali: { id: "Kembali", en: "Back to Home", es: "Volver al Inicio", tl: "Bumalik sa Home" },
      labelMetode: { id: "Metode Pembayaran Tujuan", en: "Select Receiving Method", es: "1. Seleccionar Método", tl: "1. Pamamaraan ng Pag-withdraw" },
      labelJumlah: { id: "Jumlah WLD yang Dicairkan", en: "Amount of WLD to Sell", es: "2. Cantidad di WLD a Vender", tl: "2. Halaga ng WLD na Ibe-benta" },
      btnSubmit: { id: "Konfirmasi & Lanjutkan Pencairan", en: "Continue Cash Out", es: "Continuar Retiro", tl: "Magpatuloy sa Pag-withdraw" },
      btnLoading: { id: "Sinkronisasi Blok & Menunggu Admin...", en: "Waiting Admin Approval...", es: "Esperando Aprobación...", tl: "Naghihintay sa Pag-apruba..." },
      livePrice: { id: "Kurs Nilai Tukar Saat Ini", en: "Current Live Rate", es: "Precio en Vivo", tl: "Live na Presyo" },
      estimasi: { id: "Total Dana Bersih Yang Diterima", en: "Net Amount You Will Receive", es: "Total Neto a Recibir", tl: "Kabuuang Matatanggap Mo" },
      next: { id: "Langkah Berikutnya", en: "Next Step", es: "Siguiente Paso", tl: "Susunod na Hakbang" },
      doneTransfer: { id: "Saya Sudah Menyelesaikan Transfer", en: "I Have Sent the WLD", es: "Ya He Transferido", tl: "Naka-transfer Na Ako" },
      copyBtn: { id: "Salin", en: "Copy", es: "Copiar", tl: "Kopyahin" },
      copiedBtn: { id: "Berhasil Disalin!", en: "Copied!", es: "¡Copiado!", tl: "Na-kopya na!" },
      targetWalletText: { id: "Username Tujuan (World App):", en: "Target Username (World App):", es: "Usuario de Destino (World App):", tl: "Target na Username (World App):" },
      globalSupport: { id: "Mendukung Jaringan Pertukaran Lintas Negara Instan", en: "Supporting Cross-Border Instant Cash Out", es: "Soporte de Retiro Instantáneo Internacional", tl: "Suportado ang Instant Cash Out sa Buong Mundo" },
      testiTitle: { id: "Aktivitas Komunitas & Ulasan", en: "Community Reviews & Proof of Transfer", es: "Reseñas de la Comunidad y Pruebas", tl: "Mga Review ng Komunidad at Patunay" },
      testiSubtitle: { id: "Ulasan dan bukti penyelesaian transaksi transparan dari pengguna global.", en: "Real reviews from global users who have successfully cashed out their Worldcoin grants.", es: "Reseñas reales de usuarios globales que han retirado con éxito sus subvenciones.", tl: "Mga totoong ulat mula sa mga user sa buong mundo na matagumpay na nag-withdraw." }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'];
  };

  const totalEstimasiLokal = Number(jumlahWld) * wldLocalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeBayar) { triggerAlert('error', "Silakan pilih metode pembayaran terlebih dahulu"); return; }
    if (!namaBank || !namaPemilik || !nomorRekening) { triggerAlert('error', "Silakan lengkapi semua data tujuan rekening"); return; }
    if (Number(jumlahWld) < 3) { triggerAlert('error', "Minimal penarikan adalah 3 WLD"); return; }
    setCurrentStep(1); setShowStepModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowStepModal(false); setIsSubmitting(true); 
    try {
      const { data, error } = await supabase.from('transaksi').insert([
        { locale: locale, mata_uang: currency.code, metode_bayar: metodeBayar, nama_bank: namaBank, nama_pemilik: namaPemilik, nomor_rekening: nomorRekening, jumlah_wld: Number(jumlahWld), estimasi_lokal: totalEstimasiLokal, status: 'pending' }
      ]).select().single();
      
      if (error) throw error;
      setCurrentTransaksiId(data.id);

      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jumlahWld: Number(jumlahWld),
          namaPemilik: namaPemilik,
        }),
      });

      triggerAlert('success', "Pesanan dibuat! Mohon tunggu konfirmasi agen.");
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Gagal memproses transaksi.');
      setIsSubmitting(false);
    }
  };

  const stepsData = [
    { 
      id: 1, 
      title: { id: "Salin Username Agen", en: "Copy Agent Username", es: "Copiar usuario del agente", tl: "Kopyahin ang Username ng Ahente" }, 
      desc: { id: "Salin nama username World App tujuan transfer agen kami di bawah ini.", en: "Copy our agent's World App destination username shown below.", es: "Copie el nombre de usuario de World App de destino de nuestro agente a continuación.", tl: "Kopyahin ang patutunguhang username sa World App ng aming ahente sa ibaba." } 
    },
    { 
      id: 2, 
      title: { id: "Buka World App Resmi", en: "Open Official World App", es: "Abrir World App Oficial", tl: "Buksan ang Opisyal na World App" }, 
      desc: { id: "Luncurkan aplikasi World App resmi di perangkat telepon pintar Anda.", en: "Launch the official World App on your smartphone device.", es: "Inicie la aplicación oficial World App en su dispositivo teléfono inteligente.", tl: "I-launch ang opisyal na World App sa iyong smartphone." } 
    },
    { 
      id: 3, 
      title: { id: "Masuk ke Dompet WLD", en: "Go to WLD Wallet", es: "Ir a la Billetera WLD", tl: "Pumunta sa WLD Wallet" }, 
      desc: { id: "Ketuk saldo koin WLD Anda pada beranda utama aplikasi.", en: "Tap your WLD coin balance on the app's main dashboard.", es: "Toque el saldo de su moneda WLD en el tablero principal de la aplicación.", tl: "I-tap ang iyong balanse ng koin na WLD sa main dashboard ng app." } 
    },
    { 
      id: 4, 
      title: { id: "Pilih Opsi Kirim / Send", en: "Select Send Option", es: "Seleccionar Opción Enviar", tl: "Piliin ang opsyong Ipadala (Send)" }, 
      desc: { id: "Klik tombol Kirim (Send) untuk memproses pemindahan aset.", en: "Click the Send button to process the asset transfer.", es: "Haga clic en el botón Enviar para procesar la transferencia de activos.", tl: "I-click ang opsyong Ipadala kuwento iproseso ang paglipat ng asset." } 
    },
    { 
      id: 5, 
      title: { id: "Tempel Nama Penerima", en: "Paste Recipient Username", es: "Pegar Usuario Destinatario", tl: "I-paste ang Username ng Tatanggap" }, 
      desc: { id: "Tempelkan username agen yang telah Anda salin sebelumnya pada bilah pencarian.", en: "Paste the previously copied agent username into the search bar.", es: "Pegue el nombre de usuario del agente copiado anteriormente en la barra de búsqueda.", tl: "I-paste ang nakopyang username ng ahente sa search bar." } 
    },
    { 
      id: 6, 
      title: { id: "Input Nominal Koin", en: "Enter Coin Amount", es: "Ingresar Cantidad di Monedas", tl: "Ilagay ang Halaga ng Koin" }, 
      desc: { id: "Masukkan jumlah koin yang sesuai dengan nominal aplikasi ini.", en: "Enter the amount of coins matching the amount on this app.", es: "Ingrese la cantidad de monedas que coincida con el monto en esta aplicación.", tl: "Ilagay ang halaga ng mga koin na tumutugma sa halaga sa app na ito." } 
    },
    { 
      id: 7, 
      title: { id: "Konfirmasi Pengiriman", en: "Confirm Transfer", es: "Confirmar Transferencia", tl: "Kumpirmahin ang Pagpapadala" }, 
      desc: { id: "Periksa detail transaksi lalu geser/konfirmasi untuk mengirim.", en: "Check transaction details then slide/confirm to send.", es: "Verifique los detalles de la transacción, luego deslice/confirme para enviar.", tl: "Suriin ang mga rincian ng transaksyon pagkatapos ay i-slide/kumpirmahin para ipadala." } 
    },
    { 
      id: 8, 
      title: { id: "Selesaikan Proses", en: "Complete Process", es: "Completar Proceso", tl: "Tapusin ang Proseso" }, 
      desc: { id: "Setelah konfirmasi di World App selesai, tekan tombol di bawah ini.", en: "Once the confirmation in World App is complete, press the button below.", es: "Una vez completada la confirmación en World App, presione el botón de abajo.", tl: "Kapag tapos na ang kumpirmasyon sa World App, pindutin ang button sa ibaba." } 
    }
  ];

  return (
    <div className="container py-5 px-3 px-md-4" style={{ minHeight: '100vh', backgroundColor: '#fcfcfd' }}>
      
      {/* OVERLAY SPIN LOADER REALTIME */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4"
            style={{ backgroundColor: 'rgba(9, 9, 11, 0.96)', backdropFilter: 'blur(12px)', zIndex: 20000 }}
          >
            <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3.5rem', height: '3.5rem', strokeWidth: '3px' }} />
            <h3 className="h5 fw-bold text-center mb-2" style={{ letterSpacing: '-0.01em' }}>{getLabel('btnLoading')}</h3>
            <p className="small text-white-50 text-center m-0" style={{ maxWidth: '320px', lineHeight: '1.6' }}>
              {locale === 'id' ? "Sistem sedang memverifikasi rincian transaksi blok WLD Anda secara otomatis. Mohon jangan menutup tab ini." : "Verifying your WLD transfer network block."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SYSTEM ALERTS */}
      <AnimatePresence>
        {alertState.show && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }} animate={{ opacity: 1, y: 24, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="position-fixed top-0 start-50 translate-middle-x p-3 rounded-4 shadow-lg border-0 d-flex align-items-center gap-3 text-white"
            style={{ zIndex: 9999, width: 'calc(100% - 2rem)', maxWidth: '460px', backgroundColor: alertState.type === 'success' ? '#059669' : '#dc2626', backdropFilter: 'blur(4px)' }}
          >
            <div className="bg-white bg-opacity-20 p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px' }}>
              {alertState.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
            </div>
            <div className="small fw-semibold">{alertState.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE TRANSAKSI NOTIFICATION BAR */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="position-fixed bottom-0 start-50 translate-middle-x p-3 bg-white border border-light-subtle shadow-lg rounded-4 mb-4 d-flex align-items-center gap-3"
            style={{ zIndex: 999, width: 'calc(100% - 2rem)', maxWidth: '420px' }}
          >
            <div className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: '44px', height: '44px' }}>
              <LuCheck size={20} className="fw-bold" />
            </div>
            <div className="d-flex flex-column gap-1 w-100">
              <div className="small fw-bold text-dark d-flex align-items-center justify-content-between">
                <span>{activeNotification.name}</span>
                <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>{activeNotification.country} {activeNotification.flag}</span>
              </div>
              <div className="small text-secondary">Cairkan <strong className="text-primary-emphasis fw-bold">{activeNotification.wldAmount} WLD</strong> via {activeNotification.method}</div>
              <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.725rem' }}><LuClock size={12} /> {activeNotification.timeAgo[locale] || activeNotification.timeAgo['en']}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER TOP NAV */}
      <div className="mb-4">
        <Link href="/" className="text-secondary text-decoration-none small fw-bold d-inline-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill border border-light-subtle shadow-sm transition-all hover-translate">
          <LuArrowLeft size={15} /> {getLabel('btnKembali')}
        </Link>
      </div>

      {/* LAYOUT GRID RESPONSIVE UTAMA */}
      <div className="row g-4 justify-content-center">
        
        {/* KOLOM KIRI: FORM DATA PENCAIRAN */}
        <div className="col-12 col-lg-7">
          <div className="bg-white border border-light-subtle rounded-4 p-4 p-md-5 shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><LuShieldCheck size={22} /></div>
              <h1 className="h4 fw-extrabold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>{getLabel('title')}</h1>
            </div>
            <p className="text-secondary small mb-4 lh-base">{getLabel('content')}</p>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              
              {/* DROPDOWN METODE PENERIMAAN */}
              <div className="position-relative" ref={dropdownRef}>
                <label className="form-label small fw-bold text-secondary mb-2">{getLabel('labelMetode')}</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="form-control d-flex align-items-center justify-content-between py-2 px-3 border border-secondary border-opacity-25 bg-white shadow-sm"
                  style={{ borderRadius: '12px', height: '52px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                >
                  {selectedOption ? (
                    <span className="fw-semibold text-dark d-flex align-items-center gap-2">
                      <LuWallet className="text-primary" size={18} /> {selectedOption.brandName}
                    </span>
                  ) : (
                    <span className="text-muted small">Pilih opsi atau metode penarikan uang</span>
                  )}
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                    <LuChevronDown size={16} className="text-secondary" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 6 }} exit={{ opacity: 0, y: -10 }}
                      className="position-absolute w-100 bg-white border border-light-subtle shadow-lg p-2"
                      style={{ zIndex: 100, borderRadius: '16px' }}
                    >
                      {paymentOptions.map((option) => (
                        <div 
                          key={option.value} onClick={() => { setMetodeBayar(option.value); setNamaBank(''); setNamaPemilik(''); setNomorRekening(''); setIsDropdownOpen(false); }}
                          className={`p-3 rounded-3 cursor-pointer transition-all mb-1 ${metodeBayar === option.value ? 'bg-primary bg-opacity-10 fw-semibold text-primary' : 'hover-bg-light'}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="d-block text-dark small fw-bold">{option.brandName}</span>
                          <span className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>{option.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* INPUT FORM DINAMIS REKENING */}
              <AnimatePresence initial={false}>
                {metodeBayar !== "" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden d-flex flex-column gap-3 p-3 bg-light bg-opacity-50 rounded-4 border border-light-subtle">
                    <div>
                      <label className="form-label small fw-bold text-secondary mb-1">{dynamicInput.bankLabel}</label>
                      <input type="text" placeholder={dynamicInput.bankPlaceholder} value={namaBank} onChange={(e) => setNamaBank(e.target.value)} className="form-control py-2 px-3 border border-secondary border-opacity-25 shadow-sm" style={{ borderRadius: '10px', height: '44px' }} required />
                    </div>

                    <div>
                      <label className="form-label small fw-bold text-secondary mb-1">{dynamicInput.ownerLabel}</label>
                      <input type="text" placeholder={dynamicInput.ownerPlaceholder} value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)} className="form-control py-2 px-3 border border-secondary border-opacity-25 shadow-sm" style={{ borderRadius: '10px', height: '44px' }} required />
                    </div>

                    <div>
                      <label className="form-label small fw-bold text-secondary mb-1">{dynamicInput.numLabel}</label>
                      <input type="text" placeholder={dynamicInput.numPlaceholder} value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)} className="form-control py-2 px-3 border border-secondary border-opacity-25 shadow-sm" style={{ borderRadius: '10px', height: '44px' }} required />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INPUT JUMLAH NOMINAL KOIN WLD */}
              <div>
                <label className="form-label small fw-bold text-secondary mb-2">{getLabel('labelJumlah')}</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white border-end-0 text-secondary" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}><LuCoins size={16} /></span>
                  <input type="number" min="3" step="any" placeholder="Minimal 3 WLD" value={jumlahWld} onChange={(e) => setJumlahWld(e.target.value)} className="form-control border-start-0 border-end-0 py-2 fw-bold text-dark" style={{ height: '52px' }} required />
                  <span className="input-group-text bg-light-subtle border-start-0 fw-extrabold text-secondary px-3" style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', fontSize: '0.85rem' }}>WLD</span>
                </div>
              </div>

              {/* LIVE COUNTER ESTIMASI DANA BERSIH */}
              <AnimatePresence>
                {Number(jumlahWld) >= 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-3 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-4 d-flex align-items-center gap-3 shadow-sm">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '36px', height: '36px' }}><LuDollarSign size={18} /></div>
                    <div>
                      <span className="text-success fw-bold d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.03em' }}>{getLabel('estimasi')}</span>
                      <div className="h3 fw-extrabold text-success m-0 mt-1" style={{ letterSpacing: '-0.03em' }}>
                        {currency.symbol}{totalEstimasiLokal.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-100 fw-bold text-white shadow mt-2 hover-opacity" style={{ borderRadius: '12px', height: '52px', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                {getLabel('btnSubmit')}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: LIVE RATES WIDGET & BANNER */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          
          {/* CARD UTAMA LIVE RATE TICKER */}
          <div className="border rounded-4 p-4 shadow-sm d-flex flex-column gap-4 bg-dark text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #09090b 0%, #1e1e24 100%)' }}>
            <div className="position-absolute bg-primary rounded-circle filter-blur opacity-10" style={{ width: '140px', height: '140px', top: '-20px', right: '-20px', filter: 'blur(40px)' }} />
            
            <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 2 }}>
              <div>
                <span className="text-primary-emphasis fw-extrabold small d-flex align-items-center gap-2 mb-2" style={{ letterSpacing: '0.05em', color: '#3b82f6' }}>
                  <LuTrendingUp size={14} /> {getLabel('livePrice')}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <span className="bg-success rounded-circle d-inline-block animate-pulse" style={{ width: '8px', height: '8px', boxShadow: '0 0 8px #10b981' }} />
                  <h2 className="h1 fw-extrabold text-white m-0" style={{ letterSpacing: '-0.03em' }}>
                    {isLoadingPrice ? '...' : `${currency.symbol}${wldLocalPrice.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}`}
                  </h2>
                </div>
              </div>
              <div className="border-start border-secondary border-opacity-25 ps-4 text-end">
                <span className="text-white-50 d-block fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>ORACLE FEED</span>
                <div className="h4 fw-extrabold text-warning m-0 mt-1">{isLoadingPrice ? '...' : `$${wldPriceUSD.toFixed(2)}`}</div>
              </div>
            </div>
          </div>

          {/* BANNER JARINGAN INFRASTRUKTUR */}
          <div className="position-relative w-100 p-4 rounded-4 bg-white border border-light-subtle shadow-sm overflow-hidden d-flex align-items-center" style={{ minHeight: '130px' }}>
            <div className="position-absolute end-0 top-50 translate-middle-y opacity-25" style={{ width: '150px', height: '150px', pointerEvents: 'none' }}>
              <Image src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=300&auto=format&fit=crop" alt="Global Wire network" fill className="rounded-circle object-cover" />
            </div>
            <div className="position-relative" style={{ zIndex: 2 }}>
              <span className="badge bg-secondary bg-opacity-10 text-secondary fw-extrabold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                <LuGlobe size={12} className="me-1 text-primary" /> SECURE SMART NODES
              </span>
              <h3 className="h6 fw-bold m-0 lh-base text-dark-emphasis" style={{ maxWidth: '85%' }}>{getLabel('globalSupport')}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* SEKSI DAFTAR TESTIMONI KOMUNITAS (10 Ulasan Valid) */}
      <div className="mt-5 pt-5 border-top border-light-subtle">
        <div className="d-flex flex-column align-items-center mb-4 text-center">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary mb-2"><LuMessageSquare size={22} /></div>
          <h2 className="h4 fw-extrabold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>{getLabel('testiTitle')}</h2>
          <p className="text-secondary small mt-2 m-0" style={{ maxWidth: '500px' }}>{getLabel('testiSubtitle')}</p>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {testimoniList.map((item, index) => (
            <div key={index} className="col">
              <div className="bg-white border border-light-subtle p-4 rounded-4 h-100 shadow-sm d-flex flex-column justify-content-between hover-shadow transition-all">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="small fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                        {item.name} <span style={{ fontSize: '0.9rem' }}>{item.flag}</span>
                      </h5>
                      <span className="text-muted d-block mt-1" style={{ fontSize: '0.725rem' }}>{item.date}</span>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success fw-extrabold px-2 py-1" style={{ borderRadius: '6px', fontSize: '0.75rem' }}>+{item.wld}</span>
                  </div>
                  <div className="d-flex gap-1 mb-3">
                    {[...Array(item.rating)].map((_, i) => <LuStar key={i} size={13} style={{ fill: '#f59e0b', stroke: '#f59e0b' }} />)}
                  </div>
                  <p className="small text-secondary lh-base m-0 text-muted"><em>&quot;{item.comment[locale] || item.comment['en']}&quot;</em></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POP-UP DIALOG MODAL PETUNJUK STEP-BY-STEP */}
      <AnimatePresence>
        {showStepModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white w-100 p-4 shadow-2xl border border-light-subtle" style={{ maxWidth: '420px', borderRadius: '28px' }}>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill small fw-extrabold" style={{ fontSize: '0.75rem' }}>
                  Langkah {currentStep} dari 8
                </span>
                <button type="button" onClick={() => setShowStepModal(false)} className="btn p-1 border-0 text-muted hover-bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><LuX size={18} /></button>
              </div>

              <div className="mb-4" style={{ minHeight: '130px' }}>
                <h4 className="h6 fw-extrabold text-dark mb-2">
                  {stepsData[currentStep - 1].title[locale] || stepsData[currentStep - 1].title['en']}
                </h4>
                <p className="text-secondary small lh-base m-0">
                  {stepsData[currentStep - 1].desc[locale] || stepsData[currentStep - 1].desc['en']}
                </p>

                {currentStep === 1 && (
                  <div className="bg-light border border-light-subtle p-3 rounded-4 mt-3 shadow-sm">
                    <div className="text-muted fw-bold mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>{getLabel('targetWalletText')}</div>
                    <div className="d-flex align-items-center justify-content-between gap-2 bg-white p-2 rounded-3 border">
                      <span className="font-monospace fw-bold text-primary-emphasis ps-1">@{myWalletAddress}</span>
                      <button type="button" onClick={handleCopy} className={`btn btn-sm text-white fw-bold d-flex align-items-center gap-1 py-2 px-3 rounded-2 shadow-sm ${copied ? 'btn-success' : 'btn-dark'}`} style={{ fontSize: '0.75rem' }}>
                        {copied ? <LuCheck size={12} /> : <LuCopy size={12} />} {copied ? getLabel('copiedBtn') : getLabel('copyBtn')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BAR PROGRESS UTAMA */}
              <div className="w-100 bg-light rounded-pill mb-4 overflow-hidden shadow-inner" style={{ height: '5px' }}>
                <div className="bg-primary h-100 transition-all" style={{ width: `${(currentStep / 8) * 100}%`, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>

              <div>
                {currentStep < 8 ? (
                  <button type="button" onClick={() => setCurrentStep((prev) => prev + 1)} className="btn btn-dark w-100 py-2 fw-bold small shadow-sm" style={{ borderRadius: '12px', height: '46px' }}>{getLabel('next')}</button>
                ) : (
                  <button type="button" onClick={handleFinalSubmit} className="btn btn-success w-100 py-2 fw-bold small d-flex align-items-center justify-content-center gap-2 shadow" style={{ borderRadius: '12px', height: '46px' }}>
                    <CheckIcon size={18} /> {getLabel('doneTransfer')}
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}