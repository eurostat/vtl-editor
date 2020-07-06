import React, {useEffect, useState} from "react";
import {IBaseStruct, IDataStructureDefinition, IStructureType} from "../../../models/api/IDataStructureDefinition";
import MaterialTable from "material-table";
import {dataPanelColumns} from "./detailPanelColumns";
import {ApiCache} from "../ApiCache";
import {ICodeList} from "../../../models/api/ICodeList";
import {SDMX_CODELIST, SDMX_DSD} from "../../../api/apiConsts";
import {ISdmxRegistry} from "../../../models/api/ISdmxRegistry";
import {fetchCodeList, fetchDataStructureDefinition} from "../../../api/sdmxApi";
import {IDataStructure} from "../../../models/api/IDataStructure";

type DataStructureDetailPanelProps = {
    registry: ISdmxRegistry,
    dataStructure: IDataStructure
}

const requestCache = ApiCache.getInstance();

const DataStructureDetailPanel = ({registry, dataStructure}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<IDataStructureDefinition | null>(null);
    const [codeLists, setCodeLists] = useState<IStructureType[]>([]);
    const [structures, setStructures] = useState<IBaseStruct[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);


    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: IDataStructureDefinition = await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry.id, dataStructure.agencyId, dataStructure.id, dataStructure.version)
                , async () => await fetchDataStructureDefinition(registry!, dataStructure));
            const structs: IBaseStruct[] = (dsd.attributes as IBaseStruct[] || []).concat(dsd.dimensions as IBaseStruct[] || []);
            setStructures(structs);
            setDataStructureDefinition(dsd);
            setLoadingDataStructureDefinition(false);
        }
        fetch();
    }, [])

    const previewCodeList = (structure: IBaseStruct) => {
        const fetch = async () => {
            const codeList: ICodeList = await requestCache.checkIfExistsInMapOrAdd(SDMX_CODELIST(registry!.id, structure.structureType.agencyId!, structure.structureType.id!, structure.structureType.version!), () => fetchCodeList(registry!, structure.structureType));
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
                    (rowData: IBaseStruct) => {
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