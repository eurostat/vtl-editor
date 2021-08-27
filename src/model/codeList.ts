export interface CodeListDetails extends CodeList {
    structureId: string;
    name: string;
}

export interface CodeList {
    agencyId: string;
    id: string;
    version: string;
    page: number;
    totalPages: number;
    codes: Code[];
}

export interface Code {
    id: string;
    value: string;
}
