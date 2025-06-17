export interface Context {
  req: any;
  res: any;
  dataLoaders: any;
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL Service!',
    healthCheck: () => ({
      status: 'healthy',
      service: 'graphql-service',
      timestamp: new Date().toISOString()
    })
  },
  Mutation: {
    ping: () => 'pong'
  }
}; 