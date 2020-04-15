import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {IRange, languages} from "monaco-editor";
import {VTL_VERSION} from "./settings";

let suggestionMap: Map<VTL_VERSION,languages.CompletionItem[]> = new Map();

export const parseGrammar = (version: VTL_VERSION, method: string, range: IRange): languages.CompletionItem[] => {
    if(!suggestionMap.has(version)){
        suggestionMap.set(version, mapArrayIntoObject(prepareString(method), range));
    }
    return suggestionMap.get(version)!;
};

const prepareString = (method: string): string[] => {
    let temp: any[] = method.split(";")
    temp = temp.map(m => m.split(":")[1] || null);
    temp = temp.filter(m => m).map(m => m.split("\n"))
    temp = temp.flatMap(m => m);
    temp = temp.map(m => m.split(" "));
    return temp.flatMap(m => m).map(m => m.split("|")).flatMap(m => m);
};


const deleteRepeat = (map: Map<string, string[]>): void => {
    const functions = map.get(FUNCTION);
    let identifierArray = map.get(IDENTIFIER);
    if (identifierArray) {
        map.set(IDENTIFIER, identifierArray.filter(i => functions && !functions.includes(i)));
    }
};

const formatValue = (value: string): string => {
    return value.replace(/[^A-Z_]/g, "");
};

const isUpperCase = (value: string): boolean => {
    let matchLower: string[] | null = value?.match(/[a-z]/);
    let matchUpper: string[] | null = value?.match(/[A-Z]/);

    return (value && !matchLower && matchUpper && matchUpper.length > 0) || matchLower?.length === 0 || false;
};

const isNextBracket = (value: string): boolean => {
    return value.includes("'('");
};

const FUNCTION = "FUNCTION";
const IDENTIFIER = "IDENTIFIER";
const mapArrayIntoObject = (array: string[], range: IRange): languages.CompletionItem[] => {
    console.log("inside");
    const map: Map<string, string[]> = createMap(array);
    map.set(FUNCTION, Array.from(new Set(map.get(FUNCTION))));
    map.set(IDENTIFIER, Array.from(new Set(map.get(IDENTIFIER))));
    let functionArray = map.get(FUNCTION);
    let output: languages.CompletionItem[] = functionArray ? functionArray.map(v => mappingFunction(FUNCTION, v, range)) : [];
    let identifierArray = map.get(IDENTIFIER);
    let identifier: languages.CompletionItem[] = identifierArray ? identifierArray.map(v => mappingFunction(IDENTIFIER, v, range)) : [];
    return [...output, ...identifier];
};

const createMap = (array: string[]): Map<string, string[]> => {
    let map = new Map();
    map.set(FUNCTION, []);
    map.set(IDENTIFIER, []);
    array.forEach((inner, index) => {
        inner = inner.replace(" ", "");
        if (index + 1 < array.length && isUpperCase(inner) && isNextBracket(array[index + 1])) {
            map.get(FUNCTION).push(formatValue(inner).toLowerCase());
        } else if (isUpperCase(inner)) {
            map.get(IDENTIFIER).push(formatValue(inner).toLowerCase());
        }
    });
    deleteRepeat(map);
    return map;
};

const mappingFunction = (type: string, value: string, range: IRange): languages.CompletionItem => {
    let itemType = type === FUNCTION ? monaco.languages.CompletionItemKind.Function : monaco.languages.CompletionItemKind.Keyword;
    const insertText = type === FUNCTION ? value + "()" : value;
    return {
        label: value,
        kind: itemType,
        insertText: insertText,
        documentation: "test",
        range: range
    }

};
