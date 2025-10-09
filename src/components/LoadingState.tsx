export function LoadingState() {
  return (
    <div className="w-full p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-4 text-foreground/70">
        Fetching guidance and generating summary...
      </p>
    </div>
  );
}
