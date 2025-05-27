import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-steps.ts';
import '@/ai/flows/create-testing-checklist.ts';
import '@/ai/flows/draft-email-to-vendor.ts';