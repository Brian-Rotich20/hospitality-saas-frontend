import { z } from 'zod';

export const schema = z.object({
  categoryId:    z.string().min(1, 'Select a category'),
  subCategoryId: z.string().optional(),
  title:         z.string().min(5, 'At least 5 characters').max(255),
  description:   z.string().min(20, 'At least 20 characters').max(5000),
  county:        z.string().min(2, 'Select a county'),
  area:          z.string().min(2, 'Select an area'),
  pricingType:   z.enum(['per_hour', 'per_day', 'per_person', 'package', 'contact']),
  price:         z.coerce.number().positive().optional(),
  minPrice:      z.coerce.number().positive().optional(),
  maxPrice:      z.coerce.number().positive().optional(),
  currency:      z.string().default('KES'),
  lat:           z.number().optional(),
  lng:           z.number().optional(),
}).refine(data => {
  if (data.pricingType === 'package') return !!data.minPrice && !!data.maxPrice;
  if (data.pricingType !== 'contact') return !!data.price;
  return true;
}, { message: 'Price is required', path: ['price'] })
  .refine(data => {
    if (data.pricingType === 'package' && data.minPrice && data.maxPrice) {
      return data.maxPrice > data.minPrice;
    }
    return true;
  }, { message: 'Max price must be greater than min price', path: ['maxPrice'] });