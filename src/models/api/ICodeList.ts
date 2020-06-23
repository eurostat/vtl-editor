export interface ICodeList {
    agencyId: string,
    id: string,
    version: string,
    page: number,
    totalPages: number,
    codes: ICode[]
}

interface ICode {
    id: string,
    value: string
}