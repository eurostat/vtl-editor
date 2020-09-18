import MaterialTable, { DetailPanel } from "material-table";
import React, { useEffect, useState } from "react";
import { SDMX_DSD } from "../../web-api/apiConsts";
import { fetchDataStructureDefinition } from "../../web-api/sdmxApi";
import { ApiCache } from "../ApiCache";
import CodeListDetailPanel from "../code-list-details/CodeListDetailPanel";
import { CodeList } from "../entity/CodeList";
import { DataStructure } from "../entity/DataStructure";
import { BaseStruct, DataStructureDefinition } from "../entity/DataStructureDefinition";
import { SdmxRegistry } from "../entity/SdmxRegistry";
import { dataPanelColumns } from "./detailPanelColumns";

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