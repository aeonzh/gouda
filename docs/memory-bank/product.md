# Product Document: Gouda E-Commerce Platform

## 1. Project Overview

Gouda is a multi-vendor B2B e-commerce platform designed to streamline wholesale purchasing. It consists of two distinct mobile applications:

- **B2C (Customer-Facing) App**: Allows customers to browse products from various vendors, place orders, and manage their accounts.
- **B2B (Administrative) App**: Empowers business owners and sales agents to manage products, inventory, orders, and customer relationships.

The platform's primary focus is on order creation and management, excluding payment processing and logistics from its current scope.

## 2. Core Problem & Goals

The project aims to solve the complexities of manual wholesale ordering by providing a centralized digital platform.

**Core Goals:**

- **Enable Multi-Vendor Operations**: Support multiple businesses managing their own product catalogs and orders within a single system.
- **Seamless Customer Experience**: Offer an intuitive and efficient way for customers to discover products and place orders.
- **Streamline Business Operations**: Provide businesses with tools for centralized inventory, order, and customer management.
- **Ensure Security**: Implement robust, role-based access control to protect sensitive business and customer data.

## 3. User Personas & Key Features

### 3.1. B2C - The Customer

Customers are buyers who need a simple way to order goods from their approved vendors.

**Key Features:**

- **Authentication**: Secure login, registration, and password reset.
- **Vendor & Product Discovery**: Browse authorized vendors and their product catalogs.
- **Shopping Cart**: Add, remove, and update product quantities before ordering.
- **Order Management**: Place orders from the cart and track their history and status.
- **Profile Management**: View and edit personal information and manage addresses.

### 3.2. B2B - The Business Owner & Sales Agent

Business owners and sales agents are responsible for managing the e-commerce operations for their company.

**Key Features:**

- **Secure Authentication**: Role-based login for business users.
- **Product Catalog Management**: Full CRUD (Create, Read, Update, Delete) capabilities for products and categories.
- **Order Processing**: View incoming orders, check details, and update their status (e.g., pending, processing, completed).
- **Inventory Management**: Track stock levels and make adjustments as needed.
- **Customer Order Creation**: Ability for sales agents to create orders on behalf of their customers.

## 4. User Experience Flow

### B2C App Flow:

1.  A customer logs into the B2C application.
2.  The home screen displays a list of vendors the customer is authorized to purchase from.
3.  The customer selects a vendor to enter their dedicated storefront. This action sets the active vendor context for the shopping session.
4.  Within the vendor's storefront, the customer can browse products, search, and filter. The shopping cart is specific to this vendor; adding an item clears any items from a different vendor.
5.  The customer proceeds to checkout, creating an order that is tied to the single, active vendor.
6.  The order appears in the customer's history, clearly associated with the vendor it was placed with.

### B2B App Flow:

1.  A business user (Owner or Sales Agent) logs into the B2B application.
2.  The application context is automatically scoped to their assigned `business_id`. All data displayed and actions performed are restricted to this single business.
3.  The user is directed to a dashboard summarizing their business's activity (e.g., new orders, sales metrics).
4.  They can navigate to role-specific management sections:
    - **Product Management**: Manage the product catalog exclusive to their business.
    - **Order Management**: View and process orders placed with their business.
    - **Inventory Management**: Monitor and adjust stock for their business's products.
5.  A Sales Agent can create an order for a customer, but only for customers associated with their business and using products from their business's catalog.
6.  When an order's status is updated, the change is reflected for the specific customer in the B2C app.
