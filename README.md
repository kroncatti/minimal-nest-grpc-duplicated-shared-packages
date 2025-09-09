# NestJS gRPC Duplicate Enum Issue - Minimal Reproduction

This is a minimal reproduction of a protobuf namespace conflict issue when using NestJS with gRPC.

> [!IMPORTANT]
> Updated on 2025-09-09: Using NestJS, there is no workaround over this. The ideal solution involves changing the way the npm packages are released.
>
> We should not release depending packages in the same package. They should be imported and released separately.

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

This reproduces a real-world scenario where protobuf definitions are **released as separate npm libraries**:

### The npm Library Distribution Model

In many organizations, protobuf definitions are packaged and distributed as individual npm libraries:
- `@company/proto-v1` - Contains all v1 protobuf definitions including shared models
- `@company/proto-v2` - Contains all v2 protobuf definitions including shared models

Each version becomes a separate npm package because:
- **Versioning independence**: Different services can consume different API versions
- **Dependency isolation**: Services don't need to pull all versions
- **Publishing workflow**: Each API version has its own release cycle

### The Duplication Problem

1. **Both npm packages include shared models**: Each library (`proto-v1`, `proto-v2`) must include its own copy of `shared_models.proto` to be self-contained
2. **Same namespace, same definitions**: Both versions define `Operation` enum in `com.example.shared.v1` namespace
3. **NestJS loads both libraries**: When a service needs to support both v1 and v2 APIs, it imports both npm packages
4. **Protobuf namespace collision**: Both libraries try to register the same enum in the same namespace
5. **Result**: `duplicate name 'Operation' in Namespace .com.example.shared.v1`

### The Consequences

To avoid this conflict, teams are forced to make suboptimal choices:

- **Bump shared package versions unnecessarily**: In v2, we increment `shared_models.proto` namespace to `com.example.shared.v2` just to avoid conflicts, even when the models haven't changed
- **Break semantic versioning**: Shared models that are logically identical get different namespaces
- **Complicate client code**: Consumers must handle different namespaces for the same logical models
- **Reduce reusability**: Shared models become less shareable across versions

The current workaround of bumping shared model namespaces (e.g., `v1` → `v2`) just to avoid conflicts undermines the benefits of semantic versioning and shared model reusability.
