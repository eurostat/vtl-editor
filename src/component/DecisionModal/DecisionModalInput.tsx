import React from "react";
import {createModal} from "react-modal-promise";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import {useSnackbar} from "notistack";

type DecisionModalInputProps = {
    open: any,
    close: any,
    title: string,
    text: string,
    acceptButton?: DecisionModalButton,
    cancelButton?: DecisionModalButton,
}


type DecisionModalButton = {
    value: string,
    color: "primary" | "secondary",
    className?: string
}

const DecisionModalInput = ({open, close, text, title, acceptButton, cancelButton}: DecisionModalInputProps) => {
    const {enqueueSnackbar} = useSnackbar();
    const onAcceptButton = () => {
        const inputEl = document.getElementById("inputVal") as HTMLInputElement;
        const inputValue: string = inputEl.value;
        if (!inputValue || !inputValue.trim()) {
            enqueueSnackbar(`Input cannot be empty`, {
                variant: "warning"
            });
        } else {
            close(inputValue);
        }
    };
    const onCancelButton = () => close(cancelButton?.value)


    const firstLetterUpperCase = (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return (
        <Modal show={open} dialogClassName="">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalBody>
                <div>
                    <input type="text" className="form-control" id="inputVal" aria-describedby="inputVal"
                           placeholder="Enter value"/>
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
};

DecisionModalInput.defaultProps = {
    acceptButton: {value: "accept", color: "primary"} as DecisionModalButton,
    cancelButton: {
        value: "cancel",
        color: "secondary",
        className: "default-button outline-button"
    } as DecisionModalButton
}


export const decisionModalInput = createModal(DecisionModalInput);