export class ApiCache {
    cache: Map<string, any>;

    constructor() {
        this.cache = new Map<string, any>();
    }

    clearCacheAndAdd = async (value: string, asyncFunction: any) => {
        this.cache.delete(value);
        return await this.checkIfExistsInMapOrAdd(value, asyncFunction);
    }

    checkIfExistsInMapOrAdd = async (value: string, asyncFunction: any): Promise<any> => {
        if (this.cache.has(value)) {
            return this.cache.get(value);
        }
        const requestResult = await asyncFunction();
        this.cache.set(value, requestResult);
        return requestResult;
    };

}