/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: "YOUR_AZURE_AD_CLIENT_ID_PLACEHOLDER", // Must be registered in Azure Portal
    authority: "https://login.microsoftonline.com/common", // Defaults to 'common' for multi-tenant. Replace with tenant ID for single-tenant
    redirectUri: window.location.origin, // Dynamic redirect to current origin (e.g. http://localhost:5173)
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set to true if you are having issues on IE11 or Edge
  }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, offline_access) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: ["User.Read"]
};

/**
 * Add here the endpoints and scopes for retrieveing access tokens for protected web APIs.
 */
export const tokenRequest = {
  scopes: ["User.Read", "api://YOUR_BACKEND_API_CLIENT_ID_PLACEHOLDER/access_as_user"]
};
