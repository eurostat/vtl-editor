import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "./authorized";

export interface RoleEntity {
    id: string,
    name: string,
    ord: number,
}

export function rolesTransfer(roles: string[] | undefined): RoleEntity[] {
    return defaultRoles.filter((role) => roles?.includes(role.id));
}

export function rolesPayload(roles: RoleEntity[]): string[] {
    return roles.map((role) => role.id);
}

export function rolesDefaultSort(roles: RoleEntity[]): RoleEntity[] {
    return [...roles].sort((a, b) => a.ord - b.ord);
}

export const defaultRoles = [
    {
        id: ROLE_ADMIN,
        name: "Administrator",
        ord: 0
    },
    {
        id: ROLE_MANAGER,
        name: "Domain Manager",
        ord: 1
    },
    {
        id: ROLE_USER,
        name: "Domain User",
        ord: 2
    },
] as RoleEntity[];
