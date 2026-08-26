// Curated hero images keyed by destination keyword. Add an entry + drop the
// matching file into public/destinations/ to support a new destination.
const DESTINATION_IMAGES: Record<string, string> = {
  japan: "/destinations/japan.jpg",
  france: "/destinations/france.jpg",
  indonesia: "/destinations/indonesia.jpg",
  italy: "/destinations/italy.jpg",
  "south korea": "/destinations/south-korea.jpg",
  russia: "/destinations/russia.jpg",
};

const DEFAULT_HERO_IMAGE = "/hero.jpg";

export function getHeroImage(destination?: string | null): string {
  if (!destination) return DEFAULT_HERO_IMAGE;

  const normalized = destination.trim().toLowerCase();
  for (const [keyword, image] of Object.entries(DESTINATION_IMAGES)) {
    if (normalized.includes(keyword)) return image;
  }

  return DEFAULT_HERO_IMAGE;
}
