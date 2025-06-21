# Application Specification Document

## 1. Application Overview

This document outlines the technical specifications of a mobile application built using the Expo framework and React Native. The application leverages Expo Router for file-system based navigation and is written in TypeScript for enhanced code quality. Styling is managed with NativeWind and Tailwind CSS, providing a utility-first styling approach. The application integrates with Supabase for backend services, including database operations and authentication. Based on the project structure and file names, the application appears to be an e-commerce or store-based system, facilitating browsing stores, viewing products, managing a shopping cart, and tracking orders.

## 2. Tech Stack

*   **Framework:** React Native + Expo
*   **Language:** TypeScript
*   **Styling:** NativeWind, Tailwind CSS
*   **Backend:** Supabase


## 4. Folder Structure

The application's folder structure is organized to facilitate development with Expo Router's file-based routing.

### `app` Folder

Contains the main application screens and navigation logic.

*   `+not-found.tsx`: Handles the display of a 404 "not found" page for undefined routes.
*   `_layout.tsx`: The main layout component for the application, likely setting up the overall navigation structure or shared UI elements.
*   `cart.tsx`: Represents the screen or component for the user's shopping cart.
*   `(auth)`: Directory for authentication-related screens.
    *   `auth.tsx`: The main authentication screen, handling user login or sign-up.
*   `(tabs)`: Directory containing screens that are part of a tab-based navigation interface.
    *   `_layout.tsx`: Defines the layout and configuration for the tab navigation.
    *   `index.tsx`: The default screen displayed within the tabs section (e.g., a home screen).
    *   `orders.tsx`: Displays a list of the user's orders.
    *   `profile.tsx`: Shows the user's profile information.
*   `orders/[id].tsx`: A dynamic route for displaying details of a specific order, where `[id]` is a placeholder for the order ID.
*   `stores/[storeId].tsx`: A dynamic route for displaying details of a specific store, with `[storeId]` as a placeholder for the store ID.
*   `stores/[storeId]/[itemId].tsx`: A dynamic route for displaying details of a specific item within a particular store, using both `[storeId]` and `[itemId]` as placeholders.

### `components` Folder

Contains reusable UI components used throughout the application.

*   `CartButton.tsx`: A button component related to the user's shopping cart.
*   `Store.tsx`: A component that displays a brief overview or representation of a store.
*   `StoreDetails.tsx`: A component responsible for rendering the detailed information of a specific store.
*   `StoreItemsList.tsx`: A component that displays a list of items belonging to a store.
*   `store/`: Subdirectory for components specifically related to stores.
    *   `StoreCatalogItem.tsx`: Represents an individual item within a store's catalog.
    *   `StoreDetails.tsx`: Another component for displaying store details, potentially with different levels of detail or purpose compared to `components/StoreDetails.tsx`.

## 5. Application Flow (Based on File Structure)

The application flow is primarily dictated by the file-based routing provided by Expo Router. The main entry point is likely handled by `/app/_layout.tsx`, which sets up the initial navigation structure.