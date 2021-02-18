import { faChevronDown, faFilter, faSyncAlt, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Autocomplete } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PageHeader from "../main-view/page-header/pageHeader";
import DataStructureTable from "./dataStructureTable";
import { Agency } from "./entity/Agency";
import { FinalStructureEnum } from "./entity/DataStructure";
import { SdmxRegistry } from "./entity/SdmxRegistry";
import { SdmxResult } from "./entity/SdmxResult";
import { fetchAgencies, fetchRegistries } from "./sdmxService";
import "./sdmxView.scss"

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

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

const SdmxView = ({
                      registry, setRegistry,
                      agencies, setAgencies,
                      selectedAgencies, setSelectedAgencies,
                      finalType, setFinalType, setSdmxResult, clearSdmxState
                  }: SDMXViewProps) => {
    const [registries, setRegistries] = useState<SdmxRegistry[]>([]);
    const [registriesLoading, setRegistriesLoading] = useState<boolean>(false);

    const [agenciesLoading, setAgenciesLoading] = useState<boolean>(false);

    const [showFilters, setShowFilters] = useState(false);
    const [prevFilteredState, setPrevFilteredState] = useState<FilteredState | null>(null);

    const dataStructureTableRef = useRef();
    const {enqueueSnackbar} = useSnackbar();

    const loadRegistries = useCallback(async (refresh: boolean) => {
        setRegistriesLoading(true);
        return fetchRegistries(refresh)
            .then((fetched) => {
                setRegistriesLoading(false);
                return fetched;
            })
            .catch(() => {
                setRegistriesLoading(false);
                enqueueSnackbar(`Failed to load registries.`, {variant: "error"});
                return Promise.reject();
            });
    }, [enqueueSnackbar]);

    const loadAgencies = useCallback(async (registryId: string, refresh: boolean) => {
        setAgenciesLoading(true);
        return fetchAgencies(registryId, refresh)
            .then((fetched) => {
                setAgenciesLoading(false);
                return fetched;
            })
            .catch(() => {
                setAgenciesLoading(false);
                enqueueSnackbar(`Failed to load agencies.`, {variant: "error"});
                return Promise.reject();
            });
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadRegistries(false)
            .then((loaded) => setRegistries(loaded))
            .catch(() => {
            });
    }, [loadRegistries]);

    useEffect(() => {
        if (registry) {
            loadAgencies(registry.id, false)
                .then((loaded) => setAgencies(loaded))
                .catch(() => {
                });
        }
    }, [registry, loadAgencies, setAgencies]);

    const onRegistriesRefresh = () => {
        loadRegistries(true).then((loaded) => {
            setSelectedAgencies([]);
            setRegistry(null);
            setRegistries(loaded);
            enqueueSnackbar(`Registries refreshed successfully.`, {variant: "success"});
        }).catch(() => {
        });
    };

    /**
     * Clearing current selected agencies.
     * Clearing stored agencies in cache for currently selected registry
     * It is necessary to choose registry
     */
    const onAgenciesRefresh = () => {
        if (registry) {
            loadAgencies(registry.id, true).then((loaded) => {
                setSelectedAgencies([]);
                setAgencies(loaded);
                enqueueSnackbar(`Agencies from ${registry.name} refreshed successfully.`,
                    {variant: "success"});
            }).catch(() => {
            });
        } else {
            enqueueSnackbar(`Select registry first.`, {variant: "error"});
        }
    }

    const onRegistryChange = (event: any, newRegistry: SdmxRegistry | null) => {
        setRegistry(newRegistry);
        setSelectedAgencies([]);
    };

    const onAgencyChange = (event: any, newAgencies: Agency[]) => {
        setSelectedAgencies(newAgencies);
    };

    const onFinalChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setFinalType(event.target.value as FinalStructureEnum);
    };

    const onFilterClear = () => {
        setSelectedAgencies([]);
        setFinalType(FinalStructureEnum.ALL);
    }

    const onFilterApply = () => {
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
            <PageHeader title={"Import Data Structure Definition"}/>
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
                            onChange={onRegistryChange}
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
                        {registry?.url ? <p>Selected registry URL: {registry.url}</p> : null}
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
                                        onChange={onFinalChange}
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
                                <Tooltip title="Apply filter" placement="top" arrow>
                                    <button className={`btn btn-primary default-button button-margin-right`}
                                            onClick={onFilterApply}>
                                        <FontAwesomeIcon icon={faFilter}/>
                                        <span>Apply</span>
                                    </button>
                                </Tooltip>
                                <Tooltip title="Clear filter" placement="top" arrow>
                                    <button className="btn btn-primary default-button outline-button"
                                            onClick={onFilterClear}>
                                        <FontAwesomeIcon icon={faUndoAlt}/>
                                        <span>Clear</span>
                                    </button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </div>
                </div>
                <Row style={{marginBottom: "20px"}}>
                    <Col xs={12} className="justify-content-end">
                        <Tooltip title="Display data structure definitions" placement="top" arrow>
                            <button className={`btn btn-primary default-button`}
                                    onClick={onFilterApply}>
                                <span>Show Definitions</span>
                            </button>
                        </Tooltip>
                    </Col>
                </Row>
            </Container>
            <div className="table-container">
                <DataStructureTable ref={dataStructureTableRef} {...DataStructureTableProps}/>
            </div>
        </div>
    );

};
export default SdmxView;