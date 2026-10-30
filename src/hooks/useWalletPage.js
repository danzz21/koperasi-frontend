import { useState } from 'react'
import { useWallet, useWalletMutations } from '@/hooks/useWalletData'

export function useWalletPage() {
  const [nominal, setNominal] = useState('')
  const [metode, setMetode] = useState('transfer_bca')
  const [pindahNominal, setPindahNominal] = useState('')
  const [pindahJenis, setPindahJenis] = useState('sukarela')
  const [bukti, setBukti] = useState(null)
  const [hasil, setHasil] = useState(null)
  const [sukses, setSukses] = useState(null)
  const [error, setError] = useState(null)
  const walletQuery = useWallet()

  const reportError = err => {
    const errors = err?.response?.data?.errors
    setError(errors ? Object.values(errors).flat().join(' ') : err?.response?.data?.message || err?.message || 'Gagal memproses.')
  }

  const { topUp: topup, transfer: pindah, uploadProof: unggahBukti } = useWalletMutations({
    topUp: {
      onSuccess: response => {
        setSukses(response.data?.message)
        setError(null)
        setHasil(response.data?.data ?? null)
        setNominal('')
      },
      onError: reportError,
    },
    transfer: {
      onSuccess: response => {
        setSukses(response.data?.message)
        setError(null)
        setPindahNominal('')
      },
      onError: reportError,
    },
    uploadProof: {
      onSuccess: response => {
        setSukses(response.data?.message)
        setError(null)
        setBukti(null)
      },
      onError: reportError,
    },
  })

  const data = walletQuery.data
  const availableSavings = data?.simpanan_tersedia ?? {}
  const kirimTopup = event => {
    event.preventDefault()
    setSukses(null)
    setError(null)
    setHasil(null)
    topup.mutate({ nominal: Number(nominal), metode })
  }

  const kirimPindah = event => {
    event.preventDefault()
    setSukses(null)
    setError(null)
    pindah.mutate({ nominal: Number(pindahNominal), jenis: pindahJenis })
  }

  const uploadProof = () => {
    if (bukti && hasil?.id) unggahBukti.mutate({ id: hasil.id, file: bukti })
  }

  return {
    data,
    isLoading: walletQuery.isLoading,
    nominal,
    setNominal,
    metode,
    setMetode,
    pindahNominal,
    setPindahNominal,
    pindahJenis,
    setPindahJenis,
    bukti,
    setBukti,
    hasil,
    sukses,
    error,
    setError,
    setSukses,
    saldo: data?.saldo ?? 0,
    pending: data?.topup_pending ?? 0,
    gatewayAktif: !!data?.gateway_aktif,
    autoApprove: !!data?.auto_approve,
    rekening: data?.rekening ?? {},
    totalSimpanan: Number(availableSavings.sukarela || 0) + Number(availableSavings.pokok || 0),
    kirimTopup,
    kirimPindah,
    uploadProof,
    topupPending: topup.isPending,
    pindahPending: pindah.isPending,
    proofPending: unggahBukti.isPending,
  }
}
