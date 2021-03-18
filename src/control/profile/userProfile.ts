import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { domainsDefaultSort, DomainTransfer } from "../domain/domain";
import { groupsDefaultSort, GroupTransfer } from "../group/group";
import { RoleEntity, rolesDefaultSort, processRolesTransfer } from "../role";

export interface UserProfileTransfer {
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
    inheritedRoles: string[],
    completeRoles?: RoleEntity[],
    domains: DomainTransfer[],
    inheritedDomains: DomainTransfer[],
    groups: GroupTransfer[],
    hasAllDomains: boolean,
}

export function processUserProfileTransfer(user: UserProfileTransfer): UserProfileTransfer {
    return _.flow(convertEntityDates, mergeName,
        completeRoles, completeDomains, sortCollections)(user);
}

function mergeName(user: UserProfileTransfer): UserProfileTransfer {
    user.name = `${user.lastName} ${user.firstName}`;
    return user;
}

function completeRoles(user: UserProfileTransfer): UserProfileTransfer {
    user.completeRoles = processRolesTransfer(user.roles);
    const inheritedRoles = processRolesTransfer(user.inheritedRoles)
        .map((role) => _.merge(_.cloneDeep(role), {inherited: true}));
    user.completeRoles.push(...inheritedRoles);
    return user;
}

function completeDomains(user: UserProfileTransfer): UserProfileTransfer {
    const inheritedDomains = user.inheritedDomains
        .map((domain) => _.merge(_.cloneDeep(domain), {inherited: true}));
    user.domains.push(...inheritedDomains);
    return user;
}

function sortCollections(user: UserProfileTransfer): UserProfileTransfer {
    if (user.completeRoles) user.completeRoles = rolesDefaultSort(user.completeRoles);
    if (user.domains) user.domains = domainsDefaultSort(user.domains);
    if (user.groups) user.groups = groupsDefaultSort(user.groups);
    return user;
}