import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { JobScheduleRule } from './constructs/event-bridge';
import { JobGlue } from './constructs/glue';
import { JobLambda } from './constructs/lambda';
import { ResultBucket } from './constructs/s3';
import { JobQueue } from './constructs/sqs';
import { JobStateMachine } from './constructs/step-functions';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new ResultBucket(this, 'ResultBucket');
    const firstLambda = new JobLambda(this, 'FirstJobLambda', {
      bucket: bucket.bucket,
      handler: 'csv_upload_s3.handler',
    });
    const secondLambda = new JobLambda(this, 'SecondJobLambda', {
      bucket: bucket.bucket,
      handler: 'echo_hello_world.handler',
    });
    const glue = new JobGlue(this, 'JobGlue');
    const queue = new JobQueue(this, 'JobQueue');

    const jobStateMachine = new JobStateMachine(this, 'JobStateMachine', {
      firstLambdaFunction: firstLambda.function,
      standardGlueJobName: glue.standardJobName,
      dedicatedGlueJobName: glue.dedicatedJobName,
      failureQueue: queue.queue,
    });

    new JobScheduleRule(this, 'JobScheduleRule', {
      stateMachine: jobStateMachine.stateMachine,
    });
  }
}
