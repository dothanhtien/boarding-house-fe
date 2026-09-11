# Boarding House

[![CI](https://github.com/dothanhtien/boarding-house-fe/actions/workflows/ci.yml/badge.svg)](https://github.com/dothanhtien/boarding-house-fe/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

Front-end for the Boarding House management system — an admin dashboard for managing boarding house operations, built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

This project started from the [TailAdmin](https://tailadmin.com) Next.js admin template and has been trimmed down and adapted to the needs of this application.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [ApexCharts](https://apexcharts.com/) for data visualization
- [FullCalendar](https://fullcalendar.io/) for scheduling
- [React DnD](https://react-dnd.github.io/react-dnd/) for drag-and-drop interactions

## Getting Started

### Prerequisites

- Node.js version pinned in [.nvmrc](.nvmrc) (run `nvm use` if you have nvm installed)

### Setup

```bash
nvm use                          # or install the Node version from .nvmrc manually
npm install
cp .env.example .env.local       # fill in real values for local dev
npm run dev
```

> Use the `--legacy-peer-deps` flag on `npm install` if you run into peer-dependency errors.

The app will be available at [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build           # Build for production
npm run start           # Start the production server
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with --fix
npm run format          # Format all files with Prettier
npm run format:check    # Check formatting without writing
npm run typecheck       # Type-check with tsc --noEmit
npm run test            # Run tests once (Vitest)
npm run test:watch      # Run tests in watch mode
```

Run a single test file: `npx vitest run src/components/ui/button/Button.test.tsx`

### Git hooks & CI

A Husky `pre-commit` hook runs `npx lint-staged`, which runs `eslint --fix` + `prettier --write` on staged `*.{js,jsx,ts,tsx}` and `prettier --write` on staged `*.{json,css,md}`. GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, format check, tests, and build on every push/PR to `main`.

## Project Structure

```text
src/
├── app/                  # App Router routes
│   ├── (admin)/          # Authenticated admin dashboard & profile pages
│   └── (auth)/           # Sign in / sign up pages
├── components/           # UI and feature components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── icons/                # SVG icon components
└── layout/               # App shell (header, sidebar)
```
