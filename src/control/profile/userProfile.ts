import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { domainsDefaultSort, DomainTransfer } from "../domain/domain";
import { groupsDefaultSort, GroupTransfer } from "../group/group";
import { RoleEntity, rolesDefaultSort, rolesTransfer } from "../role";

export interface UserProfileTransfer {
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    groups?: GroupTransfer[]
}

export function processUserProfileTransfer(user: UserProfileTransfer): UserProfileTransfer {
    return _.flow(convertEntityDates, mergeName, completeRoles, sortCollections)(user);
}

function mergeName(user: UserProfileTransfer): UserProfileTransfer {
    user.name = `${user.lastName} ${user.firstName}`;
    return user;
}

function completeRoles(user: UserProfileTransfer): UserProfileTransfer {
    user.completeRoles = rolesTransfer(user.roles);
    return user;
}

function sortCollections(user: UserProfileTransfer): UserProfileTransfer {
    if (user.completeRoles) user.completeRoles = rolesDefaultSort(user.completeRoles);
    if (user.domains) user.domains = domainsDefaultSort(user.domains);
    if (user.groups) user.groups = groupsDefaultSort(user.groups);
    return user;
}