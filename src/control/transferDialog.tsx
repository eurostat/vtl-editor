import { Tooltip } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import { createModal } from "react-modal-promise";
import { IdentifiedItem } from "./itemList";
import "./managementView.scss";
import TransferList from "./transferList";

export interface TransferDialogProps<T extends IdentifiedItem> {
    open: any,
    close: any,
    title: string,
    singularItem: string,
    pluralItem: string,
    selected: T[],
    fetchAvailable: () => Promise<T[]>,
    captionField?: string,
    captionGet?: (item: T) => string,
}

function TransferDialog<T extends IdentifiedItem>({
                                                                     open,
                                                                     close,
                                                                     title,
                                                                     singularItem,
                                                                     pluralItem,
                                                                     selected,
                                                                     fetchAvailable,
                                                                     captionField,
                                                                     captionGet,
                                                                 }: TransferDialogProps<T>) {
    const [available, setAvailable] = useState<any[]>([]);
    const [committed, setCommitted] = useState<any[] | undefined>(undefined);

    const loadAvailable = useCallback(async () => {
        try {
            const received = await fetchAvailable();
            const selectedIds = selected.map((item) => item.id);
            const unique = received.filter((item) => !selectedIds.includes(item.id));
            setAvailable(unique);
        } catch {
        }
    }, [fetchAvailable, selected])

    useEffect(() => {
        loadAvailable().then();
    }, [loadAvailable])

    useEffect(() => {
        if (committed === undefined) setCommitted(selected);
    }, [committed, selected])

    const confirmEdit = () => {
        close(committed);
    }

    const cancelEdit = () => close();

    return (
        <Modal show={open} dialogClassName="" size="lg">
            <ModalHeader className="transfer-dialog-title">{title}</ModalHeader>
            <ModalBody>
                <TransferList singularItem={singularItem} pluralItem={pluralItem}
                              selected={selected} commitSelected={setCommitted} available={available}
                              captionField={captionField} captionGet={captionGet}/>
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

export const transferDialog = createModal<TransferDialogProps<any>, any>(TransferDialog);