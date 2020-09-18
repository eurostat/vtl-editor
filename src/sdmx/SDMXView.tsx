import React, {useEffect, useRef, useState} from "react";
import {getAgencies, getSdmxRegistries} from "../web-api/sdmxApi";
import {CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {Col, Container, Row} from "react-bootstrap";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Checkbox from '@material-ui/core/Checkbox';
import {SdmxRegistry, SdmxRegistryObject} from "./entity/SdmxRegistry";
import {Agency, AgencyObject} from "./entity/Agency";
import {FinalStructureEnum} from "./entity/DataStructure";
import "./sdmxView.scss"
import {SDMX_AGENCIES, SDMX_REGISTIRES} from "../web-api/apiConsts";
import {faChevronDown, faFilter, faSyncAlt, faUndoAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSnackbar} from "notistack";
import {ApiResponse} from "../web-api/apiResponse";
import {ApiCache} from "./ApiCache";
import DataStructureTable from "./DataStructureTable";
import {SdmxResult} from "./entity/SdmxResult";
import PageHeader from "../main-view/page-header/PageHeader";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;
const requestCache = ApiCache.getInstance();

type FilteredState = {
    registry: SdmxRegistry,
    agencies: Agency[],
    final: FinalStructureEnum
}

type SDMXViewProps = {
    registry: SdmxRegistry | null,
    setRegistry: (registry: SdmxRegistry | null) => void,
    agencies: Agency[],
    setAgencies: (agencies: Agency[]) => void,
    selectedAgencies: Agency[],
    setSelectedAgencies: (agencies: Agency[]) => void,
    finalType: FinalStructureEnum,
    setFinalType: (finalType: FinalStructureEnum) => void,
    setSdmxResult: (sdmxResult: SdmxResult) => void,
    clearSdmxState: () => void
}

const SDMXView = ({
                      registry, setRegistry,
                      agencies, setAgencies,
                      selectedAgencies, setSelectedAgencies,
                      finalType, setFinalType, setSdmxResult, clearSdmxState
                  }: SDMXViewProps) => {
    const [registries, setRegistries] = useState<SdmxRegistry[]>([]);
    const [registriesLoading, setRegistriesLoading] = useState<boolean>(true);

    const [agenciesLoading, setAgenciesLoading] = useState<boolean>(false);

    const [showFilters, setShowFilters] = useState(false);
    const [prevFilteredState, setPrevFilteredState] = useState<FilteredState | null>(null);

    const dataStructureTableRef = useRef();
    const {enqueueSnackbar} = useSnackbar();

    const fetchRegistries = async () => {
        let registries: ApiResponse<SdmxRegistryObject> | undefined = await getSdmxRegistries();
        if (registries && registries.data) {
            return registries.data.registries;
        }
        return [];
    };

    const fetchAgencies = async () => {
        let agencies: ApiResponse<AgencyObject> | undefined = await getAgencies(registry!.id);
        if (agencies && agencies.data) {
            return agencies.data.agencies;
        }
        return [];
    };

    useEffect(() => {
        const fetch = async () => {
            setRegistries(await requestCache.checkIfExistsInMapOrAdd(SDMX_REGISTIRES, fetchRegistries));
            setRegistriesLoading(false);
        }
        fetch();
    }, []);

    useEffect(() => {
        const fetch = async () => {
            if (registry) {
                setAgenciesLoading(true);
                setAgencies(await requestCache.checkIfExistsInMapOrAdd(SDMX_AGENCIES(registry.id), fetchAgencies));
                setAgenciesLoading(false);
            }
        }
        fetch();
    }, [registry]);


    const onRegistriesRefresh = () => {
        setSelectedAgencies([]);
        setRegistry(null);
        const fetch = async () => {
            setRegistriesLoading(true);
            setRegistries(await requestCache.clearCacheAndAdd(SDMX_REGISTIRES, fetchRegistries));
            setRegistriesLoading(false);
            enqueueSnackbar(`Registries refreshed successfully!`, {
                variant: "success"
            });
        }
        fetch();
    };

    /**
     * Clearing current selected agencies.
     * Clearing stored agencies in cache for currently selected registry
     * It is nessesery to choose registry
     */
    const onAgenciesRefresh = () => {
        const fetch = async () => {
            setAgenciesLoading(true);
            setSelectedAgencies([]);
            setAgencies(await requestCache.clearCacheAndAdd(SDMX_AGENCIES(registry!.id), fetchAgencies));
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

    const onRegistriesChange = (event: any, newRegistry: SdmxRegistry | null) => {
        setRegistry(newRegistry);
        setSelectedAgencies([]);
    };

    const onAgencyChange = (event: any, newAgencies: Agency[]) => {
        setSelectedAgencies(newAgencies);
    };

    const onAgencyTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setFinalType(event.target.value as FinalStructureEnum);
    };


    const onRevert = () => {
        if (prevFilteredState) {
            setRegistry(prevFilteredState.registry)
            setSelectedAgencies(prevFilteredState.agencies)
            setFinalType(prevFilteredState.final);
            enqueueSnackbar(`Values reverted!`, {
                variant: "success"
            });
        }
    }

    const onFilterData = () => {
        if (dataStructureTableRef && dataStructureTableRef.current) {
            // @ts-ignore
            dataStructureTableRef.current!.onFilterData();
        }
    }

    const DataStructureTableProps = {
        registry,
        isFiltered: !!prevFilteredState,
        setPrevFilteredState,
        finalType,
        selectedAgencies,
        setSdmxResult,
        clearSdmxState
    }

    return (
        <div className="sdmx-container">
            <PageHeader name={"Import SDMX"}/>
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
                            value={registry}
                            getOptionLabel={(option: SdmxRegistry) => option.name}
                            getOptionSelected={(option: SdmxRegistry, value: SdmxRegistry) => option.id === value.id}
                            loading={registriesLoading}
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
                        {registry?.url ? <p>Selected registry url: {registry.url}</p> : null}
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
                                    getOptionLabel={(option: Agency) => option.name}
                                    loading={agenciesLoading}
                                    onChange={onAgencyChange}
                                    renderOption={(option: Agency, {selected}) => (
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
                                <span>Final</span>
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
                                <button className={`btn btn-primary default-button button-margin-right`}
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
                        <button className={`btn btn-primary default-button`}
                                onClick={onFilterData}>
                            <span>Search</span>
                        </button>
                    </Col>
                </Row>
            </Container>
            <div className="table-container">
                <DataStructureTable ref={dataStructureTableRef} {...DataStructureTableProps}/>
            </div>
        </div>
    );


};
export default SDMXView;