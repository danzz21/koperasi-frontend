import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function usePpobProduct(type, config) {
  const navigate = useNavigate()
  const [target, setTarget] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const products = useMemo(
    () => config.products.filter(product => filter === 'Semua' || product[1] === filter),
    [config.products, filter],
  )
  const validTarget = target.replace(/\D/g, '').length >= 10

  const changeFilter = value => {
    setFilter(value)
    setSelected(null)
  }

  const submitOrder = event => {
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

  return {
    target,
    setTarget,
    filter,
    changeFilter,
    selected,
    setSelected,
    submitting,
    products,
    validTarget,
    submitOrder,
  }
}
