import { UserManagerSettings } from "oidc-client";
import { createUserManager } from 'redux-oidc';

export const baseUrl = process.env.REACT_APP_ROUTER_BASE
    || `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;

const userManagerConfig: UserManagerSettings  = {
  authority: process.env.REACT_APP_AUTHORITY_URL,
  client_id: "vrm-frontend",
  redirect_uri: `${baseUrl}/callback`,
  response_type: "code",
  scope: "openid profile",
  silent_redirect_uri: `${baseUrl}/silentRenew.html`,
  post_logout_redirect_uri: `${baseUrl}`,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
  monitorSession: true,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;