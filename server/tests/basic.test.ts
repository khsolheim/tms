/// <reference types="jest" />

describe('Basic Test Setup', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test async operations', async () => {
    const asyncOperation = () => Promise.resolve('success');
    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  it('should test error throwing', () => {
    const errorFunction = () => {
      throw new Error('Test error');
    };
    expect(errorFunction).toThrow('Test error');
  });
}); 