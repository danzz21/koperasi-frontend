import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDashboard,
  getInstallments,
  getLoans,
  getOnboarding,
  getProfile,
  getSavings,
  getWithdrawalRequests,
  getWithdrawalSummary,
  submitLoanApplication,
  submitOnboarding,
  submitWithdrawalRequest,
  updateProfile,
} from '@/services/memberService'

export const useDashboard = () => useQuery({
  queryKey: ['anggota-dashboard'],
  queryFn: getDashboard,
})

export const useSavings = () => useQuery({
  queryKey: ['anggota-simpanan'],
  queryFn: getSavings,
})

export const useLoans = () => useQuery({
  queryKey: ['anggota-pinjaman'],
  queryFn: getLoans,
})

export const useLoanApplication = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitLoanApplication,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['anggota-pinjaman'] })
      await options?.onSuccess?.(...args)
    },
  })
}

export const useInstallments = queryKey => useQuery({
  queryKey: queryKey || ['anggota-cicilan'],
  queryFn: getInstallments,
})

export const useProfile = () => useQuery({
  queryKey: ['anggota-profil'],
  queryFn: getProfile,
})

export const useProfileUpdate = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['anggota-profil'] })
      await options?.onSuccess?.(...args)
    },
  })
}

export const useOnboarding = () => useQuery({
  queryKey: ['anggota-onboarding'],
  queryFn: getOnboarding,
  retry: 0,
})

export const useOnboardingSubmit = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitOnboarding,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['anggota-profil'] })
      await options?.onSuccess?.(...args)
    },
  })
}

export const useWithdrawalSummary = () => useQuery({
  queryKey: ['anggota-pengunduran-diri-ringkasan'],
  queryFn: getWithdrawalSummary,
})

export const useWithdrawalRequests = () => useQuery({
  queryKey: ['anggota-pengunduran-diri'],
  queryFn: getWithdrawalRequests,
})

export const useWithdrawalSubmit = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitWithdrawalRequest,
    ...options,
    onSuccess: async (...args) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['anggota-pengunduran-diri'] }),
        queryClient.invalidateQueries({ queryKey: ['anggota-pengunduran-diri-ringkasan'] }),
      ])
      await options?.onSuccess?.(...args)
    },
  })
}
