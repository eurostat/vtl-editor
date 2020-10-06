import { MuiThemeProvider } from "@material-ui/core/styles";
import { Cached } from "@material-ui/icons";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { muiTheme } from "../utility/detailTable";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { getFolderContents } from "./repositoryService";
import { detailedFolder } from "./repositorySlice";

const DirectoryPreview = () => {
    const folder: StoredItemTransfer = useSelector(detailedFolder);
    const [data, setData] = useState<any[]>([]);

    const convertItem = (item: StoredItemTransfer) => {
        const converted = Object.assign({} as any, item);
        converted.createDate = new Date(item.createDate).toLocaleString();
        converted.updateDate = new Date(item.updateDate).toLocaleString();
        return converted;
    }

    const fetchContents = () => {
        if (folder) {
            getFolderContents(folder.id).then((response) => {
                if (response && response.data) {
                    const contents: any[] = [];
                    contents.push(
                        ...response.data.folders.map((item: StoredItemTransfer) => convertItem(item)),
                        ...response.data.files.map((item: StoredItemTransfer) => convertItem(item))
                    );
                    setData(contents);
                }
            }).catch(() => {
            });
        }
    }

    useEffect(() => {
        fetchContents();
    }, [folder]);

    const columns = [
        {title: "Name", field: "name"},
        {title: "Version", field: "version"},
        {title: "Created on", field: "createDate"},
        {title: "Modified on", field: "updateDate"},
        {title: "Created by", field: "createdBy"},
        {title: "Modified by", field: "updatedBy"},
    ];

    return (
        <MuiThemeProvider theme={muiTheme}>
            <MaterialTable title={`Folder: ${folder?.name || "—"}`} columns={columns} data={data}
                           options={{showTitle: true}}
                           actions={[
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbar',
                                   onClick: fetchContents
                               },
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: fetchContents
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
};

export default DirectoryPreview;