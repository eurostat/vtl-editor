import React, {useEffect, useRef, useState} from "react";
import {getAgencies, getSdmxRegistries} from "../../api/sdmxApi";
import {CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import {Col, Container, Row} from "react-bootstrap";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Checkbox from '@material-ui/core/Checkbox';
import {ISdmxRegistry, ISdmxRegistryObject} from "../../models/api/ISdmxRegistry";
import {IAgency, IAgencyObject} from "../../models/api/IAgency";
import {FinalStructureEnum, IDataStructure} from "../../models/api/IDataStructure";
import "./sdmxView.scss"
import {SDMX_AGENCIES, SDMX_REGISTIRES} from "../../api/apiConsts";
import {faChevronDown, faFilter, faSyncAlt, faUndoAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSnackbar} from "notistack";
import {IResponse} from "../../models/api/IResponse";
import {ICodeList} from "../../models/api/ICodeList";
import {ApiCache} from "./ApiCache";
import DataStructureTable from "./DataStructureTable";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;
const requestCache = new ApiCache();

type FilteredState = {
    registry: ISdmxRegistry,
    agencies: IAgency[],
    final: FinalStructureEnum
}

type SDMXViewProps = {
    setCodeList:(codeLists:ICodeList[]) => void
}

const SDMXView = ({setCodeList}:SDMXViewProps) => {
    const [registries, setRegistries] = useState<ISdmxRegistry[]>([]);
    const [registry, setRegistry] = useState<ISdmxRegistry | null>(null);
    const [registriesLoading, setRegistriesLoading] = useState<boolean>(true);

    const [agencies, setAgencies] = useState<IAgency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<IAgency[]>([]);
    const [agenciesLoading, setAgenciesLoading] = useState<boolean>(false);

    const [showFilters, setShowFilters] = useState(false);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [prevFilteredState, setPrevFilteredState] = useState<FilteredState | null>(null);

    const [reverted, setReverted] = useState(false);
    const dataStructureTableRef = useRef();
    const {enqueueSnackbar} = useSnackbar();

    const fetchRegistries = async () => {
        let registries: IResponse<ISdmxRegistryObject> | undefined = await getSdmxRegistries();
        if (registries && registries.data) {
            return registries.data.registries;
        }
        return [];
    };

    const fetchAgencies = async () => {
        let agencies: IResponse<IAgencyObject> | undefined = await getAgencies(registry!.id);
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
            setSelectedAgencies([]);
            if (registry) {
                setAgenciesLoading(true);
                setAgencies(await requestCache.checkIfExistsInMapOrAdd(SDMX_AGENCIES(registry.id), fetchAgencies));
                setAgenciesLoading(false);
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

    const onRegistriesChange = (event: any, newRegistry: ISdmxRegistry | null) => {
        setRegistry(newRegistry);
    };

    const onAgencyChange = (event: any, newAgencies: IAgency[]) => {
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
            setReverted(!reverted);
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
                <DataStructureTable ref={dataStructureTableRef} registry={registry} requestCache={requestCache}
                                    isFiltered={!!prevFilteredState}
                                    setPrevFilteredState={setPrevFilteredState} finalType={finalType}
                                    selectedAgencies={selectedAgencies} setCodeLists={setCodeLists}/>
            </div>
        </div>
    );


};
export default SDMXView;