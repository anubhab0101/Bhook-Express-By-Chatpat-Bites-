import type { MenuCategory, MenuItem } from "@/types";

type SeedItem = Omit<MenuItem, "id" | "createdAt">;

const CATEGORY_COLORS: Record<MenuCategory, [string, string]> = {
  Starters: ["#f97316", "#fde68a"],
  Rolls: ["#dc2626", "#fed7aa"],
  Chinese: ["#b91c1c", "#fecaca"],
  Biryani: ["#d97706", "#fef3c7"],
  "Main Course": ["#92400e", "#fde68a"],
  Beverages: ["#0284c7", "#bae6fd"],
  Desserts: ["#be185d", "#fbcfe8"],
};

function imageFor(name: string, category: MenuCategory) {
  const [primary, secondary] = CATEGORY_COLORS[category];
  const shortName = name.replace(/&/g, "and");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${secondary}"/>
          <stop offset="1" stop-color="${primary}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="600" fill="url(#bg)"/>
      <circle cx="450" cy="300" r="190" fill="rgba(255,255,255,.82)"/>
      <circle cx="450" cy="300" r="132" fill="${primary}" opacity=".18"/>
      <ellipse cx="450" cy="330" rx="210" ry="62" fill="rgba(0,0,0,.16)"/>
      <circle cx="360" cy="245" r="38" fill="#fff7ed"/>
      <circle cx="446" cy="215" r="52" fill="#ffedd5"/>
      <circle cx="535" cy="254" r="42" fill="#fed7aa"/>
      <rect x="250" y="382" width="400" height="72" rx="36" fill="rgba(255,255,255,.88)"/>
      <text x="450" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="#3f2412">${shortName}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function item(name: string, price: number, category: MenuCategory, featured = false): SeedItem {
  return {
    name,
    price,
    category,
    featured,
    available: true,
    image: imageFor(name, category),
    description: `${name} from the restaurant offline menu.`,
  };
}

export const OFFLINE_MENU_ITEMS: SeedItem[] = [
  item("Egg Chicken Roll", 70, "Rolls", true),
  item("Lachha Egg Chicken Roll", 80, "Rolls"),
  item("Chicken Biriyani", 100, "Biryani", true),
  item("Crab Masala", 100, "Main Course"),
  item("Chicken Stick", 10, "Starters"),
  item("Chicken Popcorn", 80, "Starters"),
  item("Chicken Chop", 7, "Starters"),
  item("Chicken Burger", 80, "Starters"),
  item("Chicken Desi Kasa", 120, "Main Course", true),
  item("Chicken 65", 120, "Chinese"),
  item("Chicken Pakoda", 60, "Starters"),
  item("Bread Omelette", 60, "Starters"),
  item("Double Egg Omelette", 40, "Starters"),
  item("Chicken Dumplings", 70, "Chinese"),
  item("Veg Dumplings", 60, "Chinese"),
  item("Paneer Dumplings", 70, "Chinese"),
  item("Spring Roll", 60, "Chinese"),
  item("Harabhara Kabab", 60, "Starters"),
];
