import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../utility/store";
import { DomainTransfer } from "./domain/domain";
import { GroupTransfer } from "./group/group";
import { UserTransfer } from "./user/user";

const initialState = {
    data: {
        domains: [],
        groups: [],
        users: []
    },
    view: {
        domainEdit: false,
        groupEdit: false,
        userEdit: false,
    },
    edit: {
        domainId: undefined,
        groupId: undefined,
        userId: undefined,
    }
} as ControlState;

export const controlSlice = createSlice({
    name: "control",
    initialState: initialState,
    reducers: {
        replaceDomains(state, action: PayloadAction<DomainTransfer[]>) {
            state.data.domains = action.payload;
        },
        addDomain(state, action: PayloadAction<DomainTransfer>) {
            const domains = state.data.domains.filter((item) => item.id !== action.payload.id);
            domains.push(action.payload);
            state.data.domains = sortByName(domains);
        },
        expelDomain(state, action: PayloadAction<DomainTransfer>) {
            const domains = state.data.domains.filter((item) => item.id !== action.payload.id);
            state.data.domains = sortByName(domains);
        },
        startDomainEdit(state, action: PayloadAction<number | undefined>) {
            state.view.domainEdit = true;
            state.edit.domainId = action.payload;
        },
        finishDomainEdit(state) {
            state.view.domainEdit = false;
            state.edit.domainId = undefined;
        },
        replaceGroups(state, action: PayloadAction<GroupTransfer[]>) {
            state.data.groups = action.payload;
        },
        addGroup(state, action: PayloadAction<GroupTransfer>) {
            const groups = state.data.groups.filter((item) => item.id !== action.payload.id);
            groups.push(action.payload);
            state.data.groups = sortByName(groups);
        },
        expelGroup(state, action: PayloadAction<GroupTransfer>) {
            const groups = state.data.groups.filter((item) => item.id !== action.payload.id);
            state.data.groups = sortByName(groups);
        },
        startGroupEdit(state, action: PayloadAction<number | undefined>) {
            state.view.groupEdit = true;
            state.edit.groupId = action.payload;
        },
        finishGroupEdit(state) {
            state.view.groupEdit = false;
            state.edit.groupId = undefined;
        },
        replaceUsers(state, action: PayloadAction<UserTransfer[]>) {
            state.data.users = action.payload;
        },
        addUser(state, action: PayloadAction<UserTransfer>) {
            const users = state.data.users.filter((item) => item.id !== action.payload.id);
            users.push(action.payload);
            state.data.users = sortByName(users);
        },
        expelUser(state, action: PayloadAction<UserTransfer>) {
            const users = state.data.users.filter((item) => item.id !== action.payload.id);
            state.data.users = sortByName(users);
        },
        startUserEdit(state, action: PayloadAction<number | undefined>) {
            state.view.userEdit = true;
            state.edit.userId = action.payload;
        },
        finishUserEdit(state) {
            state.view.userEdit = false;
            state.edit.userId = undefined;
        },
    }
});

const sortByName = (list: any[]) => {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export interface ControlState {
    data: {
        domains: DomainTransfer[],
        groups: GroupTransfer[],
        users: UserTransfer[],
    },
    view: {
        domainEdit: boolean,
        groupEdit: boolean,
        userEdit: boolean
    },
    edit: {
        domainId: number | undefined,
        groupId: number | undefined,
        userId: number | undefined,
    }
}

export const {
    replaceDomains, addDomain, expelDomain, startDomainEdit, finishDomainEdit,
    replaceGroups, addGroup, expelGroup, startGroupEdit, finishGroupEdit,
    replaceUsers, addUser, expelUser, startUserEdit, finishUserEdit,
} = controlSlice.actions;

export const domainList = (state: RootState) => state.control.data.domains;
export const domainEdit = (state: RootState) => state.control.view.domainEdit;
export const editedDomain = (state: RootState) => state.control.edit.domainId;
export const groupList = (state: RootState) => state.control.data.groups;
export const groupEdit = (state: RootState) => state.control.view.groupEdit;
export const editedGroup = (state: RootState) => state.control.edit.groupId;
export const userList = (state: RootState) => state.control.data.users;
export const userEdit = (state: RootState) => state.control.view.userEdit;
export const editedUser = (state: RootState) => state.control.edit.userId;

export default controlSlice.reducer;