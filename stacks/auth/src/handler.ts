import { APIGatewayProxyHandler } from 'aws-lambda';
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
}
const generatePolicy = (principalId: string, methodArn: string): APIGatewayAuthorizerResult => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

export const auth = async (event: APIGatewayTokenAuthorizerEvent, context: any): Promise<APIGatewayAuthorizerResult> => {
  if (!event.authorizationToken) {
    throw new Error('Unauthorized');
  }

  const token = event.authorizationToken.replace('Bearer ', '');

  try {
    const claims = jwt.verify(token, "abc") as any; // Assuming your claims have a specific structure
    const policy = generatePolicy(claims.sub, event.methodArn);

    return {
      ...policy,
      context: claims,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Unauthorized');
  }
};

