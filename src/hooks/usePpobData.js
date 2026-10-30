import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWallet } from '@/services/walletService'
import {
  createPpobOrder,
  getPpobCatalog,
  getPpobHistory,
  getPpobStatus,
  simulatePpobPayment,
} from '@/services/ppobService'

export const usePpobCatalog = () => useQuery({
  queryKey: ['ppob-index'],
  queryFn: getPpobCatalog,
})

export const usePpobHistory = () => useQuery({
  queryKey: ['ppob-history'],
  queryFn: getPpobHistory,
})

export const usePpobStatus = orderId => useQuery({
  queryKey: ['ppob-status', orderId],
  queryFn: () => getPpobStatus(orderId),
  enabled: Boolean(orderId),
})

export const usePpobWallet = () => useQuery({
  queryKey: ['anggota-ewallet'],
  queryFn: getWallet,
  staleTime: 30000,
})

export const useCreatePpobOrder = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPpobOrder,
    ...options,
    onSuccess: async (...args) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['anggota-ewallet'] }),
        queryClient.invalidateQueries({ queryKey: ['ppob-index'] }),
        queryClient.invalidateQueries({ queryKey: ['ppob-history'] }),
      ])
      await options?.onSuccess?.(...args)
    },
  })
}

export const useSimulatePpobPayment = options => useMutation({
  mutationFn: simulatePpobPayment,
  ...options,
})
