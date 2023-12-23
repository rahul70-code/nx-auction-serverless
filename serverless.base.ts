import type { Serverless } from 'serverless/aws';

export const baseServerlessConfiguration: Partial<Serverless> = {
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
  resources: {
    Resources: {
      AuctionsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'AuctionsTable_1',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'status',
              AttributeType: 'S',
            },
            {
              AttributeName: 'endingAt',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'statusAndEndingAt',
              KeySchema: [
                {
                  AttributeName: 'status',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'endingAt',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          ],
        },
      },
      AuctionsProcessTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'Auctions Process Topic',
          TopicName: 'AuctionsProcessTopic',
        },
      },
    },
  },
};