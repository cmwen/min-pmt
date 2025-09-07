import { describe, it, expect } from 'vitest';
import { greet, sum } from '../src/index';

describe('core', () => {
  it('greet returns greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  it('sum adds numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
