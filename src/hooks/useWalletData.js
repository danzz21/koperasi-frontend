import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getWallet,
  getWalletHistory,
  topUpWallet,
  transferToWallet,
  uploadWalletProof,
} from '@/services/walletService'

export const useWallet = options => useQuery({
  queryKey: ['anggota-ewallet'],
  queryFn: getWallet,
  ...options,
})

export const useWalletHistory = () => useQuery({
  queryKey: ['anggota-ewallet-riwayat'],
  queryFn: getWalletHistory,
})

const invalidateWalletData = queryClient => Promise.all([
  queryClient.invalidateQueries({ queryKey: ['anggota-ewallet'] }),
  queryClient.invalidateQueries({ queryKey: ['anggota-ewallet-riwayat'] }),
  queryClient.invalidateQueries({ queryKey: ['anggota-saldo-simpanan'] }),
  queryClient.invalidateQueries({ queryKey: ['simpanan'] }),
  queryClient.invalidateQueries({ queryKey: ['ppob-index'] }),
])

export const useWalletMutations = options => {
  const queryClient = useQueryClient()
  const createMutation = (mutationFn, mutationOptions = {}) => useMutation({
    ...mutationOptions,
    mutationFn,
    onSuccess: async (...args) => {
      await invalidateWalletData(queryClient)
      await mutationOptions.onSuccess?.(...args)
    },
  })

  return {
    topUp: createMutation(topUpWallet, options?.topUp),
    transfer: createMutation(transferToWallet, options?.transfer),
    uploadProof: createMutation(({ id, file }) => uploadWalletProof(id, file), options?.uploadProof),
  }
}
