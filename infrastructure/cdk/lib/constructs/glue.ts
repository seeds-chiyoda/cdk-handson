import * as path from 'node:path';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

export class JobGlue extends Construct {
  public readonly standardJobName: string;
  public readonly dedicatedJobName: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const standardScriptAsset = new s3assets.Asset(this, 'StandardScriptAsset', {
      path: path.join(__dirname, '../../src/glue/standard/job.py'),
    });
    const dedicatedScriptAsset = new s3assets.Asset(this, 'DedicatedScriptAsset', {
      path: path.join(__dirname, '../../src/glue/dedicated/job.py'),
    });

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    standardScriptAsset.grantRead(role);
    dedicatedScriptAsset.grantRead(role);

    const standardJob = new glue.CfnJob(this, 'StandardJob', {
      name: 'sample-standard-adapter-job',
      role: role.roleArn,
      glueVersion: '4.0',
      command: {
        name: 'glueetl',
        scriptLocation: standardScriptAsset.s3ObjectUrl,
      },
      workerType: 'G.1X',
      numberOfWorkers: 2,
      maxRetries: 0,
    });

    const dedicatedJob = new glue.CfnJob(this, 'DedicatedJob', {
      name: 'sample-dedicated-adapter-job',
      role: role.roleArn,
      glueVersion: '4.0',
      command: {
        name: 'glueetl',
        scriptLocation: dedicatedScriptAsset.s3ObjectUrl,
      },
      workerType: 'G.1X',
      numberOfWorkers: 2,
      maxRetries: 0,
    });

    this.standardJobName = standardJob.ref;
    this.dedicatedJobName = dedicatedJob.ref;
  }
}
