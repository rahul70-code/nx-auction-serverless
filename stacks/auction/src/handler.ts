import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import * as AWS from 'aws-sdk';
// import * as middy from '@middy/core';
// import { jsonBodyParser, httpEventNormalizer, httpErrorHandler } from '@middy/http';
import createError from 'http-errors';
// import validator from '@middy/validator';
const dynamoDB = new AWS.DynamoDB.DocumentClient();
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';


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
interface Auction {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  endingAt: string;
  highestBid: {
    amount: number;
  };
  seller: string;
}

export const create: APIGatewayProxyHandler = async (event, _context) => {
  const { title } = JSON.parse(event.body);
  // const { email } = event.requestContext ? event.requestContext.authorizer : { email: '' };
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);
  const auction: Auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller:  "",
  };

  try {
    await dynamoDB
      .put({
        TableName: 'AuctionsTable_1',
        Item: auction,
      })
      .promise();
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}


export const fetchAuctions: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const status = event.queryStringParameters?.status;

  let auctions;

  try {
    const params: any = {
      TableName: 'AuctionsTable_1',
    };

    // Add status condition if it is provided
    if (status) {
      params.IndexName = 'statusAndEndingAt';
      params.KeyConditionExpression = '#status = :status';
      params.ExpressionAttributeValues = {
        ':status': status,
      };
      params.ExpressionAttributeNames = {
        '#status': 'status',
      };
    }

    const result = await dynamoDB.query(params).promise();
    auctions = result.Items;
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

export const fetchAuction: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  let auction;
  const { id } = event.pathParameters;

  try {
    const result = await dynamoDB.get({
      TableName: 'AuctionsTable_1',
      Key: { id },
    }).promise();
    auction = result.Item;
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID ${id} not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const placeBid: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const { amount } = JSON.parse(event.body || '{}');
  // const { email } = event.requestContext?.authorizer || '';

  const auctionData = await dynamoDB.get({
    TableName: 'AuctionsTable_1',
    Key: { id },
  }).promise();

  let auction = auctionData.Item;

  // if (email === auction.seller) {
  //   throw new createError.Forbidden("You cannot bid on your own auctions!");
  // }

  // if (email === auction.highestBid.bidder) {
  //   throw new createError.Forbidden("You are already the highest bidder");
  // }

  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden("You cannot bid on CLOSED Auction");
  }

  if (amount <= auction.highestBid.amount) {
    return new createError.Forbidden("Your bid must be higher than " + amount);
  }

  const params = {
    TableName: 'AuctionsTable_1',
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',//, highestBid.bidder = :bidder
    ExpressionAttributeValues: {
      ':amount': amount,
      // ':bidder': email,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updateAuction;

  try {
    const result = await dynamoDB.update(params).promise();
    updateAuction = result.Attributes;
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
};

export async function getEndedAuctions(): Promise<any[]> {
  const now = new Date();
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: 'AuctionsTable',
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingDate <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items as any[];
}
  



