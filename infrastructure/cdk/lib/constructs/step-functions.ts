import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export interface JobStateMachineProps {
  readonly firstLambdaFunction: lambda.IFunction;
  readonly secondLambdaFunction: lambda.IFunction;
}

export class JobStateMachine extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: JobStateMachineProps) {
    super(scope, id);

    const firstInvoke = new tasks.LambdaInvoke(this, 'FirstInvokeLambda', {
      lambdaFunction: props.firstLambdaFunction,
      payloadResponseOnly: true,
    });

    const secondInvoke = new tasks.LambdaInvoke(this, 'SecondInvokeLambda', {
      lambdaFunction: props.secondLambdaFunction,
      payloadResponseOnly: true,
    });

    const failState = new sfn.Fail(this, 'JobFailed');

    const statusChoice = new sfn.Choice(this, 'StatusIsSuccess')
      .when(sfn.Condition.stringEquals('$.status', 'success'), secondInvoke)
      .otherwise(failState);

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(firstInvoke.next(statusChoice)),
      timeout: cdk.Duration.minutes(5),
    });
  }
}
