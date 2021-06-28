import React, {useState} from "react";
import {Button, Form, Modal, ModalBody, ModalFooter} from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import {createModal} from "react-modal-promise";
import {DecisionModalButton, DecisionModalInputProps} from "../main-view/decision-dialog/inputDialog";
import {useSnackbar} from "notistack";
import _ from "lodash";

export interface CredentialsDialogResult {
    username: string
    password: string
    domain: string
}

const CredentialsDialog = ({
                               open,
                               close,
                               text,
                               defaultValue,
                               title,
                               acceptButton,
                               cancelButton
                           }: DecisionModalInputProps) => {
    const {enqueueSnackbar} = useSnackbar();
    const [credentials, setCredentials] = useState<CredentialsDialogResult>(defaultValue);



    const onAcceptButton = () => {
        if (!credentials.username || !credentials.password || !credentials.domain) {
            enqueueSnackbar(`All fields are required`, {variant: "warning"});
            return;
        }
        close(credentials);
    };

    function onChangeLogin(event: any) {
        setCredentials(_.merge(_.cloneDeep(credentials), {username: event.target.value}));
    }

    function onChangePassword(event: any) {
        setCredentials(_.merge(_.cloneDeep(credentials), {password: event.target.value}));
    }

    function onChangeDomain(event: any) {
        setCredentials(_.merge(_.cloneDeep(credentials), {domain: event.target.value}));
    }

    const onCancelButton = () => close()

    const firstLetterUpperCase = (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return (
        <Modal show={open} dialogClassName="">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody style={{whiteSpace: "pre-line"}}>{text}</ModalBody>
            <ModalBody>
                <Form>
                    <Form.Group>
                        <Form.Label>User Name</Form.Label>
                        <Form.Control type="text" id="loginInput" aria-describedby="loginInput"
                                      defaultValue={defaultValue.username} onChange={onChangeLogin}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" id="passInput" aria-describedby="passInput"
                                      defaultValue={defaultValue.password} onChange={onChangePassword}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Domain</Form.Label>
                        <Form.Control type="text" id="domainInput" aria-describedby="domainInput"
                                      defaultValue={defaultValue.domain} onChange={onChangeDomain}/>
                    </Form.Group>
                </Form>
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

CredentialsDialog.defaultProps = {
    acceptButton: {value: "submit", color: "primary"} as DecisionModalButton,
    cancelButton: {
        value: "cancel",
        color: "secondary",
        className: "default-button outline-button"
    } as DecisionModalButton
}

export const credentialsDialog = createModal(CredentialsDialog);
