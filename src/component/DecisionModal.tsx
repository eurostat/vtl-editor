import React from "react";
import {createModal} from "react-modal-promise";
import {Button, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";


const DecisionModal = ({open, close, text, title}: any) => {
    const save = () => close("yes");
    const no = () => close("no");
    const cancel = () => close("cancel");

    return (
        <Modal show={open}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={save}>
                    Yes
                </Button>{" "}
                <Button color="secondary" onClick={no}>
                    No
                </Button>
                <Button color="secondary" onClick={cancel}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};


export const decisionModal = createModal(DecisionModal);