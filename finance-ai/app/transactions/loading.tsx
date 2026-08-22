export default function TransactionsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading transactions" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-muted" />
        <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        <div className="h-[28rem] animate-pulse rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
