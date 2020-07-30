import React, {useEffect, useState} from "react";
import {BaseStruct, DataStructureDefinition} from "../../../models/api/DataStructureDefinition";
import MaterialTable, {DetailPanel} from "material-table";
import {dataPanelColumns} from "./detailPanelColumns";
import {ApiCache} from "../ApiCache";
import {CodeList} from "../../../models/api/CodeList";
import {SDMX_CODELIST, SDMX_DSD} from "../../../api/apiConsts";
import {SdmxRegistry} from "../../../models/api/SdmxRegistry";
import {fetchCodeList, fetchDataStructureDefinition} from "../../../api/sdmxApi";
import {DataStructure} from "../../../models/api/DataStructure";
import CodeListDetailPanel from "./CodeListDetailPanel/CodeListDetailPanel";

type DataStructureDetailPanelProps = {
    registry: SdmxRegistry,
    dataStructure: DataStructure,
    showCodeListPreview: boolean
}

interface DataStructureTableRow extends BaseStruct {
    type: DataStructureTableRowType
}

type DataStructureTableRowType =
    "attribute" | "dimension" | "timeDimension" | "primaryMeasure"


const requestCache = ApiCache.getInstance();

const DataStructureDetailPanel = ({registry, dataStructure, showCodeListPreview}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<DataStructureDefinition | undefined>(undefined);
    const [codeList, setCodeList] = useState<CodeList | undefined>(undefined);
    const [structures, setStructures] = useState<DataStructureTableRow[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);


    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: DataStructureDefinition = await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry.id, dataStructure.agencyId, dataStructure.id, dataStructure.version)
                , async () => await fetchDataStructureDefinition(registry!, dataStructure));
            const mapDimensions = (): DataStructureTableRow[] => {
                return mapToDataStructureTableRow(dsd.attributes || [], "attribute");
            }

            const mapAttributes = (): DataStructureTableRow[] => {
                return mapToDataStructureTableRow(dsd.dimensions || [], "dimension");
            }
            const mapToDataStructureTableRow = (array: BaseStruct[], dataType: DataStructureTableRowType): DataStructureTableRow[] => {
                return (array || []).map(baseStruct => {
                    return {type: dataType, ...baseStruct}
                });
            }

            const structs: DataStructureTableRow[] = mapDimensions()
                .concat(mapAttributes());
            setStructures(structs);
            setDataStructureDefinition(dsd);
            setLoadingDataStructureDefinition(false);
        }
        fetch();
    }, [])

    const conditionalRenderCodeListPreview = (showCodeListPreview: boolean) => {
        return showCodeListPreview ?
            {
                "detailPanel": [(rowData: DataStructureTableRow) => {
                    return {
                        disabled: rowData.structureType.type !== "codelist",
                        icon: rowData.structureType.type === "codelist" ? "chevron_right" : "  ",
                        render: (rowData: DataStructureTableRow) => <CodeListDetailPanel registry={registry!}
                                                                                         baseStruct={rowData}/>
                    } as DetailPanel<DataStructureTableRow>
                }]
            }
            : {}
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
                {...conditionalRenderCodeListPreview(showCodeListPreview)}

            />
        </div>
    )
}


export default DataStructureDetailPanel;