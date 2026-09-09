# Boarding House

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

- Node.js 20.x or later

### Installation

```bash
npm install
```

> Use the `--legacy-peer-deps` flag if you run into peer-dependency errors during installation.

### Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # Build for production
npm run start   # Start the production server
npm run lint    # Run ESLint
```

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
