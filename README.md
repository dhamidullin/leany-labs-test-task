# Aviation Weather Map - Leany Labs Test Task

A full-stack application that visualizes aviation weather advisories (SIGMETs and AIRSIGMETs) on an interactive map.

## Overview

The application consists of a **Next.js frontend** for visualization and a **Node.js/Express backend** that acts as a proxy and cache for the Aviation Weather Center (AWC) API.

### Features Implemented

*   **Interactive Map**: Visualizes weather warnings using MapLibre GL JS (or compatible library).
*   **Data Layers**: Toggles for SIGMET and AIRSIGMET layers.
*   **Filtering**:
    *   **Altitude Range**: Filter weather events by altitude (0 - 48,000 ft).
    *   **Time Slider**: Filter events by validity period (-24h to +6h).
*   **Backend Proxy**:
    *   Proxies requests to AWC `/isigmet` and `/airsigmet` endpoints.
    *   Normalizes data into a unified format.
    *   **Caching**: Implements an in-memory cache with the **Strategy Pattern** to support easy swapping of cache implementations (e.g., Redis).
    *   **TTL**: Cache entries expire after 1 hour (implemented with active expiration using `ms` package).

### Tech Stack

*   **Frontend**: Next.js (React), MapLibre GL JS, Tailwind CSS.
*   **Backend**: Node.js, Express, TypeScript.
*   **Package Manager**: pnpm (Monorepo workspace).

## Getting Started

This project is set up as a monorepo. You can run both the frontend and backend from the root directory.

### Prerequisites

*   Node.js (LTS recommended)
*   pnpm
*   **No .env files required**: The development environment is configured to run without additional environment variables.

### Development

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Start the development server:**

    This command runs both the backend (port 3001) and frontend (port 3000) in parallel.

    ```bash
    pnpm dev
    ```

3.  **Open the application:**

    Visit [http://localhost:3000](http://localhost:3000) in your browser.

    *   Backend API is available at [http://localhost:3001](http://localhost:3001)

### Testing

The backend includes unit tests for the caching logic (covering TTL, eviction policies, and complex object handling).

To run tests:

```bash
pnpm test
```

## Project Structure

*   `apps/web`: Next.js frontend application.
*   `apps/backend`: Express backend service with caching and data normalization.
*   `packages/types`: Shared TypeScript definitions.

## Note on Production

The production environment setup has not been implemented yet.