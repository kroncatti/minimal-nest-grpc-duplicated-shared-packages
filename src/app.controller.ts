import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface RequestV1 {
  requestId: string;
  operation: number;
}

interface ResponseV1 {
  responseId: string;
  sharedData: any;
}

interface RequestV2 {
  requestId: string;
  operation: number;
  additionalData: string[];
}

interface ResponseV2 {
  responseId: string;
  sharedData: any;
  success: boolean;
}

@Controller()
export class AppController {
  @GrpcMethod('ServiceV1', 'ProcessRequest')
  processRequestV1(data: RequestV1): ResponseV1 {
    return {
      responseId: `response-${data.requestId}`,
      sharedData: { id: '123', operation: data.operation, status: 1 },
    };
  }

  @GrpcMethod('ServiceV2', 'ProcessAdvancedRequest')
  processAdvancedRequestV2(data: RequestV2): ResponseV2 {
    return {
      responseId: `advanced-response-${data.requestId}`,
      sharedData: { id: '456', operation: data.operation, status: 1 },
      success: true,
    };
  }
}
