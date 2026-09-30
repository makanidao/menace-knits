export type Mask = { id: string; name: string; style: string; blurb: string; photo: string; sheet: string; split: string; swatch: string };

export const MASKS: Mask[] = [
  { id: "pink-bunny", name: "Pink Bunny", style: "No. 37", blurb: "Soft pink crochet with tall bunny ears. The one the whole lift line points at.", photo: "/assets/lap37.jpg", sheet: "/assets/sheet37.jpg", split: "/assets/split37.jpg", swatch: "#F4A9BC" },
  { id: "mint-menace", name: "Mint Menace", style: "No. 12", blurb: "Pale mint knit with two little horns and red stitch lines running down the face.", photo: "/assets/lap12.jpg", sheet: "/assets/sheet12.jpg", split: "/assets/split12.jpg", swatch: "#DCE9DD" },
  { id: "drip-eye", name: "Drip Eye", style: "No. 14", blurb: "Black knit with ears, a stitched red eye and lavender drips around the mouth.", photo: "/assets/lap14.jpg", sheet: "/assets/sheet14.jpg", split: "/assets/split14.jpg", swatch: "#1D1C24" },
  { id: "denim-bunny", name: "Denim Bunny", style: "No. 19", blurb: "Denim blue rib knit with round bunny ears and a red stitched accent.", photo: "/assets/lap19.jpg", sheet: "/assets/sheet19.jpg", split: "/assets/split19.jpg", swatch: "#5E7DA8" },
  { id: "cobalt", name: "Cobalt", style: "No. 47", blurb: "Bright cobalt blue, clean and loud. Easy to find your crew on the mountain.", photo: "/assets/lap47.jpg", sheet: "/assets/sheet47.jpg", split: "/assets/split47.jpg", swatch: "#2150D6" },
];

export type Bundle = { qty: number; total: number; compare: number; each: number; popular?: boolean };

export const BUNDLES: Bundle[] = [
  { qty: 1, total: 29.99, compare: 39.99, each: 29.99 },
  { qty: 2, total: 53.98, compare: 79.98, each: 26.99 },
  { qty: 3, total: 76.47, compare: 119.97, each: 25.49 },
  { qty: 4, total: 99.99, compare: 159.96, each: 25.0, popular: true },
];

export const money = (n: number) => `$${n.toFixed(2)}`;
export const maskById = (id: string) => MASKS.find((m) => m.id === id) ?? MASKS[0];
