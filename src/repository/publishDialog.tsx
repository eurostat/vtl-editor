import {useSnackbar} from "notistack";
import React, {useCallback, useEffect, useState} from "react";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import {createModal} from "react-modal-promise";
import {CircularProgress, TextField} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {DomainTransfer} from "../control/domain/domain";
import {fetchProfileDomains} from "../control/controlService";

type DecisionModalInputProps = {
    open: any,
    close: any,
    title: string,
    text: string,
    defaultValue?: string,
    acceptButton?: DecisionModalButton,
    cancelButton?: DecisionModalButton,
}

type DecisionModalButton = {
    value: string,
    color: "primary" | "secondary",
    className?: string
}

export interface PublishDialogResult {
    name: string
    domainId: number
    domainName: string
}

const PublishDialog = ({
                           open,
                           close,
                           text,
                           defaultValue,
                           title,
                           acceptButton,
                           cancelButton
                       }: DecisionModalInputProps) => {

    const [domains, setDomains] = useState<DomainTransfer[]>([]);
    const [domain, setDomain] = useState<DomainTransfer | null>(null);
    const [domainsLoading, setdomainsLoading] = useState<boolean>(false);
    const {enqueueSnackbar} = useSnackbar();

    const loadDomains = useCallback(async () => {
        setdomainsLoading(true);
        return fetchProfileDomains()
            .then((fetched) => {
                setdomainsLoading(false);
                return fetched;
            })
            .catch(() => {
                setdomainsLoading(false);
                enqueueSnackbar(`Failed to load domains.`, {variant: "error"});
                return Promise.reject();
            });
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadDomains()
            .then((loaded) => setDomains(loaded))
            .catch(() => {
            });
    }, [loadDomains]);


    const onAcceptButton = () => {
        const nameInnputEl = document.getElementById("nameInput") as HTMLInputElement;
        const name: string = nameInnputEl.value;
        if (!name || !name.trim()) {
            enqueueSnackbar(`Name cannot be empty`, {variant: "warning"});
            return;
        }
        if (!domain) {
            enqueueSnackbar(`Domain cannot be empty`, {variant: "warning"});
            return;
        }
        close({name: name, domainId: domain.id, domainName: domain.name} as PublishDialogResult);
    };

    const onCancelButton = () => close()

    const firstLetterUpperCase = (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }


    const onDomainChange = (event: any, newDomain: DomainTransfer | null) => {
        setDomain(newDomain);
    };

    return (
        <Modal show={open} dialogClassName="">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody style={{whiteSpace: "pre-line"}}>{text}</ModalBody>
            <ModalBody>
                <div>
                    <input type="text" className="form-control" id="nameInput" aria-describedby="nameInput"
                           placeholder="Enter value" defaultValue={defaultValue}/>
                </div>
                <div>
                    <Autocomplete
                        id="domain-select"
                        options={domains}
                        className="sdmx-autocomplete"
                        value={domain}
                        getOptionLabel={(option: DomainTransfer) => option.name}
                        getOptionSelected={(option: DomainTransfer, value: DomainTransfer) => option.id === value.id}
                        loading={domainsLoading}
                        onChange={onDomainChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Domain"
                                variant="outlined"
                                margin="normal"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {domainsLoading ?
                                                <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button key={acceptButton?.value} color={acceptButton?.color} className={acceptButton?.className}
                        onClick={onAcceptButton}>
                    {firstLetterUpperCase(acceptButton!.value)}
                </Button>
                <Button key={cancelButton?.value} color={cancelButton?.color} className={cancelButton?.className}
                        onClick={onCancelButton}>
                    {firstLetterUpperCase(cancelButton!.value)}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

PublishDialog.defaultProps = {
    acceptButton: {value: "publish", color: "primary"} as DecisionModalButton,
    cancelButton: {
        value: "cancel",
        color: "secondary",
        className: "default-button outline-button"
    } as DecisionModalButton
}

export const publishDialog = createModal(PublishDialog);