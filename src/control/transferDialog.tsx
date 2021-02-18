import { Tooltip } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import { createModal } from "react-modal-promise";
import "./managementView.scss";
import TransferList from "./transferList";

type TransferDialogProps = {
    open: any,
    close: any,
    title: string,
    singularItem: string,
    pluralItem: string,
    selected: any[],
    fetchAvailable: () => Promise<any[]>,
    captionField?: string,
    identifierField?: string,
}

const TransferDialog = ({
                            open,
                            close,
                            title,
                            singularItem,
                            pluralItem,
                            selected,
                            fetchAvailable,
                            captionField,
                            identifierField
                        }: TransferDialogProps) => {
    const [available, setAvailable] = useState<any[]>([]);
    const [comitted, setComitted] = useState<any[] | undefined>(undefined);

    const loadAvailable = useCallback(async () => {
        try {
            const received = await fetchAvailable();
            const selectedIds = selected.map((item) => identifierField ? item[identifierField] : item);
            const unique = received.filter((item) => !selectedIds.includes(identifierField ? item[identifierField] : item));
            setAvailable(unique);
        } catch {
        }
    }, [fetchAvailable, selected, identifierField])

    useEffect(() => {
        loadAvailable().then();
    }, [loadAvailable])

    useEffect(() => {
        if (comitted === undefined) setComitted(selected);
    }, [comitted, selected])

    const confirmEdit = () => {
        close(comitted);
    }

    const cancelEdit = () => close();

    return (
        <Modal show={open} dialogClassName="" size="lg">
            <ModalHeader className="transfer-dialog-title">{title}</ModalHeader>
            <ModalBody>
                <TransferList singularItem={singularItem} pluralItem={pluralItem}
                              selected={selected} commitSelected={setComitted} available={available}
                              captionField={captionField} identifierField={identifierField}/>
            </ModalBody>
            <ModalFooter>
                <Tooltip title="Confirm changes" placement="top" arrow>
                    <Button key="done" color="primary" onClick={confirmEdit}>
                        Done
                    </Button>
                </Tooltip>
                <Tooltip title="Cancel changes" placement="top" arrow>
                    <Button key="cancel" color="secondary" onClick={cancelEdit}>
                        Cancel
                    </Button>
                </Tooltip>
            </ModalFooter>
        </Modal>
    );
}

export const transferDialog = createModal(TransferDialog);