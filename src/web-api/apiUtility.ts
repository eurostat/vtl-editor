export function convertEntityDates(item: any) {
    const converted = Object.assign({} as any, item);
    if (item.createDate) converted.createDate = convertDate(item.createDate);
    if (item.updateDate) converted.updateDate = convertDate(item.updateDate);
    return converted;
}

function convertDate(origin: string): string {
    const date = new Date(origin);
    return `${date.toLocaleDateString("fr-CA")}, ${date.toLocaleTimeString()}`;
}