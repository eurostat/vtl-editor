import React, {useEffect, useState} from "react";
import {IBaseStruct, IDataStructureDefinition, IStructureType} from "../../../models/api/IDataStructureDefinition";
import MaterialTable from "material-table";
import {dataPanelColumns} from "./detailPanelColumns";
import {ApiCache} from "../ApiCache";
import {ICodeList} from "../../../models/api/ICodeList";
import {SDMX_CODELIST} from "../../../api/apiConsts";
import {ISdmxRegistry} from "../../../models/api/ISdmxRegistry";

type DataStructureDetailPanelProps = {
    retrieveItemFunction: () => Promise<IDataStructureDefinition>,
    fetchCodeList: (registry: ISdmxRegistry, structureType: IStructureType) => Promise<ICodeList | null>,
    registry: ISdmxRegistry | null
}

const requestCache = ApiCache.getInstance();

const DataStructureDetailPanel = ({retrieveItemFunction, fetchCodeList, registry}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<IDataStructureDefinition | null>(null);
    const [codeLists, setCodeLists] = useState<IStructureType[]>([]);
    const [structures, setStructures] = useState<IBaseStruct[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: IDataStructureDefinition = await retrieveItemFunction();
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
            {/*{loadingDataStructureDefinition ? <span>Loading...</span> : null}*/}
            {/*{structures.map(struct =>*/}
            {/*    <p key={struct.id}>{`name: ${struct.name} agencyId:${struct.structureType.agencyId} id:${struct.structureType.id} version:${struct.structureType.version}`}</p>)}*/}

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