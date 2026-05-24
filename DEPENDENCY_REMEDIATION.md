# Dependency Remediation

This document tracks the remediation strategy for high-risk dependencies as part of the security rollout.

## Analyzed Packages

| Package | Current Vulnerable / Old Version | Recommended Target | Severity | Breaking Change? | Testing Required |
|---------|--------------------------------|-------------------|----------|----------------|------------------|
| **next** | `15.2.4` | `16.2.6` | High/Moderate (Indirect) | **Yes (Major)** | Full SSR/Turbopack verification, routing tests. |
| **@clerk/\*** | `6.19.1` (nextjs) / `5.62.0` (js) | `7.4.1` / `6.12.1` | - | **Yes (Major)** | Full authentication flow, session management. |
| **axios** | `1.8.4` | `1.16.1` | Moderate | No (Minor) | API requests and error handling verification. |
| **lodash** | `4.17.21` (Transitive) | `^4.17.21` | Moderate (Transitive) | No | App stability, UI components relying on lodash. |
| **protobufjs**| `<=7.5.7` (Transitive) | `>=7.5.8` | Critical | No (Patch) | Firebase connection and basic interactions. |

## Remediation Strategy
- **Safe Updates**: `axios`, `lodash`, and `protobufjs` will be updated immediately. `lodash` and `protobufjs` will be enforced using `overrides` in `package.json` to handle transitive dependency issues securely.
- **Staged Updates**: `next` and `@clerk/*` involve major version updates that will break existing integrations. These are scheduled for a separate staged migration branch.
