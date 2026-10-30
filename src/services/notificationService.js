import api from '@/lib/api'

export const getNotifications = () => api.get('/notifications').then(response => response.data)
export const markNotificationAsRead = id => api.post(`/notifications/${id}/read`)
