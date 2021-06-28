import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached} from "@material-ui/icons";
import MaterialTable from "material-table";
import React, {useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {domainDetailedFolder, domainDetailedFolderPath} from "./domainRepoSlice";
import {detailTableTheme} from "../detailTableTheme";
import {NodeType} from "../tree-explorer/nodeType";
import {fetchDomainBinned, fetchDomainScripts} from "./domainRepoService";
import {TreeNode} from "react-treebeard";
import {processItemTransfer} from "../entity/storedItemTransfer";
import {useErrorNotice, useSuccessNotice, useWarningNotice} from "../../utility/useNotification";

const DomainFolderDetails = () => {
    const folder = useSelector(domainDetailedFolder);
    const [contents, setContents] = useState<any[]>([]);
    const path: string = useSelector(domainDetailedFolderPath);
    const showSuccess = useSuccessNotice();
    const showWarning = useWarningNotice();
    const showError = useErrorNotice();

    const loadContents = useCallback(async () => {
        if (!folder || !folder.childType) {
            showWarning("No folder selected. Select folder first.");
            return Promise.reject();
        }
        let call;
        switch (folder.childType) {
            case NodeType.SCRIPT: {
                call = fetchDomainScripts;
                break;
            }
            case NodeType.BINNED: {
                call = fetchDomainBinned;
                break;
            }
            default: {
                return;
            }
        }
        try {
            const response = await call(folder);
            if (response) {
                const received = response.map((node: TreeNode) => processItemTransfer(node.entity));
                setContents(received);
            }
        } catch (error) {
            showError("Failed to load contents.", error);
            return Promise.reject();
        }
    }, [folder, showWarning, showError]);

    useEffect(() => {
        loadContents().catch(() => {
            // ignored
        });
    }, [folder, loadContents]);

    const refreshContents = async () => {
        try {
            await loadContents();
            showSuccess("Contents refreshed successfully.");
        } catch {
        }
    }

    return (
        <MuiThemeProvider theme={detailTableTheme}>
            <MaterialTable title={`Folder path: ${path || "—"}`}
                           data={contents}
                           columns={[
                               {title: "Name", field: "name"},
                               {title: "Version", field: "version"},
                               {title: "Final", field: "finalizedCaption"},
                               {title: "Created on", field: "createDate"},
                               {title: "Modified on", field: "updateDate"},
                               {title: "Created by", field: "createdBy"},
                               {title: "Modified by", field: "updatedBy"},
                           ]}
                           options={{
                               showTitle: true,
                               toolbarButtonAlignment: "left"
                           }}
                           actions={[
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbar',
                                   onClick: refreshContents
                               },
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: refreshContents
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
};

export default DomainFolderDetails;
