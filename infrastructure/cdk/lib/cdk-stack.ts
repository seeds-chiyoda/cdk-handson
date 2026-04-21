import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { ResultBucket } from './constructs/s3';
import { WorkflowLambda } from './constructs/lambda';
import { WorkflowStateMachine } from './constructs/step-functions';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const resultBucket = new ResultBucket(this, 'ResultBucket');
    const workflowLambda = new WorkflowLambda(this, 'WorkflowLambda', {
      bucket: resultBucket.bucket,
    });
    new WorkflowStateMachine(this, 'WorkflowStateMachine', {
      workflowLambda: workflowLambda.function,
    });
  }
}
