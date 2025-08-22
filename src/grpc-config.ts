import { GrpcOptions, Transport } from '@nestjs/microservices';

export const grpcConfig: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:50051',
    package: [
      'com.example.service.v1',
      'com.example.service.v2',
    ],
    protoPath: [
      // v1/service_v1.proto imports v1/shared_models.proto
      // v2/service_v2.proto imports v2/shared_models.proto  
      // Both shared_models.proto files define "Operation" enum in SAME namespace!
      // This will cause: "duplicate name 'Operation' in Namespace .com.example.shared.v1"
      'proto/v1/service_v1.proto',
      'proto/v2/service_v2.proto',
    ],
    gracefulShutdown: true,
  },
};
