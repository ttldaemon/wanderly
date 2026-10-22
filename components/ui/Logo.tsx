import { MountainSnow } from "lucide-react";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});


export default function Logo() {
  return (
    <div className="mb-1.5 flex items-center justify-center gap-2">
      <span
        className={`${caveat.className} text-4xl font-bold tracking-wide text-forest drop-shadow-sm sm:text-5xl`}
      >
        Wanderly
      </span>

      <MountainSnow
        className="h-8 w-8 text-forest sm:h-9 sm:w-9"
        strokeWidth={1.75}
      />
    </div>
  )
}