import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, LoaderCircle, Phone, Smartphone, Wallet, Wifi, Zap } from 'lucide-react'

const catalog = {
  pulsa: {
    title: 'Isi Pulsa',
    subtitle: 'Pulsa semua operator',
    accent: 'emerald',
    icon: Smartphone,
    inputLabel: 'Nomor Handphone',
    inputHint: 'Contoh: 08123456789',
    buttonLabel: 'Beli Pulsa',
    filters: ['Semua', 'Telkomsel', 'XL', 'Indosat', 'Tri'],
    products: [
      ['TSEL10', 'Telkomsel', 'Telkomsel Rp 10.000', 10000, 11000],
      ['TSEL20', 'Telkomsel', 'Telkomsel Rp 20.000', 20000, 21500],
      ['TSEL50', 'Telkomsel', 'Telkomsel Rp 50.000', 50000, 52000],
      ['XL10', 'XL', 'Pulsa Rp 10.000', 10000, 10500],
      ['XL50', 'XL', 'Pulsa Rp 50.000', 50000, 51500],
      ['ISAT10', 'Indosat', 'Pulsa Rp 10.000', 10000, 10500],
      ['TRI10', 'Tri', 'Pulsa Rp 10.000', 10000, 10200],
    ],
  },
  data: {
    title: 'Paket Data',
    subtitle: 'Kuota internet semua provider',
    accent: 'blue',
    icon: Wifi,
    inputLabel: 'Nomor Handphone',
    inputHint: 'Contoh: 08123456789',
    buttonLabel: 'Beli Paket Data',
    filters: ['Semua', 'Telkomsel', 'XL', 'Indosat', 'Tri'],
    products: [
      ['TSEL_1GB_7H', 'Telkomsel', 'Telkomsel 1 GB/7H', 1, 12000],
      ['TSEL_3GB_30H', 'Telkomsel', 'Telkomsel 3 GB/30H', 3, 35000],
      ['TSEL_5GB_30H', 'Telkomsel', 'Telkomsel 5 GB/30H', 5, 55000],
      ['XL_5GB_30H', 'XL', 'XL 5 GB/30H', 5, 50000],
      ['ISAT_3GB_30H', 'Indosat', 'Indosat 3 GB/30H', 3, 30000],
      ['TRI_4GB_30H', 'Tri', 'Tri 4 GB/30H', 4, 40000],
    ],
  },
  listrik: {
    title: 'Token Listrik PLN',
    subtitle: 'Prabayar · Langsung ke meter',
    accent: 'amber',
    icon: Zap,
    inputLabel: 'Nomor Meter / ID Pelanggan',
    inputHint: 'Contoh: 123456789012',
    inputHelp: 'Cek nomor meter di bagian depan kWh meter Anda',
    buttonLabel: 'Beli Token PLN',
    products: [
      ['PLN20K', 'PLN', 'Token PLN Rp 20.000', 20000, 21500],
      ['PLN50K', 'PLN', 'Token PLN Rp 50.000', 50000, 51500],
      ['PLN100K', 'PLN', 'Token PLN Rp 100.000', 100000, 101500],
      ['PLN200K', 'PLN', 'Token PLN Rp 200.000', 200000, 201500],
    ],
  },
  ewallet: {
    title: 'Top Up E-Wallet',
    subtitle: 'GoPay · OVO · DANA · ShopeePay',
    accent: 'violet',
    icon: Wallet,
    inputLabel: 'Nomor HP / Akun E-Wallet',
    inputHint: 'Contoh: 08123456789',
    buttonLabel: 'Top Up Sekarang',
    filters: ['Semua', 'GoPay', 'OVO', 'DANA', 'ShopeePay'],
    products: [
      ['GOPAY50', 'GoPay', 'GoPay Rp 50.000', 50000, 51000],
      ['GOPAY100', 'GoPay', 'GoPay Rp 100.000', 100000, 101500],
      ['OVO50', 'OVO', 'OVO Rp 50.000', 50000, 51000],
      ['DANA50', 'DANA', 'DANA Rp 50.000', 50000, 51000],
      ['SHOPEEPAY50', 'ShopeePay', 'ShopeePay Rp 50.000', 50000, 51000],
    ],
  },
}

