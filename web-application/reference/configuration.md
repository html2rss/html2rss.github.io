---
layout: default
title: Configuration
nav_order: 1
permalink: /web-application/reference/configuration
parent: Reference
grand_parent: Web Application
---

# Configuration Reference

## Supported ENV variables

| Name                           | Description                        |
| ------------------------------ | ---------------------------------- |
| `BASE_URL`                     | default: '<http://localhost:3000>' |
| `LOG_LEVEL`                    | default: 'warn'                    |
| `HEALTH_CHECK_USERNAME`        | default: auto-generated on start   |
| `HEALTH_CHECK_PASSWORD`        | default: auto-generated on start   |
|                                |                                    |
| `AUTO_SOURCE_ENABLED`          | default: false                     |
| `AUTO_SOURCE_USERNAME`         | no default.                        |
| `AUTO_SOURCE_PASSWORD`         | no default.                        |
| `AUTO_SOURCE_ALLOWED_ORIGINS`  | no default.                        |
|                                |                                    |
| `PORT`                         | default: 3000                      |
| `RACK_ENV`                     | default: 'development'             |
| `RACK_TIMEOUT_SERVICE_TIMEOUT` | default: 15                        |
| `WEB_CONCURRENCY`              | default: 2                         |
| `WEB_MAX_THREADS`              | default: 5                         |
|                                |                                    |
| `SENTRY_DSN`                   | no default.                        |
