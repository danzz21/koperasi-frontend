import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationAsRead } from '@/services/notificationService'

export const useNotifications = () => useQuery({
  queryKey: ['anggota-notifications'],
  queryFn: getNotifications,
})

export const useMarkNotificationRead = options => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['anggota-notifications'] })
      await options?.onSuccess?.(...args)
    },
  })
}
