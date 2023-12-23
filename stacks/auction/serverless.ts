import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
  ...baseServerlessConfiguration,
  service: 'auction',
  functions: {
    hello: {
      handler: 'src/handler.hello',
      events: [
        {
          http: {
            method: 'get',
            path: 'hello',
          },
        },
      ],
    },
    create: {
      handler: 'src/handler.create',
      description: 'Creates the new auction',
      events: [
        {
          http: {
            method: 'post',
            path: 'auction',
            authorizer: "arn:aws:lambda:eu-west-1:991785523771:function:auth-dev-auth"
          },
        },
      ],
    },
    fetchAuctions: {
      handler: 'src/handler.fetchAuctions',
      description: 'Get all the auctions',
      events: [
        {
          http: {
            method: 'get',
            path: 'auctions',
          },
        },
      ],
    },
    fetchAuction: {
      handler: 'src/handler.fetchAuction',
      description: 'Get auction by auctionId',
      events: [
        {
          http: {
            method: 'get',
            path: 'auction/{id}',
          },
        },
      ],
    },
    placeBid: {
      handler: 'src/handler.placeBid',
      description: 'placeBid using auctionId',
      events: [
        {
          http: {
            method: 'patch',
            path: 'auction/{id}/bid',
          },
        },
      ],
    },
    // placeBid: 
  },
};

module.exports = serverlessConfiguration;
