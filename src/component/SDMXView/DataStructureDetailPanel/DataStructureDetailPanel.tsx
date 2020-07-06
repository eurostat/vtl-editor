import React, {useEffect, useState} from "react";
import {BaseStruct, DataStructureDefinition, StructureType} from "../../../models/api/DataStructureDefinition";
import MaterialTable from "material-table";
import {dataPanelColumns} from "./detailPanelColumns";
import {ApiCache} from "../ApiCache";
import {CodeList} from "../../../models/api/CodeList";
import {SDMX_CODELIST, SDMX_DSD} from "../../../api/apiConsts";
import {SdmxRegistry} from "../../../models/api/SdmxRegistry";
import {fetchCodeList, fetchDataStructureDefinition} from "../../../api/sdmxApi";
import {DataStructure} from "../../../models/api/DataStructure";

type DataStructureDetailPanelProps = {
    registry: SdmxRegistry,
    dataStructure: DataStructure
}

const requestCache = ApiCache.getInstance();

const DataStructureDetailPanel = ({registry, dataStructure}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<DataStructureDefinition | null>(null);
    const [codeLists, setCodeLists] = useState<StructureType[]>([]);
    const [structures, setStructures] = useState<BaseStruct[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);


    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: DataStructureDefinition = await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry.id, dataStructure.agencyId, dataStructure.id, dataStructure.version)
                , async () => await fetchDataStructureDefinition(registry!, dataStructure));
            const structs: BaseStruct[] = (dsd.attributes as BaseStruct[] || []).concat(dsd.dimensions as BaseStruct[] || []);
            setStructures(structs);
            setDataStructureDefinition(dsd);
            setLoadingDataStructureDefinition(false);
        }
        fetch();
    }, [])

    const previewCodeList = (structure: BaseStruct) => {
        const fetch = async () => {
            const codeList: CodeList = await requestCache.checkIfExistsInMapOrAdd(SDMX_CODELIST(registry!.id, structure.structureType.agencyId!, structure.structureType.id!, structure.structureType.version!), () => fetchCodeList(registry!, structure.structureType));
            //Temp solution
            alert(codeList.codes.map(code => `${code.id} ${code.value}\n`));
        }
        fetch();
    }

    return (
        <div className="dsd-detail-panel">
            <MaterialTable
                isLoading={loadingDataStructureDefinition}
                columns={dataPanelColumns}
                data={structures}
                options={{
                    showTextRowsSelected: false,
                    showTitle: false,
                    pageSize: 10
                }}
                actions={[
                    (rowData: BaseStruct) => {
                        return {
                            icon: "visibilityOutlined",
                            tooltip: "Preview",
                            onClick: (event) => previewCodeList(rowData),
                            hidden: rowData.structureType.type !== "codelist"
                        }
                    }
                ]}
            />
        </div>
    )
}


export default DataStructureDetailPanel;