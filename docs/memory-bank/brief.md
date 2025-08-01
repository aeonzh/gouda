# Gouda Project Brief

## Overview

Gouda is a multi-vendor e-commerce platform built as a monorepo with two React Native mobile applications: a customer-facing B2C app and an administrative B2B app. The system enables businesses to manage products and orders while allowing customers to browse vendors and place orders.

## Core Objectives

- Enable multi-vendor product management and order processing
- Provide seamless customer experience for browsing and ordering
- Streamline business operations through centralized inventory and order management
- Ensure secure, role-based access control across all system components

## Key Features

### Customer App (B2C)

- User authentication (login, signup, password reset)
- Vendor discovery and product browsing
- Shopping cart management
- Order placement and history tracking
- Profile and address management

### Admin App (B2B)

- Business authentication and role-based access
- Product catalog management (CRUD operations)
- Order processing and status updates
- Inventory tracking and adjustments
- Customer order creation on behalf of users

## Technology Stack

- **Frontend**: React Native with Expo, NativeWind for styling
- **Backend**: Supabase (PostgreSQL, PostgREST, Auth, Storage)
- **Architecture**: Monorepo with shared packages
- **Navigation**: Expo Router
- **Authentication**: Supabase Auth with JWT tokens
- **Security**: Row Level Security (RLS) policies

## System Scope

The platform focuses on order creation and management workflows. It does not handle payment processing or shipment/delivery logistics, keeping the scope focused on the core e-commerce operations between vendors and customers.
