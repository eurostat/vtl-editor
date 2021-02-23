import MaterialTable from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { CodeList } from "../entity/CodeList";
import { BaseStruct, StructureType } from "../entity/DataStructureDefinition";
import { SdmxRegistry } from "../entity/SdmxRegistry";
import { buildSdmxRequest } from "../entity/SdmxRequest";
import { fetchCodelists } from "../sdmxService";
import { codeListDetailColumns } from "./codeListDetailColumns";

type CodeListDetailPanelProps = {
    registry: SdmxRegistry,
    baseStruct: BaseStruct
}

const CodeListDetailPanel = ({registry, baseStruct}: CodeListDetailPanelProps) => {
    const [codeList, setCodeList] = useState<CodeList | undefined>(undefined);
    const [loadingCodeList, setLoadingCodeList] = useState<boolean>(false);
    const {enqueueSnackbar} = useSnackbar();

    const loadCodelist = useCallback(async (structureType: StructureType, refresh: boolean) => {
        setLoadingCodeList(true);
        const request = buildSdmxRequest(registry.id, structureType);
        return fetchCodelists(request, refresh)
            .then((fetched) => {
                setLoadingCodeList(false);
                return fetched;
            })
            .catch(() => {
                setLoadingCodeList(false);
                enqueueSnackbar(`Failed to load codelist ${request.resourceId}.`, {variant: "error"});
                return Promise.reject();
            });
    }, [registry, enqueueSnackbar]);

    useEffect(() => {
        if (registry && baseStruct.structureType) {
            loadCodelist(baseStruct.structureType, false)
                .then((loaded) => {
                    if (loaded.length > 0) setCodeList(loaded[0])
                    else enqueueSnackbar(`Codelist ${baseStruct.structureType.id} not found.`, {variant: "error"});
                })
                .catch(() => {
                });
        }
    }, [registry, loadCodelist, baseStruct.structureType, enqueueSnackbar]);

    return (
        <div className="code-list-panel">
            <MaterialTable
                isLoading={loadingCodeList}
                columns={codeListDetailColumns}
                data={codeList?.codes || []}
                options={{
                    showTextRowsSelected: false,
                    showTitle: false,
                    pageSize: 10
                }}
            />
        </div>
    )
}

export default CodeListDetailPanel;