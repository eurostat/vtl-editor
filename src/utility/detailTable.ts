import { createMuiTheme } from "@material-ui/core";

export const muiTheme = createMuiTheme({
    overrides: {
        MuiToolbar: {
            root: {
                backgroundColor: '#f5f5f5',
            },
        },
    },
});