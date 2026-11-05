import type { Metadata } from "next";
import { CalendarX2, SearchX } from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { AccountPage } from "@/features/account/components/account-page";
import { BookingFlow } from "@/features/bookings/components/booking-flow";
import { stayParamsSchema } from "@/features/bookings/validation";
import { getHotelBySlug } from "@/features/hotels/queries";
import { requireUser } from "@/lib/auth/session";
import { getRazorpayConfig } from "@/lib/payments/razorpay";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Book your stay", robots: { index: false } };

type SearchParams = PageProps<"/booking">["searchParams"];

async function BookingContent({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const query = new URLSearchParams(
    Object.entries(raw).flatMap(([key, value]) => (first(value) === undefined ? [] : [[key, first(value)!]])),
  );
  // Guests are sent to log in and brought straight back to this exact booking.
  const profile = await requireUser(`/booking?${query}`);

  const backToHotels = <ButtonLink href="/hotels">Browse hotels</ButtonLink>;
  const parsed = stayParamsSchema.safeParse(Object.fromEntries(query));
  if (!parsed.success) {
    return (
      <EmptyState
        icon={SearchX}
        title="This booking link isn't valid"
        description="Choose a room, dates and guests on a hotel page to start a booking."
        action={backToHotels}
      />
    );
  }
  const stay = parsed.data;

  const hotel = await getHotelBySlug(stay.hotel);
  const room = hotel?.rooms.find((r) => r.id === stay.room);
  if (!hotel || !room) {
    return (
      <EmptyState
        icon={SearchX}
        title="We couldn't find that room"
        description="It may no longer be available. Please pick another room."
        action={backToHotels}
      />
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const back = <ButtonLink href={`/hotels/${hotel.slug}#rooms`}>Choose different dates</ButtonLink>;
  if (stay.checkIn < today) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Check-in is in the past"
        description="Please choose dates from today onwards."
        action={back}
      />
    );
  }

  // Live availability for these exact nights (the database checks again when you confirm).
  const supabase = await createClient();
  const { data: availability } = await supabase.rpc("get_room_availability", {
    p_hotel_id: hotel.id,
    p_check_in: stay.checkIn,
    p_check_out: stay.checkOut,
  });
  const free = availability?.find((a) => a.room_id === room.id)?.units_free ?? 0;
  if (free < stay.rooms || room.maxGuests * stay.rooms < stay.guests) {
    return (
      <EmptyState
        icon={CalendarX2}
        title={
          free < stay.rooms ? "This room isn't available for those dates" : "This room is too small for your group"
        }
        description={
          free < stay.rooms
            ? "It has been booked for some of your nights. Try other dates or another room."
            : `It sleeps up to ${room.maxGuests} guests per room. Add rooms or pick a larger room.`
        }
        action={back}
      />
    );
  }

  return (
    <BookingFlow
      hotel={{
        name: hotel.name,
        city: hotel.city,
        country: hotel.destination.country,
        imageUrl: hotel.images[0].url,
        imageAlt: hotel.images[0].alt,
      }}
      room={{ id: room.id, name: room.name, bedInfo: room.bedInfo, pricePerNight: room.pricePerNight }}
      offer={hotel.offer}
      stay={{
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        nights: differenceInCalendarDays(parseISO(stay.checkOut), parseISO(stay.checkIn)),
        guests: stay.guests,
        rooms: stay.rooms,
      }}
      prefill={{ fullName: profile.full_name ?? "", email: profile.email }}
      testPayments={getRazorpayConfig() !== null}
    />
  );
}

export default function BookingPage(props: PageProps<"/booking">) {
  return (
    <AccountPage
      eyebrow="Demo booking"
      title="Book your stay"
      description="Two quick steps. Demo only — no real money is ever taken."
    >
      <BookingContent searchParams={props.searchParams} />
    </AccountPage>
  );
}
