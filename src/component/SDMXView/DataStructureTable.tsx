import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {Tooltip} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import MaterialTable from "material-table";
import {dataStructuresColumns} from "./tableColumns";
import {DataStructure, DataStructureObject, FinalStructureEnum} from "../../models/api/DataStructure";
import DataStructureDetailPanel from "./DataStructureDetailPanel/DataStructureDetailPanel";
import {SDMX_STRUCTURES} from "../../api/apiConsts";
import {SdmxRegistry} from "../../models/api/SdmxRegistry";
import {ApiCache} from "./ApiCache";
import {CustomResponse} from "../../models/api/CustomResponse";
import {DataStructureDefinition} from "../../models/api/DataStructureDefinition";
import {getSdmxDataStructures} from "../../api/sdmxApi";
import {useSnackbar} from "notistack";
import {Agency} from "../../models/api/Agency";
import {useHistory} from 'react-router-dom'
import {SdmxResult} from "../../models/api/SdmxResult";
import SdmxDownloadScreen from "./SdmxLoadingScreen/SdmxDownloadScreen";

type DataStructureTableProps = {
    registry: SdmxRegistry | null,
    isFiltered: boolean,
    selectedAgencies: Agency[],
    setPrevFilteredState: (value: any) => void,
    finalType: FinalStructureEnum
    setSdmxResult: (setSdmxResult: SdmxResult) => void,
    clearSdmxState: () => void
}

const requestCache = ApiCache.getInstance();


