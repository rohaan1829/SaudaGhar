import {
  Sprout,
  Shirt,
  Package,
  Wrench,
  FileText,
  Apple,
  Hammer,
  Cpu,
  Briefcase,
  FlaskConical,
  Leaf,
  Box,
  type LucideIcon,
} from 'lucide-react'

export const MATERIAL_CATEGORIES = [
  'Agricultural Waste',
  'Textile Waste',
  'Plastic Waste',
  'Metal Scrap',
  'Paper Waste',
  'Food Waste',
  'Construction Materials',
  'Electronic Waste',
  'Leather Waste',
  'Chemical Waste',
  'Organic Compost',
  'Other',
] as const

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Agricultural Waste': Sprout,
  'Textile Waste': Shirt,
  'Plastic Waste': Package,
  'Metal Scrap': Wrench,
  'Paper Waste': FileText,
  'Food Waste': Apple,
  'Construction Materials': Hammer,
  'Electronic Waste': Cpu,
  'Leather Waste': Briefcase,
  'Chemical Waste': FlaskConical,
  'Organic Compost': Leaf,
  'Other': Box,
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] || Box
}

export const BUSINESS_TYPES = [
  'Farmer',
  'Crop Farmer',
  'Poultry Farm',
  'Dairy Farm',
  'Textile Factory',
  'Food Processing Unit',
  'Paper Mill',
  'Plastic Factory',
  'Leather Industry',
  'Metal and Scrap Industry',
  'Recycling Company',
  'Plastic Recycling',
  'Metal Recycling',
  'Electronic Waste Recycler',
  'Workshop',
  'Local Manufacturer',
  'Home-based Small Industry',
  'Construction Company',
  'Brick/Kiln',
  'Cement/Steel Supplier',
  'Contractor',
  'Waste Management Company',
  'Garbage Collector',
  'Municipal Waste Handler',
  'Organic Compost Company',
  'Other',
] as const

export const MATERIAL_CONDITIONS = [
  'New',
  'Used',
  'Leftover',
  'Waste',
  'Recyclable',
] as const

export const LISTING_TYPES = ['Buy', 'Sell', 'Exchange'] as const

