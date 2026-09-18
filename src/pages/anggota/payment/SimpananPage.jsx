import { useMemo, useState } from 'react'
import { ArrowLeft, Banknote, Check, CreditCard, LoaderCircle, WalletCards } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/lib/api'

const config = {
  pokok: { label: 'Simpanan Pokok', minimum: 10000, icon: '🏦', description: 'Setoran awal wajib anggota dan dapat dicicil maksimal 10 kali.' },
  wajib: { label: 'Simpanan Wajib', minimum: 10000, icon: '💰', description: 'Setoran rutin untuk memenuhi kewajiban anggota koperasi.' },
  sukarela: { label: 'Simpanan Sukarela', minimum: 5000, icon: '🤲', description: 'Setoran fleksibel yang dapat dilakukan kapan saja.' },
}

const methods = [
  { id: 'bca_va', label: 'BCA Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-blue-600' },
  { id: 'bni_va', label: 'BNI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-orange-500' },
  { id: 'bri_va', label: 'BRI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-sky-600' },
  { id: 'qris', label: 'QRIS', group: 'E-Wallet & QRIS', fee: 0, color: 'bg-emerald-600' },
  { id: 'gopay', label: 'GoPay', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-green-600' },
  { id: 'dana', label: 'DANA', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-blue-500' },
]

const formatRupiah = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

export default function SimpananPaymentPage() {
  const navigate = useNavigate()
  const { jenis = 'wajib' } = useParams()
  const current = config[jenis] || config.wajib
  const [nominal, setNominal] = useState('')
  const [tenor, setTenor] = useState(jenis === 'pokok' ? '10' : '1')
  const [method, setMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const selectedMethod = methods.find(item => item.id === method)
  const amount = Number(nominal || 0)
  const admin = selectedMethod?.fee || 0
  const total = amount + admin
  const monthly = amount > 0 ? Math.ceil(amount / Number(tenor)) : 0
  const valid = amount >= current.minimum

  const quickAmounts = useMemo(() => (
    jenis === 'pokok' ? [25000, 50000, 100000, 200000, 500000] : [25000, 50000, 100000, 200000, 500000]
  ), [jenis])

  const submit = async event => {
    event.preventDefault()
    if (!valid) {
      setMessage(`Nominal minimum ${formatRupiah(current.minimum)}.`)
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await api.post('/anggota/payment/proses-simpanan', {
        nominal: amount,
        payment_method: method,
        jenis,
        tenor: Number(tenor),
      })
      const orderId = response.data?.order_id || response.data?.data?.order_id
      if (!orderId) throw new Error('Server tidak mengembalikan order ID.')
      navigate(`/anggota/payment/status/${orderId}`)
    } catch (error) {
      const validation = error.response?.data?.errors
      const details = validation ? Object.values(validation).flat().join(' ') : ''
      setMessage(details || error.response?.data?.message || error.message || 'Pengajuan simpanan gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '112px' }}>
      <header className="rounded-b-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate('/anggota/simpanan')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20" aria-label="Kembali"><ArrowLeft size={19} /></button>
          <div><h1 className="font-bold">Setor {current.label}</h1><p className="text-xs text-white/80">via Payment Gateway</p></div>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-4 px-4 py-4">
        <section className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl">{current.icon}</span>
          <div><h2 className="font-extrabold">{current.label}</h2><p className="mt-1 text-xs opacity-85">{current.description}</p><span className="mt-2 inline-block rounded-lg bg-white/20 px-2 py-1 text-[11px]">Min. {formatRupiah(current.minimum)}</span></div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><Banknote size={15} /> Jumlah Setoran</h2>
          <div className="mb-3 flex flex-wrap gap-2">{quickAmounts.map(value => <button type="button" key={value} onClick={() => setNominal(String(value))} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600">{formatRupiah(value)}</button>)}</div>
          <label className="text-xs font-semibold text-gray-500">Masukkan nominal setoran</label>
          <input required min={current.minimum} step="1000" type="number" value={nominal} onChange={event => setNominal(event.target.value)} className="input-field mt-2" placeholder="Contoh: 100000" />
          <p className="mt-2 text-xs text-gray-500">Minimum setoran: {formatRupiah(current.minimum)}</p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><WalletCards size={15} /> Tenor Simpanan</h2>
          <div className="grid grid-cols-5 gap-2">
            {(jenis === 'pokok' ? [1, 2, 3, 5, 10] : [1]).map(value => <button type="button" key={value} onClick={() => setTenor(String(value))} className={`rounded-xl border-2 p-2 text-center ${Number(tenor) === value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600'}`}><span className="block text-sm font-extrabold">{value}x</span><span className="text-[10px]">cicilan</span>{Number(tenor) === value && <Check size={13} className="mx-auto mt-1" />}</button>)}
          </div>
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm"><div className="flex justify-between"><span className="text-gray-600">Simulasi per cicilan</span><b className="text-emerald-700">{formatRupiah(monthly)}</b></div><p className="mt-1 text-xs text-gray-500">Total pokok {formatRupiah(amount)} dibagi {tenor} kali pembayaran.</p></div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><CreditCard size={15} /> Metode Pembayaran</h2>
          {['Virtual Account', 'E-Wallet & QRIS'].map(group => <div key={group} className="mb-3 last:mb-0"><p className="mb-2 text-[11px] font-bold uppercase text-gray-400">{group}</p><div className="grid grid-cols-2 gap-2">{methods.filter(item => item.group === group).map(item => <button type="button" key={item.id} onClick={() => setMethod(item.id)} className={`relative rounded-xl border-2 p-3 text-left ${method === item.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}><span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${item.color}`}><CreditCard size={15} /></span><span className="block text-xs font-bold">{item.label}</span><span className="mt-1 block text-[10px] text-gray-500">{item.fee ? `+${formatRupiah(item.fee)}` : 'Gratis'}</span>{method === item.id && <Check size={15} className="absolute right-2 top-2 text-emerald-600" />}</button>)}</div></div>)}
        </section>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Mode simulasi aktif. Tidak ada uang nyata yang diproses.</div>
        <section className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4"><div className="flex justify-between text-sm"><span className="text-gray-600">Nominal simpanan</span><b>{formatRupiah(amount)}</b></div><div className="mt-2 flex justify-between text-sm"><span className="text-gray-600">Biaya admin</span><b>{formatRupiah(admin)}</b></div><div className="mt-3 flex justify-between border-t border-emerald-200 pt-3"><span className="font-bold">Total pembayaran</span><b className="text-xl text-emerald-600">{formatRupiah(total)}</b></div></section>
        {message && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
        <button disabled={!valid || loading} className="fixed bottom-[72px] left-4 right-4 z-40 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-bold text-white shadow-lg disabled:opacity-50">{loading ? <span className="flex justify-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Memproses...</span> : valid ? `Lanjutkan Pembayaran — ${formatRupiah(total)}` : 'Masukkan Nominal Setoran'}</button>
      </form>
    </div>
  )
}
