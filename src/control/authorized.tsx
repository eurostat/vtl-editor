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

const curriedAuthority = _.curry(checkAuthority);

export function useAuthority() {
    const authenticated = useSelector(loggedIn);
    const roles = useSelector(grantedRoles);
    return curriedAuthority(authenticated, roles);
}

export function useAdminRole() {
    const authority = useAuthority()
    return authority([ROLE_ADMIN], []);
}

export function useManagerRole() {
    const authority = useAuthority()
    return authority([ROLE_ADMIN, ROLE_MANAGER], []);
}

export function useUserRole() {
    const authority = useAuthority()
    return authority([ROLE_ADMIN, ROLE_MANAGER, ROLE_USER], []);
}
