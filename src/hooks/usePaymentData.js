import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createInstallmentPayment,
  createSavingsPayment,
  getPaymentHistory,
  getPaymentStatus,
  simulatePayment,
} from '@/services/paymentService'

export const usePaymentHistory = () => useQuery({
  queryKey: ['payment-history'],
  queryFn: getPaymentHistory,
})

export const usePaymentStatus = orderId => useQuery({
  queryKey: ['payment-status', orderId],
  queryFn: () => getPaymentStatus(orderId),
  enabled: Boolean(orderId),
})

export const useSimulatePayment = options => useMutation({
  mutationFn: simulatePayment,
  ...options,
})

export const useCreateSavingsPayment = options => useMutation({
  mutationFn: createSavingsPayment,
  ...options,
})

export const useCreateInstallmentPayment = options => useMutation({
  mutationFn: createInstallmentPayment,
  ...options,
})
