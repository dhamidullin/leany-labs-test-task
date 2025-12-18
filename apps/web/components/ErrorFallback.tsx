'use client';

interface ErrorFallbackProps {
  error?: Error,
  resetErrorBoundary?: () => void
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white p-4 text-center">
      <div className="bg-red-50 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">
          {error?.message || 'An unexpected error occurred while rendering the app.'}
        </p>

        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

