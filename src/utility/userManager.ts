import { UserManagerSettings } from "oidc-client";
import { createUserManager } from 'redux-oidc';

export const baseUrl = `${window.location.protocol}//${window.location.hostname}`
    + (window.location.port ? `:${window.location.port}` : '')
    + (process.env.REACT_APP_ROUTER_BASE ? `${process.env.REACT_APP_ROUTER_BASE}` : '');

const userManagerConfig: UserManagerSettings = {
    authority: process.env.REACT_APP_AUTH_URL,
    client_id: process.env.REACT_APP_AUTH_CLIENT_ID,
    redirect_uri: `${baseUrl}/callback`,
    response_type: process.env.REACT_APP_AUTH_RESPONSE || "code",
    scope: process.env.REACT_APP_AUTH_SCOPE || "openid profile email",
    silent_redirect_uri: `${baseUrl}/silentRenew.html`,
    post_logout_redirect_uri: `${baseUrl}`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
    monitorSession: true,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
