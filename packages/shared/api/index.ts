/**
 * Shared API module for the Gouda application
 *
 * This module provides a centralized interface for all API operations,
 * including authentication, customer management, orders, products,
 * organizations, and members.
 *
 * @module api
 */

// Core authentication and user management
export * from './auth';
export * from './profiles';

// Business and customer management
export * from './customers';
export * from './members';
export * from './organisations';

// E-commerce functionality
export * from './orders';
export * from './products';

// Database client
export * from './supabase';
