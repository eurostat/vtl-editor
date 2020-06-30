import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {Box, CircularProgress, Tooltip, Typography} from "@material-ui/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import MaterialTable from "material-table";
import {dataStructuresColumns} from "./tableColumns";
import {FinalStructureEnum, IDataStructure, IDataStructureObject} from "../../models/api/IDataStructure";
import DataStructureDetailPanel from "./DataStructureDetailPanel";
import {SDMX_DSD, SDMX_STRUCTURES} from "../../api/apiConsts";
import {ISdmxRegistry} from "../../models/api/ISdmxRegistry";
import {ICodeList, ICodeListDetails} from "../../models/api/ICodeList";
import {ApiCache} from "./ApiCache";
import {IResponse} from "../../models/api/IResponse";
import {IBaseStruct, IDataStructureDefinition, IStructureType} from "../../models/api/IDataStructureDefinition";
import {getCodeList, getDataStructureDefinition, getSdmxDataStructures} from "../../api/sdmxApi";
import {useSnackbar} from "notistack";
import {IAgency} from "../../models/api/IAgency";
import {useHistory} from 'react-router-dom'
import {ISdmxResult} from "../../models/api/ISdmxResult";

type DataStructureTableProps = {
    registry: ISdmxRegistry | null,
    requestCache: ApiCache;
    isFiltered: boolean,
    selectedAgencies: IAgency[],
    setPrevFilteredState: (value: any) => void,
    finalType: FinalStructureEnum
    setSdmxResult: (setSdmxResult: ISdmxResult) => void
}


