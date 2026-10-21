
export default function SkeletonLocSearch() {
  return (
    <div className="flex flex-col gap-6 p-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col rounded-2xl border border-sand bg-white/70 p-5 shadow-xs"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-36 rounded-md bg-sand" />
            <div className="h-3 w-20 rounded-md bg-sand/70" />
          </div>
          <div className="aspect-[16/10] w-full rounded-xl bg-sand/40" />
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full rounded-md bg-sand/60" />
            <div className="h-3.5 w-3/4 rounded-md bg-sand/50" />
          </div>
        </div>
      ))}
    </div>
  )
}