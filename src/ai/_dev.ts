
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-error-prevention.ts';
import '@/ai/flows/generate-smart-contract-code.ts';
import '@/ai/flows/estimate-gas-cost.ts';
import '@/ai/flows/get-known-liquidity-pool-info.ts';
import '@/ai/flows/generate-test-cases.ts';
import '@/ai/flows/refine-smart-contract-code.ts';

