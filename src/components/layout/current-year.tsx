import { cacheLife } from "next/cache";

/** Current year for the footer, cached so the shell stays prerenderable. */
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
