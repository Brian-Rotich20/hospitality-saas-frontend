import { z } from 'zod';
import { schema } from './schema';

export type FormData = z.infer<typeof schema>;

export interface Photo {
  id: string;        // stable id — survives reordering, used as React key
  url: string;
  uploading: boolean;
  error?: string;
}

export type WizardStep = 'category' | 'details' | 'pricing' | 'preview';

export const STEP_ORDER: WizardStep[] = ['category', 'details', 'pricing', 'preview'];

export const STEP_LABELS: Record<WizardStep, string> = {
  category: 'Category',
  details:  'Details',
  pricing:  'Pricing',
  preview:  'Preview',
};