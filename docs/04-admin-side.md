# Administrative Application PRD

## 1. Project Overview

This document outlines the requirements for the Administrative application, a mobile application designed to serve as the interface for store managers and seller agents interacting with the B2B wholesale store platform. The application will provide tools for managing products, inventory, orders, buyers, and administrative users, with functionalities varying based on user roles.

## 2. Core Requirements

- Enable administrative users (store managers and seller agents) to log in securely.

- Provide a dashboard with key information and quick access to common tasks based on user role.
- Allow users to manage product information, including adding, editing, and organizing products.
- Enable users to monitor and adjust inventory levels.
- Provide tools for viewing, managing, and updating the status of orders.
- Allow seller agents to create orders on behalf of buyers.
- Enable users to view and manage buyer accounts.
- (For higher-level admins) Allow management of administrative user accounts and permissions.
- Provide access to relevant reports and analytics.

## 3. Core Features

- **Authentication:** User login for administrative roles.
- **Dashboard:** Role-specific overview and shortcuts.
- **Product Management:** View, search, filter products; Add/Edit product details (description, pricing, inventory, images); Category management.
- **Inventory Management:** View inventory list; Adjust stock levels; Low stock alerts.
- **Order Management:** View, search, filter orders; View order details; Update order status; Create orders for buyers (Seller Agent).
- **Customer/Buyer Management:** View buyer list; View buyer details; Add/Edit buyer accounts.
- **User Management (Admin):** View user list; Add/Edit user accounts and roles.
- **Reporting & Analytics:** Access to sales reports, inventory reports, etc.
- **Settings & Configuration (Admin):** Manage general settings, pricing rules, shipping, payment gateways.

## 4. Core Components

- Login form for administrative users
- Dashboard interface with role-based widgets/information
- Product listing, detail, and editing forms
- Inventory listing and adjustment interfaces
- Order listing and detail views
- Order status update controls
- Order creation form (for Seller Agent)
- Buyer listing and detail views
- Buyer add/edit forms
- User listing and add/edit forms (Admin)
- Reporting views
- Settings forms

## 5. App/User Flow

User flows will vary significantly based on the user's role (Store Manager or Seller Agent) due to role-based access control.

**General Login Flow:**

1. User opens the app and logs in with administrative credentials.
2. User is directed to their role-specific dashboard.

**Store Manager Flows (Examples):**

- **Product Management:** Navigate to Product List -> View/Search/Filter Products -> Select a Product -> View/Edit Product Details or Navigate to Add Product -> Fill in details -> Save Product.
- **Order Management:** Navigate to Order List -> View/Search/Filter Orders -> Select an Order -> View Order Details -> Update Order Status.
- **Inventory Management:** Navigate to Inventory List -> View Low Stock Alerts -> Select a Product -> Adjust Inventory.

**Seller Agent Flows (Examples):**

- **Customer Management:** Navigate to Buyer List -> View/Search/Filter Buyers -> Select a Buyer -> View Buyer Details.
- **Order Creation:** Navigate to Create Order (for Seller Agent) -> Select a Buyer -> Add Products to Order -> Review Order -> Create Order.
- **Reporting:** Navigate to Reports -> Select a Sales Report -> View Report.

## 6. Tech Stack

The Administrative application will be built using:

- React Native
- Expo
- NativeWind (for styling)

## 7. Implementation Plan

The implementation will follow an iterative approach, starting with core functionalities shared by both roles and then developing role-specific features. The initial focus will be on:

1. Setting up the project environment with React Native, Expo, and NativeWind.
2. Implementing the administrative login and role-based dashboard.
3. Developing core Product Management features (viewing, adding, editing).
4. Building core Order Management features (viewing, updating status).
5. Implementing basic Inventory Management (viewing levels).
6. Developing Customer/Buyer Management features (viewing, adding, editing).
7. Implementing the "Create Order" feature for Seller Agents.
8. Implementing role-based access control to restrict feature visibility and access.
9. Integrating with the backend API for data fetching and submission.
10. Thorough testing and debugging.

Subsequent iterations will focus on adding more advanced features like detailed reporting, inventory adjustments, low stock alerts, user management (for higher-level admins), and settings/configuration.
Administrative Application Screens:

Authentication and Dashboard:

- Login: For administrative users (managers and agents) to sign in.
- Dashboard: A central landing page providing an overview of key metrics and quick access to common tasks (e.g., new orders, pending approvals, sales summaries - potentially role-specific).

Product Management:

- Product List: To view, search, and filter all products.
- Add/Edit Product: To create new products or modify existing ones (details, pricing, inventory, images).
- Category Management: To organize products into categories.

Inventory Management:

- Inventory List: To view current stock levels for all products.
- Adjust Inventory: To manually update stock levels.
- Low Stock Alerts: To view products that are running low on inventory.

Order Management:

- Order List: To view, search, and filter all orders.
- Order Details: To view the details of a specific order (items, quantities, pricing, shipping information, status).
- Update Order Status: To change the status of an order (e.g., pending, processing, shipped, delivered, cancelled).
- Create Order (for Seller Agent): A screen for seller agents to create orders on behalf of buyers.

Customer/Buyer Management:

- Buyer List: To view and manage buyer accounts.
- Buyer Details: To view details of a specific buyer (contact information, order history, assigned seller agent).
- Add/Edit Buyer: To create new buyer accounts or modify existing ones.

User Management (for higher-level admins):

- User List: To view and manage administrative user accounts (managers, agents).
- Add/Edit User: To create new administrative users or modify existing ones (including assigning roles and permissions).

Reporting and Analytics:

- Sales Reports: To view sales data by product, buyer, seller agent, date range, etc.
- Inventory Reports: To view inventory levels and turnover.
- Other relevant reports based on business needs.

Settings and Configuration:

- General Settings: To configure application settings.
- Pricing Rules: To manage wholesale pricing rules, discounts, etc.
- Shipping Methods: To configure available shipping options.
- Payment Gateway Settings: To configure payment processing.

Role-Specific Access:

Within this administrative app, we would use the role-based access control we discussed to ensure that Store Managers and Seller Agents only see and can interact with the screens and data relevant to their roles. For example:

- Store Managers would likely have full access to product, inventory, order, and user management (within their scope).
- Seller Agents would focus on customer management, creating orders for their assigned buyers, and accessing sales reports related to their performance.
