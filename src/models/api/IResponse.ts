export interface IResponse<T> {
    status: boolean,
    data?: T;
    message: string,
    error?: IApiError
}


export interface IApiError{
    timestamp: string,
    status:number,
    error: string,
    message: string,
    path:string
}