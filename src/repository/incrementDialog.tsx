import {useSnackbar} from "notistack";
import React, {useEffect, useState} from "react";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import {createModal} from "react-modal-promise";
import {DecisionModalButton, DecisionModalInputProps} from "../main-view/decision-dialog/inputDialog";
import {DEFAULT_VERSION} from "../editor/editorFile";
import {MINOR_VERSION_REGEX, VERSION_REGEX} from "./entity/incrementVersionPayload";

export interface IncrementDialogResult {
    version: string
    squash: boolean
}

const IncrementDialog = ({
                           open,
                           close,
                           text,
                           defaultValue,
                           title,
                           acceptButton,
                           cancelButton
                       }: DecisionModalInputProps) => {

    const [previousMinor, setPreviousMinor] = useState(DEFAULT_VERSION);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (!!defaultValue && VERSION_REGEX.test(defaultValue)) {
            const parts = defaultValue.split(".");
            const minor = parseInt(parts[1], 10) + 1;
            setPreviousMinor(parts[0] + "." + minor + ".0");
        }
    }, [defaultValue]);

    const onAcceptButton = () => {
        const inputEl = document.getElementById("nameInput") as HTMLInputElement;
        const version = !!inputEl.value ? inputEl.value.trim() : "";
        if (version === "") {
            enqueueSnackbar(`Version cannot be empty`, {variant: "warning"});
            return;
        }
        if (!MINOR_VERSION_REGEX.test(version)) {
            enqueueSnackbar(`Version has to match the pattern X.Y.0`, {variant: "warning"});
            return;
        }
        if (version.localeCompare(previousMinor, undefined, {numeric: true}) < 0) {
            enqueueSnackbar(`Version has to be greater than current`, {variant: "warning"});
            return;
        }
        close({version: version, squash: false} as IncrementDialogResult);
    };

    const onCancelButton = () => close();

    const firstLetterUpperCase = (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return (
        <Modal show={open} dialogClassName="">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody style={{whiteSpace: "pre-line"}}>{text}</ModalBody>
            <ModalBody>
                <div>
                    <input type="text" className="form-control" id="nameInput" aria-describedby="nameInput"
                           placeholder="Enter value" defaultValue={previousMinor}/>
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

IncrementDialog.defaultProps = {
    acceptButton: {value: "increment", color: "primary"} as DecisionModalButton,
    cancelButton: {
        value: "cancel",
        color: "secondary",
        className: "default-button outline-button"
    } as DecisionModalButton
}

export const incrementDialog = createModal(IncrementDialog);