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
        id: "administrator",
        name: "Administrator",
        ord: 0
    },
    {
        id: "domain_manager",
        name: "Domain Manager",
        ord: 1
    },
    {
        id: "domain_user",
        name: "Domain User",
        ord: 2
    },
] as RoleEntity[];
