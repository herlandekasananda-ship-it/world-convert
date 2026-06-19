'use client';

import { useEffect, useState, use } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function PencairanPage({ params }: Props) {
  // 🛠️ Mencegah Error 7053 dengan mengunci tipe data locale secara eksplisit
  const { locale: rawLocale } = use(params);
  const locale = (rawLocale || 'en') as 'id' | 'en' | 'es' | 'tl';
  
  const [wldLocalPrice, setWldLocalPrice] = useState<number>(0);
  const [wldPriceUSD, setWldPriceUSD] = useState<number>(0);
  const [jumlahWld, setJumlahWld] = useState<string>('');
  const [nomorRekening, setNomorRekening] = useState<string>('');
  const [metodeBayar, setMetodeBayar] = useState<string>('');
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State untuk mengontrol Modal Step-by-Step
  const [showStepModal, setShowStepModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const myWalletAddress = "nitayunitaa"; // Username World App Tujuan Agen

  const getCurrencyConfig = () => {
    switch (locale) {
      case 'id': return { code: 'IDR', symbol: 'Rp ', localeCode: 'id-ID', fallbackPrice: 48500 };
      case 'es': return { code: 'EUR', symbol: '€', localeCode: 'de-DE', fallbackPrice: 2.95 };
      case 'tl': return { code: 'PHP', symbol: '₱', localeCode: 'en-PH', fallbackPrice: 185 };
      default: return { code: 'USD', symbol: '$', localeCode: 'en-US', fallbackPrice: 3.15 };
    }
  };

  const currency = getCurrencyConfig();

  useEffect(() => {
    const fetchMarketPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT', { cache: 'no-store' });
        const marketData = await res.json();
        if (marketData && marketData.price) {
          const priceInUSD = parseFloat(marketData.price);
          setWldPriceUSD(priceInUSD);
          if (currency.code === 'USD') {
            setWldLocalPrice(priceInUSD);
            setIsLoadingPrice(false);
            return;
          }
          const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD');
          const fiatData = await fiatRes.json();
          const targetRate = fiatData.rates?.[currency.code];
          if (targetRate) {
            setWldLocalPrice(priceInUSD * targetRate);
            setIsLoadingPrice(false);
            return;
          }
        }
      } catch (error) {
        console.warn("Gagal fetch data live:", error);
      }
      setWldPriceUSD((prev) => (prev === 0 ? 3.15 : prev));
      setWldLocalPrice((prev) => (prev === 0 ? currency.fallbackPrice : prev));
      setIsLoadingPrice(false);
    };

    fetchMarketPrice();
    const marketInterval = setInterval(fetchMarketPrice, 15000);
    return () => clearInterval(marketInterval);
  }, [locale, currency.code, currency.fallbackPrice]);

  // Reset nomor rekening jika pengguna mengubah metode pembayaran agar tidak salah data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNomorRekening('');
  }, [metodeBayar]);

  const handleCopy = () => {
    navigator.clipboard.writeText(myWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabel = (key: string) => {
    const dictionary: Record<string, Record<string, string>> = {
      title: { id: "Formulir Pencairan Worldcoin", en: "Worldcoin Withdrawal Form", es: "Formulario de Retiro de Worldcoin", tl: "Worldcoin Form sa Pag-withdraw" },
      content: { id: "Silakan isi data akun keuangan Anda untuk menerima pencairan dana lokal secara instan.", en: "Please fill in your financial account data to receive instant local fund withdrawals.", es: "Por favor, complete sus datos financieros para recibir el retiro.", tl: "Mangyaring sagutan ang iyong detalye para sa pag-withdraw." },
      btnKembali: { id: "← Kembali", en: "← Back", es: "← Volver", tl: "← Bumalik" },
      labelMetode: { id: "Pilih Metode Penarikan", en: "Select Withdrawal Method", es: "Seleccionar Método de Retiro", tl: "Pilihin ang Pamamaraan ng Pag-withdraw" },
      labelJumlah: { id: "Jumlah WLD yang Dicairkan", en: "Amount of WLD to Cash Out", es: "Cantidad de WLD a Retirar", tl: "Halaga ng WLD na I-cash Out" },
      btnSubmit: { id: "Proses Pencairan Instan", en: "Process Instant Withdrawal", es: "Procesar Retiro", tl: "Iproses ang Pag-withdraw" },
      btnLoading: { id: "Memproses...", en: "Processing...", es: "Procesando...", tl: "Prino-proseso..." },
      livePrice: { id: "Harga Pasar Live", en: "Live Market Price", es: "Precio de Mercado en Vivo", tl: "Live na Presyo sa Merkado" },
      estimasi: { id: "Estimasi Total Diterima", en: "Estimated Total Received", es: "Total Estimado", tl: "Kalkuladong Kabuuang Matatanggap" },
      next: { id: "Langkah Selanjutnya →", en: "Next Step →", es: "Siguiente Paso →", tl: "Susunod na Hakbang →" },
      doneTransfer: { id: "Saya Sudah Transfer ✅", en: "I Have Transferred ✅", es: "Ya He Transferido ✅", tl: "Naka-transfer Na Ako ✅" },
      copyBtn: { id: "Salin", en: "Copy", es: "Copiar", tl: "Kopyahin" },
      copiedBtn: { id: "Tersalin!", en: "Copied!", es: "¡Copiado!", tl: "Na-kopya na!" },
      targetWalletText: { id: "Username Tujuan (World App):", en: "Target Username (World App):", es: "Usuario de Destino (World App):", tl: "Target na Username (World App):" }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'];
  };

  // 🔄 KONDISIONAL DINAMIS: Menentukan Label & Placeholder Berdasarkan Metode & Negara
  const getDynamicInputConfig = () => {
    switch (metodeBayar) {
      // --- REGION: INDONESIA (id) ---
      case 'dana_gopay':
        return {
          label: "Nomor E-Wallet (DANA / OVO / GoPay / LinkAja)",
          placeholder: "Contoh: 081234567890"
        };
      case 'bank_transfer':
        return {
          label: "Nomor Rekening Bank & Nama Bank",
          placeholder: "Contoh: 5345012345 (BCA) a/n Budi"
        };

      // --- REGION: SPANYOL / EROPA (es) ---
      case 'sepa_revolut':
        return {
          label: "Número de Cuenta Bancaria (IBAN) / Revolut",
          placeholder: "Ejemplo: ES12 3456 7890 1234 5678"
        };
      case 'paypal':
        return {
          label: "Correo Electrónico de PayPal",
          placeholder: "Ejemplo: usuario@email.com"
        };
      case 'crypto':
        return {
          label: "Dirección de Billetera Crypto (USDT/USDC - Polygon/Arbitrum)",
          placeholder: "Ejemplo: 0x71C... (Asegúrate de que la red sea correcta)"
        };

      // --- REGION: FILIPINA (tl) ---
      case 'gcash':
        return {
          label: "GCash / Maya Mobile Number",
          placeholder: "Halimbawa: 09123456789"
        };
      case 'ph_bank':
        return {
          label: "Bank Name & Account Number",
          placeholder: "Halimbawa: BDO 1234567890"
        };

      // --- REGION: GLOBAL ENGLISH (en) ---
      case 'paypal_stripe':
        return {
          label: "PayPal Email / Stripe Account ID",
          placeholder: "Example: payment@yourdomain.com"
        };
      case 'swift':
        return {
          label: "International Bank Details (IBAN & SWIFT/BIC Code)",
          placeholder: "Example: SWIFT: KREDIXHH, IBAN: DE89..."
        };
      case 'crypto_cashout':
        return {
          label: "Crypto Wallet Address (USDT / USDC Network)",
          placeholder: "Example: 0x... or T... (TRC-20)"
        };

      default:
        return { label: "", placeholder: "" };
    }
  };

  const dynamicInput = getDynamicInputConfig();

  const stepsData = [
    {
      id: 1,
      title: { id: "Langkah 1: Salin Username Agen", en: "Step 1: Copy Agent Username", es: "Paso 1: Copiar Usuario del Agente", tl: "Hakbang 1: Kopyahin ang Username" },
      desc: { id: "Salin nama username World App tujuan transfer agen kami yang tertera di bawah ini.", en: "Copy our agent's World App target username listed below.", es: "Copie el nombre de usuario de World App de nuestro agente a continuación.", tl: "Kopyahin ang World App username ng aming ahente sa ibaba." }
    },
    {
      id: 2,
      title: { id: "Langkah 2: Buka World App", en: "Step 2: Open World App", es: "Paso 2: Abrir World App", tl: "Hakbang 2: Buksan ang World App" },
      desc: { id: "Buka aplikasi World App resmi di HP Anda dan pastikan saldo WLD Anda mencukupi.", en: "Open the official World App on your phone and ensure your WLD balance is sufficient.", es: "Abra la aplicación oficial World App en su teléfono.", tl: "Buksan ang opisyal na World App sa iyong telepono." }
    },
    {
      id: 3,
      title: { id: "Langkah 3: Masuk ke Menu Dompet", en: "Step 3: Go to Wallet Menu", es: "Paso 3: Ir al Menú de Billetera", tl: "Hakbang 3: Pumunta sa Wallet Menu" },
      desc: { id: "Ketuk ikon dompet atau saldo koin WLD Anda pada halaman utama aplikasi.", en: "Tap the wallet icon or your WLD coin balance on the main dashboard.", es: "Toque el icono de la billetera o su saldo de WLD.", tl: "I-tap ang wallet icon o ang iyong balanse ng WLD." }
    },
    {
      id: 4,
      title: { id: "Langkah 4: Pilih Tombol Kirim", en: "Step 4: Select Send Button", es: "Paso 4: Seleccionar Enviar", tl: "Hakbang 4: Pilihin ang Send Button" },
      desc: { id: "Pilih opsi 'Kirim' atau 'Send' untuk memulai pemindahan koin WLD Anda.", en: "Select the 'Send' option to initiate your WLD coin transfer.", es: "Seleccione la opción 'Enviar' para iniciar la transferencia de WLD.", tl: "Pilihin ang 'Send' na opsyon para simulan ang pag-transfer ng WLD." }
    },
    {
      id: 5,
      title: { id: "Langkah 5: Tempel Username Tujuan", en: "Step 5: Paste Target Username", es: "Paso 5: Pegar Usuario Destino", tl: "Hakbang 5: I-paste ang Username" },
      desc: { id: "Tempelkan (Paste) nama username koin yang sudah disalin tadi ke dalam kolom pencarian penerima.", en: "Paste the copied username into the recipient search bar.", es: "Pegue el nombre de usuario copiado en la barra de búsqueda de destinatarios.", tl: "I-paste ang kinopyang username sa search bar ng tatanggap." }
    },
    {
      id: 6,
      title: { id: "Langkah 6: Masukkan Jumlah WLD", en: "Step 6: Enter WLD Amount", es: "Paso 6: Ingresar Cantidad WLD", tl: "Hakbang 6: Ilagay ang Halaga ng WLD" },
      desc: { id: "Masukkan jumlah koin WLD yang ingin dicairkan sesuai dengan nominal yang Anda input di website ini.", en: "Enter the amount of WLD coins to cash out, matching your input on this website.", es: "Ingrese la cantidad de WLD a retirar, coincidiendo con lo ingresado en este sitio web.", tl: "Ilagay ang halaga ng WLD na nais i-cash out, na tumutugma sa inilagay mo sa website na ito." }
    },
    {
      id: 7,
      title: { id: "Langkah 7: Konfirmasi Pengiriman", en: "Step 7: Confirm Shipment", es: "Paso 7: Confirmar Envío", tl: "Hakbang 7: Kumpirmahin ang Pagpapadala" },
      desc: { id: "Periksa kembali nominal transfer, lalu lakukan konfirmasi pengiriman hingga transaksi sukses.", en: "Double-check the transfer amount, then confirm the transfer until it succeeds.", es: "Verifique el monto de la transferencia, luego confirme el envío hasta que sea exitoso.", tl: "Suriin muli ang halaga ng transfer, pagkatapos ay kumpirmahin ang pagpapadala hanggang sa magtagumpay." }
    },
    {
      id: 8,
      title: { id: "Langkah 8: Selesaikan Transaksi", en: "Step 8: Complete Transaction", es: "Paso 8: Completar Transacción", tl: "Hakbang 8: Tapusin ang Transaksyon" },
      desc: { id: "Jika transfer sudah berhasil, klik tombol di bawah untuk instruksi otomatis pencairan uang ke rekening lokal Anda.", en: "If the transfer is successful, click the button below to initiate automatic fund withdrawal to your local bank.", es: "Si la transferencia fue exitosa, haga clic abajo para iniciar el retiro automático a su banco.", tl: "Kung matagumpay ang transfer, i-click ang button sa ibaba upang simulan ang awtomatikong pagpapadala sa iyong bank account." }
    }
  ];

  const totalEstimasiLokal = Number(jumlahWld) * wldLocalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(jumlahWld) < 3) {
      alert(locale === 'id' ? "Minimal penarikan adalah 3 WLD" : "Minimum withdrawal is 3 WLD");
      return;
    }
    setCurrentStep(1);
    setShowStepModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowStepModal(false);
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      alert(locale === 'id' ? `Pencairan sukses! Dana dikirim ke: ${nomorRekening}` : `Withdrawal success! Funds sent to: ${nomorRekening}`);
      setJumlahWld('');
      setNomorRekening('');
      setMetodeBayar('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ padding: '2.5rem 1rem', fontFamily: 'system-ui, sans-serif', maxWidth: '580px', margin: '0 auto', color: '#1e293b' }}
    >
      {/* Tombol Kembali */}
      <motion.div whileHover={{ x: -4 }}>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          {getLabel('btnKembali')}
        </Link>
      </motion.div>

      {/* Judul Halaman */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          {getLabel('title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
          {getLabel('content')}
        </p>
      </div>

      {/* Tampilan Harga Realtime */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38bdf8', fontWeight: '700' }}>
            {getLabel('livePrice')} ({currency.code})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
            <motion.span 
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}
            />
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
              {isLoadingPrice ? 'Fetching...' : `${currency.symbol}${wldLocalPrice.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}`}
            </h2>
          </div>
        </div>
        <div style={{ textAlign: 'right', backgroundColor: 'rgba(255,255,255,0.07)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8' }}>WLD / USD</span>
          <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc' }}>
            {isLoadingPrice ? '...' : `$${wldPriceUSD.toFixed(3)}`}
          </div>
        </div>
      </motion.div>

      {/* FORMULIR UTAMA */}
      <motion.form 
        layout
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '2.25rem', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.02)' }}
      >
        {/* INPUT 1: Pilih Metode Penarikan Terlebih Dahulu */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>{getLabel('labelMetode')}</label>
          <select 
            value={metodeBayar}
            onChange={(e) => setMetodeBayar(e.target.value)}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
            required
          >
            <option value="">-- Select Method --</option>
            {locale === 'id' && (
              <>
                <option value="dana_gopay">DANA / OVO / GoPay / LinkAja</option>
                <option value="bank_transfer">Bank Transfer (BCA, Mandiri, BRI, BNI)</option>
              </>
            )}
            {locale === 'es' && (
              <>
                <option value="sepa_revolut">SEPA Bank Transfer / Revolut</option>
                <option value="paypal">PayPal International</option>
                <option value="crypto">Crypto Wallet (USDT / USDC)</option>
              </>
            )}
            {locale === 'tl' && (
              <>
                <option value="gcash">GCash / Maya E-Wallet</option>
                <option value="ph_bank">BDO / BPI / Metrobank</option>
              </>
            )}
            {locale === 'en' && (
              <>
                <option value="paypal_stripe">PayPal / Stripe Transfer</option>
                <option value="swift">International Bank Wire (SWIFT)</option>
                <option value="crypto_cashout">Crypto Wallet Cashout</option>
              </>
            )}
          </select>
        </div>

        {/* 🔄 INPUT 2: Muncul Secara Fleksibel Menyesuaikan Metode Pilihan Pengguna */}
        <AnimatePresence initial={false}>
          {metodeBayar !== "" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                {dynamicInput.label}
              </label>
              <input 
                type="text" 
                placeholder={dynamicInput.placeholder}
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none' }} 
                required 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* INPUT 3: Jumlah Koin WLD */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>{getLabel('labelJumlah')}</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              min="3"
              step="any"
              placeholder="Min. 3 WLD" 
              value={jumlahWld}
              onChange={(e) => setJumlahWld(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} 
              required 
            />
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: '#94a3b8' }}>WLD</span>
          </div>
        </div>

        {/* Kalkulator Estimasi Live */}
        <AnimatePresence initial={false}>
          {Number(jumlahWld) >= 3 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px', overflow: 'hidden' }}
            >
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600', textTransform: 'uppercase' }}>
                {getLabel('estimasi')}
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#166534', marginTop: '0.25rem' }}>
                {currency.symbol}{totalEstimasiLokal.toLocaleString(currency.localeCode, { maximumFractionDigits: locale === 'id' ? 0 : 2 })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={!isSubmitting ? { scale: 1.01 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb', 
            color: '#ffffff', 
            padding: '1rem', 
            borderRadius: '12px', 
            border: 'none', 
            fontWeight: 'bold', 
            fontSize: '1.05rem', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
            marginTop: '0.5rem', 
            boxShadow: isSubmitting ? 'none' : '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
            transition: 'background-color 0.2s ease'
          }}
        >
          {isSubmitting ? getLabel('btnLoading') : getLabel('btnSubmit')}
        </motion.button>
      </motion.form>

      {/* POPUP MODAL LANGKAH-LANGKAH TRANSFER WLD */}
      <AnimatePresence>
        {showStepModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem', boxSizing: 'border-box' }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', boxSizing: 'border-box' }}
            >
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Step {currentStep} of 8
                </span>
                <button 
                  onClick={() => setShowStepModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              {/* Konten Langkah Dinamis */}
              <div style={{ minHeight: '160px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                  {stepsData[currentStep - 1].title[locale] || stepsData[currentStep - 1].title['en']}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {stepsData[currentStep - 1].desc[locale] || stepsData[currentStep - 1].desc['en']}
                </p>

                {/* Box Copy Data Username World App Agen */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                    {getLabel('targetWalletText')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                      @{myWalletAddress}
                    </span>
                    <button 
                      onClick={handleCopy}
                      style={{ backgroundColor: copied ? '#10b981' : '#0f172a', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      {copied ? getLabel('copiedBtn') : getLabel('copyBtn')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ width: `${(currentStep / 8) * 100}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }}></div>
              </div>

              {/* Navigasi Modal */}
              <div>
                {currentStep < 8 ? (
                  <button 
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                  >
                    {getLabel('next')}
                  </button>
                ) : (
                  <button 
                    onClick={handleFinalSubmit}
                    style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                  >
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