import React, {useEffect, useRef, useState} from "react";
import {getAgencies, getSdmxDataStructures, getSdmxRegistries} from "../../api/sdmxApi";
import {CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {Col, Container, Row} from "react-bootstrap";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Checkbox from '@material-ui/core/Checkbox';
import {ISdmxRegistry} from "../../models/api/ISdmxRegistry";
import {IAgency} from "../../models/api/IAgency";
import {FinalStructureEnum, IDataStructure} from "../../models/api/IDataStructure";
import "./sdmxView.scss"
import MaterialTable from 'material-table';
import {dataStructuresColumns} from "./tableColumns";
import {SDMX_REGISTIRES, SDMX_AGENCIES, SDMX_STRUCTURES} from "../../api/apiConsts";
import {faSyncAlt, faFilter, faUndoAlt, faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSnackbar} from "notistack";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;
const requestCache = new Map();

type FilteredState = {
    registry: ISdmxRegistry,
    agencies: IAgency[],
    final: FinalStructureEnum
}

const SDMXView = () => {
    const [registries, setRegistries] = useState<ISdmxRegistry[]>([]);
    const [registry, setRegistry] = useState<ISdmxRegistry | null>(null);

    const [registriesLoading, setRegistriesLoading] = useState<boolean>(true);
    const [agencies, setAgencies] = useState<IAgency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<IAgency[]>([]);
    const [agenciesLoading, setAgenciesLoading] = useState<boolean>(false);

    const [showFilters, setShowFilters] = useState(false);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [dataStructures, setDataStructures] = useState<IDataStructure[]>([]);
    const [dataStructure, setDataStructure] = useState<IDataStructure | null>(null);
    const [dataStructuresLoading, setDataStructuresLoading] = useState<boolean>(false);

    const [filteredDataStructures, setFilteredDataStructures] = useState<IDataStructure[]>([]);
    const [prevFilteredState, setPrevFilteredState] = useState<FilteredState | null>(null);
    const [reverted, setReverted] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const tableRef = useRef<any>();

    const fetchRegistries = async () => {
        let registries = await getSdmxRegistries();
        registries = registries.registries;
        return registries;
    };

    const fetchAgencies = async () => {
        let agencies = await getAgencies(registry!.id);
        return agencies.agencies;
    };

    const fetchDataStructures = async () => {
        const dataStructures = await getSdmxDataStructures(registry!.id);
        return dataStructures.dataStructures;
    };

    useEffect(() => {
        const fetch = async () => {
            setRegistries(await checkIfExistsInMapOrAdd(SDMX_REGISTIRES, fetchRegistries));
            setRegistriesLoading(false);
        }
        fetch();
    }, []);

    useEffect(() => {
        const fetch = async () => {
            setSelectedAgencies([]);
            if (registry) {
                setAgencies(await checkIfExistsInMapOrAdd(SDMX_AGENCIES(registry.id), fetchAgencies));
                setDataStructures(await checkIfExistsInMapOrAdd(SDMX_STRUCTURES(registry.id), fetchDataStructures));
                setAgenciesLoading(false);
                setDataStructuresLoading(false);
            }
        }
        fetch();
    }, [registry]);

    useEffect(() => {
        setSelectedAgencies(prevFilteredState?.agencies || []);
    }, [reverted])


    /*TODO Ustalic dokladnie co mamy zrobić w przypadku uzycia funkcji "refresh agencies". Czy refreshujemy agencje wszystkich rejestrow czy tylko konkretne.
    *  Co za tym idzie aby móc zrefreshowac agencje musimy miec wybrany juz jakiś konkretny rejest
    *  Aktualnie refreshujemy jedynie agencje powiazane z obecnie wybranym rejestrem
   */
    const onRegistriesRefresh = () => {
        setSelectedAgencies([]);
        setDataStructures([]);
        setRegistry(null);
        const fetch = async () => {
            setRegistriesLoading(true);
            setRegistries(await clearCacheAndAdd(SDMX_REGISTIRES, fetchRegistries));
            setRegistriesLoading(false);
            enqueueSnackbar(`Registries refreshed successfully!`, {
                variant: "success"
            });
        }
        fetch();
    };

    const onAgenciesRefresh = () => {
        const fetch = async () => {
            setAgenciesLoading(true);
            setAgencies(await clearCacheAndAdd(SDMX_AGENCIES(registry!.id), fetchAgencies));
            setAgenciesLoading(false);
        }
        if (registry) {
            fetch();
            enqueueSnackbar(`Agencies for ${registry.name} refreshed successfully!`, {
                variant: "success"
            });
        } else {
            enqueueSnackbar(`Specify registry to refresh!`, {
                variant: "error"
            });
        }
    }

    const onDataStructuresRefresh = () => {
        const fetch = async () => {
            setDataStructuresLoading(true);
            let dsd = await clearCacheAndAdd(SDMX_STRUCTURES(registry!.id), fetchDataStructures);
            setDataStructures(dataStructures);
            if (prevFilteredState) {
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

    const onRegistriesChange = (event: any, newRegistry: ISdmxRegistry | null) => {
        setRegistry(newRegistry);
        if (newRegistry) {
            setAgenciesLoading(true);
            setDataStructuresLoading(true);
        }
    };

    const onAgencyChange = (event: any, newAgencies: IAgency[]) => {
        setSelectedAgencies(newAgencies);
    };

    const onAgencyTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setFinalType(event.target.value as FinalStructureEnum);
    };

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

    const onFilterData = () => {
        if (registry) {
            const result = filterData(dataStructures);
            setFilteredDataStructures(result);
        } else {
            enqueueSnackbar(`Select registry`, {
                variant: "error"
            });
        }
    };

    /**
     * Filtering data based on form inputs.
     * If there is no selected agency we are returning all data structures
     * Filtering by final status: if option "NO" has been choose data structures with @enum {FinalStructureEnum.UNSET} will be also on the list.
     */
    const filterData = (data: IDataStructure[]) => {
        let result = [];
        if (selectedAgencies.length > 0) {
            const mappedAgenciesId = selectedAgencies.map(agency => agency.id);
            result = data.filter(ds => mappedAgenciesId.includes(ds.agencyId));
            setPrevFilteredState({registry: registry!, agencies: selectedAgencies, final: finalType});
        } else {
            result = dataStructures;
        }
        result = result.filter(ds => finalType === FinalStructureEnum.ALL || finalType === ds.isFinal
            || (finalType === FinalStructureEnum.FALSE && ds.isFinal === FinalStructureEnum.UNSET))
        return result;
    }

    const onRevert = () => {
        if (prevFilteredState) {
            setRegistry(prevFilteredState.registry)
            setSelectedAgencies(prevFilteredState.agencies)
            setFinalType(prevFilteredState.final);
            setReverted(!reverted);
            enqueueSnackbar(`Values reverted!`, {
                variant: "success"
            });
        }
    }


    const clearCacheAndAdd = async (value: string, asyncFunction: any) => {
        requestCache.delete(value);
        return await checkIfExistsInMapOrAdd(value, asyncFunction);
    }

    const checkIfExistsInMapOrAdd = async (value: string, asyncFunction: any): Promise<any> => {
        if (requestCache.has(value)) {
            return requestCache.get(value);
        }
        const requestResult = await asyncFunction();
        requestCache.set(value, requestResult);
        return requestResult;
    };

    return (
        <div className="sdmx-container">
            <div className="view-name-container">
                <h3>Import SDMX</h3>
            </div>
            <Container>
                <Row className="justify-content-md-left">
                    <Col xs={2} className="sdmx-option">
                        <span>Registry</span>
                    </Col>
                    <Col xs={9}>
                        <Autocomplete
                            id="registries-select"
                            options={registries}
                            className="sdmx-autocomplete"
                            getOptionLabel={(option: ISdmxRegistry) => option.name}
                            loading={registriesLoading}
                            value={registry}
                            onChange={onRegistriesChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="SDMX Source"
                                    variant="outlined"
                                    margin="normal"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {registriesLoading ?
                                                    <CircularProgress color="inherit" size={20}/> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Col>
                    <Col xs={1} className="sdmx-option text-left left-padding-none">
                        {!registriesLoading ?
                            <Tooltip title="Refresh registries" placement="right" arrow>
                                <button onClick={onRegistriesRefresh}>
                                    <FontAwesomeIcon className="refresh-icon" icon={faSyncAlt}/>
                                </button>
                            </Tooltip>
                            : null}
                    </Col>
                </Row>
                <div className="filter-container">
                    <div className="filter-row cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                        <button>
                            <FontAwesomeIcon icon={faChevronDown}/>
                            <span>Filter</span>
                        </button>
                    </div>
                    <div className={"filter-options " + (showFilters ? "open" : "")}>
                        <Row className="justify-content-md-left">
                            <Col xs={2} className="sdmx-option sdmx-agency">
                                <span>Agency</span>
                            </Col>
                            <Col xs={9}>
                                <Autocomplete
                                    multiple
                                    id="agencies-select"
                                    className="sdmx-autocomplete"
                                    options={agencies}
                                    disableCloseOnSelect
                                    value={selectedAgencies}
                                    getOptionLabel={(option: IAgency) => option.name}
                                    loading={agenciesLoading}
                                    onChange={onAgencyChange}
                                    renderOption={(option: IAgency, {selected}) => (
                                        <>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{marginRight: 8}}
                                                checked={selected}
                                            />
                                            {option.name}
                                        </>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Choose agency"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {agenciesLoading ?
                                                            <CircularProgress color="inherit" size={20}/> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Col>
                            <Col xs={1} className="sdmx-option text-left left-padding-none sdmx-agency">
                                {registry && !agenciesLoading ?
                                    <Tooltip title="Refresh agencies" placement="right" arrow>
                                        <button onClick={onAgenciesRefresh}>
                                            <FontAwesomeIcon className="refresh-icon" icon={faSyncAlt}/>
                                        </button>
                                    </Tooltip>
                                    : null}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2} className="sdmx-option">
                                <span>Agency type</span>
                            </Col>
                            <Col xs={1}>
                                <FormControl variant="outlined" margin="normal" style={{minWidth: 70}}>
                                    <InputLabel id="agency-type-select-label">Final</InputLabel>
                                    <Select
                                        className="sdmx-final-select"
                                        labelId="agency-type-select"
                                        id="agency-type-select"
                                        value={finalType}
                                        onChange={onAgencyTypeChange}
                                        label="Agency type"
                                        autoWidth
                                    >
                                        <MenuItem value={FinalStructureEnum.ALL}>All</MenuItem>
                                        <MenuItem value={FinalStructureEnum.TRUE}>Yes</MenuItem>
                                        <MenuItem value={FinalStructureEnum.FALSE}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Col>
                        </Row>
                        <Row className="justify-content-md-center" style={{marginBottom: "10px"}}>
                            <Col xs={12}>
                                <button className="btn btn-primary default-button button-margin-right"
                                        onClick={onFilterData}>
                                    <FontAwesomeIcon icon={faFilter}/>
                                    <span>Filter</span>
                                </button>
                                <button className="btn btn-primary default-button outline-button" onClick={onRevert}>
                                    <FontAwesomeIcon icon={faUndoAlt}/>
                                    <span>Revert</span>
                                </button>
                            </Col>
                        </Row>
                    </div>
                </div>
                <Row style={{marginBottom: "20px"}}>
                    <Col xs={12} className="justify-content-end">
                        <button className="btn btn-primary default-button"
                                onClick={onFilterData}>
                            <span>Search</span>
                        </button>
                    </Col>
                </Row>
            </Container>
            <div className="table-container">
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
                            />
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "20px"}}>
                        <Col xs={12} className="justify-content-end">
                            <button className="btn btn-primary default-button button-margin-right"
                            >
                                <span>OK</span>
                            </button>
                            <button className="btn btn-primary default-button outline-button">
                                <span>Cancel</span>
                            </button>
                        </Col>
                    </Row>
                </Container>
            </div>

        </div>
    );


};

export default SDMXView;