import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../utility/store";
import {DatasetDefinitionTransfer} from "./dataset-definition/datasetDefinitionTransfer";
import {ProgramTransfer} from "./program/programTransfer";

export interface EditClientState {
    data: {
        definitions: DatasetDefinitionTransfer[],
        programs: ProgramTransfer[],
    },
    hasCredentials: boolean,
}

const initialState = {
    data: {
        definitions: [],
        programs: [],
    },
    hasCredentials: false,
} as EditClientState;

export const editClientSlice = createSlice({
    name: "editClient",
    initialState: initialState,
    reducers: {
        replaceDefinitions(state, action: PayloadAction<DatasetDefinitionTransfer[]>) {
            state.data.definitions = action.payload;
        },
        addDefinition(state, action: PayloadAction<DatasetDefinitionTransfer>) {
            const definitions = state.data.definitions.filter((item) => item.id !== action.payload.id);
            definitions.push(action.payload);
            state.data.definitions = sortByName(definitions);
        },
        expelDefinition(state, action: PayloadAction<DatasetDefinitionTransfer>) {
            const definitions = state.data.definitions.filter((item) => item.id !== action.payload.id);
            state.data.definitions = sortByName(definitions);
        },
        replacePrograms(state, action: PayloadAction<ProgramTransfer[]>) {
            state.data.programs = action.payload;
        },
        addProgram(state, action: PayloadAction<ProgramTransfer>) {
            const programs = state.data.programs.filter((item) => item.id !== action.payload.id);
            programs.push(action.payload);
            state.data.programs = sortByName(programs);
        },
        expelProgram(state, action: PayloadAction<ProgramTransfer>) {
            const programs = state.data.programs.filter((item) => item.id !== action.payload.id);
            state.data.programs = sortByName(programs);
        },
        credentialsChecked(state, action: PayloadAction<boolean>) {
            state.hasCredentials = action.payload;
        }
    }
});

const sortByName = (list: any[]) => {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export const {
    replaceDefinitions, addDefinition, expelDefinition,
    replacePrograms, addProgram, expelProgram, credentialsChecked
} = editClientSlice.actions;

export const definitionList = (state: RootState) => state.editClient.data.definitions;
export const programList = (state: RootState) => state.editClient.data.programs;
export const credentialsProvided = (state: RootState) => state.editClient.hasCredentials;

export default editClientSlice.reducer;
