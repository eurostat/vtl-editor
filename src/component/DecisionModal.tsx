import React from "react";
import {createModal} from "react-modal-promise";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";

type DecisionModalProps = {
    open: any,
    close: any,
    title: string,
    text: string,
    settings?: DecisionModalSettings
}

type DecisionModalSettings = {
    buttons: DecisionModalButton[]
}

type DecisionModalButton = {
    value: string,
    color: "primary" | "secondary"
}

const DecisionModal = ({open, close, text, title, settings}: DecisionModalProps) => {
    return (
        <Modal show={open}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalFooter>
                {settings?.buttons.map(button => {
                    const buttonValue = button.value.charAt(0).toUpperCase() + button.value.slice(1);
                    return (<Button key={buttonValue} color={button.color} onClick={() => close(button.value)}>
                        {buttonValue}
                    </Button>)
                })}
            </ModalFooter>
        </Modal>
    );
};
DecisionModal.defaultProps = {
    settings: {
        buttons: [
            {value: "yes", color: "primary"} as DecisionModalButton,
            {value: "no", color: "secondary"} as DecisionModalButton,
            {value: "cancel", color: "secondary"} as DecisionModalButton
        ]
    }
}


export const decisionModal = createModal(DecisionModal);