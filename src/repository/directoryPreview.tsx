import { MuiThemeProvider } from "@material-ui/core/styles";
import { Cached } from "@material-ui/icons";
import MaterialTable from "material-table";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { muiTheme } from "../utility/detailTable";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { getFolder, getFolderContents } from "./repositoryService";
import { detailedFolder, detailedFolderPath, updateNode } from "./repositorySlice";

const DirectoryPreview = () => {
    const folderId = useSelector(detailedFolder);
    const [contents, setContents] = useState<any[]>([]);
    const path: string = useSelector(detailedFolderPath);
    const dispatch = useDispatch();

    const convertItem = (item: StoredItemTransfer) => {
        const converted = Object.assign({} as any, item);
        converted.createDate = new Date(item.createDate).toLocaleString();
        converted.updateDate = new Date(item.updateDate).toLocaleString();
        return converted;
    }

    const fetchFolder = useCallback(() => {
        if (folderId) {
            getFolder(folderId).then((received) => {
                const nodeUpdate: any = {id: folderId, entity: received};
                dispatch(updateNode(nodeUpdate));
            }).catch(() => {
            });
        }
    }, [folderId, dispatch]);

    const fetchContents = useCallback(() => {
        getFolderContents(folderId).then((response) => {
            if (response && response.data) {
                const contents: any[] = [];
                contents.push(
                    ...response.data.folders.map((item: StoredItemTransfer) => convertItem(item)),
                    ...response.data.files.map((item: StoredItemTransfer) => convertItem(item))
                );
                setContents(contents);
            }
        }).catch(() => {
        });
    }, [folderId]);

    useEffect(() => {
        fetchFolder();
        fetchContents();
    }, [folderId, fetchFolder, fetchContents]);

    return (
        <MuiThemeProvider theme={muiTheme}>
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
                           options={{showTitle: true}}
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