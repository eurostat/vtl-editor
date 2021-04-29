import React from "react";
import {createMuiTheme} from "@material-ui/core";
import {Action} from "material-table";

export type MatTableIconPosition = "auto" | "toolbar" | "toolbarOnSelect" | "row";

export function materialTableAction<RowData extends object>(icon: React.ReactElement,
                                                           position: MatTableIconPosition,
                                                           onClick: (event: any, data: RowData | RowData[]) => void,
                                                           tooltip?: string) {
    return {
        icon: () => icon,
        tooltip: tooltip,
        position: position,
        onClick: onClick
    } as Action<RowData>
}

export function materialTableTitle(singularTitle: string, pluralTitle: string, count: number) {
    return (
        <div className="table-title">
            <h6>{count}</h6>
            <h6>{count === 1 ? singularTitle : pluralTitle}</h6>
        </div>
    );
}

export const materialTableTheme = createMuiTheme({
    overrides: {
        MuiToolbar: {
            root: {
                backgroundColor: '#e0e0e0',
                minHeight: '48px !important',
            },
            gutters: {
                paddingLeft: '8px !important',
            },
        },
        MuiTableCell: {
            root: {
                padding: "10px",
            },
        },
        MuiIconButton: {
            root: {
                padding: "10px",
            },
        },
    },
});