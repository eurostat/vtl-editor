import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from "./authorized";

export interface RoleEntity {
    id: string,
    name: string,
    ord: number,
    inherited: boolean,
}

export const roleInheritedCaption = (role: RoleEntity) => `${role.name}${role.inherited ? " *" : ""}`;

export function processRolesTransfer(roles: string[] | undefined): RoleEntity[] {
    return defaultRoles.filter((role) => roles?.includes(role.id));
}

export function toRolesPayload(roles: RoleEntity[]): string[] {
    return roles.map((role) => role.id);
}

export function rolesDefaultSort(roles: RoleEntity[]): RoleEntity[] {
    return [...roles].sort((a, b) => a.ord - b.ord);
}

export const defaultRoles = [
    {
        id: ROLE_ADMIN,
        name: "Administrator",
        ord: 0,
        inherited: false,
    },
    {
        id: ROLE_MANAGER,
        name: "Domain Manager",
        ord: 1,
        inherited: false,
    },
    {
        id: ROLE_USER,
        name: "Domain User",
        ord: 2,
        inherited: false,
    },
] as RoleEntity[];
