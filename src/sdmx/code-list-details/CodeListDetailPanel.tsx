import React, {useEffect, useState} from "react";
import MaterialTable from "material-table";
import { ApiCache } from "../apiCache";
import {CodeList} from "../entity/CodeList";
import { fetchCodeList } from "../sdmxService";
import {codeListDetailColumns} from "./codeListDetailColumns";
import {BaseStruct} from "../entity/DataStructureDefinition";
import {SDMX_CODELIST} from "../../web-api/apiConsts";
import {SdmxRegistry} from "../entity/SdmxRegistry";

type CodeListDetailPanelProps = {
    registry: SdmxRegistry,
    baseStruct: BaseStruct
}

const CodeListDetailPanel = ({registry, baseStruct}: CodeListDetailPanelProps) => {
    const [codeList, setCodeList] = useState<CodeList | undefined>(undefined);
    const [loadingCodeList, setLoadingCodeList] = useState<boolean>(false);
    const requestCache = ApiCache.getInstance();

    useEffect(() => {
        const fetch = async () => {
            const codeList: CodeList = await requestCache.checkIfExistsInMapOrAdd(SDMX_CODELIST(registry!.id, baseStruct.structureType.agencyId!, baseStruct.structureType.id!, baseStruct.structureType.version!),
                () => fetchCodeList(registry!, baseStruct.structureType));
            setCodeList(codeList);
            setLoadingCodeList(false);
        }
        fetch();
    }, [registry, baseStruct, requestCache])

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