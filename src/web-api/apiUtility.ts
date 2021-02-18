export function convertEntityDates(item: any) {
    const converted = Object.assign({} as any, item);
    if (item.createDate) converted.createDate = new Date(item.createDate).toLocaleString();
    if (item.updateDate) converted.updateDate = new Date(item.updateDate).toLocaleString();
    return converted;
}