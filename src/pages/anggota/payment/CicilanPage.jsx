import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarCheck, Check, CreditCard, Info, LoaderCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const methods = [
  { id: 'bca_va', label: 'BCA Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-blue-600' },
  { id: 'bni_va', label: 'BNI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-orange-500' },
  { id: 'bri_va', label: 'BRI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-sky-600' },
  { id: 'qris', label: 'QRIS', group: 'E-Wallet & QRIS', fee: 0, color: 'bg-emerald-600' },
  { id: 'gopay', label: 'GoPay', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-green-600' },
  { id: 'dana', label: 'DANA', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-blue-500' },
]

const money = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`
const loanLabels = { qard: 'Al-Qord (Qard)', murabahah: 'Murabahah', mudharabah: 'Mudharabah' }

export default function CicilanPaymentPage() {
  const navigate = useNavigate()
  const { jenis = 'qard', id } = useParams()
  const [method, setMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['anggota-cicilan-payment'],
    queryFn: () => api.get('/anggota/cicilan').then(response => response.data?.data || []),
  })
  const item = rows.find(row => String(row.id) === String(id))
  const selected = methods.find(option => option.id === method)
  useEffect(() => {
    if (item) setAmountInput(String(item.nominal || ''))
  }, [item])
  const amount = Number(amountInput || 0)
  const total = amount + Number(selected?.fee || 0)
  const paid = Number(item?.jml_terbayar || item?.terbayar || 0)
  const loanTotal = Number(item?.jml_pinjam || item?.total_pinjaman || 0)
  const progress = loanTotal > 0 ? Math.min(100, Math.round((paid / loanTotal) * 100)) : 0

  const quickAmounts = useMemo(() => {
    const values = [50000, 100000, 200000, 500000]
    return amount > 0 && !values.includes(amount) ? [amount, ...values] : values
  }, [amount])

  const submit = async event => {
    event.preventDefault()
    if (!item) return
    if (amount <= 0) {
      setMessage('Masukkan nominal pembayaran yang valid.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await api.post('/anggota/payment/proses-cicilan', {
        id: item.id,
        nominal: amount,
        payment_method: method,
        jenis,
      })
      const orderId = response.data?.order_id || response.data?.data?.order_id
      if (!orderId) throw new Error('Server tidak mengembalikan order ID.')
      navigate(`/anggota/payment/status/${orderId}`)
    } catch (error) {
      const validation = error.response?.data?.errors
      const details = validation ? Object.values(validation).flat().join(' ') : ''
      setMessage(details || error.response?.data?.message || error.message || 'Pembayaran cicilan gagal.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Memuat data cicilan...</div>
  if (!item) return <div className="min-h-screen bg-gray-50 p-6 text-center"><p className="text-gray-500">Data cicilan tidak ditemukan.</p><button type="button" onClick={() => navigate('/anggota/cicilan')} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Kembali ke Cicilan</button></div>

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '112px' }}>
      <header className="rounded-b-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate('/anggota/cicilan')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20" aria-label="Kembali"><ArrowLeft size={19} /></button>
          <div><h1 className="font-bold">Bayar Cicilan</h1><p className="text-xs text-white/80">via Payment Gateway</p></div>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-sm">
          <div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-white/20 px-2 py-1 text-xs font-bold">{loanLabels[jenis] || jenis.toUpperCase()}</span><CalendarCheck size={22} /></div>
          <p className="text-xs opacity-80">Nominal cicilan ke-{item.cicilan_ke || '-'}</p>
          <p className="mt-1 text-2xl font-extrabold">{money(amount)}</p>
          <div className="mt-3 flex justify-between text-xs opacity-85"><span>Progress pelunasan</span><span>{progress}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-white/25"><div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><CalendarCheck size={15} /> Nominal Angsuran</h2>
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs text-gray-500">Nominal pembayaran</p><div className="mt-1 flex items-center gap-2"><span className="font-bold text-emerald-700">Rp</span><input type="number" min="1" value={amountInput} onChange={event => setAmountInput(event.target.value)} className="w-full bg-transparent text-lg font-extrabold text-emerald-700 outline-none" aria-label="Nominal pembayaran" /></div></div>
          <p className="mb-2 text-xs font-semibold text-gray-500">Pilihan nominal cepat</p>
          <div className="flex flex-wrap gap-2">{quickAmounts.map(value => <button type="button" key={value} onClick={() => setAmountInput(String(value))} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${value === amount ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>{money(value)}</button>)}</div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><Info size={15} /> Ringkasan Pembayaran</h2>
          <div className="flex justify-between border-b border-gray-100 py-2 text-sm"><span className="text-gray-500">Jenis pinjaman</span><b>{loanLabels[jenis] || jenis}</b></div>
          <div className="flex justify-between border-b border-gray-100 py-2 text-sm"><span className="text-gray-500">Jumlah bayar</span><b>{money(amount)}</b></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Total setelah biaya admin</span><b className="text-lg text-emerald-600">{money(total)}</b></div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><CreditCard size={15} /> Metode Pembayaran</h2>
          {['Virtual Account', 'E-Wallet & QRIS'].map(group => <div key={group} className="mb-3 last:mb-0"><p className="mb-2 text-[11px] font-bold uppercase text-gray-400">{group}</p><div className="grid grid-cols-2 gap-2">{methods.filter(option => option.group === group).map(option => <button type="button" key={option.id} onClick={() => setMethod(option.id)} className={`relative rounded-xl border-2 p-3 text-left ${method === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}><span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${option.color}`}><CreditCard size={15} /></span><span className="block text-xs font-bold">{option.label}</span><span className="mt-1 block text-[10px] text-gray-500">{option.fee ? `+${money(option.fee)}` : 'Gratis'}</span>{method === option.id && <Check size={15} className="absolute right-2 top-2 text-emerald-600" />}</button>)}</div></div>)}
        </section>

        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><Info size={16} /> Mode simulasi aktif. Tidak ada uang nyata yang diproses.</div>
        {message && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
        <button disabled={loading} className="fixed bottom-[72px] left-4 right-4 z-40 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-bold text-white shadow-lg disabled:opacity-50">{loading ? <span className="flex justify-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Memproses...</span> : `Bayar ${money(total)} →`}</button>
      </form>
    </div>
  )
}
