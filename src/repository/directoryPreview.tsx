import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached} from "@material-ui/icons";
import MaterialTable from "material-table";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {detailTableTheme} from "./detailTableTheme";
import {processItemTransfer, StoredItemTransfer} from "./entity/storedItemTransfer";
import {getFolder, getFolderContents} from "./personal-repo/personalRepoService";
import {detailedFolder, detailedFolderPath, updateNode} from "./personal-repo/personalRepoSlice";
import {useErrorNotice, useSuccessNotice} from "../utility/useNotification";

const DirectoryPreview = () => {
    const folderId = useSelector(detailedFolder);
    const [contents, setContents] = useState<any[]>([]);
    const path: string = useSelector(detailedFolderPath);
    const dispatch = useDispatch();
    const showSuccess = useSuccessNotice();
    const showError = useErrorNotice();

    const fetchFolder = useCallback(async () => {
        if (!folderId) return Promise.resolve();
        try {
            const received = await getFolder(folderId);
            const nodeUpdate: any = {id: folderId, entity: received};
            dispatch(updateNode(nodeUpdate));
        } catch (error) {
            showError("Failed to load folder information.", error);
            return Promise.reject();
        }
    }, [folderId, dispatch, showError]);

    const fetchContents = useCallback(async () => {
        try {
            const response = await getFolderContents(folderId);
            if (response) {
                const received: any[] = [];
                received.push(
                    ...response.folders.map((item: StoredItemTransfer) => processItemTransfer(item)),
                    ...response.files.map((item: StoredItemTransfer) => processItemTransfer(item))
                );
                setContents(received);
            }
        } catch (error) {
            showError("Failed to load folder contents.", error);
            return Promise.reject();
        }
    }, [folderId, showError]);

    useEffect(() => {
        Promise.all([fetchFolder(), fetchContents()]).catch(() => {
            // ignored
        });
    }, [folderId, fetchFolder, fetchContents]);

    const refreshFolder = async () => {
        try {
            await Promise.all([fetchFolder(), fetchContents()]);
            showSuccess("Folder refreshed successfully.");
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
                                   onClick: refreshFolder
                               },
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: refreshFolder
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
};

export default DirectoryPreview;
