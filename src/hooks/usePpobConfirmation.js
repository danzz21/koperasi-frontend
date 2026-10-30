import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCreatePpobOrder, usePpobWallet } from '@/hooks/usePpobData'

const paymentMethods = [
  { id: 'ewallet', fee: 0 },
  { id: 'bca_va', fee: 4000 },
  { id: 'bni_va', fee: 4000 },
  { id: 'bri_va', fee: 4000 },
  { id: 'qris', fee: 0 },
  { id: 'gopay', fee: 1000 },
  { id: 'dana', fee: 1000 },
]

export function usePpobConfirmation() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const order = state?.order
  const [method, setMethod] = useState('ewallet')
  const [error, setError] = useState('')
  const selectedMethod = paymentMethods.find(item => item.id === method)
  const total = useMemo(
    () => Number(order?.harga || 0) + Number(selectedMethod?.fee || 0),
    [order, selectedMethod],
  )
  const { data: wallet = {} } = usePpobWallet()
  const saldo = Number(wallet.saldo || 0)
  const saldoCukup = saldo >= total

  const createOrder = useCreatePpobOrder({
    onSuccess: response => {
      const orderId = response.data?.data?.order_id || response.data?.order_id
      if (!orderId) {
        setError('Server tidak mengembalikan order ID.')
        return
      }
      navigate(`/anggota/ppob/status/${orderId}`)
    },
    onError: err => {
      const validation = err.response?.data?.errors
      const details = validation ? Object.values(validation).flat().join(' ') : ''
      setError(err.code === 'ECONNABORTED'
        ? 'Server terlalu lama merespons. Pastikan backend dan database sedang berjalan, lalu coba lagi.'
        : details || err.response?.data?.message || err.message || 'Pesanan belum dapat diproses.')
    },
  })

  useEffect(() => {
    if (!order) return
    setMethod(saldo >= Number(order.harga || 0) ? 'ewallet' : 'qris')
  }, [order, saldo])

  const submit = event => {
    event.preventDefault()
    setError('')
    if (method === 'ewallet' && !saldoCukup) {
      setError(`Saldo E-Wallet kamu Rp ${new Intl.NumberFormat('id-ID').format(saldo)}, belum cukup untuk total Rp ${new Intl.NumberFormat('id-ID').format(total)}. Topup dulu saldomu.`)
      return
    }
    createOrder.mutate({ ...order, payment_method: method })
  }

  return {
    order,
    method,
    setMethod,
    total,
    saldo,
    saldoCukup,
    error,
    submit,
    isSubmitting: createOrder.isPending,
  }
}
