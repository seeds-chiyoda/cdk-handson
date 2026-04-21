import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export interface WorkflowStateMachineProps {
  readonly workflowLambda: lambda.IFunction;
}

export class WorkflowStateMachine extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: WorkflowStateMachineProps) {
    super(scope, id);

    const invoke = new tasks.LambdaInvoke(this, 'InvokeWorkflowLambda', {
      lambdaFunction: props.workflowLambda,
      payloadResponseOnly: true,
    });

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(invoke),
      timeout: cdk.Duration.minutes(5),
    });
  }
}
