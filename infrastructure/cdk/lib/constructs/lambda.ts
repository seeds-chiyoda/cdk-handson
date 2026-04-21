import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LAMBDA_ARCHITECTURE, LAMBDA_RUNTIME } from '../lambda-config';

export interface JobLambdaProps {
  readonly bucket: s3.IBucket;
  readonly handler: string;
}

export class JobLambda extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: JobLambdaProps) {
    super(scope, id);

    const codePath = path.join(__dirname, '../../src/lambda');

    this.function = new lambda.Function(this, 'Function', {
      runtime: LAMBDA_RUNTIME,
      architecture: LAMBDA_ARCHITECTURE,
      handler: props.handler,
      code: lambda.Code.fromAsset(codePath),
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    props.bucket.grantPut(this.function);
  }
}