const DataStructureTable = forwardRef(({
                                           registry, requestCache, isFiltered,
                                           selectedAgencies, setPrevFilteredState, finalType,
                                           setSdmxResult
                                       }: DataStructureTableProps, ref: any) => {
    const [dataStructures, setDataStructures] = useState<IDataStructure[]>([]);
    const [dataStructure, setDataStructure] = useState<IDataStructure | null>(null);
    const [dataStructuresLoading, setDataStructuresLoading] = useState(false);
    const [filteredDataStructures, setFilteredDataStructures] = useState<IDataStructure[]>([]);

    const [dataStructureDefinition, setDataStructureDefinition] = useState<IDataStructureDefinition | null>(null);

    const [codeListLoading, setCodeListLoading] = useState<boolean>(false);
    const [codeListProgress, setCodeListProgress] = useState<number>(0);
    const [codeListTotal, setCodeListTotal] = useState<number>(0);
    const tableRef = useRef<any>();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();

    const fetchDataStructureDefinition = async (ds: IDataStructure) => {
        const dataStructureDefinition: IResponse<IDataStructureDefinition> | undefined =
            await getDataStructureDefinition(registry!.id, ds.agencyId, ds.id, ds.version);
        if (dataStructureDefinition && dataStructureDefinition.data) {
            return dataStructureDefinition.data;
        }
        return null;
    }

    const fetchDataStructures = async () => {
        const dataStructures: IResponse<IDataStructureObject> | undefined = await getSdmxDataStructures(registry!.id);
        if (dataStructures && dataStructures.data) {
            return dataStructures.data.dataStructures;
        }
        return [];
    };


    const fetchCodeLists = async (structureTypes: IStructureType[]) => {
        const [codeListsResponses] = await Promise.all([Promise.all(structureTypes
            .map(structureType => getCodeList(registry!.id, structureType.agencyId!, structureType.id!, structureType.version!))
            .map(promise => {
                promise.then(() => setCodeListProgress(prevState => prevState += 1));
                return promise;
            })
        )])
        return codeListsResponses.filter(response => response && response.data).map(response => response!.data);
    }

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
        setDataStructure(rowData);
    }

    const getItemIndex = (item: IDataStructure): number => {
        for (let index in dataStructures) {
            let ds = dataStructures[index];
            if (ds.id === item.id) return parseInt(index);
        }
        return -1;
    }

    const onCodeListsFetch = () => {
        const fetch = async () => {
            setCodeListProgress(0);
            const dsd =
                await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry!.id, dataStructure!.agencyId, dataStructure!.id, dataStructure!.version),
                    async () => await fetchDataStructureDefinition(dataStructure!));
            setDataStructureDefinition(dsd);
            const structuresFromDSD: IBaseStruct[] = getCodeListsFromDSD(dsd);
            setCodeListTotal(structuresFromDSD.length);
            setCodeListLoading(true);
            const codeLists =
                await requestCache.checkIfExistsInMapOrAdd(`CODE LISTS: ${SDMX_DSD(registry!.id, dataStructure!.agencyId, dataStructure!.id, dataStructure!.version)}`,
                    () => fetchCodeLists(structuresFromDSD.map(structure => structure.structureType)));
            setSdmxResult(createSdmxResult(dsd, codeLists));
            setCodeListLoading(false);
            enqueueSnackbar(`${codeLists.length} code list${codeLists.length > 1 ? "s" : ""} downloaded!`, {
                variant: "success"
            });
            history.push("/");
        }
        if (dataStructure) {
            fetch();
        } else {
            enqueueSnackbar(`Choose data structure from the list!`, {
                variant: "error"
            });
        }
    }

    const createSdmxResult = (dsd: IDataStructureDefinition, codeLists: ICodeList[]): ISdmxResult => {
        return {
            texts: getTextFromDSD(dsd),
            codeLists: mapICodeDetails(getCodeListsFromDSD(dsd), codeLists),
            timeDimension: dsd.timeDimension,
            primaryMeasure: dsd.primaryMeasure
        }
    }

    const onCancel = () => {
        history.push("/");
    }

    const mapICodeDetails = (structures: IBaseStruct[], codeLists: ICodeList[]): ICodeListDetails[] => {
        const structuresMap = structures.reduce((map: { [key: string]: IBaseStruct }, obj) => {
            map[obj.structureType.id!] = obj;
            return map;
        }, {});
        return codeLists.map(cl => Object.assign({
            structureId: structuresMap[cl.id].id,
            name: structuresMap[cl.id].name
        }, cl));
    }


    const getTextFromDSD = (dsd: IDataStructureDefinition): IBaseStruct[] => {
        return getListByType(dsd, "text");
    }

    const getCodeListsFromDSD = (dsd: IDataStructureDefinition): IBaseStruct[] => {
        return getListByType(dsd, "codelist");
    }

    const getListByType = (dsd: IDataStructureDefinition, type: "codelist" | "text"): IBaseStruct[] => {
        return (dsd.dimensions as IBaseStruct[] || []).concat(dsd?.attributes as IBaseStruct[] || [])
            .filter(base => base.structureType.type === type);
    }


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
    const filterData = (data: IDataStructure[]): IDataStructure[] => {
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
                            detailPanel={(rowData: IDataStructure) => {
                                return (<DataStructureDetailPanel
                                    retrieveItemFunction={async () => await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry!.id, rowData.agencyId, rowData.id, rowData.version)
                                        , async () => await fetchDataStructureDefinition(rowData))}/>)
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
                <LoadingScreen codeListProgress={codeListProgress} codeListTotal={codeListTotal}/> : null}
        </>
    )
});

type LoadingScreenFooterProps = {
    codeListProgress: number,
    codeListTotal: number
}
const LoadingScreen = ({codeListProgress, codeListTotal}: LoadingScreenFooterProps) => {
    const progress = Math.round(codeListProgress / codeListTotal * 100);
    return (
        <div className="sdmx-loading-screen">
            <div className="sdmx-loading-content-area">
                <Box>
                    <CircularProgress variant="static" value={progress} size={60}/>
                    <Box
                        top={-45}
                        left={0}
                        bottom={0}
                        right={0}
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Typography variant="caption" component="div"
                                    color="textSecondary">{`${progress}%`}</Typography>
                    </Box>
                </Box>
                <p>Downloading code lists...</p>
            </div>
        </div>
    )
}
export default DataStructureTable;