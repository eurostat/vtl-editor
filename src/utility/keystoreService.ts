import {clearSessionStorage, fromSessionStorage, toSessionStorage} from "./browserStorage";
import {KEYUTIL, stob64u, KJUR} from "jsrsasign";

export enum KeystoreItem {
    PRIVATE = "prvkey",
    PUBLIC = "pubkey",
}

export function generateKeys() {
    clearKeys();
    const keyPair = KEYUTIL.generateKeypair('EC', 'secp256r1');
    toSessionStorage(KeystoreItem.PRIVATE, KEYUTIL.getJWKFromKey(keyPair['prvKeyObj']));
    toSessionStorage(KeystoreItem.PUBLIC, KEYUTIL.getJWKFromKey(keyPair['pubKeyObj']));
}

export function clearKeys() {
    clearSessionStorage(KeystoreItem.PRIVATE);
    clearSessionStorage(KeystoreItem.PUBLIC);
}

function getKey(type: KeystoreItem) {
    let  key = fromSessionStorage(type);
    if (!key) {
        generateKeys();
        key = fromSessionStorage(type);
    }
    return KEYUTIL.getKey(key);
}

export const publicKey = () => getKey(KeystoreItem.PUBLIC);

export const publicKeyEncoded = () => stob64u(JSON.stringify(KEYUTIL.getJWKFromKey(publicKey())));

export const privateKey = () => getKey(KeystoreItem.PRIVATE);

export const randomHex = (n: number) => KJUR.crypto.Util.getRandomHexOfNbytes(n);

export function signJWT(jwtPayload: any) {
    const jwtKey: any = privateKey();
    const jwtHeader = {alg: 'ES256', cty: 'JWT'};
    return KJUR.jws.JWS.sign('ES256', jwtHeader, jwtPayload, jwtKey);
}
