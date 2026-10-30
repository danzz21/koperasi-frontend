import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, LoaderCircle, ShoppingCart, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePpobConfirmation } from '@/hooks/usePpobConfirmation'

const paymentMethods = [
  { id: 'ewallet',  label: 'Saldo E-Wallet Koperasi', group: 'Saldo Koperasi', fee: 0, color: 'bg-violet-600' },
  { id: 'bca_va', label: 'BCA Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-blue-600' },
  { id: 'bni_va', label: 'BNI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-orange-500' },
  { id: 'bri_va', label: 'BRI Virtual Account', group: 'Virtual Account', fee: 4000, color: 'bg-sky-600' },
  { id: 'qris', label: 'QRIS', group: 'E-Wallet & QRIS', fee: 0, color: 'bg-emerald-600' },
  { id: 'gopay', label: 'GoPay', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-green-600' },
  { id: 'dana', label: 'DANA', group: 'E-Wallet & QRIS', fee: 1000, color: 'bg-blue-500' },
]

const GROUPS = ['Saldo Koperasi', 'Virtual Account', 'E-Wallet & QRIS']

const formatRupiah = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const {
    order,
    method,
    setMethod,
    total,
    saldo,
    saldoCukup,
    error,
    submit,
    isSubmitting,
  } = usePpobConfirmation()

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center">
        <p className="text-gray-500">Data pesanan tidak ditemukan.</p>
        <button type="button" onClick={() => navigate('/anggota/ppob')} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Kembali ke PPOB</button>
      </div>
    )
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
          {GROUPS.map(group => <div key={group} className="mb-3 last:mb-0"><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-bold uppercase text-gray-400">{group}</p>{group === 'Saldo Koperasi' && <Link to="/anggota/ewallet" className="text-[11px] font-bold text-violet-600">+ Top Up</Link>}</div><div className="grid grid-cols-2 gap-2">{paymentMethods.filter(item => item.group === group).map(item => <button type="button" key={item.id} onClick={() => setMethod(item.id)} className={`relative rounded-xl border-2 p-3 text-left ${method === item.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}><span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white ${item.color}`}>{item.id === 'ewallet' ? <Wallet size={15} /> : <CreditCard size={15} />}</span><span className="block text-xs font-bold">{item.label}</span><span className="mt-1 block text-[10px] text-gray-500">{item.id === 'ewallet' ? `Saldo ${formatRupiah(saldo)}` : item.fee ? `+Rp ${item.fee.toLocaleString('id-ID')}` : 'Gratis'}</span>{method === item.id && <Check size={15} className="absolute right-2 top-2 text-emerald-600" />}</button>)}</div></div>)}
        </section>
        {method === 'ewallet' && !saldoCukup && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Saldo E-Wallet kamu <strong>{formatRupiah(saldo)}</strong>, belum cukup untuk total{' '}
            <strong>{formatRupiah(total)}</strong>. Kurang {formatRupiah(total - saldo)}.{' '}
            <Link to="/anggota/ewallet" className="font-bold underline">Topup sekarang</Link> atau pilih
            metode lain.
          </div>
        )}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Ini adalah simulasi. Tidak ada uang nyata yang diproses.</div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={isSubmitting || (method === 'ewallet' && !saldoCukup)} className="fixed bottom-[72px] left-4 right-4 z-40 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-bold text-white shadow-lg disabled:opacity-50">{isSubmitting ? <span className="flex justify-center gap-2"><LoaderCircle size={18} className="animate-spin" /> Memproses...</span> : method === 'ewallet' ? `Bayar dengan Saldo E-Wallet (${formatRupiah(total)})` : 'Lanjutkan Pembayaran'}</button>
      </form>
    </div>
  )
}
