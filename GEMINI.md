# Gemini Code Assist Project Information

This document is intended to provide context and guidelines for Gemini Code Assist to understand and contribute to this project effectively.

## Agents

This section includes information from the AGENTS.md file.

### Agents

In this project, "agents" refer to AI-powered components or flows that automate specific tasks or provide intelligent assistance. These agents leverage various models and tools to perform actions like answering questions about project data, generating testing checklists, drafting emails, and suggesting next steps.

Key aspects of agents in this project:

*   **Purpose:** To automate repetitive tasks, provide quick access to information, and assist with decision-making.
*   **Implementation:** Agents are typically implemented using frameworks like Genkit, defining flows that orchestrate interactions with models, tools, and external services.
*   **Examples:** Current agents include flows for answering questions about pump data, creating testing checklists, drafting emails to vendors, and suggesting next steps for project tasks.
*   **Integration:** Agents are integrated into the project's user interface, allowing users to interact with them through dedicated pages or components.
*   **Development:** New agents can be developed by defining new flows in the `src/ai/flows` directory, leveraging existing models and tools or integrating new ones as needed.

## Project Context and Guidelines

### Project Overview

This project is a web application built with Next.js, React, and Tailwind CSS. It likely involves managing and displaying data related to "pumps," potentially including scheduling, charts, and a backlog/kanban system. Firebase is used for backend services, including Firestore for data storage and potentially Firebase Functions for server-side logic.

### Key Technologies and Frameworks

*   **Frontend:**
    *   Next.js (React framework)
    *   React
    *   Tailwind CSS (styling)
    *   Shadcn/ui (UI components)
*   **Backend:**
    *   Firebase (Firestore for data, Functions for server-side logic)
*   **AI/Agents:**
    *   Genkit (framework for building AI flows)
*   **TypeScript:** Used throughout the project for type safety.
*   **pnpm:** Package manager.
*   **Vitest:** Testing framework.

### Project Structure

The project follows a typical Next.js application structure with some additions for AI agents and backend functions:

*   `src/app`: Next.js application pages and API routes.
    *   `src/app/ai-query`: Page for interacting with AI agents.
    *   `src/app/charts`: Page for displaying charts.
    *   `src/app/schedule`: Page for scheduling.
    *   `src/app/api`: API routes.
*   `src/components`: Reusable React components.
    *   `src/components/ai-actions`: Components related to AI agent interactions.
    *   `src/components/kanban`: Components for the kanban board.
    *   `src/components/pump`: Components for pump-related features (forms, modals, filters).
    *   `src/components/schedule`: Components for the scheduling page.
    *   `src/components/ui`: Shadcn/ui components.
*   `src/lib`: Utility functions and constants.
*   `src/hooks`: Custom React hooks.
*   `src/services`: Services for interacting with APIs or backend services (e.g., Firebase).
*   `src/types`: TypeScript type definitions.
*   `src/ai`: Code related to AI agents and Genkit flows.
    *   `src/ai/flows`: Definitions of AI agent flows.
*   `functions`: Firebase Functions code.
*   `public`: Static assets (images).
*   `docs`: Project documentation.
*   `specs`: Feature specifications.

### Coding Guidelines

*   **TypeScript:** Use TypeScript for all new code and refactor existing JavaScript to TypeScript where possible.
*   ** eslint and Prettier:** Adhere to the project's ESLint and Prettier configurations for code formatting and style.
*   **Component Structure:** Prefer functional components and hooks.
*   **State Management:** Utilize React's built-in state management or consider a library like Zustand or Jotai for more complex scenarios if needed (check existing patterns first).
*   **Styling:** Use Tailwind CSS classes for styling. Avoid inline styles or separate CSS files unless necessary for third-party libraries.
*   **Firebase Interaction:** Use the services defined in `src/services` for interacting with Firebase.
*   **API Routes:** Define API endpoints in `src/app/api`.
*   **Error Handling:** Implement robust error handling on both the frontend and backend.
*   **Testing:** Write unit tests using Vitest for functions and components. Consider integration tests for critical flows.

### Development Workflow

*   **Branching:** Use a branching strategy like Gitflow or a simple feature branching model. Create a new branch for each task or feature.
*   **Commits:** Write clear and concise commit messages.
*   **Pull Requests:** Create pull requests for code changes and require reviews from other team members.
*   **Testing:** Ensure tests pass before submitting a pull request.
*   **Deployment:** The project is likely deployed using Firebase App Hosting or a similar service integrated with Next.js.

### Relevant Files

*   `package.json`: Project dependencies and scripts.
*   `tsconfig.json`: TypeScript configuration.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `firebase.json`: Firebase project configuration.
*   `firestore.rules`: Firestore security rules.
*   `firestore.indexes.json`: Firestore index definitions.
*   `next.config.ts`: Next.js configuration.
*   `vitest.config.ts`: Vitest configuration.
*   `src/lib/constants.ts`: Project-wide constants.
*   `src/lib/firebase.ts`: Firebase initialization.
*   `src/services`: API and data fetching logic.
*   `src/ai/flows`: AI agent flow definitions.

This information should provide Gemini Code Assist with a solid understanding of the project's structure, technologies, guidelines, and the role of AI agents within the application.