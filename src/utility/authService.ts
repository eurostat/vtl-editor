import {RequestMethod, sendDirectRequest} from "../web-api/apiService";
import {randomHex, signJWT} from "./keystoreService";
import {readState} from "./store";
import {idToken} from "./authSlice";

export const TOKEN_URL = process.env.REACT_APP_AUTH_URL + "/token";

export async function fetchAccessToken() {
    const now = Date.now();
    const assertionPayload = {
        "iss": process.env.REACT_APP_AUTH_CLIENT_ID,
        "sub": process.env.REACT_APP_AUTH_CLIENT_ID,
        "aud": TOKEN_URL,
        "jti": randomHex(64),
        "exp": now + (5 * 60 * 1000),
        "iat": now,
        "id_token": readState(idToken)
    };
    const assertionJwt = signJWT(assertionPayload);
    const headers = {"Content-Type": "application/x-www-form-urlencoded"};
    const queryParams = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "client_id": process.env.REACT_APP_AUTH_CLIENT_ID,
        "assertion": assertionJwt,
        "scope": process.env.REACT_APP_AUTH_SCOPE,
        "audience": process.env.REACT_APP_AUTH_AUDIENCE
    }
    const response = await sendDirectRequest(RequestMethod.POST, TOKEN_URL, queryParams, headers, undefined,"include");
    if (response && response.data && response.data.access_token) return response.data.access_token;
    return Promise.reject();
}
