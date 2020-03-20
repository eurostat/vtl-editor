import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const parseGrammar = (method, range) => {
    return mapArrayIntoObject(prepareString(method), range);
};

const prepareString = (method) => {
    let temp = method.split(";")
    temp = temp.map(m => m.split(":")[1] || null);
    temp = temp.filter(m => m).map(m => m.split("\n"))
    temp = temp.flatMap(m => m);
    temp = temp.map(m => m.split(" "));
    return temp.flatMap(m => m).map(m => m.split("|")).flatMap(m => m);
};
const FUNCTION = "FUNCTION";
const IDENTIFIER = "IDENTIFIER";

const createMap = (array) => {
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

const deleteRepeat = (map) => {
    const functions = map.get(FUNCTION);
    map.set(IDENTIFIER, map.get(IDENTIFIER).filter(i => !functions.includes(i)));
}

const formatValue = (value) => {
    return value.replace(/[^A-Z_]/g, "");
};

const isUpperCase = (value) => {
    let matchLower = value?.match(/[a-z]/);
    let matchUpper = value?.match(/[A-Z]/);
    return (value && !matchLower && matchUpper?.length > 0) || matchLower?.length === 0 || false;
};

const isNextBracket = (value) => {
    return value.includes("'('");
};


const mapArrayIntoObject = (array, range) => {
    const map = createMap(array);
    map.set(FUNCTION, Array.from(new Set(map.get(FUNCTION))));
    map.set(IDENTIFIER, Array.from(new Set(map.get(IDENTIFIER))));
    // let output = map.get(FUNCTION).map(v => mappingFunction(FUNCTION, v, range)).reduce((x, y) => x + ",\n" + y);
    // let identifier = map.get(IDENTIFIER).map(v => mappingFunction(IDENTIFIER, v, range)).reduce((x, y) => x + ",\n" + y);
    // output += ",\n" + identifier;
    let output = map.get(FUNCTION).map(v => mappingFunction(FUNCTION, v, range));
    let identifier = map.get(IDENTIFIER).map(v => mappingFunction(IDENTIFIER, v, range));
    return [...output, ...identifier];
    //  return output;
};

const mappingFunction = (type, value, range) => {
    let itemType = type === FUNCTION ? monaco.languages.CompletionItemKind.Function : monaco.languages.CompletionItemKind.Keyword;
    const insertText = type === FUNCTION ? value + "()" : value;
    console.log("mapping");
    return {
        label: value,
        kind: itemType,
        insertText: insertText,
        range: range
    }

};
//
// const mappingFunction = (type, value) => {
//     type = type === FUNCTION ? "monaco.languages.CompletionItemKind.Function" : "monaco.languages.CompletionItemKind.Keyword";
//     return `{
//         label: '${value}',
//         kind: ${type},
//         insertText: '${value}',
//         range: range
//      }
//     `
// };
