import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createMuiTheme, Tooltip } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";
import MaterialTable from "material-table";
import { useSnackbar } from "notistack";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useHistory } from 'react-router-dom'
import DataStructureDetailPanel from "./data-structure-details/DataStructureDetailPanel";
import { Agency } from "./entity/Agency";
import { DataStructure, FinalStructureEnum } from "./entity/DataStructure";
import { SdmxRegistry } from "./entity/SdmxRegistry";
import { SdmxRequest } from "./entity/SdmxRequest";
import { SdmxResult } from "./entity/SdmxResult";
import SdmxDownloadScreen from "./loading-screen/SdmxDownloadScreen";
import { fetchDataStructures } from "./sdmxService";
import { dataStructuresColumns } from "./tableColumns";

type DataStructureTableProps = {
    registry: SdmxRegistry | null,
    isFiltered: boolean,
    selectedAgencies: Agency[],
    setPrevFilteredState: (value: any) => void,
    finalType: FinalStructureEnum
    setSdmxResult: (setSdmxResult: SdmxResult) => void,
    clearSdmxState: () => void
}

const DataStructureTable = forwardRef(({
                                           registry, isFiltered,
                                           selectedAgencies, setPrevFilteredState, finalType,
                                           setSdmxResult, clearSdmxState
                                       }: DataStructureTableProps, ref: any) => {
    const [dataStructures, setDataStructures] = useState<DataStructure[]>([]);
    const [dataStructure, setDataStructure] = useState<any>();
    const [dataStructuresLoading, setDataStructuresLoading] = useState(false);
    const [filteredDataStructures, setFilteredDataStructures] = useState<DataStructure[]>([]);
    const [codeListLoading, setCodeListLoading] = useState<boolean>(false);
    const tableRef = useRef<any>();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();

    const loadDataStructures = useCallback(async (registryId: string, refresh: boolean) => {
        setDataStructuresLoading(true);
        const request: SdmxRequest = {registryId: registryId, detail: "allstubs"};
        return fetchDataStructures(request, refresh)
            .then((fetched) => {
                setDataStructuresLoading(false);
                return fetched;
            })
            .catch(() => {
                setDataStructuresLoading(false);
                enqueueSnackbar(`Failed to load data structures.`, {variant: "error"});
                return Promise.reject();
            });
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (registry) {
            loadDataStructures(registry.id, false)
                .then((loaded) => setDataStructures(loaded))
                .catch(() => {
                });
        }
    }, [registry, loadDataStructures]);

    /**
     * Clearing selected row when filteredDataStructure is changing.
     * It prevents from saving selected row after changing route or registry.
     */
    useEffect(() => {
        const dataManager = tableRef.current.dataManager;
        return (() => {
            dataManager.changeAllSelected(false);
            setDataStructure(undefined);
        })
    }, [filteredDataStructures])

    const onDataStructuresRefresh = () => {
        if (registry) {
            loadDataStructures(registry.id, true).then((loaded) => {
                setDataStructures(loaded);
                if (isFiltered) setFilteredDataStructures(filterData(loaded));
                enqueueSnackbar(`Data structures from ${registry.name} refreshed successfully.`,
                    {variant: "success"});
            }).catch(() => {
            });
        } else {
            enqueueSnackbar(`Select registry first`, {variant: "error"});
        }
    }

    /**
     *
     * @param rows
     * @param row
     */
    const onDataStructureSelect = (rows: any[], row?: any) => {
        if (row) {
            if (row.tableData.checked) {
                if (dataStructure && dataStructure.tableData.id !== row.tableData.id
                    && rows.some((item) => item.tableData.id === dataStructure.tableData.id)) {
                    tableRef.current.dataManager.changeRowSelected(false, [dataStructure.tableData.id]);
                }
                setDataStructure(_.cloneDeep(row));
            } else {
                tableRef.current.dataManager.changeAllSelected(false);
                setDataStructure(undefined);
            }
        }
    }

    const onCodeListsFetch = () => {
        if (dataStructure) {
            setCodeListLoading(true)
        } else {
            enqueueSnackbar(`Choose data structure from the list.`, {variant: "error"});
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
        let result: any[];
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

    const muiTableTheme = createMuiTheme({
        overrides: {
            MuiTableCell: {
                root: {
                    padding: "10px",
                },
            },
            MuiIconButton: {
                root: {
                    padding: "10px",
                },
            },
        }
    });

    return (
        <>
            <Container>
                <Row className="justify-content-xs-center">
                    <Col xs={12} className="sdmx-table">
                        <MuiThemeProvider theme={muiTableTheme}>
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
                                        showCodeListPreview={false}
                                    />)
                                }}
                                actions={[
                                    {
                                        icon: () => <FontAwesomeIcon icon={faSyncAlt}
                                                                     className="refresh-icon"
                                                                     style={{fontSize: "18.2px"}}/>,
                                        tooltip: 'Refresh definition list',
                                        position: 'toolbar',
                                        onClick: onDataStructuresRefresh
                                    },
                                    {
                                        icon: () => <FontAwesomeIcon icon={faSyncAlt}
                                                                     className="refresh-icon"
                                                                     style={{fontSize: "18.2px"}}/>,
                                        tooltip: 'Refresh definition list',
                                        position: 'toolbarOnSelect',
                                        onClick: onDataStructuresRefresh
                                    }
                                ]}
                            />
                        </MuiThemeProvider>
                    </Col>
                </Row>
                <Row style={{marginBottom: "20px"}}>
                    <Col xs={12} className="justify-content-end">
                        <Tooltip title="Import selected definition" placement="top" arrow>
                            <button className="btn btn-primary default-button button-margin-right"
                                    onClick={onCodeListsFetch}>
                                <span>Import</span>
                            </button>
                        </Tooltip>
                        <Tooltip title="Cancel importing" placement="top" arrow>
                            <button className="btn btn-primary default-button outline-button" onClick={onCancel}>
                                <span>Cancel</span>
                            </button>
                        </Tooltip>
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