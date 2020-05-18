import {parseGrammar} from "../GrammarParser"


export const suggestions = (range: any, file: string):any[] => {
    return parseGrammar(file, range);
};
