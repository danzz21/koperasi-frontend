import { useState } from 'react'
import { useLoanApplication, useLoans } from '@/hooks/useMemberData'

const filterTypes = {
  alqordh: 'qard',
  murabahah: 'murabahah',
  mudharabah: 'mudharabah',
}

export function useLoanPage() {
  const [activeFilter, setActiveFilter] = useState('semua')
  const [tipe, setTipe] = useState('qard')
  const [nominal, setNominal] = useState('')
  const [tenor, setTenor] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [applicationError, setApplicationError] = useState(null)
  const [applicationSuccess, setApplicationSuccess] = useState(null)
  const loansQuery = useLoans()

  const application = useLoanApplication({
    onSuccess: response => {
      setApplicationError(null)
      setApplicationSuccess({
        message: response.data?.message || 'Pengajuan pinjaman berhasil dikirim.',
        data: response.data?.data ?? null,
      })
      setNominal('')
      setTenor('')
      setKeterangan('')
    },
    onError: error => {
      const errors = error?.response?.data?.errors
      setApplicationError(errors
        ? Object.values(errors).flat().join(' ')
        : error?.response?.data?.message || error?.message || 'Pengajuan pinjaman gagal dikirim.')
    },
  })

  const submitApplication = event => {
    event.preventDefault()
    setApplicationError(null)
    setApplicationSuccess(null)

    const amount = Number(nominal)
    const months = Number(tenor)
    if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isSafeInteger(months) || months < 1) {
      setApplicationError('Nominal dan tenor harus berupa bilangan bulat lebih dari 0.')
      return
    }

    application.mutate({
      tipe,
      nominal: amount,
      tenor: months,
      ...(keterangan.trim() ? { keterangan: keterangan.trim() } : {}),
    })
  }

  const pinjaman = loansQuery.data ?? []
  const filteredPinjaman = activeFilter === 'semua'
    ? pinjaman
    : pinjaman.filter(loan => loan.tipe?.toLowerCase() === filterTypes[activeFilter])

  return {
    activeFilter,
    setActiveFilter,
    tipe,
    setTipe,
    nominal,
    setNominal,
    tenor,
    setTenor,
    keterangan,
    setKeterangan,
    applicationError,
    applicationSuccess,
    isSubmitting: application.isPending,
    pinjaman: filteredPinjaman,
    isLoading: loansQuery.isLoading,
    isError: loansQuery.isError,
    submitApplication,
  }
}
