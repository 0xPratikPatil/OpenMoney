---
plan name: provider-frontend-integration
plan description: Wire providers to real-time frontend
plan status: active
---

## Idea
Connect all 33 OpenBB-ported data providers to the Hono API and Next.js frontend with live market data, real-time WebSocket streaming, provider discovery UI, standardized response envelopes, and proper credential flow. Eliminate all mock data, fix the broken credential pipeline for domain routes, and build a shadcn-inspired provider registry browser.

## Implementation
- Register all 33 providers in provider-init.ts
- Standardize response envelope to OBBject everywhere
- Fix credential flow: thread credentials through domain routes
- Fix frontend API client: remove v1 paths, add public market data routes
- Remove mock data from dashboard and markets pages, wire live API
- Build provider registry/discovery API endpoint and UI (shadcn-inspired)
- Add real-time WebSocket market data streaming
- Add rate limiting for public endpoints
- Add per-user provider defaults in settings
- Add Hono RPC client for type-safe frontend API calls

## Required Specs
<!-- SPECS_START -->
- provider-frontend-wire
<!-- SPECS_END -->