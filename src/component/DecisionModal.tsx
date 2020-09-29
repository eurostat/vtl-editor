import React from "react";
import {createModal} from "react-modal-promise";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";


const DecisionModal = ({open, close, text, title}: any) => {
    const save = () => close(true);
    const cancel = () => close(false);

    return (
        <Modal show={open}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={save}>
                    Yes
                </Button>{" "}
                <Button color="secondary" onClick={cancel}>
                    No
                </Button>
            </ModalFooter>
        </Modal>
    );
};


export const decisionModal = createModal(DecisionModal);