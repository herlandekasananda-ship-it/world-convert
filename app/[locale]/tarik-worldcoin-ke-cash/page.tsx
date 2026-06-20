/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, use, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 

// Import React Icons standar Lu
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
  LuGlobe
} from 'react-icons/lu';

// Menggunakan Pack Fi (Feather Icons) khusus untuk ikon Status Alert agar bebas eror versi TS
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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
  logoUrl: string; 
}

export default function PencairanPage({ params }: Props) {
  const { locale: rawLocale } = use(params);
  const locale = (rawLocale || 'en') as 'id' | 'en' | 'es' | 'tl';
  
  const [wldLocalPrice, setWldLocalPrice] = useState<number>(0);
  const [wldPriceUSD, setWldPriceUSD] = useState<number>(0);
  const [jumlahWld, setJumlahWld] = useState<string>('');
  const [nomorRekening, setNomorRekening] = useState<string>('');
  const [metodeBayar, setMetodeBayar] = useState<string>('');
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State untuk Custom Dropdown Metode Pembayaran
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [alertState, setAlertState] = useState<CustomAlert>({ show: false, type: 'success', message: '' });
  const [showStepModal, setShowStepModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const myWalletAddress = "nitayunitaa"; 

  // Menutup dropdown jika pengguna menyentuh/klik area di luar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          { value: 'dana_gopay', brandName: 'DANA / E-Wallet', label: 'DANA, OVO, GoPay, LinkAja', logoUrl: '/logos/dana.png' },
          { value: 'bank_transfer', brandName: 'Transfer Bank', label: 'BCA, Mandiri, BRI, BNI, dll', logoUrl: '/logos/idbank.png' }
        ];
      case 'es':
        return [
          { value: 'sepa_revolut', brandName: 'SEPA / Revolut', label: 'SEPA Bank Transfer / Revolut', logoUrl: '/logos/revolut.png' },
          { value: 'paypal', brandName: 'PayPal', label: 'PayPal International', logoUrl: '/logos/paypal.png' },
          { value: 'crypto', brandName: 'Crypto Wallet', label: 'USDT / USDC (Polygon/Arbitrum)', logoUrl: '/logos/crypto.png' }
        ];
      case 'tl':
        return [
          { value: 'gcash', brandName: 'GCash / Maya', label: 'GCash / Maya E-Wallet', logoUrl: '/logos/gcash.png' },
          { value: 'ph_bank', brandName: 'Local Bank', label: 'BDO / BPI / Metrobank', logoUrl: '/logos/localbank.png' }
        ];
      default:
        return [
          { value: 'paypal_stripe', brandName: 'PayPal / Stripe', label: 'PayPal or Stripe Transfer', logoUrl: '/logos/paypal.png' },
          { value: 'swift', brandName: 'SWIFT Wire', label: 'International Bank Wire', logoUrl: '/logos/bank.png' },
          { value: 'crypto_cashout', brandName: 'Crypto (USDT)', label: 'Crypto Wallet Cashout', logoUrl: '/logos/crypto.png' }
        ];
    }
  };

  const paymentOptions = getPaymentOptions();
  const selectedOption = paymentOptions.find(opt => opt.value === metodeBayar);

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ show: true, type, message });
    setTimeout(() => setAlertState(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchMarketPrice = async () => {
      if (document.hidden) return; 
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT', { 
          cache: 'no-store',
          signal: controller.signal 
        });
        const marketData = await res.json();
        
        if (marketData?.price) {
          const priceInUSD = parseFloat(marketData.price);
          setWldPriceUSD(priceInUSD);
          
          if (currency.code === 'USD') {
            setWldLocalPrice(priceInUSD);
            setIsLoadingPrice(false);
            return;
          }
          
          const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
          const fiatData = await fiatRes.json();
          const targetRate = fiatData.rates?.[currency.code];
          
          if (targetRate) {
            setWldLocalPrice(priceInUSD * targetRate);
            setIsLoadingPrice(false);
            return;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn("Gagal fetch data live:", error.message);
        }
      }
    };

    fetchMarketPrice();
    const marketInterval = setInterval(fetchMarketPrice, 10000);

    return () => {
      controller.abort();
      clearInterval(marketInterval);
    };
  }, [locale, currency.code, currency.fallbackPrice]);

  useEffect(() => {
    setNomorRekening('');
  }, [metodeBayar]);

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
      labelJumlah: { id: "2. Jumlah WLD yang Ingin Dijual", en: "2. Amount of WLD to Sell", es: "2. Cantidad di WLD a Vender", tl: "2. Halaga ng WLD na Ibe-benta" },
      btnSubmit: { id: "Lanjutkan Pencairan", en: "Continue Cash Out", es: "Continuar Retiro", tl: "Magpatuloy sa Pag-withdraw" },
      btnLoading: { id: "Memproses...", en: "Processing...", es: "Procesando...", tl: "Prino-proseso..." },
      livePrice: { id: "Kurs Rate Saat Ini", en: "Current Live Rate", es: "Precio en Vivo", tl: "Live na Presyo" },
      estimasi: { id: "Bersih Diterima di Rekening Anda", en: "Net Amount You Will Receive", es: "Total Neto a Recibir", tl: "Kabuuang Matatanggap Mo" },
      next: { id: "Langkah Selanjutnya", en: "Next Step", es: "Siguiente Paso", tl: "Susunod na Hakbang" },
      doneTransfer: { id: "Saya Sudah Transfer Ke Agen", en: "I Have Sent the WLD", es: "Ya He Transferido", tl: "Naka-transfer Na Ako" },
      copyBtn: { id: "Salin", en: "Copy", es: "Copiar", tl: "Kopyahin" },
      copiedBtn: { id: "Tersalin!", en: "Copied!", es: "¡Copiado!", tl: "Na-kopya na!" },
      targetWalletText: { id: "Username Tujuan (World App):", en: "Target Username (World App):", es: "Usuario de Destino (World App):", tl: "Target na Username (World App):" },
      globalSupport: { id: "Mendukung Pencairan Lintas Negara Secara Instan", en: "Supporting Cross-Border Instant Cash Out", es: "Soporte de Retiro Instantáneo Internacional", tl: "Suportado ang Instant Cash Out sa Buong Mundo" }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'];
  };

  const getDynamicInputConfig = () => {
    switch (metodeBayar) {
      case 'dana_gopay': return { label: "Nomor HP E-Wallet", placeholder: "Masukkan Nomor DANA / OVO / GoPay / LinkAja" };
      case 'bank_transfer': return { label: "Detail Rekening Bank", placeholder: "Nomor Rekening + Nama Bank + Nama Pemilik (Contoh: BCA 123456 a/n Budi)" };
      case 'sepa_revolut': return { label: "IBAN / Revolut Tag", placeholder: "e.g., ES12 3456... or @revolut-tag" };
      case 'paypal': return { label: "Email PayPal", placeholder: "example@email.com" };
      case 'crypto': return { label: "Alamat Wallet Crypto", placeholder: "0x... (USDT/USDC Network Polygon/Arbitrum)" };
      case 'gcash': return { label: "GCash / Maya Number", placeholder: "e.g., 09123456789" };
      case 'ph_bank': return { label: "Bank Account Details", placeholder: "Bank Name + Account Number" };
      case 'paypal_stripe': return { label: "PayPal / Stripe Email", placeholder: "payment@domain.com" };
      case 'swift': return { label: "SWIFT/BIC & IBAN", placeholder: "SWIFT: XXXX, IBAN: XXXX" };
      case 'crypto_cashout': return { label: "Crypto Wallet Address", placeholder: "0x... or T... (USDT/USDC)" };
      default: return { label: "", placeholder: "" };
    }
  };

  const dynamicInput = getDynamicInputConfig();
  const totalEstimasiLokal = Number(jumlahWld) * wldLocalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodeBayar) {
      triggerAlert('error', locale === 'id' ? "Silakan pilih metode pembayaran terlebih dahulu" : "Please select a payment method");
      return;
    }
    if (Number(jumlahWld) < 3) {
      triggerAlert('error', locale === 'id' ? "Minimal penarikan adalah 3 WLD" : "Minimum withdrawal is 3 WLD");
      return;
    }
    setCurrentStep(1);
    setShowStepModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowStepModal(false);
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      triggerAlert('success', locale === 'id' ? `Pencairan Sukses! Dana sedang dikirim ke rekening Anda.` : `Withdrawal Success! Funds are being sent.`);
      setJumlahWld('');
      setNomorRekening('');
      setMetodeBayar('');
    } catch {
      triggerAlert('error', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsData = [
    { id: 1, title: { id: "Langkah 1: Salin Username Agen", en: "Step 1: Copy Agent Username", es: "Paso 1: Copiar Usuario del Agente", tl: "Hakbang 1: Kopyahin ang Username" }, desc: { id: "Salin nama username World App tujuan transfer agen kami yang tertera di bawah ini.", en: "Copy our agent's World App target username listed below.", es: "Copie el nombre de usuario de World App de nuestro agente a continuación.", tl: "Kopyahin ang World App username ng aming ahente sa ibaba." } },
    { id: 2, title: { id: "Langkah 2: Buka World App", en: "Step 2: Open World App", es: "Paso 2: Abrir World App", tl: "Hakbang 2: Buksan ang World App" }, desc: { id: "Buka aplikasi World App resmi di HP Anda dan pastikan saldo WLD Anda mencukupi.", en: "Open the official World App on your phone and ensure your WLD balance is sufficient.", es: "Abra la aplicación oficial World App en su teléfono.", tl: "Buksan ang opisyal na World App sa iyong telepono." } },
    { id: 3, title: { id: "Langkah 3: Masuk ke Menu Dompet", en: "Step 3: Go to Wallet Menu", es: "Paso 3: Ir al Menú de Billetera", tl: "Hakbang 3: Pumunta sa Wallet Menu" }, desc: { id: "Ketuk ikon dompet atau saldo koin WLD Anda pada halaman utama aplikasi.", en: "Tap the wallet icon or your WLD coin balance on the main dashboard.", es: "Toque el icono de la billetera o su saldo de WLD.", tl: "I-tap ang wallet icon o ang iyong balanse ng WLD." } },
    { id: 4, title: { id: "Langkah 4: Pilih Tombol Kirim", en: "Step 4: Select Send Button", es: "Paso 4: Seleccionar Enviar", tl: "Hakbang 4: Pilihin ang Send Button" }, desc: { id: "Pilih opsi 'Kirim' atau 'Send' untuk memulai pemindahan koin WLD Anda.", en: "Select the 'Send' option to initiate your WLD coin transfer.", es: "Seleccione la opción 'Enviar' para iniciar la transferencia de WLD.", tl: "Pilihin ang 'Send' na opsyon para simulan ang pag-transfer ng WLD." } },
    { id: 5, title: { id: "Langkah 5: Tempel Username Tujuan", en: "Step 5: Paste Target Username", es: "Paso 5: Pegar Usuario Destino", tl: "Hakbang 5: I-paste ang Username" }, desc: { id: "Tempelkan (Paste) nama username koin yang sudah disalin tadi ke dalam kolom pencarian penerima.", en: "Paste the copied username into the recipient search bar.", es: "Pegue el nombre de usuario copiado en la barra de búsqueda de destinatarios.", tl: "I-paste ang kinopyang username sa search bar ng tatanggap." } },
    { id: 6, title: { id: "Langkah 6: Masukkan Jumlah WLD", en: "Step 6: Enter WLD Amount", es: "Paso 6: Ingresar Cantidad WLD", tl: "Hakbang 6: Ilagay ang Halaga ng WLD" }, desc: { id: "Masukkan jumlah koin WLD yang ingin dicairkan sesuai dengan nominal yang Anda input di website ini.", en: "Enter the amount of WLD coins to cash out, matching your input on this website.", es: "Ingrese la cantidad de WLD a retirar, coincidiendo con lo ingresado en este sitio web.", tl: "Ilagay ang halaga ng WLD na nais i-cash out, na tumutugma sa inilagay mo sa website na ito." } },
    { id: 7, title: { id: "Langkah 7: Konfirmasi Pengiriman", en: "Step 7: Confirm Shipment", es: "Paso 7: Confirmar Envío", tl: "Hakbang 7: Kumpirmahin ang Pagpapadala" }, desc: { id: "Periksa kembali nominal transfer, lalu lakukan konfirmasi pengiriman hingga transaksi sukses.", en: "Double-check the transfer amount, then confirm the transfer until it succeeds.", es: "Verifique el monto de la transferencia, luego confirme el envío hasta que sea exitoso.", tl: "Suriin muli ang halaga ng transfer, pagkatapos ay kumpirmahin ang pagpapadala hanggang sa magtapumay." } },
    { id: 8, title: { id: "Langkah 8: Selesaikan Transaksi", en: "Step 8: Complete Transaction", es: "Paso 8: Completar Transacción", tl: "Hakbang 8: Tapusin ang Transaksyon" }, desc: { id: "Jika transfer sudah berhasil, klik tombol di bawah untuk instruksi otomatis pencairan uang ke rekening lokal Anda.", en: "If the transfer is successful, click the button below to initiate automatic fund withdrawal to your local bank.", es: "Si la transferencia fue exitosa, haga clic abajo para iniciar el retiro automático a su banco.", tl: "Kung matagumpay ang transfer, i-click ang button sa ibaba upang simulan ang awtomatikong pagpapadala sa iyong bank account." } }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '1.25rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '480px', margin: '0 auto', color: '#1e293b', boxSizing: 'border-box' }}
    >
      {/* 🔔 CUSTOM ANIMATED ALERT BANNER */}
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

      {/* Nav Kembali */}
      <Link href="/" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
        <LuArrowLeft size={14} />
        {getLabel('btnKembali')}
      </Link>

      {/* Header Utama */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          {getLabel('title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
          {getLabel('content')}
        </p>
      </div>

      {/* 🖼️ BANNER ANIMASI NEGARA GLOBAL */}
      <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 1.25rem', boxSizing: 'border-box', border: '1px solid #1e293b' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          style={{ position: 'absolute', right: '-15px', width: '140px', height: '140px', opacity: 0.25, pointerEvents: 'none' }}
        >
          <Image 
            src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=300&auto=format&fit=crop" 
            alt="World Globe" 
            fill
            sizes="140px"
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </motion.div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '0.25rem 0.5rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            <LuGlobe size={12} className="animate-spin" style={{ animationDuration: '8s' }} />
            GLOBAL NETWORK
          </span>
          <h3 style={{ color: '#f8fafc', fontSize: '0.88rem', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>
            {getLabel('globalSupport')}
          </h3>
        </div>
      </div>

      {/* 🚀 TATA LETAK BARU: LIVE RATE CARD MINIMALIS & ELEGAN (Tanpa Kotak Hitam) */}
      <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <LuTrendingUp size={14} />
            {getLabel('livePrice')} ({currency.code})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '7px', height: '7px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {isLoadingPrice ? 'Calculating...' : `${currency.symbol}${wldLocalPrice.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}`}
            </h2>
          </div>
        </div>
        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1rem', textAlign: 'right' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Binance Global</span>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginTop: '0.1rem' }}>
            {isLoadingPrice ? '...' : `$${wldPriceUSD.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Form Utama Modern */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
        
        {/* FIELD 1: CUSTOM BRANDED METHOD SELECTOR */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <LuWallet size={15} style={{ color: '#2563eb' }} />
            {getLabel('labelMetode')}
          </label>
          
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxSizing: 'border-box', userSelect: 'none', transition: 'border-color 0.2s' }}
          >
            {selectedOption ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ position: 'relative', width: '22px', height: '22px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={selectedOption.logoUrl} alt={selectedOption.brandName} fill sizes="22px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedOption.brandName}</span>
              </div>
            ) : (
              <span style={{ color: '#94a3b8' }}>-- Tap untuk memilih metode --</span>
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
                      setIsDropdownOpen(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem', borderRadius: '10px', cursor: 'pointer', backgroundColor: metodeBayar === option.value ? '#eff6ff' : 'transparent', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = metodeBayar === option.value ? '#eff6ff' : '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = metodeBayar === option.value ? '#eff6ff' : 'transparent')}
                  >
                    <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '2px' }}>
                      <Image src={option.logoUrl} alt={option.brandName} fill sizes="28px" style={{ objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{option.brandName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{option.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FIELD 2: Input Rekening (Bersyarat) */}
        <AnimatePresence initial={false}>
          {metodeBayar !== "" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                <LuCreditCard size={15} style={{ color: '#2563eb' }} />
                {dynamicInput.label}
              </label>
              <input 
                type="text" 
                placeholder={dynamicInput.placeholder}
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }} 
                required 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIELD 3: Input Nominal Jumlah Coin */}
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

        {/* Kalkulator Terintegrasi Bersih */}
        <AnimatePresence>
          {Number(jumlahWld) >= 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <LuDollarSign size={18} style={{ color: '#166534' }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {getLabel('estimasi')}
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#166534', marginTop: '0.05rem', letterSpacing: '-0.02em' }}>
                  {currency.symbol}{totalEstimasiLokal.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ width: '100%', backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb', color: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.25rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isSubmitting ? getLabel('btnLoading') : getLabel('btnSubmit')}
        </button>
      </form>

      {/* POPUP MODAL LANGKAH TRANSFER WLD */}
      <AnimatePresence>
        {showStepModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vw', minHeight: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box' }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.3rem 0.6rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <LuSmartphone size={12} />
                  Langkah {currentStep} dari 8
                </span>
                <button type="button" onClick={() => setShowStepModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
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

              {/* Progress Tracker Bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${(currentStep / 8) * 100}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.2s ease' }} />
              </div>

              <div>
                {currentStep < 8 ? (
                  <button type="button" onClick={() => setCurrentStep((prev) => prev + 1)} style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', padding: '0.7rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                    {getLabel('next')}
                  </button>
                ) : (
                  <button type="button" onClick={handleFinalSubmit} style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', padding: '0.7rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
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