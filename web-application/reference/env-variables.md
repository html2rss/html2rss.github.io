---
title: 'ENV variables'
---

# Configuration Reference

## Supported ENV variables

| Name                           | Description                        |
| ------------------------------ | ---------------------------------- |
| `LOG_LEVEL`                    | default: 'warn'                    |
| `HEALTH_CHECK_USERNAME`        | default: auto-generated on start   |
| `HEALTH_CHECK_PASSWORD`        | default: auto-generated on start   |
|                                |                                    |
| `AUTO_SOURCE_ENABLED`          | default: false                     |
| `AUTO_SOURCE_USERNAME`         | no default.                        |
| `AUTO_SOURCE_PASSWORD`         | no default.                        |
| `AUTO_SOURCE_ALLOWED_ORIGINS`  | no default.                        |
| `AUTO_SOURCE_ALLOWED_URLS`     | no default. Wildcard patterns supported. |
|                                |                                    |
| `PORT`                         | default: 3000                      |
| `RACK_ENV`                     | default: 'development'             |
| `RACK_TIMEOUT_SERVICE_TIMEOUT` | default: 15                        |
| `WEB_CONCURRENCY`              | default: 2                         |
| `WEB_MAX_THREADS`              | default: 5                         |
|                                |                                    |
| `SENTRY_DSN`                   | no default.                        |
|                                |                                    |
| `RUBY_PATH`                    | default: 'ruby'                    |
| `APP_ROOT`                     | default: '.'                       |
