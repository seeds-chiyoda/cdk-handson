import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

export interface JobScheduleRuleProps {
  readonly stateMachine: sfn.IStateMachine;
}

const SAMPLE_INPUT = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Carol', age: 28 },
];

export class JobScheduleRule extends Construct {
  constructor(scope: Construct, id: string, props: JobScheduleRuleProps) {
    super(scope, id);

    new events.Rule(this, 'Rule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [
        new targets.SfnStateMachine(props.stateMachine, {
          input: events.RuleTargetInput.fromObject(SAMPLE_INPUT),
        }),
      ],
    });
  }
}
