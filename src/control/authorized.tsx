import _ from "lodash";
import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { grantedRoles, loggedIn } from "../utility/authSlice";

export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_MANAGER = "ROLE_MANAGER";
export const ROLE_USER = "ROLE_USER";
export const ROLES_MANAGER = [ROLE_ADMIN, ROLE_MANAGER];
export const ROLES_USER = [ROLE_ADMIN, ROLE_MANAGER, ROLE_USER];

const hasAnyAuthority = (roles: string[], required: string[]) => {
    if (!required || required.length === 0) return true;
    if (roles && roles.length !== 0) {
        return required.some(auth => roles.includes(auth));
    }
    return false;
};

const hasAllAuthorities = (roles: string[], required: string[]) => {
    if (!required || required.length === 0) return true;
    if (roles && roles.length !== 0) {
        return required.every(auth => roles.includes(auth));
    }
    return false;
}

export type AuthorizedProps = {
    anyAuthority?: string[],
    allAuthorities?: string[],
}

const Authorized: FunctionComponent<AuthorizedProps> = ({
                                                            anyAuthority = [],
                                                            allAuthorities = [],
                                                            children
                                                        }) => {
    const authenticated = useSelector(loggedIn);
    const roles = useSelector(grantedRoles);

    return (
        <>
            {
                (
                    authenticated
                    && hasAllAuthorities(roles, allAuthorities)
                    && hasAnyAuthority(roles, anyAuthority)
                )
                    ? <>{children}</>
                    : null
            }
        </>
    );
}

export default Authorized;

const checkAuthority = (authenticated: boolean, roles: string[],
                        anyAuthority: string[], allAuthorities: string[],
                        component: any) => {
    return (authenticated
        && hasAllAuthorities(roles, allAuthorities)
        && hasAnyAuthority(roles, anyAuthority))
        ? component
        : null;
}

const curriedCheckAuthority = _.curry(checkAuthority);

export function useAuthorityCheck() {
    const authenticated = useSelector(loggedIn);
    const roles = useSelector(grantedRoles);
    return curriedCheckAuthority(authenticated, roles);
}

export function useVisitorRole() {
    const authority = useAuthorityCheck()
    return authority([], []);
}

export function useAdminRole() {
    const authority = useAuthorityCheck()
    return authority([ROLE_ADMIN], []);
}

export function useManagerRole() {
    const authority = useAuthorityCheck()
    return authority([ROLE_ADMIN, ROLE_MANAGER], []);
}

export function useUserRole() {
    const authority = useAuthorityCheck()
    return authority([ROLE_ADMIN, ROLE_MANAGER, ROLE_USER], []);
}

const confirmAuthority = (authenticated: boolean, roles: string[],
                        authority: string) => {
    return (authenticated && hasAllAuthorities(roles, [authority]));
}

const curriedConfirmAuthority = _.curry(confirmAuthority);

export function useRole() {
    const authenticated = useSelector(loggedIn);
    const roles = useSelector(grantedRoles);
    return curriedConfirmAuthority(authenticated, roles);
}
