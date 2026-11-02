import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-28 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-navy-50 text-navy-900">
        <Compass className="size-8" aria-hidden="true" />
      </div>
      <p className="mt-6 text-sm font-semibold text-lagoon-700">404</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Looks like you&apos;ve wandered off the map</h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or is still being built.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </Container>
  );
}
