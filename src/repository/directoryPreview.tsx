import { MuiThemeProvider } from "@material-ui/core/styles";
import { Cached } from "@material-ui/icons";
import MaterialTable from "material-table";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertEntityDates } from "../web-api/apiUtility";
import { detailTableTheme } from "./detailTableTheme";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { getFolder, getFolderContents } from "./personal-repo/personalRepoService";
import { detailedFolder, detailedFolderPath, updateNode } from "./personal-repo/personalRepoSlice";

const DirectoryPreview = () => {
    const folderId = useSelector(detailedFolder);
    const [contents, setContents] = useState<any[]>([]);
    const path: string = useSelector(detailedFolderPath);
    const dispatch = useDispatch();

    const fetchFolder = useCallback(() => {
        if (folderId) {
            getFolder(folderId)
                .then((received) => {
                    const nodeUpdate: any = {id: folderId, entity: received};
                    dispatch(updateNode(nodeUpdate));
                })
                .catch(() => {
                });
        }
    }, [folderId, dispatch]);

    const fetchContents = useCallback(() => {
        getFolderContents(folderId)
            .then((response) => {
                if (response && response.data) {
                    const received: any[] = [];
                    received.push(
                        ...response.data.folders.map((item: StoredItemTransfer) => convertEntityDates(item)),
                        ...response.data.files.map((item: StoredItemTransfer) => convertEntityDates(item))
                    );
                    setContents(received);
                }
            })
            .catch(() => {
            });
    }, [folderId]);

    useEffect(() => {
        fetchFolder();
        fetchContents();
    }, [folderId, fetchFolder, fetchContents]);

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
                                   onClick: fetchFolder
                               },
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: fetchFolder
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
};

export default DirectoryPreview;