const accentClasses = {
  emerald: { gradient: 'from-emerald-500 to-teal-600', selectedBg: 'bg-emerald-50', selectedBorder: 'border-emerald-500', text: 'text-emerald-600', active: 'bg-emerald-600 border-emerald-600', badge: 'bg-emerald-500' },
  blue: { gradient: 'from-blue-500 to-indigo-600', selectedBg: 'bg-blue-50', selectedBorder: 'border-blue-500', text: 'text-blue-600', active: 'bg-blue-600 border-blue-600', badge: 'bg-blue-500' },
  amber: { gradient: 'from-amber-500 to-orange-600', selectedBg: 'bg-amber-50', selectedBorder: 'border-amber-500', text: 'text-amber-600', active: 'bg-amber-600 border-amber-600', badge: 'bg-amber-500' },
  violet: { gradient: 'from-purple-500 to-violet-600', selectedBg: 'bg-purple-50', selectedBorder: 'border-purple-500', text: 'text-purple-600', active: 'bg-purple-600 border-purple-600', badge: 'bg-purple-500' },
}

export default function PpobProductPage({ type }) {
  const navigate = useNavigate()
  const config = catalog[type]
  const [target, setTarget] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const Icon = config.icon
  const colors = accentClasses[config.accent]
  const products = useMemo(
    () => config.products.filter(product => filter === 'Semua' || product[1] === filter),
    [config.products, filter]
  )
  const validTarget = target.replace(/\D/g, '').length >= 10

  const submitOrder = async event => {
    event.preventDefault()
    if (!selected || !validTarget) return
    setSubmitting(true)
    navigate('/anggota/ppob/konfirmasi', {
      state: {
        order: {
          jenis_produk: type === 'data' ? 'paket_data' : type === 'listrik' ? 'token_listrik' : type,
          kode_produk: selected[0],
          nomor_tujuan: target,
          provider: selected[1],
          nama_produk: selected[2],
          nominal: selected[3],
          harga: selected[4],
        },
      },
    })
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '112px' }}>
      <header className={`bg-gradient-to-br ${colors.gradient} text-white rounded-b-3xl shadow-lg`}>
        <div className="flex items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate('/anggota/ppob')} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center" aria-label="Kembali">
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="font-bold">{config.title}</h1>
            <p className="text-xs text-white/80">{config.subtitle}</p>
          </div>
        </div>
      </header>

      <form onSubmit={submitOrder} className="px-4 py-4 space-y-4">
        {type === 'listrik' && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white flex items-center gap-3 shadow-sm">
            <Zap size={30} />
            <div><p className="font-bold text-sm">Token PLN Prabayar</p><p className="text-xs opacity-85">Token 20 digit dikirim setelah pembayaran berhasil</p></div>
          </div>
        )}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-2">
            <Phone size={14} /> {config.inputLabel}
          </label>
          <input value={target} onChange={event => setTarget(event.target.value)} inputMode="numeric" maxLength={15} className="input-field" placeholder={config.inputHint} />
          {config.inputHelp && <p className="text-xs text-gray-500 mt-2">{config.inputHelp}</p>}
        </div>
        {config.filters && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pilih Provider</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {config.filters.map(item => <button type="button" key={item} onClick={() => { setFilter(item); setSelected(null) }} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${filter === item ? `${colors.active} text-white` : 'bg-white text-gray-600 border-gray-200'}`}>{item}</button>)}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pilih Nominal</p>
          <div className={type === 'data' ? 'space-y-2' : 'grid grid-cols-2 gap-3'}>
            {products.map(product => {
              const isSelected = selected?.[0] === product[0]
              return <button type="button" key={product[0]} onClick={() => setSelected(product)} className={`relative text-left bg-white rounded-2xl p-3 border-2 shadow-sm transition ${isSelected ? `${colors.selectedBorder} ${colors.selectedBg}` : 'border-transparent'}`}>
                {isSelected && <span className={`absolute right-2 top-2 w-5 h-5 rounded-full ${colors.badge} text-white flex items-center justify-center`}><Check size={13} /></span>}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center mb-2`}><Icon size={18} /></div>
                <p className="text-sm font-bold text-gray-800">{product[2]}</p>
                <p className="text-xs text-gray-500 mt-1">{product[1]}{type === 'data' ? ` · ${product[3]} GB` : ''}</p>
                <p className={`text-sm font-extrabold ${colors.text} mt-2`}>Rp {product[4].toLocaleString('id-ID')}</p>
              </button>
            })}
          </div>
        </div>
        <button disabled={!selected || !validTarget || submitting} className={`fixed bottom-[72px] left-4 right-4 z-40 rounded-2xl py-3 text-white font-bold shadow-lg bg-gradient-to-r ${colors.gradient} disabled:opacity-50`}>
          {submitting ? <span className="flex items-center justify-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Memproses...</span> : selected && validTarget ? `${config.buttonLabel} — Rp ${selected[4].toLocaleString('id-ID')}` : 'Pilih Nominal & Nomor Dulu'}
        </button>
      </form>
    </div>
  )
}
