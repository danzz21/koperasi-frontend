import { useMemo, useState } from 'react'
import { ArrowLeft, Check, CreditCard, LoaderCircle, ShoppingCart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '@/lib/api'

const paymentMethods = [
  { id: 'bca_va', label: 'BCA Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-blue-600' },
  { id: 'bni_va', label: 'BNI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-orange-500' },
  { id: 'bri_va', label: 'BRI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-sky-600' },
  { id: 'qris', label: 'QRIS', group: 'E-Wallet & QRIS', fee: 0, color: 'bg-emerald-600' },
  { id: 'gopay', label: 'GoPay', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-green-600' },
  { id: 'dana', label: 'DANA', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-blue-500' },
]

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const order = state?.order
  const [method, setMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const selectedMethod = paymentMethods.find(item => item.id === method)
  const total = useMemo(() => Number(order?.harga || 0) + Number(selectedMethod?.fee || 0), [order, selectedMethod])

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center">
        <p className="text-gray-500">Data pesanan tidak ditemukan.</p>
        <button type="button" onClick={() => navigate('/anggota/ppob')} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Kembali ke PPOB</button>
      </div>
    )
  }

  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/anggota/ppob/order', {
        ...order,
        payment_method: method,
      }, { timeout: 20000 })
      const orderId = response.data?.data?.order_id || response.data?.order_id
      if (!orderId) throw new Error('Server tidak mengembalikan order ID.')
      navigate(`/anggota/ppob/status/${orderId}`)
    } catch (err) {
      const validation = err.response?.data?.errors
      const details = validation ? Object.values(validation).flat().join(' ') : ''
      const message = err.code === 'ECONNABORTED'
        ? 'Server terlalu lama merespons. Pastikan backend dan database sedang berjalan, lalu coba lagi.'
        : details || err.response?.data?.message || err.message || 'Pesanan belum dapat diproses.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '110px' }}>
      <header className="rounded-b-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20" aria-label="Kembali"><ArrowLeft size={19} /></button>
          <div><h1 className="font-bold">Konfirmasi Pesanan</h1><p className="text-xs text-white/80">Periksa detail sebelum membayar</p></div>
        </div>
      </header>
      <form onSubmit={submit} className="space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><ShoppingCart size={15} /> Detail Pesanan</h2>
          {[['Produk', order.nama_produk], ['Tujuan', order.nomor_tujuan], ['Provider', order.provider], ['Harga Produk', `Rp ${Number(order.harga).toLocaleString('id-ID')}`]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-dashed border-gray-100 py-2 last:border-0"><span className="text-sm text-gray-500">{label}</span><span className="text-right text-sm font-semibold">{value}</span></div>)}
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-3"><span className="font-bold">Total Bayar</span><span className="text-lg font-extrabold text-emerald-600">Rp {total.toLocaleString('id-ID')}</span></div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><CreditCard size={15} /> Pilih Metode Pembayaran</h2>
          {['Virtual Account', 'E-Wallet & QRIS'].map(group => <div key={group} className="mb-3 last:mb-0"><p className="mb-2 text-[11px] font-bold uppercase text-gray-400">{group}</p><div className="grid grid-cols-2 gap-2">{paymentMethods.filter(item => item.group === group).map(item => <button type="button" key={item.id} onClick={() => setMethod(item.id)} className={`relative rounded-xl border-2 p-3 text-left ${method === item.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}><span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${item.color}`}><CreditCard size={15} /></span><span className="block text-xs font-bold">{item.label}</span><span className="mt-1 block text-[10px] text-gray-500">{item.fee ? `+Rp ${item.fee.toLocaleString('id-ID')}` : 'Gratis'}</span>{method === item.id && <Check size={15} className="absolute right-2 top-2 text-emerald-600" />}</button>)}</div></div>)}
        </section>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Ini adalah simulasi. Tidak ada uang nyata yang diproses.</div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={loading} className="fixed bottom-[72px] left-4 right-4 z-40 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-bold text-white shadow-lg disabled:opacity-50">{loading ? <span className="flex justify-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Memproses...</span> : 'Lanjutkan Pembayaran'}</button>
      </form>
    </div>
  )
}
