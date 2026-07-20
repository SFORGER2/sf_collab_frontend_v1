// Alternative OAuth implementation using implicit flow for development
export const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirectUri: window.location.origin + '/auth/callback',
    scope: 'openid email profile',
    responseType: 'token id_token', // Using implicit flow instead of authorization code
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  }
};

export class SimpleOAuthService {
  // Generate a random state parameter for security
  static generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Store state in sessionStorage for verification
  static storeState(state) {
    sessionStorage.setItem('oauth_state', state);
  }

  // Verify state parameter
  static verifyState(state) {
    const storedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    return storedState === state;
  }

  // Build Google OAuth URL for implicit flow
  static buildGoogleAuthUrl() {
    const state = this.generateState();
    this.storeState(state);
    
    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.google.clientId,
      redirect_uri: OAUTH_CONFIG.google.redirectUri,
      scope: OAUTH_CONFIG.google.scope,
      response_type: OAUTH_CONFIG.google.responseType,
      state: state,
      prompt: 'select_account',
      nonce: this.generateState(), // Required for id_token
    });

    return `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`;
  }

  // Parse tokens from URL hash (implicit flow)
  static parseTokensFromHash(hash) {
    const params = new URLSearchParams(hash.substring(1));
    return {
      access_token: params.get('access_token'),
      id_token: params.get('id_token'),
      state: params.get('state'),
      token_type: params.get('token_type'),
      expires_in: params.get('expires_in'),
    };
  }

  // Decode JWT token (simple implementation)
  static decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Handle OAuth callback for implicit flow
static handleOAuthCallback() {
  try {
    const hash = window.location.hash;
    if (!hash) {
      throw new Error('No hash found in URL');
    }

    const tokens = this.parseTokensFromHash(hash);
    
    if (!tokens.access_token || !tokens.id_token) {
      throw new Error('Missing tokens in callback');
    }

    if (!this.verifyState(tokens.state)) {
      throw new Error('Invalid state parameter');
    }

    // Decode the ID token to get user info
    const userInfo = this.decodeJWT(tokens.id_token);
    
    if (!userInfo) {
      throw new Error('Failed to decode user info');
    }

    // Save tokens and user info for API / WebSocket usage
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('id_token', tokens.id_token);
    localStorage.setItem('user', JSON.stringify({
      id: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      name: userInfo.name,
      picture: userInfo.picture,
      emailVerified: userInfo.email_verified
    }));

    // Clear the hash from URL
    window.history.replaceState(null, null, window.location.pathname);

    return {
      success: true,
      tokens,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        emailVerified: userInfo.email_verified,
      }
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

  // Start OAuth flow
  static startOAuthFlow() {
    const authUrl = this.buildGoogleAuthUrl();
    window.location.href = authUrl;
  }
}
