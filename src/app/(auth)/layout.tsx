import Image from "next/image";
import { photos } from "@/features/hotels/data/photos";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={photos.infinityPoolDeck} alt="" fill preload sizes="50vw" className="object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-eyebrow text-lagoon-200 uppercase">TripNest</p>
          <p className="mt-3 max-w-md font-display text-h2 text-white">Your next stay is a few clicks away.</p>
          <p className="mt-3 max-w-md text-white/85">
            Save hotels, keep track of bookings and manage your trips in one place.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">{children}</div>
    </div>
  );
}
