import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export interface JobStateMachineProps {
  readonly firstLambdaFunction: lambda.IFunction;
  readonly standardGlueJobName: string;
  readonly dedicatedGlueJobName: string;
  readonly failureQueue: sqs.IQueue;
}

export class JobStateMachine extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: JobStateMachineProps) {
    super(scope, id);

    const firstInvoke = new tasks.LambdaInvoke(this, 'FirstInvokeLambda', {
      lambdaFunction: props.firstLambdaFunction,
      payloadResponseOnly: true,
    });

    const runStandardGlue = new tasks.GlueStartJobRun(this, 'RunStandardGlue', {
      glueJobName: props.standardGlueJobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    });

    const runDedicatedGlue = new tasks.GlueStartJobRun(this, 'RunDedicatedGlue', {
      glueJobName: props.dedicatedGlueJobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    });

    const sendFailureMessage = new tasks.SqsSendMessage(this, 'SendFailureMessage', {
      queue: props.failureQueue,
      messageBody: sfn.TaskInput.fromJsonPathAt('$'),
    });

    const failState = new sfn.Fail(this, 'JobFailed');
    const failureChain = sendFailureMessage.next(failState);

    firstInvoke.addCatch(failureChain);
    runStandardGlue.addCatch(failureChain);
    runDedicatedGlue.addCatch(failureChain);

    const statusChoice = new sfn.Choice(this, 'StatusIsSuccess')
      .when(
        sfn.Condition.stringEquals('$.status', 'success'),
        runStandardGlue.next(runDedicatedGlue),
      )
      .otherwise(failureChain);

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(firstInvoke.next(statusChoice)),
      timeout: cdk.Duration.minutes(5),
    });
  }
}
