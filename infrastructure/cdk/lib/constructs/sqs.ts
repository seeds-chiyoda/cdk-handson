import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class JobQueue extends Construct {
  public readonly queue: sqs.Queue;
  public readonly deadLetterQueue: sqs.Queue;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: cdk.Duration.days(14),
    });

    this.queue = new sqs.Queue(this, 'Queue', {
      deadLetterQueue: {
        queue: this.deadLetterQueue,
        maxReceiveCount: 3,
      },
    });
  }
}
