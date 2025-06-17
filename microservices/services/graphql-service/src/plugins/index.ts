export const plugins = [
  // Basic request logging plugin
  {
    requestDidStart() {
      return Promise.resolve({
        didResolveOperation(requestContext: any) {
          console.log('GraphQL Operation:', requestContext.request.operationName);
        },
        didEncounterErrors(requestContext: any) {
          console.error('GraphQL Errors:', requestContext.errors);
        }
      });
    }
  }
]; 