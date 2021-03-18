import { UserManagerSettings } from "oidc-client";
import { createUserManager } from 'redux-oidc';

export const baseUrl = `${window.location.protocol}//${window.location.hostname}`
    + (window.location.port ? `:${window.location.port}` : '')
    + (process.env.REACT_APP_ROUTER_BASE ? `${process.env.REACT_APP_ROUTER_BASE}` : '');

const userManagerConfig: UserManagerSettings = {
    authority: process.env.REACT_APP_AUTHORITY_URL,
    client_id: process.env.REACT_APP_AUTHORITY_CLIENT_ID,
    redirect_uri: `${baseUrl}/callback`,
    response_type: "code",
    scope: "openid profile email",
    silent_redirect_uri: `${baseUrl}/silentRenew.html`,
    post_logout_redirect_uri: `${baseUrl}`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
    monitorSession: true,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;