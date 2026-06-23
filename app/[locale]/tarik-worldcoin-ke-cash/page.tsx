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
  LuCreditCard, 
  LuCopy, 
  LuCheck, 
  LuX, 
  LuTrendingUp, 
  LuDollarSign,
  LuSmartphone,
  LuChevronDown,
  LuGlobe,
  LuUser,
  LuMessageSquare,
  LuStar,
  LuClock
} from 'react-icons/lu';

import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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

// 🔔 Interface untuk Live Notification
interface LiveNotification {
  name: string;
  country: string;
  flag: string;
  wldAmount: number;
  timeAgo: { id: string; en: string; es: string; tl: string };
  method: string;
}

export default function PencairanPage({ params }: Props) {
  const { locale: rawLocale } = use(params);
  const locale = (rawLocale || 'en') as 'id' | 'en' | 'es' | 'tl';
  
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

  // 🔔 State untuk Pop-up Notifikasi Live
  const [activeNotification, setActiveNotification] = useState<LiveNotification | null>(null);

  const [currentTransaksiId, setCurrentTransaksiId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const myWalletAddress = "nitayunitaa"; 

  // 🌍 40 DATA NOTIFIKASI POP-UP LIVE (ACAK LINTAS NEGARA)
  const liveNotificationsList: LiveNotification[] = [
    { name: "Ahmad S.", country: "Indonesia", flag: "🇮🇩", wldAmount: 12.5, method: "DANA", timeAgo: { id: "Baru saja", en: "Just now", es: "Ahora mismo", tl: "Kani-kanina lang" } },
    { name: "Maria Santos", country: "Philippines", flag: "🇵🇭", wldAmount: 24.0, method: "GCash", timeAgo: { id: "1 menit lalu", en: "1 min ago", es: "Hace 1 min", tl: "1 min ang nakalipas" } },
    { name: "Carlos M.", country: "Spain", flag: "🇪🇸", wldAmount: 8.0, method: "Revolut", timeAgo: { id: "2 menit lalu", en: "2 mins ago", es: "Hace 2 min", tl: "2 min ang nakalipas" } },
    { name: "John Doe", country: "United States", flag: "🇺🇸", wldAmount: 50.0, method: "PayPal", timeAgo: { id: "3 menit lalu", en: "3 mins ago", es: "Hace 3 min", tl: "3 min ang nakalipas" } },
    { name: "Budi Santoso", country: "Indonesia", flag: "🇮🇩", wldAmount: 18.2, method: "Bank BCA", timeAgo: { id: "3 menit lalu", en: "3 mins ago", es: "Hace 3 min", tl: "3 min ang nakalipas" } },
    { name: "Juan dela Cruz", country: "Philippines", flag: "🇵🇭", wldAmount: 15.0, method: "Maya", timeAgo: { id: "4 menit lalu", en: "4 mins ago", es: "Hace 4 min", tl: "4 min ang nakalipas" } },
    { name: "Alejandro G.", country: "Mexico", flag: "🇲🇽", wldAmount: 33.5, method: "Crypto Wallet", timeAgo: { id: "5 menit lalu", en: "5 mins ago", es: "Hace 5 min", tl: "5 min ang nakalipas" } },
    { name: "Siti Rahma", country: "Indonesia", flag: "🇮🇩", wldAmount: 6.0, method: "GoPay", timeAgo: { id: "5 menit lalu", en: "5 mins ago", es: "Hace 5 min", tl: "5 min ang nakalipas" } },
    { name: "Mark T.", country: "Singapore", flag: "🇸🇬", wldAmount: 77.0, method: "International Wire", timeAgo: { id: "6 menit lalu", en: "6 mins ago", es: "Hace 6 min", tl: "6 min ang nakalipas" } },
    { name: "Elena R.", country: "Germany", flag: "🇩🇪", wldAmount: 21.0, method: "SEPA Transfer", timeAgo: { id: "7 menit lalu", en: "7 mins ago", es: "Hace 7 min", tl: "7 min ang nakalipas" } },
    { name: "Dedi K.", country: "Indonesia", flag: "🇮🇩", wldAmount: 10.0, method: "OVO", timeAgo: { id: "8 menit lalu", en: "8 mins ago", es: "Hace 8 min", tl: "8 min ang nakalipas" } },
    { name: "Princess M.", country: "Philippines", flag: "🇵🇭", wldAmount: 11.5, method: "GCash", timeAgo: { id: "9 menit lalu", en: "9 mins ago", es: "Hace 9 min", tl: "9 min ang nakalipas" } },
    { name: "Lucas P.", country: "France", flag: "🇫🇷", wldAmount: 14.0, method: "Revolut", timeAgo: { id: "10 menit lalu", en: "10 mins ago", es: "Hace 10 min", tl: "10 min ang nakalipas" } },
    { name: "Rian H.", country: "Indonesia", flag: "🇮🇩", wldAmount: 45.0, method: "Bank Mandiri", timeAgo: { id: "11 menit lalu", en: "11 mins ago", es: "Hace 11 min", tl: "11 min ang nakalipas" } },
    { name: "Mateo S.", country: "Colombia", flag: "🇨🇴", wldAmount: 19.0, method: "PayPal", timeAgo: { id: "12 menit lalu", en: "12 mins ago", es: "Hace 12 min", tl: "12 min ang nakalipas" } },
    { name: "Chloe L.", country: "Australia", flag: "🇦🇺", wldAmount: 100.0, method: "Stripe", timeAgo: { id: "13 menit lalu", en: "13 mins ago", es: "Hace 13 min", tl: "13 min ang nakalipas" } },
    { name: "Mega W.", country: "Indonesia", flag: "🇮🇩", wldAmount: 25.0, method: "DANA", timeAgo: { id: "14 menit lalu", en: "14 mins ago", es: "Hace 14 min", tl: "14 min ang nakalipas" } },
    { name: "Nathaniel V.", country: "Philippines", flag: "🇵🇭", wldAmount: 5.5, method: "BDO Bank", timeAgo: { id: "15 menit lalu", en: "15 mins ago", es: "Hace 15 min", tl: "15 min ang nakalipas" } },
    { name: "Sofia N.", country: "Italy", flag: "🇮🇹", wldAmount: 16.8, method: "SEPA Transfer", timeAgo: { id: "16 menit lalu", en: "16 mins ago", es: "Hace 16 min", tl: "16 min ang nakalipas" } },
    { name: "Yusuf A.", country: "Turkey", flag: "🇹🇷", wldAmount: 30.0, method: "Crypto Wallet", timeAgo: { id: "18 menit lalu", en: "18 mins ago", es: "Hace 18 min", tl: "18 min ang nakalipas" } },
    { name: "Hendrik", country: "Indonesia", flag: "🇮🇩", wldAmount: 13.0, method: "LinkAja", timeAgo: { id: "19 menit lalu", en: "19 mins ago", es: "Hace 19 min", tl: "19 min ang nakalipas" } },
    { name: "Diego F.", country: "Argentina", flag: "🇦🇷", wldAmount: 40.5, method: "PayPal", timeAgo: { id: "20 menit lalu", en: "20 mins ago", es: "Hace 20 min", tl: "20 min ang nakalipas" } },
    { name: "Althea G.", country: "Philippines", flag: "🇵🇭", wldAmount: 8.2, method: "GCash", timeAgo: { id: "22 menit lalu", en: "22 mins ago", es: "Hace 22 min", tl: "22 min ang nakalipas" } },
    { name: "Eko P.", country: "Indonesia", flag: "🇮🇩", wldAmount: 9.5, method: "Bank BRI", timeAgo: { id: "23 menit lalu", en: "23 mins ago", es: "Hace 23 min", tl: "23 min ang nakalipas" } },
    { name: "Liam O.", country: "Ireland", flag: "🇮🇪", wldAmount: 60.0, method: "Revolut", timeAgo: { id: "25 menit lalu", en: "25 mins ago", es: "Hace 25 min", tl: "25 min ang nakalipas" } },
    { name: "Dewi s.", country: "Indonesia", flag: "🇮🇩", wldAmount: 70.0, method: "Bank BCA", timeAgo: { id: "26 menit lalu", en: "26 mins ago", es: "Hace 26 min", tl: "26 min ang nakalipas" } },
    { name: "Javier R.", country: "Chile", flag: "🇨🇱", wldAmount: 12.0, method: "Crypto Wallet", timeAgo: { id: "28 menit lalu", en: "28 mins ago", es: "Hace 28 min", tl: "28 min ang nakalipas" } },
    { name: "Sheng M.", country: "Malaysia", flag: "🇲🇾", wldAmount: 35.0, method: "PayPal", timeAgo: { id: "30 menit lalu", en: "30 mins ago", es: "Hace 30 min", tl: "30 min ang nakalipas" } },
    { name: "Aris K.", country: "Indonesia", flag: "🇮🇩", wldAmount: 11.0, method: "DANA", timeAgo: { id: "31 menit lalu", en: "31 mins ago", es: "Hace 31 min", tl: "31 min ang nakalipas" } },
    { name: "Janice B.", country: "Philippines", flag: "🇵🇭", wldAmount: 17.5, method: "BPI Bank", timeAgo: { id: "33 menit lalu", en: "33 mins ago", es: "Hace 33 min", tl: "33 min ang nakalipas" } },
    { name: "Oliver S.", country: "United Kingdom", flag: "🇬🇧", wldAmount: 22.0, method: "SWIFT Wire", timeAgo: { id: "35 menit lalu", en: "35 mins ago", es: "Hace 35 min", tl: "35 min ang nakalipas" } },
    { name: "Angga D.", country: "Indonesia", flag: "🇮🇩", wldAmount: 55.0, method: "Bank BNI", timeAgo: { id: "36 menit lalu", en: "36 mins ago", es: "Hace 36 min", tl: "36 min ang nakalipas" } },
    { name: "Camila V.", country: "Peru", flag: "🇵🇪", wldAmount: 14.5, method: "PayPal", timeAgo: { id: "38 menit lalu", en: "38 mins ago", es: "Hace 38 min", tl: "38 min ang nakalipas" } },
    { name: "Riza M.", country: "Philippines", flag: "🇵🇭", wldAmount: 9.0, method: "Maya", timeAgo: { id: "40 menit lalu", en: "40 mins ago", es: "Hace 40 min", tl: "40 min ang nakalipas" } },
    { name: "Taufik H.", country: "Indonesia", flag: "🇮🇩", wldAmount: 15.6, method: "GoPay", timeAgo: { id: "42 menit lalu", en: "42 mins ago", es: "Hace 42 min", tl: "42 min ang nakalipas" } },
    { name: "Noah W.", country: "New Zealand", flag: "🇳🇿", wldAmount: 85.0, method: "Stripe", timeAgo: { id: "45 menit lalu", en: "45 mins ago", es: "Hace 45 min", tl: "45 min ang nakalipas" } },
    { name: "Fitriani", country: "Indonesia", flag: "🇮🇩", wldAmount: 20.0, method: "DANA", timeAgo: { id: "48 menit lalu", en: "48 mins ago", es: "Hace 48 min", tl: "48 min ang nakalipas" } },
    { name: "Miguel A.", country: "Spain", flag: "🇪🇸", wldAmount: 11.2, method: "Revolut", timeAgo: { id: "50 menit lalu", en: "50 mins ago", es: "Hace 50 min", tl: "50 min ang nakalipas" } },
    { name: "Jerome C.", country: "Philippines", flag: "🇵🇭", wldAmount: 26.0, method: "GCash", timeAgo: { id: "52 menit lalu", en: "52 mins ago", es: "Hace 52 min", tl: "52 min ang nakalipas" } },
    { name: "Robby K.", country: "Indonesia", flag: "🇮🇩", wldAmount: 100.0, method: "Bank BCA", timeAgo: { id: "55 menit lalu", en: "55 mins ago", es: "Hace 55 min", tl: "55 min ang nakalipas" } }
  ];

  // 💬 10 DATA KOMENTAR TESTIMONI MULTIBAHASA
  const testimoniList = [
    {
      name: "Rian Hidayat",
      flag: "🇮🇩",
      date: "2026-06-21",
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
      date: "2026-06-20",
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
      date: "2026-06-19",
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
      name: "Mega Wijaya",
      flag: "🇮🇩",
      date: "2026-06-18",
      wld: "25 WLD",
      rating: 5,
      comment: {
        id: "Aplikasi penukaran WLD terbaik yang pernah saya temukan. Cair langsung ke DANA tanpa potongan besar. Admin fast respon banget.",
        en: "Best WLD exchange platform I have found so far. Disbursed directly to DANA without major cuts. Admin responds very quickly.",
        es: "La mejor plataforma de intercambio de WLD que he encontrado. Depositado directamente a DANA sin grandes recortes. El admin responde muy rápido.",
        tl: "Pinakamahusay na platform ng palitan ng WLD na nahanap ko. Pumasok agad sa DANA nang walang malaking bawas. Mabilis mag-reply ang admin."
      }
    },
    {
      name: "Juan dela Cruz",
      flag: "🇵🇭",
      date: "2026-06-16",
      wld: "15 WLD",
      rating: 4,
      comment: {
        id: "Butuh waktu sekitar 7 menit untuk memverifikasi koin saya, tapi uangnya terkirim utuh ke Maya wallet saya. Terima kasih agen!",
        en: "Took about 7 minutes to verify my coins, but the money was sent perfectly into my Maya wallet. Thank you agents!",
        es: "Tardó unos 7 minutos en verificar mis monedas, pero el dinero se envió perfectamente a mi billetera Maya. ¡Gracias agentes!",
        tl: "Tumagal ng mga 7 minuto para ma-verify ang koin ko, pero ang pera ay ligtas na pumasok sa aking Maya wallet. Salamat sa mga ahente!"
      }
    },
    {
      name: "Siti Rahma",
      flag: "🇮🇩",
      date: "2026-06-15",
      wld: "12 WLD",
      rating: 5,
      comment: {
        id: "Awalnya nyoba sedikit dulu 3 koin WLD dan beneran masuk ke GoPay otomatis pas admin konfirmasi. Langsung gas tukar sisa koin lainnya.",
        en: "Tried a small amount first with 3 WLD coins and it actually landed on GoPay automatically upon admin approval. Going to swap the rest now.",
        es: "Probé una pequeña cantidad primero con 3 monedas WLD y realmente llegó a GoPay automáticamente tras la aprobación. Voy a canjear el resto ahora.",
        tl: "Sinubukan ko muna ang maliit na halaga na 3 WLD koin at talagang pumasok ito sa GoPay nang awtomatiko pagka-approve ng admin. Ipapapalit ko na ang iba pa."
      }
    },
    {
      name: "John Doe",
      flag: "🇺🇸",
      date: "2026-06-12",
      wld: "50 WLD",
      rating: 5,
      comment: {
        id: "Penukaran internasional yang andal. Saya menggunakan dompet Crypto USDT Polygon untuk menerima dana tunai saya, pengerjaan luar biasa.",
        en: "Reliable international cashout. I used Crypto USDT Polygon wallet to receive my cash funds, wonderful performance.",
        es: "Retiro internacional confiable. Usé la billetera de Crypto USDT Polygon para recibir mis fondos en efectivo, maravilloso rendimiento.",
        tl: "Maasahang internasyonal na cashout. Ginamit ko ang aking Crypto USDT Polygon wallet para matanggap ang aking cash, napakahusay na performance."
      }
    },
    {
      name: "Budi Santoso",
      flag: "🇮🇩",
      date: "2026-06-10",
      wld: "30 WLD",
      rating: 5,
      comment: {
        id: "Rate penukaran di sini paling tinggi dibanding tempat lain. CS ramah dan dipandu pendaftarannya sampai selesai lewat panduan web.",
        en: "The exchange rate here is the highest compared to other places. The web guide helps you easily from start to finish.",
        es: "La tasa de cambio aquí es la más alta en comparación con otros lugares. La guía web te ayuda fácilmente de principio a fin.",
        tl: "Ang exchange rate dito ang pinakamataas kumpara sa ibang lugar. Napakalaking tulong ng web guide mula simula hanggang matapos."
      }
    },
    {
      name: "Althea Gutierrez",
      flag: "🇵🇭",
      date: "2026-06-08",
      wld: "8 WLD",
      rating: 5,
      comment: {
        id: "Sangat direkomendasikan untuk komunitas Worldcoin di Filipina. Sangat cepat, efisien, dan jujur.",
        en: "Highly recommended for Worldcoin community users in PH. Very fast, efficient, and honest service.",
        es: "Muy recomendado para los usuarios de la comunidad Worldcoin en Filipinas. Servicio muy rápido, eficiente y honesto.",
        tl: "Lubos na inirerekomenda para sa mga gumagamit ng Worldcoin community sa Pilipinas. Napakabilis, mahusay, at tapat na serbisyo."
      }
    },
    {
      name: "Alejandro Gómez",
      flag: "🇪🇸",
      date: "2026-06-05",
      wld: "35 WLD",
      rating: 5,
      comment: {
        id: "Situs web terbaik untuk mencairkan hibah bantuan WLD ke Euro. Terima kasih banyak atas bantuan instannya.",
        en: "Excellent website to cash out WLD grants into Euros. Thank you very much for the instant help.",
        es: "Excelente sitio web para retirar las subvenciones de WLD en euros. Muchas gracias por la ayuda instantánea.",
        tl: "Napakahusay na website para i-cash out ang WLD grants papuntang Euro. Maraming salamat sa agarang tulong."
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

  // 🔔 Loop Efek untuk Menampilkan Live Notification Pop-Up bergantian secara acak
  useEffect(() => {
    const showRandomNotification = () => {
      const randomIndex = Math.floor(Math.random() * liveNotificationsList.length);
      setActiveNotification(liveNotificationsList[randomIndex]);

      // Sembunyikan pop-up setelah 4 detik
      setTimeout(() => {
        setActiveNotification(null);
      }, 4000);
    };

    // Munculkan notifikasi pertama kali setelah 3 detik halaman dimuat
    const initialTimeout = setTimeout(showRandomNotification, 3000);

    // Atur interval pemunculan berikutnya setiap 9 detik sekali
    const interval = setInterval(showRandomNotification, 9000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
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
          { value: 'dana_gopay', brandName: 'DANA / E-Wallet', label: 'DANA, OVO, GoPay, LinkAja' },
          { value: 'bank_transfer', brandName: 'Transfer Bank', label: 'BCA, Mandiri, BRI, BNI, dll' }
        ];
      case 'es':
        return [
          { value: 'sepa_revolut', brandName: 'SEPA / Revolut', label: 'SEPA Bank Transfer / Revolut' },
          { value: 'paypal', brandName: 'PayPal', label: 'PayPal International' },
          { value: 'crypto', brandName: 'Crypto Wallet', label: 'USDT / USDC (Polygon/Arbitrum)' }
        ];
      case 'tl':
        return [
          { value: 'gcash', brandName: 'GCash / Maya', label: 'GCash / Maya E-Wallet' },
          { value: 'ph_bank', brandName: 'Local Bank', label: 'BDO / BPI / Metrobank' }
        ];
      default:
        return [
          { value: 'paypal_stripe', brandName: 'PayPal / Stripe', label: 'PayPal or Stripe Transfer' },
          { value: 'swift', brandName: 'SWIFT Wire', label: 'International Bank Wire' },
          { value: 'crypto_cashout', brandName: 'Crypto (USDT)', label: 'Crypto Wallet Cashout' }
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
        config.bankLabel = "Jenis E-Wallet";
        config.bankPlaceholder = "Contoh: DANA, OVO, GoPay, LinkAja";
        config.ownerLabel = "Nama Akun E-Wallet (Sesuai Aplikasi)";
        config.ownerPlaceholder = "Contoh: Budi Santoso";
        config.numLabel = "Nomor HP E-Wallet";
        config.numPlaceholder = "Contoh: 081234567xxx";
      } else if (metodeBayar === 'bank_transfer') {
        config.bankLabel = "Nama Bank Tujuan";
        config.bankPlaceholder = "Contoh: BCA, Mandiri, BRI, BNI";
        config.ownerLabel = "Nama Lengkap Pemilik Rekening";
        config.ownerPlaceholder = "Nama sesuai buku tabungan / KTP";
        config.numLabel = "Nomor Rekening Bank";
        config.numPlaceholder = "Masukkan angka rekening tanpa spasi";
      }
    } 
    else if (locale === 'tl') {
      if (metodeBayar === 'gcash') {
        config.bankLabel = "Wallet Type";
        config.bankPlaceholder = "e.g., GCash or Maya";
        config.ownerLabel = "Registered Full Name";
        config.ownerPlaceholder = "As registered on the app";
        config.numLabel = "Mobile Number";
        config.numPlaceholder = "e.g., 0917XXXXXXX";
      } else if (metodeBayar === 'ph_bank') {
        config.bankLabel = "Bank Name";
        config.bankPlaceholder = "e.g., BDO, BPI, Metrobank";
        config.ownerLabel = "Account Holder Name";
        config.ownerPlaceholder = "Full name on bank account";
        config.numLabel = "Bank Account Number";
        config.numPlaceholder = "Enter account digits";
      }
    }
    else if (locale === 'es') {
      if (metodeBayar === 'sepa_revolut') {
        config.bankLabel = "Nombre del Banco / App";
        config.bankPlaceholder = "Ej: Revolut, BBVA, Santander";
        config.ownerLabel = "Nombre del Titular";
        config.ownerPlaceholder = "Nombre completo del beneficiario";
        config.numLabel = "Número de Cuenta IBAN";
        config.numPlaceholder = "Ej: ESXX XXXX XXXX ...";
      } else if (metodeBayar === 'paypal') {
        config.bankLabel = "Plataforma";
        config.bankPlaceholder = "PayPal";
        config.ownerLabel = "Nombre del Perfil";
        config.ownerPlaceholder = "Nombre en PayPal";
        config.numLabel = "Correo Electrónico de PayPal";
        config.numPlaceholder = "ejemplo@correo.com";
      } else if (metodeBayar === 'crypto') {
        config.bankLabel = "Red Seleccionada (Network)";
        config.bankPlaceholder = "Ej: Polygon, Arbitrum, Optimism";
        config.ownerLabel = "Nombre del Destinatario (Opcional)";
        config.ownerPlaceholder = "Nombre o alias de la billetera";
        config.numLabel = "Dirección de Billetera (Wallet Address)";
        config.numPlaceholder = "Pegue su dirección 0x...";
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
        const res = await fetch(`/api/prices?currency=${currency.code}`, {
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error('Gagal mengambil data dari API internal');
        
        const prices = await res.json();
        
        setWldPriceUSD(prices.priceInUSD);
        setWldLocalPrice(prices.priceInLocal);
        setIsLoadingPrice(false);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Gagal memuat harga lewat API lokal, beralih ke harga fallback:", error);
          setWldLocalPrice(currency.fallbackPrice);
          setIsLoadingPrice(false);
        }
      }
    };

    fetchMarketPrice();
    const marketInterval = setInterval(fetchMarketPrice, 60000);

    return () => {
      controller.abort();
      clearInterval(marketInterval);
    };
  }, [locale, currency.code, currency.fallbackPrice]);

  useEffect(() => {
    if (!currentTransaksiId) return;

    const channel = supabase
      .channel(`realtime-transaksi-${currentTransaksiId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transaksi', filter: `id=eq.${currentTransaksiId}` },
        (payload) => {
          const updatedData = payload.new;
          
          if (updatedData.status === 'sukses') {
            setIsSubmitting(false); 
            setCurrentTransaksiId(null); 

            triggerAlert('success', locale === 'id' ? "Pencairan Berhasil! Admin telah mengonfirmasi transfer Anda dan dana dikirim." : "Cash out complete! Admin verified your transfer and funds have been sent.");
            
            setJumlahWld('');
            setNamaBank('');
            setNamaPemilik('');
            setNomorRekening('');
            setMetodeBayar('');
          } else if (updatedData.status === 'gagal') {
            setIsSubmitting(false);
            setCurrentTransaksiId(null);
            triggerAlert('error', locale === 'id' ? "Transaksi ditolak oleh admin. Periksa kembali pengiriman koin Anda." : "Transaction rejected by admin. Please check your token transfer.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTransaksiId, locale]);

  const handleCopy = () => {
    navigator.clipboard.writeText(myWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabel = (key: string) => {
    const dictionary: Record<string, Record<string, string>> = {
      title: { id: "Pencairan Worldcoin", en: "Worldcoin Cash Out", es: "Retiro de Worldcoin", tl: "Worldcoin Cash Out" },
      content: { id: "Tukar koin WLD Anda menjadi mata uang lokal dengan aman dan instan.", en: "Convert your WLD coins into local currency safely and instantly.", es: "Convierta sus monedas WLD a su moneda local al instante.", tl: "I-convert ang iyong WLD koin sa lokal na pera nang mabilis." },
      btnKembali: { id: "Kembali Halaman Utama", en: "Back to Home", es: "Volver al Inicio", tl: "Bumalik sa Home" },
      labelMetode: { id: "1. Pilih Metode Pembayaran Tujuan", en: "1. Select Receiving Method", es: "1. Seleccionar Método", tl: "1. Pamamaraan ng Pag-withdraw" },
      labelJumlah: { id: "2. Jumlah WLD yang Ingin Dijual", en: "2. Amount of WLD to Sell", es: "2. Cantidad de WLD a Vender", tl: "2. Halaga ng WLD na Ibe-benta" },
      btnSubmit: { id: "Lanjutkan Pencairan", en: "Continue Cash Out", es: "Continuar Retiro", tl: "Magpatuloy sa Pag-withdraw" },
      btnLoading: { id: "Menunggu Konfirmasi Admin...", en: "Waiting Admin Approval...", es: "Esperando Aprobación...", tl: "Naghihintay sa Pag-apruba..." },
      livePrice: { id: "Kurs Rate Saat Ini", en: "Current Live Rate", es: "Precio en Vivo", tl: "Live na Presyo" },
      estimasi: { id: "Bunga Bersih Diterima", en: "Net Amount You Will Receive", es: "Total Neto a Recibir", tl: "Kabuuang Matatanggap Mo" },
      next: { id: "Langkah Selanjutnya", en: "Next Step", es: "Siguiente Paso", tl: "Susunod na Hakbang" },
      doneTransfer: { id: "Saya Sudah Transfer Ke Agen", en: "I Have Sent the WLD", es: "Ya He Transferido", tl: "Naka-transfer Na Ako" },
      copyBtn: { id: "Salin", en: "Copy", es: "Copiar", tl: "Kopyahin" },
      copiedBtn: { id: "Tersalin!", en: "Copied!", es: "¡Copiado!", tl: "Na-kopya na!" },
      targetWalletText: { id: "Username Tujuan (World App):", en: "Target Username (World App):", es: "Usuario de Destino (World App):", tl: "Target na Username (World App):" },
      globalSupport: { id: "Mendukung Pencairan Lintas Negara Secara Instan", en: "Supporting Cross-Border Instant Cash Out", es: "Soporte de Retiro Instantáneo Internacional", tl: "Suportado ang Instant Cash Out sa Buong Mundo" },
      testiTitle: { id: "Ulasan Komunitas & Bukti Transfer", en: "Community Reviews & Proof of Transfer", es: "Reseñas de la Comunidad y Pruebas", tl: "Mga Review ng Komunidad at Patunay" },
      testiSubtitle: { id: "Ulasan asli dari pengguna global yang telah berhasil mencairkan koin Worldcoin mereka.", en: "Real reviews from global users who have successfully cashed out their Worldcoin grants.", es: "Reseñas reales de usuarios globales que han retirado con éxito sus subvenciones.", tl: "Mga totoong ulat mula sa mga user sa buong mundo na matagumpay na nag-withdraw." }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'];
  };

  const totalEstimasiLokal = Number(jumlahWld) * wldLocalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeBayar) {
      triggerAlert('error', locale === 'id' ? "Silakan pilih metode pembayaran terlebih dahulu" : "Please select a payment method");
      return;
    }
    if (!namaBank || !namaPemilik || !nomorRekening) {
      triggerAlert('error', locale === 'id' ? "Silakan lengkapi semua data tujuan rekening" : "Please fill in all account details");
      return;
    }
    if (Number(jumlahWld) < 3) {
      triggerAlert('error', locale === 'id' ? "Minimal penarikan adalah 3 WLD" : "Minimum withdrawal is 3 WLD");
      return;
    }
    setCurrentStep(1);
    setShowStepModal(true);
  };

  const sendAdminPushNotification = async (wldAmount: number, senderName: string) => {
    try {
      const { data: adminTokens, error: tokenError } = await supabase
        .from('admin_tokens')
        .select('token');

      if (tokenError) throw tokenError;
      if (!adminTokens || adminTokens.length === 0) return;

      const expoPushTokens = adminTokens.map(item => item.token);

      await fetch('/api/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: expoPushTokens,
          wldAmount: wldAmount,
          senderName: senderName
        }),
      });

    } catch (pushError) {
      console.error("Gagal mengirim notifikasi ke server admin:", pushError);
    }
  };

  const handleFinalSubmit = async () => {
    setShowStepModal(false);
    setIsSubmitting(true); 

    try {
      const { data, error } = await supabase
        .from('transaksi')
        .insert([
          {
            locale: locale,
            mata_uang: currency.code, 
            metode_bayar: metodeBayar,
            nama_bank: namaBank,
            nama_pemilik: namaPemilik,
            nomor_rekening: nomorRekening,
            jumlah_wld: Number(jumlahWld),
            estimasi_lokal: totalEstimasiLokal,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentTransaksiId(data.id);
      await sendAdminPushNotification(Number(jumlahWld), namaPemilik);
      triggerAlert('success', locale === 'id' ? "Pesanan dibuat! Mohon jangan tutup halaman ini, agen sedang memproses dana Anda." : "Order created! Please keep this page open, the agent is processing your funds.");

    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Database Error: Gagal menyimpan data transaksi.');
      setIsSubmitting(false);
    }
  };

  const stepsData = [
    { id: 1, title: { id: "Langkah 1: Salin Username Agen", en: "Step 1: Copy Agent Username", es: "Paso 1: Copiar Usuario del Agente", tl: "Hakbang 1: Kopyahin ang Username" }, desc: { id: "Salin nama username World App tujuan transfer agen kami yang tertera di bawah ini.", en: "Copy our agent's World App target username listed below.", es: "Copie el nombre de usuario de World App de nuestro agente a continuación.", tl: "Kopyahin ang World App username ng aming ahente sa ibaba." } },
    { id: 2, title: { id: "Langkah 2: Buka World App", en: "Step 2: Open World App", es: "Paso 2: Abrir World App", tl: "Hakbang 2: Buksan ang World App" }, desc: { id: "Buka aplikasi World App resmi di HP Anda.", en: "Open the official World App on your phone.", es: "Abra la aplicación oficial World App en su teléfono.", tl: "Buksan ang opisyal na World App sa iyong telepono." } },
    { id: 3, title: { id: "Langkah 3: Masuk ke Menu Dompet", en: "Step 3: Go to Wallet Menu", es: "Paso 3: Ir al Menú de Billetera", tl: "Hakbang 3: Pumunta sa Wallet Menu" }, desc: { id: "Ketuk ikon dompet atau saldo koin WLD Anda pada halaman utama aplikasi.", en: "Tap the wallet icon or your WLD coin balance.", es: "Toque el icono de la billetera o su saldo de WLD.", tl: "I-tap ang wallet icon o ang iyong balanse ng WLD." } },
    { id: 4, title: { id: "Langkah 4: Pilih Tombol Kirim", en: "Step 4: Select Send Button", es: "Paso 4: Seleccionar Enviar", tl: "Hakbang 4: Pilihin ang Send Button" }, desc: { id: "Pilih opsi 'Kirim' atau 'Send' untuk memulai pemindahan koin WLD Anda.", en: "Select the 'Send' option to initiate your WLD coin transfer.", es: "Seleccione la opción 'Enviar' para iniciar la transferencia de WLD.", tl: "Pilihin ang 'Send' na opsyon para simulan ang pag-transfer ng WLD." } },
    { id: 5, title: { id: "Langkah 5: Tempel Username Tujuan", en: "Step 5: Paste Target Username", es: "Paso 5: Pegar Usuario Destino", tl: "Hakbang 5: I-paste ang Username" }, desc: { id: "Tempelkan (Paste) nama username koin yang sudah disalin tadi ke dalam kolom pencarian penerima.", en: "Paste the copied username into the recipient search bar.", es: "Pegue el nombre de usuario copiado en la barra de búsqueda de destinatarios.", tl: "I-paste ang kinopyang username sa search bar ng tatanggap." } },
    { id: 6, title: { id: "Langkah 6: Masukkan Jumlah WLD", en: "Step 6: Enter WLD Amount", es: "Paso 6: Ingresar Cantidad WLD", tl: "Hakbang 6: Ilagay ang Halaga ng WLD" }, desc: { id: "Masukkan jumlah koin WLD yang ingin dicairkan sesuai dengan nominal yang Anda input di website ini.", en: "Enter the amount of WLD coins to cash out, matching your input on this website.", es: "Ingrese la cantidad de WLD a vender, coincidiendo con lo ingresado en este sitio web.", tl: "Ilagay ang halaga ng WLD na nais i-cash out, na tumutugma sa inilagay mo sa website na ito." } },
    { id: 7, title: { id: "Langkah 7: Konfirmasi Pengiriman", en: "Step 7: Confirm Shipment", es: "Paso 7: Confirmar Envío", tl: "Hakbang 7: Kumpirmahin ang Pagpapadala" }, desc: { id: "Periksa kembali nominal transfer, lalu lakukan konfirmasi pengiriman hingga transaksi sukses.", en: "Double-check the transfer amount, then confirm the transfer until it succeeds.", es: "Verifique el monto de la transferencia, luego confirme el envío hasta que sea exitoso.", tl: "Suriin muli ang halaga ng transfer, pagkatapos ay kumpirmahin ang pagpapadala hanggang sa magtagumpay." } },
    { id: 8, title: { id: "Langkah 8: Selesaikan Transaksi", en: "Step 8: Complete Transaction", es: "Paso 8: Completar Transacción", tl: "Hakbang 8: Tapusin ang Transaksyon" }, desc: { id: "Jika transfer sudah berhasil, klik tombol di bawah untuk instruksi otomatis pencairan uang ke rekening lokal Anda.", en: "If the transfer is successful, click the button below to initiate automatic fund withdrawal to your local bank.", es: "Si la transferencia fue exitosa, haga clic abajo para iniciar el retiro automático a su banco.", tl: "Kung matagumpay ang transfer, i-click ang button sa ibaba upang simulan ang awtomatikong pagpapadala sa iyong bank account." } }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '1.25rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '480px', margin: '0 auto', color: '#1e293b', boxSizing: 'border-box', position: 'relative' }}
    >
      {/* 🚀 OVERLAY PENANTIAN REALTIME */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', zIndex: 20000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem', boxSizing: 'border-box' }}
          >
            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'center', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              {getLabel('btnLoading')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', margin: 0, maxWidth: '320px', lineHeight: '1.5' }}>
              {locale === 'id' 
                ? "Sistem mendeteksi transfer WLD Anda. Halaman ini akan otomatis sukses ketika admin menyelesaikan pengiriman uang ke rekening Anda." 
                : "System is verifying your WLD transfer. This page will auto-refresh once the admin completes the wire transfer."}
            </p>
            <style jsx global>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALERT BANNER */}
      <AnimatePresence>
        {alertState.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 16, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            style={{
              position: 'fixed', top: 0, left: '50%',
              zIndex: 9999, width: 'calc(100% - 2rem)', maxWidth: '440px',
              backgroundColor: alertState.type === 'success' ? '#10b981' : '#ef4444',
              color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            {alertState.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{alertState.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 FLOATING LIVE POP-UP NOTIFICATION */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '1rem',
              zIndex: 999,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '340px',
              pointerEvents: 'none'
            }}
          >
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LuCheck size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>{activeNotification.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '400' }}>({activeNotification.country} {activeNotification.flag})</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '0.1rem' }}>
                {locale === 'id' ? 'Berhasil mencairkan ' : locale === 'es' ? 'Retiró con éxito ' : locale === 'tl' ? 'Matagumpay na nag-cash out ng ' : 'Successfully cashed out '}
                <strong style={{ color: '#38bdf8' }}>{activeNotification.wldAmount} WLD</strong> via {activeNotification.method}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <LuClock size={10} />
                {activeNotification.timeAgo[locale] || activeNotification.timeAgo['en']}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Kembali */}
      <Link href="/" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
        <LuArrowLeft size={14} />
        {getLabel('btnKembali')}
      </Link>

      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          {getLabel('title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
          {getLabel('content')}
        </p>
      </div>

      {/* GLOBAL BANNER */}
      <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 1.25rem', boxSizing: 'border-box', border: '1px solid #1e293b' }}>
        <div style={{ position: 'absolute', right: '-15px', width: '140px', height: '140px', opacity: 0.25, pointerEvents: 'none' }}>
          <Image 
            src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=300&auto=format&fit=crop" 
            alt="World Globe" 
            fill
            sizes="140px"
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '0.25rem 0.5rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            <LuGlobe size={12} />
            GLOBAL NETWORK
          </span>
          <h3 style={{ color: '#f8fafc', fontSize: '0.88rem', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>
            {getLabel('globalSupport')}
          </h3>
        </div>
      </div>

      {/* LIVE RATE */}
      <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <LuTrendingUp size={14} />
            {getLabel('livePrice')} ({currency.code})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '7px', height: '7px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {isLoadingPrice ? 'Calculating...' : `${currency.symbol}${wldLocalPrice.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}`}
            </h2>
          </div>
        </div>
        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1rem', textAlign: 'right' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>OKX Global</span>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginTop: '0.1rem' }}>
            {isLoadingPrice ? '...' : `$${wldPriceUSD.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
        
        {/* FIELD 1: DROP-DOWN METODE */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <LuWallet size={15} style={{ color: '#2563eb' }} />
            {getLabel('labelMetode')}
          </label>
          
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxSizing: 'border-box', userSelect: 'none' }}
          >
            {selectedOption ? (
              <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedOption.brandName}</span>
            ) : (
              <span style={{ color: '#94a3b8' }}>-- Pilih Metode Pembayaran --</span>
            )}
            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
              <LuChevronDown size={16} style={{ color: '#64748b' }} />
            </motion.div>
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 4 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 12px 20px -3px rgba(0, 0, 0, 0.08)', zIndex: 100, overflow: 'hidden', padding: '0.25rem' }}
              >
                {paymentOptions.map((option) => (
                  <div 
                    key={option.value}
                    onClick={() => {
                      setMetodeBayar(option.value);
                      setNamaBank('');
                      setNamaPemilik('');
                      setNomorRekening('');
                      setIsDropdownOpen(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', padding: '0.65rem', borderRadius: '10px', cursor: 'pointer', backgroundColor: metodeBayar === option.value ? '#eff6ff' : 'transparent' }}
                  >
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{option.brandName}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{option.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FIELD 2: INPUT REKENING */}
        <AnimatePresence initial={false}>
          {metodeBayar !== "" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              transition={{ duration: 0.2 }} 
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                  <LuCreditCard size={14} style={{ color: '#2563eb' }} />
                  {dynamicInput.bankLabel}
                </label>
                <input 
                  type="text" 
                  placeholder={dynamicInput.bankPlaceholder}
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem', outline: 'none' }} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                  <LuUser size={14} style={{ color: '#2563eb' }} />
                  {dynamicInput.ownerLabel}
                </label>
                <input 
                  type="text" 
                  placeholder={dynamicInput.ownerPlaceholder}
                  value={namaPemilik}
                  onChange={(e) => setNamaPemilik(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem', outline: 'none' }} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                  <LuSmartphone size={14} style={{ color: '#2563eb' }} />
                  {dynamicInput.numLabel}
                </label>
                <input 
                  type="text" 
                  placeholder={dynamicInput.numPlaceholder}
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem', outline: 'none' }} 
                  required 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIELD 3: JUMLAH COIN WLD */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <LuCoins size={15} style={{ color: '#2563eb' }} />
            {getLabel('labelJumlah')}
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              min="3"
              step="any"
              placeholder="Minimal 3 WLD" 
              value={jumlahWld}
              onChange={(e) => setJumlahWld(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 3.5rem 0.75rem 0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none' }} 
              required 
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b', fontSize: '0.85rem' }}>WLD</span>
          </div>
        </div>

        {/* ESTIMASI */}
        <AnimatePresence>
          {Number(jumlahWld) >= 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <LuDollarSign size={18} style={{ color: '#166534' }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>
                  {getLabel('estimasi')}
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#166534' }}>
                  {currency.symbol}{totalEstimasiLokal.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ width: '100%', backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb', color: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {getLabel('btnSubmit')}
        </button>
      </form>

      {/* 💬 SEKSI 10 BUKTI TESTIMONI KOMUNITAS */}
      <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <LuMessageSquare size={18} style={{ color: '#2563eb' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {getLabel('testiTitle')}
          </h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: '1.4' }}>
          {getLabel('testiSubtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {testimoniList.map((item, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.01)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {item.name} 
                    <span style={{ fontSize: '0.75rem' }}>{item.flag}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                    {item.date}
                  </div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                  +{item.wld}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.1rem', marginBottom: '0.5rem' }}>
                {[...Array(item.rating)].map((_, i) => (
                  <LuStar key={i} size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                ))}
              </div>

              <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                {item.comment[locale] || item.comment['en']}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL STEP */}
      <AnimatePresence>
        {showStepModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box' }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.3rem 0.6rem', borderRadius: '99px' }}>
                  Langkah {currentStep} dari 8
                </span>
                <button type="button" onClick={() => setShowStepModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <LuX size={20} />
                </button>
              </div>

              <div style={{ minHeight: '120px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {stepsData[currentStep - 1].title[locale] || stepsData[currentStep - 1].title['en']}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                  {stepsData[currentStep - 1].desc[locale] || stepsData[currentStep - 1].desc['en']}
                </p>

                {currentStep === 1 && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                      {getLabel('targetWalletText')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>@{myWalletAddress}</span>
                      <button type="button" onClick={handleCopy} style={{ backgroundColor: copied ? '#10b981' : '#0f172a', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {copied ? <LuCheck size={12} /> : <LuCopy size={12} />}
                        {copied ? getLabel('copiedBtn') : getLabel('copyBtn')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${(currentStep / 8) * 100}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.2s ease' }} />
              </div>

              <div>
                {currentStep < 8 ? (
                  <button type="button" onClick={() => setCurrentStep((prev) => prev + 1)} style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', padding: '0.7rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                    {getLabel('next')}
                  </button>
                ) : (
                  <button type="button" onClick={handleFinalSubmit} style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', padding: '0.7rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <FiCheckCircle size={15} />
                    {getLabel('doneTransfer')}
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}