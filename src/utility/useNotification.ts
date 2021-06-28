import {useSnackbar} from "notistack";
import {useCallback} from "react";

export const useSuccessNotice = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback((message: string) => {
        return enqueueSnackbar(message, {variant: "success"});
    }, [enqueueSnackbar]);
}

export const useInfoNotice = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback( (message: string) => {
        return enqueueSnackbar(message, {variant: "info"});
    }, [enqueueSnackbar]);
}

export const useWarningNotice = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback( (message: string) => {
        return enqueueSnackbar(message, {variant: "warning"});
    }, [enqueueSnackbar]);
}

export const useErrorNotice = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback( (message: string, error?: string) => {
        const errorDetail = error ? ` ${error}` : "";
        return enqueueSnackbar(`${message}${errorDetail}`, {variant: "error"});
    }, [enqueueSnackbar]);
}
