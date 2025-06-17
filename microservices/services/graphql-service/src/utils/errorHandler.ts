export function formatError(error: any) {
  // Log the error
  console.error('GraphQL Error:', error);
  
  // Return a formatted error
  return {
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
} 