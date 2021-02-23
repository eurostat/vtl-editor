import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultTheme } from "../editor/settings";
import { RootState } from "../utility/store";
import { MenuOption } from "./MenuOption";

const initialState = {
    theme: defaultTheme.code,
    sidePaneView: MenuOption.NONE,
    resizeTriggers: {
        sidePaneVisible: false,
        detailPaneVisible: false,
        detailPaneSize: 0
    }
} as ViewState;

export const viewSlice = createSlice({
    name: "view",
    initialState: initialState,
    reducers: {
        changeTheme(state, action: PayloadAction<string>) {
            state.theme = action.payload
        },
        switchSidePane(state, action: PayloadAction<MenuOption>) {
            if (state.sidePaneView !== action.payload) state.resizeTriggers.sidePaneVisible = true
            else state.resizeTriggers.sidePaneVisible = !state.resizeTriggers.sidePaneVisible
            state.sidePaneView = action.payload
        },
        showDetailPane(state, action: PayloadAction<boolean>) {
            state.resizeTriggers.detailPaneVisible = action.payload
        },
        toggleDetailPane(state) {
            state.resizeTriggers.detailPaneVisible = !state.resizeTriggers.detailPaneVisible
        },
        resizeDetailPane(state, action: PayloadAction<number>) {
            state.resizeTriggers.detailPaneSize = action.payload
        },
        showSidePane(state, action: PayloadAction<boolean>) {
            state.resizeTriggers.sidePaneVisible = action.payload
        },
        toggleSidePane(state) {
            state.resizeTriggers.sidePaneVisible = !state.resizeTriggers.sidePaneVisible
        }
    }
})

export interface ViewState {
    theme: string,
    sidePaneView: MenuOption,
    resizeTriggers: {
        sidePaneVisible: boolean,
        detailPaneVisible: boolean,
        detailPaneSize: number
    }
}

export const {
    changeTheme, switchSidePane,
    showDetailPane, toggleDetailPane, resizeDetailPane,
    showSidePane, toggleSidePane
} = viewSlice.actions;

export const appliedTheme = (state: RootState) => state.view.theme;
export const sidePaneView = (state: RootState) => state.view.sidePaneView;
export const detailPaneVisible = (state: RootState) => state.view.resizeTriggers.detailPaneVisible;
export const detailPaneSize = (state: RootState) => state.view.resizeTriggers.detailPaneSize;
export const sidePaneVisible = (state: RootState) => state.view.resizeTriggers.sidePaneVisible;
export const triggerResize = (state: RootState) => state.view.resizeTriggers;

export default viewSlice.reducer;