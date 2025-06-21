/**
 * Mock Service Worker (MSW) Test Server
 * 
 * Setter opp API mocking for testing med realistic responses
 */

// Placeholder for MSW server
// Dette kan utvides til å bruke ekte MSW når det er behov for det
export const server = {
  listen: (options?: any) => {
    console.log('Mock server listening...', options);
  },
  resetHandlers: () => {
    console.log('Mock server handlers reset');
  },
  close: () => {
    console.log('Mock server closed');
  },
  use: (...handlers: any[]) => {
    console.log('Using handlers:', handlers.length);
  }
};

// Eksport handlers for gjenbruk
export const handlers = [
  // API handlers vil bli lagt til her
];

export default server; 