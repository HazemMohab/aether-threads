export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(amount);

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '…' : str;

export const getStatusColor = (status) => ({
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}[status] || 'bg-gray-100 text-gray-800');
