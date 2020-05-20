import {parseGrammar} from "../GrammarParser"
import {VTL_VERSION} from "../settings";


export const suggestions = (version: VTL_VERSION,range: any, file: string):any[] => {
    return parseGrammar(version,file, range);
};
