export default function GuideLoading() {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-neutral-400 animate-pulse">
        <svg className="h-6 w-6 mb-2 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p>Loading guide...</p>
      </div>
    );
  }
  