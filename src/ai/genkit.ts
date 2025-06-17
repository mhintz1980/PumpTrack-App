// Disable OpenTelemetry tracing to avoid build-time errors when the
// required exporters are not present. This must be set before importing
// Genkit, otherwise tracing initialization will run automatically.
process.env.OTEL_SDK_DISABLED ??= 'true';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
