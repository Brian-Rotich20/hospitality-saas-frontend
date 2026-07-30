export const MAX_PHOTOS = 10;
export const MAX_MB     = 5;
export const ACCEPT     = ['image/jpeg', 'image/png', 'image/webp'];

export const TITLE_MAX       = 255;
export const DESCRIPTION_MAX = 5000;
export const DESCRIPTION_MIN = 20;

export const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
  'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
  'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
] as const;

export const PRICING_OPTIONS = [
  { value: 'per_hour',   label: 'Per hour'          },
  { value: 'per_day',    label: 'Per day'           },
  { value: 'per_person', label: 'Per person'        },
  { value: 'package',    label: 'Package'           },
  { value: 'contact',    label: 'Contact for price' },
] as const;

// Brand tokens — kept centralized so a future theme change is a one-file edit
export const BRAND = {
  ink:    '#2D3B45',
  inkSoft:'#3a4d5a',
  accent: '#F5C842',
} as const;