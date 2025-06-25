# Firebase Studio

This is a Next.js starter built for Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Requirements

- **Node.js** 18.18 or later
- **pnpm** for dependency management

## Install

Install all dependencies using **pnpm**:

```bash
pnpm install
```

## Development

Start the development server:

```bash
npm run dev
```

## Testing

Run the Jest test suite:

```bash
pnpm test
```

## Build

Create a production build:

```bash
npm run build
```

## Local Firestore Emulator

Set these env vars to enable the emulator:

```
GOOGLE_CLOUD_PROJECT=pumptrack-dev
FIRESTORE_EMULATOR_HOST=127.0.0.1:9099
```

For coding guidelines and contribution rules, see [`AGENTS.md`](AGENTS.md).