const DataStructureTable = forwardRef(({
                                           registry, isFiltered,
                                           selectedAgencies, setPrevFilteredState, finalType,
                                           setSdmxResult, clearSdmxState
                                       }: DataStructureTableProps, ref: any) => {
    const [dataStructures, setDataStructures] = useState<DataStructure[]>([]);
    const [dataStructure, setDataStructure] = useState<DataStructure | null>(null);
    const [dataStructuresLoading, setDataStructuresLoading] = useState(false);
    const [filteredDataStructures, setFilteredDataStructures] = useState<DataStructure[]>([]);

    const [codeListLoading, setCodeListLoading] = useState<boolean>(false);
    const tableRef = useRef<any>();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();

    const fetchDataStructures = async () => {
        const dataStructures: CustomResponse<DataStructureObject> | undefined = await getSdmxDataStructures(registry!.id);
        if (dataStructures && dataStructures.data) {
            return dataStructures.data.dataStructures;
        }
        return [];
    };


    useEffect(() => {
        const fetch = async () => {
            if (registry) {
                setDataStructuresLoading(true);
                setDataStructures(await requestCache.checkIfExistsInMapOrAdd(SDMX_STRUCTURES(registry.id), fetchDataStructures));
                setDataStructuresLoading(false);
            }
        }
        fetch();
    }, [registry]);

    /**
     * Clearing selected row when filteredDataStructure is changing.
     * It prevents from saving selected row after changing route or registry.
     */
    useEffect(() => {
        return (() => {
            tableRef.current.dataManager.changeAllSelected(false);
        })
    }, [filteredDataStructures])


    const onDataStructuresRefresh = () => {
        const fetch = async () => {
            setDataStructuresLoading(true);
            let dsd = await requestCache.clearCacheAndAdd(SDMX_STRUCTURES(registry!.id), fetchDataStructures);
            setDataStructures(dataStructures);
            if (isFiltered) {
                setFilteredDataStructures(filterData(dsd));
            }
            setDataStructuresLoading(false);
        }
        if (registry) {
            fetch();
            enqueueSnackbar(`Data structures for ${registry.name} refreshed successfully!`, {
                variant: "success"
            });
        } else {
            enqueueSnackbar(`Specify registry to refresh!`, {
                variant: "error"
            });
        }
    }


    /**
     *
     * @param data
     * @param rowData current selected row in a table
     */
    const onDataStructureSelect = (data: any[], rowData: any | null) => {
        const selectedRows = tableRef.current.dataManager.selectedCount;
        if (selectedRows > 1) {
            tableRef.current.dataManager.changeAllSelected(false);
            tableRef.current.dataManager.changeRowSelected(true, [getItemIndex(rowData)]);
        }
        let copy = Object.assign({}, rowData);
        delete copy.tableData;
        setDataStructure(copy);
    }

    const getItemIndex = (item: DataStructure): number => {
        for (let index in dataStructures) {
            let ds = dataStructures[index];
            if (ds.id === item.id) return parseInt(index);
        }
        return -1;
    }

    const onCodeListsFetch = () => {
        if (dataStructure) {
            setCodeListLoading(true)
        } else {
            enqueueSnackbar(`Choose data structure from the list!`, {
                variant: "error"
            });
        }
    }

    const onCancel = () => {
        clearSdmxState();
        history.push("/");
    }


    /**
     * Forwarding onFilterData into parent component
     */
    useImperativeHandle(ref, () => ({
        onFilterData() {
            if (registry && !dataStructuresLoading) {
                const result = filterData(dataStructures);
                setFilteredDataStructures(result);
            } else if (dataStructuresLoading) {
                enqueueSnackbar(`Loading data structures`, {
                    variant: "warning"
                });
            } else {
                enqueueSnackbar(`Select registry`, {
                    variant: "error"
                });
            }
        }
    }));


    /**
     * Filtering data based on form inputs.
     * If there is no selected agency we are returning all data structures
     * Filtering by final status: if option "NO" has been choose data structures with @enum {FinalStructureEnum.UNSET} will be also on the list.
     */
    const filterData = (data: DataStructure[]): DataStructure[] => {
        let result = [];
        if (selectedAgencies.length > 0) {
            const mappedAgenciesId = selectedAgencies.map(agency => agency.id);
            result = data.filter(ds => mappedAgenciesId.includes(ds.agencyId));
            setPrevFilteredState({registry: registry!, agencies: selectedAgencies, final: finalType});
        } else {
            result = data;
        }
        result = result.filter(ds => finalType === FinalStructureEnum.ALL || finalType === ds.isFinal
            || (finalType === FinalStructureEnum.FALSE && ds.isFinal === FinalStructureEnum.UNSET))
        return result;
    }

    return (
        <>
            <Container>
                <Row style={{marginBottom: "5px"}}>
                    <Col xs={12} className="justify-content-end">
                        {registry && !dataStructuresLoading ?
                            <Tooltip title="Refresh DSD's" placement="right" arrow>
                                <button onClick={onDataStructuresRefresh}>
                                    <FontAwesomeIcon className="refresh-icon" icon={faSyncAlt}/>
                                </button>
                            </Tooltip>
                            : null}
                    </Col>
                </Row>
                <Row className="justify-content-xs-center">
                    <Col xs={12} className="sdmx-table">
                        <MaterialTable
                            tableRef={tableRef}
                            columns={dataStructuresColumns}
                            data={filteredDataStructures}
                            options={{
                                selection: true,
                                showSelectAllCheckbox: false,
                                showTextRowsSelected: false,
                                showTitle: false
                            }}
                            onSelectionChange={onDataStructureSelect}
                            detailPanel={(rowData: DataStructure) => {
                                return (<DataStructureDetailPanel
                                    registry={registry!}
                                    dataStructure={rowData}
                                />)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginBottom: "20px"}}>
                    <Col xs={12} className="justify-content-end">
                        <button className="btn btn-primary default-button button-margin-right"
                                onClick={onCodeListsFetch}>
                            <span>OK</span>
                        </button>
                        <button className="btn btn-primary default-button outline-button" onClick={onCancel}>
                            <span>Cancel</span>
                        </button>
                    </Col>
                </Row>
            </Container>
            {codeListLoading ?
                <SdmxDownloadScreen registry={registry} dataStructure={dataStructure} setSdmxResult={setSdmxResult}
                                    showScreen={codeListLoading}/> : null}
        </>
    )
});


export default DataStructureTable;