export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleString()
} 