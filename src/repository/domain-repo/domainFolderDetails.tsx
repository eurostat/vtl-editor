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
import {convertEntityDates} from "../../web-api/apiUtility";
import {useSnackbar} from "notistack";

const DomainFolderDetails = () => {
    const folder = useSelector(domainDetailedFolder);
    const [contents, setContents] = useState<any[]>([]);
    const path: string = useSelector(domainDetailedFolderPath);
    const {enqueueSnackbar} = useSnackbar();

    const loadContents = useCallback(() => {
        if (!folder || !folder.childType) return;
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
        call(folder)
            .then((response) => {
                if (response) {
                    const received = response.map((node: TreeNode) => convertEntityDates(node.entity));
                    setContents(received);
                }
            })
            .catch(() => enqueueSnackbar(`Failed to load contents.`, {variant: "error"}));
    }, [folder, enqueueSnackbar]);

    useEffect(() => {
        loadContents();
    }, [folder, loadContents]);

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
                                   onClick: loadContents
                               },
                               {
                                   icon: () => <Cached/>,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: loadContents
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
};

export default DomainFolderDetails;