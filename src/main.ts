import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { grpcConfig } from './grpc-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // This will fail with: "duplicate name 'Operation' in Namespace .com.example.shared.v1"
  // Because both service_v1.proto and service_v2.proto import shared_models.proto
  // which defines the same Operation enum in the same namespace
  app.connectMicroservice<MicroserviceOptions>(grpcConfig);

  await app.startAllMicroservices();
  console.log('🚀 gRPC services started on localhost:50051');
  
  await app.listen(3000);
  console.log('🚀 HTTP server started on localhost:3000');
}

bootstrap().catch((error) => {
  process.exit(1);
});
