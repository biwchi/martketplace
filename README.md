# Marketplace MVP (Wildberries / Ozon–like)

A high-performance marketplace prototype inspired by large e-commerce platforms such as Wildberries, Ozon, and Amazon.

The goal of this project is to explore **real-world marketplace architecture**, focusing on:
- fast product search with autocomplete
- scalable catalog and filtering
- SSR for SEO
- personalized recommendations (even for anonymous users)
- multi-vendor marketplace design (buyers & sellers)

This is an **architecture-first MVP**, not a demo shop.

---

## Goals

- ⚡ Fast server responses
- ⚡ Instant search & autocomplete
- 🧠 SEO-friendly pages using SSR
- 🧩 Flexible product attributes (EAV)
- 👤 Support anonymous and authenticated users
- 🏪 Support sellers and multi-vendor products
- 🔁 Event-based recommendation system
- 📱 Future-ready for mobile applications

---

## Applications Overview

The project consists of **two separate web applications** sharing the same backend and database.

### Buyer Application
- Public-facing marketplace
- SEO-optimized
- SSR-enabled
- Used by buyers and anonymous visitors

Example:


example.com


### Seller Application (Admin Panel)
- Authenticated-only
- No SEO requirements
- Used by sellers to manage products
- Separate UI and UX

Example:


seller.example.com


---

## Core Features (Buyer Application)

### Catalog & Navigation
- Category tree with unlimited nesting
- Category-specific behavior (e.g. size grid for clothes)
- Product listing pages with sorting and filtering
- Infinite scroll / pagination

---

### Product Pages
- Image gallery
- Price and discounts
- Add to cart
- Add to favorites (authenticated users)
- Dynamic characteristics (EAV model)
- Product description
- User reviews
- Related / recommended products

---

### Search System

#### Autocomplete (Search Hints)
- Instant hints while typing
- Typo-tolerant
- Intent-based suggestions:
  - `jeans`
  - `jeans for men`
  - `baggy jeans`
- Category- and attribute-aware

#### Final Search
- Full-text product search
- Filtering by:
  - price
  - rating
  - attributes (color, size, material, etc.)
- Sorting and pagination

---

## User Types

### Anonymous Users
- Can browse products and categories
- Can search with autocomplete
- Receive personalized recommendations
- Identified by `visitor_id`

### Authenticated Buyers
- All anonymous features
- Add to cart
- Add to favorites
- Leave reviews
- Improved personalized recommendations

### Sellers
- Authenticated users with seller role
- Access to seller admin panel
- Can manage their own products
- Can view product-level analytics (later)

A single user account may act as both **buyer and seller**.

---

## Visitor Identity & Personalization

- Every visitor (even anonymous) has a `visitor_id`
- `visitor_id` is stored:
  - Web → HttpOnly cookie
  - Mobile apps → secure storage
- User behavior is tracked as events:
  - product views
  - searches
  - category views
- When a user logs in, anonymous behavior is merged with their account

> `visitor_id` is **not authentication** and is never trusted for permissions.

---

## Recommendation System (MVP)

Implemented without machine learning.

### Techniques:
- Recently viewed products
- Products from the same category
- "Users who viewed X also viewed Y"
- Popular products per category

### Data source:
- Event-based tracking
- Precomputed and cached results
- Supports both anonymous and authenticated users

---

## Seller Admin Panel (MVP Scope)

### Product Management
- Create and edit products
- Assign category
- Manage prices
- Upload images
- Define attributes based on category (EAV)
- Publish / unpublish products

### Product Lifecycle
- Draft → not visible to buyers
- Active → searchable and indexed
- Disabled → removed from search

> Only active products are indexed in search and recommendations.

---

## Data Model Overview

### Main Entities
- User
- Seller
- Visitor
- Category
- Product
- Product Attributes (EAV)
- Reviews
- Favorites
- Cart
- User Events

### Attributes (EAV)
- Supports different data types:
  - string
  - number
  - color
  - select
  - boolean
- Attributes are category-specific
- Used for filtering and display

---

## Tech Stack

### Frontend
- TanStack Start / Next
- SSR / Hybrid rendering
- Vite
- Optimized images and hydration

### Backend
- Bun
- TypeScript
- Elysia
- REST API

### Database
- PostgreSQL
- JSONB for flexible attributes
- Indexed for fast filtering

### Search
- Meilisearch
- Separate indexes for:
  - products
  - search hints (autocomplete)
- Locale-aware indexing (per language)

### Caching
- Redis
- Cached:
  - category trees
  - popular products
  - recommendations
  - search results

### Infrastructure
- Docker
- CDN (Cloudflare)
- Single backend for web and mobile clients

---

## Non-Goals (for MVP)

The following features are intentionally out of scope:
- Payments
- Order fulfillment
- Delivery tracking
- Seller payouts
- Moderation workflows
- Advanced analytics

These can be added later if needed.

---

## Project Philosophy

- Read-heavy optimization
- Cache-first thinking
- Event-driven analytics
- Minimal trust in client-side data
- Clear separation of buyer and seller concerns
- Scalable by design, simple by implementation

---

## Inspiration

- Wildberries
- Ozon
- Amazon
- Real-world e-commerce architectures