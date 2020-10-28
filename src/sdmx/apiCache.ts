export class ApiCache {
    private static instance: ApiCache | undefined = undefined;
    private cache: Map<string, any> = new Map<string, any>();

    private constructor() {

    }

    static getInstance = () => {
        if (!ApiCache.instance) {
            ApiCache.instance = new ApiCache();
        }
        return ApiCache.instance;
    }

    clearCacheAndAdd = async (value: string, asyncFunction: any) => {
        this.cache.delete(value);
        return this.checkIfExistsInMapOrAdd(value, asyncFunction);
    }

    checkIfExistsInMapOrAdd = async (value: string, asyncFunction: any): Promise<any> => {
        if (this.cache.has(value)) {
            return this.cache.get(value);
        }
        return asyncFunction().then((requestResult: any) => {
            this.cache.set(value, requestResult);
            return this.cache.get(value);
        });
    };

}