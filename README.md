# NestJS gRPC Duplicate Enum Issue - Minimal Reproduction

This is a minimal reproduction of a protobuf namespace conflict issue when using NestJS with gRPC.

## The Problem

When loading multiple proto files that import the same shared proto file containing enums, protobuf throws an error:

```
Error: duplicate name 'Operation' in Namespace .com.example.shared.v1
```

## Setup

The project structure reproduces the issue with:

- `proto/v1/shared_models.proto` - Contains `Operation` enum in namespace `com.example.shared.v1`
- `proto/v2/shared_models.proto` - Contains SAME `Operation` enum in SAME namespace `com.example.shared.v1`
- `proto/v1/service_v1.proto` - Imports `v1/shared_models.proto`  
- `proto/v2/service_v2.proto` - Imports `v2/shared_models.proto`
- `src/grpc-config.ts` - NestJS gRPC configuration that loads both service protos

## How to Reproduce

1. Install dependencies:
```bash
npm install
```

2. Try to start the application:
```bash
npm run start:dev
```

3. You should see the error:
```
Error: duplicate name 'Operation' in Namespace .com.example.shared.v1
    at Namespace.add (/path/to/protobufjs/src/namespace.js:239:23)
    at parseEnum (/path/to/protobufjs/src/parse.js:574:16)
    ...
```

## The Root Cause

This reproduces a real-world scenario where:

1. **Two separate packages** (v1 and v2) each have their own copy of shared models
2. **Both copies define the same enum** (`Operation`) in the **same namespace** (`com.example.shared.v1`)
3. **When NestJS loads both proto files**, protobuf tries to register the same enum twice in the same namespace
4. **Result**: `duplicate name 'Operation' in Namespace .com.example.shared.v1`

This commonly happens when:
- Supporting multiple API versions with shared dependencies
- Different packages/libraries include the same protobuf definitions
- Gradual migration between proto schema versions

## Expected Behavior

NestJS should be able to load multiple proto files that share common imports without namespace conflicts, either by:
- Deduplicating shared imports automatically
- Providing configuration options to handle shared dependencies
- Supporting protobuf's import resolution mechanisms properly

## Real-World Context

This issue commonly occurs when:
- Supporting multiple API versions that share common models (like policy-simulation-manager v16 & v17)
- Different npm packages include copies of the same protobuf definitions
- Migrating between protobuf schema versions gradually
- Microservices that evolved separately but share common domain models
