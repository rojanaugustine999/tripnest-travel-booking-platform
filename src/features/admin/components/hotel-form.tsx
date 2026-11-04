"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { FormMessage } from "@/features/auth/components/form-message";
import { saveHotel } from "../actions";
import { hotelFormSchema, type HotelFormInput } from "../validation";
import { NativeSelect } from "./native-select";

type Option = { id: string; name: string };

type HotelFormProps = {
  defaults: HotelFormInput;
  destinations: (Option & { country: string })[];
  amenities: Option[];
};

const TYPE_LABELS: Record<HotelFormInput["accommodationType"], string> = {
  hotel: "Hotel",
  resort: "Resort",
  villa: "Villa",
  boutique: "Boutique hotel",
  apartment: "Apartment",
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Create / edit a hotel. Validation runs here and again on the server. */
export function HotelForm({ defaults, destinations, amenities }: HotelFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const isEdit = Boolean(defaults.id);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<HotelFormInput>({ resolver: zodResolver(hotelFormSchema), defaultValues: defaults });
  const images = useFieldArray({ control, name: "images" });
  const selectedAmenities = useWatch({ control, name: "amenityIds" });

  function toggleAmenity(id: string) {
    setValue(
      "amenityIds",
      selectedAmenities.includes(id) ? selectedAmenities.filter((a) => a !== id) : [...selectedAmenities, id],
      { shouldDirty: true },
    );
  }

  function submit(values: HotelFormInput) {
    setBanner(null);
    startTransition(async () => {
      const result = await saveHotel(values);
      if (result.ok) {
        toast.success(result.message ?? "Hotel saved.");
        router.push("/admin/hotels");
        router.refresh();
        return;
      }
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as Path<HotelFormInput>, { type: "server", message });
      }
      setBanner(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-10">
      {banner && <FormMessage tone="error">{banner}</FormMessage>}

      <section aria-labelledby="hf-basics" className="space-y-5">
        <h2 id="hf-basics" className="text-h4">
          Basics
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="hf-name" label="Hotel name" required error={errors.name?.message}>
            {(f) => (
              <Input
                {...f}
                {...register("name", {
                  onChange: (e) => {
                    if (!isEdit && !dirtyFields.slug) setValue("slug", slugify(e.target.value));
                  },
                })}
              />
            )}
          </FormField>
          <FormField
            id="hf-slug"
            label="URL name"
            required
            hint="Used in the web address: /hotels/this-name"
            error={errors.slug?.message}
          >
            {(f) => <Input {...f} {...register("slug")} />}
          </FormField>
          <FormField id="hf-destination" label="Destination" required error={errors.destinationId?.message}>
            {(f) => (
              <NativeSelect {...f} {...register("destinationId")}>
                <option value="">Choose…</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}, {d.country}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField id="hf-city" label="City / area" required error={errors.city?.message}>
            {(f) => <Input {...f} {...register("city")} />}
          </FormField>
          <FormField id="hf-address" label="Address" required error={errors.address?.message} className="sm:col-span-2">
            {(f) => <Input {...f} {...register("address")} />}
          </FormField>
          <FormField id="hf-type" label="Type" required error={errors.accommodationType?.message}>
            {(f) => (
              <NativeSelect {...f} {...register("accommodationType")}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField id="hf-stars" label="Star rating" required error={errors.starRating?.message}>
            {(f) => (
              <NativeSelect {...f} {...register("starRating", { valueAsNumber: true })}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "star" : "stars"}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FormField>
        </div>
      </section>

      <section aria-labelledby="hf-text" className="space-y-5">
        <h2 id="hf-text" className="text-h4">
          Descriptions & policies
        </h2>
        <FormField
          id="hf-short"
          label="Short description"
          required
          hint="Shown on hotel cards (up to 200 characters)."
          error={errors.shortDescription?.message}
        >
          {(f) => <Textarea {...f} rows={2} {...register("shortDescription")} />}
        </FormField>
        <FormField id="hf-desc" label="Full description" required error={errors.description?.message}>
          {(f) => <Textarea {...f} rows={6} {...register("description")} />}
        </FormField>
        <FormField
          id="hf-facilities"
          label="Facilities"
          hint="One per line, e.g. 24-hour front desk."
          error={errors.facilities?.message}
        >
          {(f) => <Textarea {...f} rows={4} {...register("facilities")} />}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField id="hf-in" label="Check-in from" required error={errors.checkInTime?.message}>
            {(f) => <Input {...f} type="time" {...register("checkInTime")} />}
          </FormField>
          <FormField id="hf-out" label="Check-out until" required error={errors.checkOutTime?.message}>
            {(f) => <Input {...f} type="time" {...register("checkOutTime")} />}
          </FormField>
          <FormField
            id="hf-cancel"
            label="Cancellation policy"
            required
            error={errors.cancellationPolicy?.message}
            className="sm:col-span-3"
          >
            {(f) => <Input {...f} {...register("cancellationPolicy")} />}
          </FormField>
        </div>
      </section>

      <section aria-labelledby="hf-amenities" className="space-y-4">
        <h2 id="hf-amenities" className="text-h4">
          Amenities
        </h2>
        <p className="text-sm text-muted-foreground">
          Tick what the hotel offers. Cards show the first few in the order you tick them.
        </p>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a) => (
            <li key={a.id}>
              <label className="flex items-center gap-2.5 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-navy-900"
                  checked={selectedAmenities.includes(a.id)}
                  onChange={() => toggleAmenity(a.id)}
                />
                {a.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hf-images" className="space-y-4">
        <h2 id="hf-images" className="text-h4">
          Images
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste full https:// image links (for example from Unsplash). The first image is the cover. Describe each image
          for people who cannot see it.
        </p>
        {errors.images?.message && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.images.message}
          </p>
        )}
        <ul className="space-y-4">
          {images.fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
              <FormField
                id={`hf-img-url-${index}`}
                label={index === 0 ? "Cover image link" : `Image ${index + 1} link`}
                error={errors.images?.[index]?.url?.message}
              >
                {(f) => <Input {...f} inputMode="url" {...register(`images.${index}.url` as const)} />}
              </FormField>
              <FormField id={`hf-img-alt-${index}`} label="Description" error={errors.images?.[index]?.alt?.message}>
                {(f) => <Input {...f} {...register(`images.${index}.alt` as const)} />}
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => images.remove(index)}
                disabled={images.fields.length <= 1}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
        {images.fields.length < 12 && (
          <Button type="button" variant="outline" onClick={() => images.append({ url: "", alt: "" })}>
            <Plus />
            Add image
          </Button>
        )}
      </section>

      <section aria-labelledby="hf-offer" className="space-y-5">
        <h2 id="hf-offer" className="text-h4">
          Offer & visibility
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="hf-offer-label"
            label="Offer label (optional)"
            hint="e.g. Early bird"
            error={errors.offerLabel?.message}
          >
            {(f) => <Input {...f} {...register("offerLabel")} />}
          </FormField>
          <FormField id="hf-offer-percent" label="Discount % (optional)" error={errors.offerDiscountPercent?.message}>
            {(f) => <Input {...f} inputMode="numeric" {...register("offerDiscountPercent")} />}
          </FormField>
        </div>
        <div className="space-y-3">
          <label className="flex items-start gap-2.5 text-sm text-slate-800">
            <input type="checkbox" className="mt-0.5 size-4 rounded accent-navy-900" {...register("isPublished")} />
            <span>
              <strong>Published</strong> — visible to everyone. A hotel also needs at least one active room to appear in
              search.
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-slate-800">
            <input type="checkbox" className="mt-0.5 size-4 rounded accent-navy-900" {...register("isFeatured")} />
            <span>
              <strong>Featured</strong> — eligible for the homepage featured list.
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create hotel"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/hotels")}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
