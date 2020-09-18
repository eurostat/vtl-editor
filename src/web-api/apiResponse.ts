export interface ApiResponse<T> {
    success: boolean,
    status: number,
    data?: T,
    message: string,
    error?: ApiError
}

export interface ApiError {
    timestamp: string,
    status: number,
    error: string,
    message: string,
    path: string
}