import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface WorkflowLambdaProps {
  readonly bucket: s3.IBucket;
}

export class WorkflowLambda extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: WorkflowLambdaProps) {
    super(scope, id);

    const codePath = path.join(__dirname, '../../src/lambda');

    this.function = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(codePath),
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    props.bucket.grantPut(this.function);
  }
}
