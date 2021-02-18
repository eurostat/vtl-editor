import { createMuiTheme } from "@material-ui/core";

export const detailTableTheme = createMuiTheme({
    overrides: {
        MuiToolbar: {
            root: {
                backgroundColor: '#e0e0e0',
                minHeight: '48px !important',
            },
        },
    },
});