export interface CustomResponse<T> {
    status: boolean,
    data?: T;
    message: string,
    error?: ApiError
}


export interface ApiError{
    timestamp: string,
    status:number,
    error: string,
    message: string,
    path:string
}