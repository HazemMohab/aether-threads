// Spinner
export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return <div className={`${s} border-2 border-navy border-t-transparent rounded-full animate-spin`} />;
};

// Full-page loader
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// Error message
export const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
    {message}
  </div>
);

// Empty state
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action}
  </div>
);
