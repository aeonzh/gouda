# B2C Application PRD

## 1. Project Overview

This document outlines the requirements for the B2C application, a mobile application designed to serve as the primary interface for buyers interacting with the B2B wholesale store platform. The application will allow Customers to browse products, create orders, manage their accounts, and view their order history.

**Important Note:** This application focuses on order creation and management. It does not handle payment processing or shipment/delivery logistics.

## 2. Core Requirements

- Enable Customers to register and log in securely.
- Provide a clear and intuitive way for Customers to discover and view products.
- Allow Customers to add products to a shopping cart and create an order from it.
- Provide access to past order history and status updates.
- Allow Customers to manage their profile information.

## 3. Core Features

- **Authentication:** User registration, login, and password reset.
- **Product Catalog:** Browse products by category, search, filter, and view detailed product information (including pricing and availability).
- **Shopping Cart:** Add, remove, and update product quantities in the cart.
- **Order Creation:** Create an order directly from the shopping cart.
- **Order History:** View a list of past orders with details and status.
- **User Profile:** View and edit personal information.

## 4. Core Components

- Authentication forms (Login, Sign Up, Forgot Password)
- Product listing and detail components
- Search bar and filtering options
- Shopping cart interface
- Order creation confirmation
- Order history list and detail views
- User profile forms for editing personal information.

## 5. App/User Flow

A typical user flow would involve:

1. User opens the app and logs in (or signs up).
2. User browses the product catalog or searches for specific products.
3. User views product details and adds items to the shopping cart.
4. User proceeds to the shopping cart to review selected items.
5. User creates an order directly from the shopping cart.
6. User receives an order confirmation.
7. User can view the order status in their order history.
8. User can access their profile to update personal information.

## 6. Tech Stack

The Customer application will be built using:

- React Native
- Expo
- NativeWind (for styling)

## 7. Implementation Plan

The implementation will follow an iterative approach, starting with core functionalities and progressively adding more features. The initial focus will be on:

1. Setting up the project environment with React Native, Expo, and NativeWind.
2. Implementing the authentication screens and logic.
3. Developing the core product browsing and viewing features.
4. Building the shopping cart functionality.
5. Implementing the simplified order creation process directly from the shopping cart.
6. Developing the order history and user profile screens.
7. Integrating with the backend API for data fetching and submission.
8. Thorough testing and debugging.

Subsequent iterations will focus on adding features like wishlists, notifications, and potentially more advanced search and filtering options.

---

Customer Application Screens:

Authentication Screens:

- Login: For existing Customers to sign in.
- Sign Up/Registration: Allow Customers to request an account or sign up directly.
- Forgot Password: To help Customers reset their password.

Product Browsing and Discovery:

- Home/Dashboard: A landing page that might feature promotions, new arrivals, or curated collections.
- Product Listing/Catalog: To display products, likely with filtering and sorting options (by category, price, etc.).
- Product Details: To show detailed information about a single product (description, images, pricing, availability).
- Search Results: To display results based on Customer searches.

Ordering:

- Shopping Cart: To manage items the Customer wants to purchase.
- Order Confirmation: To display a summary of the placed order.

Account Management:

- My Account/Profile: To view and edit personal information.
- Order History: To view past orders and their status.

Other potentially useful screens:

- Wishlist: To save products for later.
- Notifications: To view order updates or promotional messages.
- Help/Support: Access to FAQs or contact information.
