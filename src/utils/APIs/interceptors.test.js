import { describe, expect, it } from 'vitest';

import { requestInterceptor } from './interceptors';

describe('requestInterceptor', () => {
  it('injects bearer token from localStorage when Authorization is missing', () => {
    localStorage.setItem('access_token', 'abc123');

    const config = {
      headers: {},
    };

    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not override explicit Authorization header', () => {
    localStorage.setItem('access_token', 'abc123');

    const config = {
      headers: {
        Authorization: 'Bearer existing-token',
      },
    };

    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer existing-token');
  });
});
