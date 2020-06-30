import {IBaseStruct} from "../../../models/api/IDataStructureDefinition";

export const dataPanelColumns = [
    {title: 'Id', field: 'id'},
    {title: 'Name', field: 'name'},
    {
        title: 'Type',
        render: (rowData: IBaseStruct) => rowData.structureType?.type || "",
        customFilterAndSearch: (term: string, rowData: IBaseStruct) => toLowerCase(rowData.structureType.type).includes(term.toLocaleLowerCase()),
        customSort: (a: IBaseStruct, b: IBaseStruct) => {
            let typeA = a.structureType.type;
            let typeB = b.structureType.type;
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        }
    },
    {
        title: 'Agency Id',
        render: (rowData: IBaseStruct) => rowData.structureType?.agencyId || "",
        customFilterAndSearch: (term: string, rowData: IBaseStruct) => toLowerCase(rowData.structureType?.agencyId).includes(term.toLocaleLowerCase()) || false,
        customSort: (a: IBaseStruct, b: IBaseStruct) => {
            let typeA = a.structureType?.agencyId || "";
            let typeB = b.structureType?.agencyId || "";
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        }
    },
    {
        title: 'Code list id',
        render: (rowData: IBaseStruct) => rowData.structureType?.id || "",
        customFilterAndSearch: (term: string, rowData: IBaseStruct) => toLowerCase(rowData.structureType?.id).includes(term.toLocaleLowerCase()) || false,
        customSort: (a: IBaseStruct, b: IBaseStruct) => {
            let typeA = a.structureType?.id || "";
            let typeB = b.structureType?.id || "";
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        }
    },
    {
        title: 'Version',
        render: (rowData: IBaseStruct) => rowData.structureType?.version || "",
        customFilterAndSearch: (term: string, rowData: IBaseStruct) => toLowerCase(rowData.structureType?.version).includes(term.toLocaleLowerCase()) || false,
        customSort: (a: IBaseStruct, b: IBaseStruct) => {
            let typeA = a.structureType?.version || "";
            let typeB = b.structureType?.version || "";
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        }
    },
    {
        title: 'Text type',
        render: (rowData: IBaseStruct) => rowData.structureType?.textType || "",
        customFilterAndSearch: (term: string, rowData: IBaseStruct) => toLowerCase(rowData.structureType?.textType).includes(term.toLocaleLowerCase()) || false,
        customSort: (a: IBaseStruct, b: IBaseStruct) => {
            let typeA = a.structureType?.textType || "";
            let typeB = b.structureType?.textType || "";
            if (typeA < typeB) return -1;
            if (typeA > typeB) return 1;
            return 0;
        }
    },
];


const toLowerCase = (value: string | undefined): string => {
    return value ? value.toLocaleLowerCase() : "";
}
