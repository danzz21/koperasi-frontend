import { ArrowDownLeft, ArrowUpRight, Clock3, XCircle } from 'lucide-react'

const fmt = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`

const STATUS = {
  pending: { label: 'Menunggu Verifikasi', cls: 'badge-pending' },
  sukses:  { label: 'Berhasil',           cls: 'badge-success' },
  gagal:   { label: 'Gagal',              cls: 'badge-failed' },
}

/**
 * Daftar mutasi E-Wallet (topup masuk & pembayaran keluar).
 * Dipakai oleh halaman E-Wallet dan halaman riwayat.
 */
export default function EwalletTransactions({ transactions = [], loading = false, emptyText = 'Belum ada mutasi E-Wallet.' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="spinner" />
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <div className="py-8 text-center text-gray-400">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <ArrowDownLeft className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((trx) => {
        const masuk = trx.tipe === 'topup' && trx.status === 'sukses'
        const badge = STATUS[trx.status] ?? { label: trx.status, cls: 'badge-pending' }

        return (
          <div
            key={trx.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                masuk ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-pink-600'
              }`}
            >
              {trx.status === 'pending' ? (
                <Clock3 className="h-4 w-4" />
              ) : masuk ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : trx.status === 'gagal' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-800">
                {trx.keterangan || (masuk ? 'Topup E-Wallet' : 'Pembayaran E-Wallet')}
              </p>
              <p className="truncate text-xs text-gray-500">
                {new Date(trx.created_at).toLocaleString('id-ID')}
                {trx.ref_id ? ` • ${trx.ref_id}` : ''}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className={`text-sm font-bold ${masuk ? 'text-emerald-600' : 'text-rose-600'}`}>
                {masuk ? '+' : '-'} {fmt(trx.nominal)}
              </p>
              <span className={`badge ${badge.cls} mt-0.5`}>{badge.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
