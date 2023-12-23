import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = {
  // ...baseServerlessConfiguration,
  frameworkVersion: '3',
  package: {
    individually: true,
    excludeDevDependencies: true,
  },
  plugins: ['serverless-esbuild', 'serverless-offline'],
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      target: 'node16',
      packager: 'yarn',
      sourcemap: true,
      sourcesContent: false,
    },
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    memorySize: 256,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    stage: 'dev',
    region: 'eu-west-1',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:PutItem',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:Query',
        ],
        Resource: [
          'arn:aws:dynamodb:eu-west-1:991785523771:table/AuctionsTable_1',
          'arn:aws:dynamodb:eu-west-1:991785523771:table/AuctionsTable_1/index/statusAndEndingDate',
        ],
      },
    ],
  },
  service: 'auth',
  functions: {
    auth: {
      handler: 'src/handler.auth',
      events: [
        {
          http: {
            method: 'ANY',
            path: '/',
            authorizer: {
              name: 'auth', // Reference to the auth function
              resultTtlInSeconds: 0,
              identitySource: 'method.request.header.Authorization',
            },
          },
        },
      ],
    },
  },
};

export = serverlessConfiguration;