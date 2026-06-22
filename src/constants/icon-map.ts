import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Heart,
  Film,
  Receipt,
  Wallet,
  Tag,
  Coffee,
  Gift,
  Plane,
  Gamepad2,
  Book,
  Dumbbell,
  Baby,
  PawPrint,
  Wrench,
  Briefcase,
  GraduationCap,
  PiggyBank,
  Smartphone,
  Zap,
  Droplets,
  Wifi,
  Bus,
  TrainFront,
  Bike,
  Home as HomeIcon,
  Music,
  Camera,
  type LucideIcon,
} from "lucide-react-native";

/**
 * Maps category icon string names (stored in DB) to Lucide components.
 * Used by category cards, avatars, and the icon picker.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Heart,
  Film,
  Receipt,
  Wallet,
  Tag,
  Coffee,
  Gift,
  Plane,
  Gamepad2,
  Book,
  Dumbbell,
  Baby,
  PawPrint,
  Wrench,
  Briefcase,
  GraduationCap,
  PiggyBank,
  Smartphone,
  Zap,
  Droplets,
  Wifi,
  Bus,
  TrainFront,
  Bike,
  Home: HomeIcon,
  Music,
  Camera,
};

/** All icon names available for the icon picker (min 30 per PRD). */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/** Default icon for new categories. */
export const DEFAULT_ICON = "Tag";

/** Resolves a Lucide icon component from a string name. Falls back to Tag. */
export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag;
}
