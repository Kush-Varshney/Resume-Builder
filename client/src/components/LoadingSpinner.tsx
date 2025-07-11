interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner = ({ size = 'medium' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-emerald-500 border-t-transparent border-4 border-solid`}
        role="status"
        aria-label="Loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
