import React from "react";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import {createModal} from "react-modal-promise";

type DecisionModalProps = {
    open: any,
    close: any,
    title: string,
    text: string,
    buttons?: DecisionModalButton[]
}

export type DecisionModalButton = {
    key: string,
    text: string,
    color: "primary" | "secondary",
    className?: string
}

const DecisionDialog = ({open, close, text, title, buttons}: DecisionModalProps) => {
    return (
        <Modal show={open}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalFooter>
                {buttons?.map(button => {
                    return (<Button key={button.key} color={button.color} className={button.className}
                                    onClick={() => close(button.key)}>
                        {button.text}
                    </Button>)
                })}
            </ModalFooter>
        </Modal>
    );
};

DecisionDialog.defaultProps = {
    buttons: [
        {key: "yes", text: "Yes", color: "primary"} as DecisionModalButton,
        {key: "no", text: "No", color: "secondary"} as DecisionModalButton,
        {
            key: "cancel",
            text: "Cancel",
            color: "secondary",
            className: "default-button outline-button"
        } as DecisionModalButton
    ]
}

export const decisionDialog = createModal(DecisionDialog);

export const deleteEntityDialog = (type: string, name: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionDialog({
            title: "Warning",
            text: `Do you really want to delete ${descriptor} "${name}"?`,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();
    }
    return decision();
}