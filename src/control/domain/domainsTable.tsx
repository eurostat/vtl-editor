import { MuiThemeProvider } from "@material-ui/core/styles";
import { AddCircleOutline, Cached, Clear, Edit } from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, { MaterialTableProps } from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAdminRole } from "../authorized";
import { domainList, expelDomain, replaceDomains, startDomainEdit } from "../controlSlice";
import { DomainTransfer } from "./domain";
import { deleteDomain, fetchDomains } from "./domainService";
import DomainView from "./domainView";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";

export default function DomainsTable() {
    const domains = _.cloneDeep(useSelector(domainList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const forAdmin = useAdminRole();

    const loadDomains = useCallback(() => {
        return fetchDomains().then((received: DomainTransfer[]) => {
            dispatch(replaceDomains(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load domains.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadDomains().then().catch(() => {
        });
    }, [loadDomains]);

    const refreshDomains = () => {
        loadDomains()
            .then(() => enqueueSnackbar(`Domains refreshed successfully.`, {variant: "success"}))
            .catch(() => {
            });
    }

    const createDomain = () => {
        dispatch(startDomainEdit());
    }

    const editDomain = (event: any, domain: DomainTransfer | DomainTransfer[]) => {
        if (Array.isArray(domain)) return;
        dispatch(startDomainEdit(domain.id));
    }

    const removeDomain = (event: any, domain: DomainTransfer | DomainTransfer[]) => {
        if (Array.isArray(domain)) return;
        deleteEntityDialog("domain", domain.name)
            .then(() => {
                deleteDomain(domain.id)
                    .then((response) => {
                        if (response && response.success) {
                            dispatch(expelDomain(domain));
                            enqueueSnackbar(`Domain "${domain.name}" deleted successfully.`, {variant: "success"});
                        }
                    })
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete domain "${domain.name}".`, {variant: "error"});
                    })
            })
            .catch(() => {
            });
    }

    const tableProps = {
        title: materialTableTitle("VRM Domain", "VRM Domains", domains.length),
        data: domains,
        columns: [
            {title: "Name", field: "name", defaultSort: "asc"},
            {title: "Description", field: "description"},
            {title: "Creation Date", field: "createDate"},
            {title: "Created By", field: "createdBy"},
        ],
        options: {
            showTitle: true,
            toolbarButtonAlignment: "left",
        },
        detailPanel: (domain: DomainTransfer) => {
            return (<DomainView domainId={domain.id}/>)
        },
        actions: [
            forAdmin(materialTableAction(<AddCircleOutline/>, "toolbar", createDomain, "New Domain")),
            forAdmin(materialTableAction(<AddCircleOutline/>, "toolbarOnSelect", createDomain, "New Domain")),
            materialTableAction(<Cached/>, "toolbar", refreshDomains, "Refresh"),
            materialTableAction(<Cached/>, "toolbarOnSelect", refreshDomains, "Refresh"),
            materialTableAction(<Edit/>, "row", editDomain, "Edit Domain"),
            forAdmin(materialTableAction(<Clear/>, "row", removeDomain, "Delete Domain")),
        ].filter((action) => action !== null),
    } as MaterialTableProps<any>;

    return (
        <>
            <MuiThemeProvider theme={materialTableTheme}>
                <div className="entities-table">
                    <MaterialTable {...tableProps}/>
                </div>
            </MuiThemeProvider>
        </>
    );
}