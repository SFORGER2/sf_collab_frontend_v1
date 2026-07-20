# OAuth 2.0 Setup Guide for SFCOLAB

## Google OAuth 2.0 Configuration

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (if you don't have one)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: "SFCOLAB"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google OAuth2 API"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name: "SFCOLAB Web Client"
   
5. **Configure OAuth Settings**
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)

   - **Authorized redirect URIs:**
     - `http://localhost:5173/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)

6. **Get Your Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Update your `.env` file with these values

### 2. Environment Configuration

Update your `.env` file with the actual Google OAuth credentials:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# API Configuration (when you have a backend)
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### 3. Security Considerations

1. **Client Secret**: In a production environment, the client secret should be stored on your backend server, not in the frontend environment variables.

2. **State Parameter**: The implementation uses a state parameter for CSRF protection.

3. **HTTPS**: Always use HTTPS in production for OAuth flows.

### 4. Backend Integration (TODO)

When you implement your backend, you'll need to:

1. **Create OAuth endpoints:**
   ```
   POST /api/auth/oauth/callback
   GET /api/auth/oauth/google
   ```

2. **Handle token exchange on the backend:**
   - Exchange authorization code for tokens
   - Validate tokens with Google
   - Create/update user in your database
   - Return your application's JWT token

3. **Update the AuthContext:**
   - Replace mock API calls with actual backend calls
   - Handle token refresh
   - Implement proper error handling

### 5. Testing OAuth Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the flow:**
   - Go to `/login` or `/signup`
   - Click the "Google" button
   - You should be redirected to Google's OAuth consent screen
   - After approval, you'll be redirected back to your app

### 6. Production Deployment

1. **Update environment variables** for production
2. **Add production domain** to Google OAuth settings
3. **Implement proper backend** for security
4. **Enable HTTPS**

### 7. Additional OAuth Providers

The architecture supports adding more OAuth providers. To add Facebook, GitHub, etc.:

1. **Add provider config** to `simpleOAuthService.js`
2. **Implement provider-specific methods**
3. **Add provider buttons** to login/signup forms
4. **Update AuthContext** to handle multiple providers

## Current Implementation Status

✅ **Completed:**
- OAuth service architecture
- Google OAuth URL generation
- State parameter security
- OAuth callback handling
- Frontend integration
- Error handling
- Loading states

⏳ **TODO (Backend Required):**
- Secure token exchange
- User database integration
- JWT token generation
- Token refresh mechanism
- Rate limiting
- Session management

## File Structure

```
src/
├── services/
│   └── simpleOAuthService.js    # Simple OAuth service and utilities
├── contexts/
│   └── AuthContext.jsx          # Authentication context with OAuth
├── components/
│   ├── auth/
│   │   ├── Login.jsx            # Login with OAuth integration
│   │   ├── SignUp.jsx           # SignUp with OAuth integration
│   │   └── OAuthCallback.jsx    # OAuth callback handler
│   └── ProtectedRoute.jsx       # Route protection
└── router/
    └── routes.jsx               # Routes with OAuth callback
```

This implementation provides a solid foundation for OAuth 2.0 authentication in your React application!
