export function initializeDataLoaders() {
  return {
    // Basic placeholder for data loaders
    // In a real implementation, you would use DataLoader library
    userLoader: {
      load: (id: string) => Promise.resolve({ id, name: `User ${id}` })
    }
  };
} 