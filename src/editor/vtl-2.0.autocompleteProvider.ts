import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {parseGrammar} from "./GrammarParser"


export const suggestions = (range: any, file: string):any[] => {
    return parseGrammar(file, range);
};
// export const  suggestions = (range: any):any[] => {
//     return [];
// };

// export const  suggestions = (range: any) => {
//     return [{
//         label: 'EXISTS_IN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'EXISTS_IN',
//         range: range
//      }
//     ,
// {
//         label: 'ROUND',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'ROUND',
//         range: range
//      }
//     ,
// {
//         label: 'CEIL',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CEIL',
//         range: range
//      }
//     ,
// {
//         label: 'FLOOR',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'FLOOR',
//         range: range
//      }
//     ,
// {
//         label: 'ABS',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'ABS',
//         range: range
//      }
//     ,
// {
//         label: 'EXP',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'EXP',
//         range: range
//      }
//     ,
// {
//         label: 'LN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LN',
//         range: range
//      }
//     ,
// {
//         label: 'LOG',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LOG',
//         range: range
//      }
//     ,
// {
//         label: 'TRUNC',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'TRUNC',
//         range: range
//      }
//     ,
// {
//         label: 'POWER',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'POWER',
//         range: range
//      }
//     ,
// {
//         label: 'SQRT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'SQRT',
//         range: range
//      }
//     ,
// {
//         label: 'LEN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LEN',
//         range: range
//      }
//     ,
// {
//         label: 'BETWEEN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'BETWEEN',
//         range: range
//      }
//     ,
// {
//         label: 'TRIM',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'TRIM',
//         range: range
//      }
//     ,
// {
//         label: 'LTRIM',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LTRIM',
//         range: range
//      }
//     ,
// {
//         label: 'RTRIM',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'RTRIM',
//         range: range
//      }
//     ,
// {
//         label: 'UCASE',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'UCASE',
//         range: range
//      }
//     ,
// {
//         label: 'LCASE',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LCASE',
//         range: range
//      }
//     ,
// {
//         label: 'SUBSTR',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'SUBSTR',
//         range: range
//      }
//     ,
// {
//         label: 'INSTR',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'INSTR',
//         range: range
//      }
//     ,
// {
//         label: 'REPLACE',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'REPLACE',
//         range: range
//      }
//     ,
// {
//         label: 'CHARSET_MATCH',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CHARSET_MATCH',
//         range: range
//      }
//     ,
// {
//         label: 'ISNULL',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'ISNULL',
//         range: range
//      }
//     ,
// {
//         label: 'NVL',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'NVL',
//         range: range
//      }
//     ,
// {
//         label: 'MOD',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'MOD',
//         range: range
//      }
//     ,
// {
//         label: 'FLOW_TO_STOCK',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'FLOW_TO_STOCK',
//         range: range
//      }
//     ,
// {
//         label: 'STOCK_TO_FLOW',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'STOCK_TO_FLOW',
//         range: range
//      }
//     ,
// {
//         label: 'EVAL',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'EVAL',
//         range: range
//      }
//     ,
// {
//         label: 'CAST',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CAST',
//         range: range
//      }
//     ,
// {
//         label: 'PERIOD_INDICATOR',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'PERIOD_INDICATOR',
//         range: range
//      }
//     ,
// {
//         label: 'TIMESHIFT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'TIMESHIFT',
//         range: range
//      }
//     ,
// {
//         label: 'FILL_TIME_SERIES',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'FILL_TIME_SERIES',
//         range: range
//      }
//     ,
// {
//         label: 'TIME_AGG',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'TIME_AGG',
//         range: range
//      }
//     ,
// {
//         label: 'CHECK',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CHECK',
//         range: range
//      }
//     ,
// {
//         label: 'CHECK_DATAPOINT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CHECK_DATAPOINT',
//         range: range
//      }
//     ,
// {
//         label: 'CHECK_HIERARCHY',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'CHECK_HIERARCHY',
//         range: range
//      }
//     ,
// {
//         label: 'HIERARCHY',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'HIERARCHY',
//         range: range
//      }
//     ,
// {
//         label: 'OVER',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'OVER',
//         range: range
//      }
//     ,
// {
//         label: 'FIRST_VALUE',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'FIRST_VALUE',
//         range: range
//      }
//     ,
// {
//         label: 'LAG',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LAG',
//         range: range
//      }
//     ,
// {
//         label: 'LAST_VALUE',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LAST_VALUE',
//         range: range
//      }
//     ,
// {
//         label: 'RANK',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'RANK',
//         range: range
//      }
//     ,
// {
//         label: 'RATIO_TO_REPORT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'RATIO_TO_REPORT',
//         range: range
//      }
//     ,
// {
//         label: 'LEAD',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'LEAD',
//         range: range
//      }
//     ,
// {
//         label: 'SUM',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'SUM',
//         range: range
//      }
//     ,
// {
//         label: 'AVG',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'AVG',
//         range: range
//      }
//     ,
// {
//         label: 'COUNT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'COUNT',
//         range: range
//      }
//     ,
// {
//         label: 'MEDIAN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'MEDIAN',
//         range: range
//      }
//     ,
// {
//         label: 'MIN',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'MIN',
//         range: range
//      }
//     ,
// {
//         label: 'MAX',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'MAX',
//         range: range
//      }
//     ,
// {
//         label: 'STDDEV_POP',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'STDDEV_POP',
//         range: range
//      }
//     ,
// {
//         label: 'STDDEV_SAMP',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'STDDEV_SAMP',
//         range: range
//      }
//     ,
// {
//         label: 'VAR_POP',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'VAR_POP',
//         range: range
//      }
//     ,
// {
//         label: 'VAR_SAMP',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'VAR_SAMP',
//         range: range
//      }
//     ,
// {
//         label: 'UNION',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'UNION',
//         range: range
//      }
//     ,
// {
//         label: 'SYMDIFF',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'SYMDIFF',
//         range: range
//      }
//     ,
// {
//         label: 'SETDIFF',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'SETDIFF',
//         range: range
//      }
//     ,
// {
//         label: 'INTERSECT',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'INTERSECT',
//         range: range
//      }
//     ,
// {
//         label: 'HAVING',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'HAVING',
//         range: range
//      }
//     ,
// {
//         label: 'IDENTIFIER',
//         kind: monaco.languages.CompletionItemKind.Function,
//         insertText: 'IDENTIFIER',
//         range: range
//      }
//     ,
// {
//         label: 'ASSIGN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ASSIGN',
//         range: range
//      }
//     ,
// {
//         label: 'PUT_SYMBOL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PUT_SYMBOL',
//         range: range
//      }
//     ,
// {
//         label: 'OPTIONAL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'OPTIONAL',
//         range: range
//      }
//     ,
// {
//         label: 'MEMBERSHIP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'MEMBERSHIP',
//         range: range
//      }
//     ,
// {
//         label: 'NOT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NOT',
//         range: range
//      }
//     ,
// {
//         label: 'IN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IN',
//         range: range
//      }
//     ,
// {
//         label: 'IDENTIFIER',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IDENTIFIER',
//         range: range
//      }
//     ,
// {
//         label: 'EXISTS_IN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'EXISTS_IN',
//         range: range
//      }
//     ,
// {
//         label: 'ALL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ALL',
//         range: range
//      }
//     ,
// {
//         label: 'AND',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'AND',
//         range: range
//      }
//     ,
// {
//         label: 'OR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'OR',
//         range: range
//      }
//     ,
// {
//         label: 'XOR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'XOR',
//         range: range
//      }
//     ,
// {
//         label: 'IF',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IF',
//         range: range
//      }
//     ,
// {
//         label: 'THEN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'THEN',
//         range: range
//      }
//     ,
// {
//         label: 'ELSE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ELSE',
//         range: range
//      }
//     ,
// {
//         label: 'CONCAT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CONCAT',
//         range: range
//      }
//     ,
// {
//         label: 'CURRENT_DATE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CURRENT_DATE',
//         range: range
//      }
//     ,
// {
//         label: 'IS',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IS',
//         range: range
//      }
//     ,
// {
//         label: 'VALUE_DOMAIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'VALUE_DOMAIN',
//         range: range
//      }
//     ,
// {
//         label: 'VARIABLE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'VARIABLE',
//         range: range
//      }
//     ,
// {
//         label: 'RULE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RULE',
//         range: range
//      }
//     ,
// {
//         label: 'CONDITION',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CONDITION',
//         range: range
//      }
//     ,
// {
//         label: 'AS',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'AS',
//         range: range
//      }
//     ,
// {
//         label: 'WHEN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'WHEN',
//         range: range
//      }
//     ,
// {
//         label: 'DEFINE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DEFINE',
//         range: range
//      }
//     ,
// {
//         label: 'OPERATOR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'OPERATOR',
//         range: range
//      }
//     ,
// {
//         label: 'RETURNS',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RETURNS',
//         range: range
//      }
//     ,
// {
//         label: 'END',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'END',
//         range: range
//      }
//     ,
// {
//         label: 'DEFAULT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DEFAULT',
//         range: range
//      }
//     ,
// {
//         label: 'LANGUAGE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LANGUAGE',
//         range: range
//      }
//     ,
// {
//         label: 'STRING_CONSTANT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'STRING_CONSTANT',
//         range: range
//      }
//     ,
// {
//         label: 'INTEGER_CONSTANT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'INTEGER_CONSTANT',
//         range: range
//      }
//     ,
// {
//         label: 'SINGLE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'SINGLE',
//         range: range
//      }
//     ,
// {
//         label: 'FIRST',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FIRST',
//         range: range
//      }
//     ,
// {
//         label: 'LAST',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LAST',
//         range: range
//      }
//     ,
// {
//         label: 'IMBALANCE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IMBALANCE',
//         range: range
//      }
//     ,
// {
//         label: 'INVALID',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'INVALID',
//         range: range
//      }
//     ,
// {
//         label: 'COMPONENTS',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'COMPONENTS',
//         range: range
//      }
//     ,
// {
//         label: 'ALL_MEASURES',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ALL_MEASURES',
//         range: range
//      }
//     ,
// {
//         label: 'NON_NULL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NON_NULL',
//         range: range
//      }
//     ,
// {
//         label: 'NON_ZERO',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NON_ZERO',
//         range: range
//      }
//     ,
// {
//         label: 'PARTIAL_NULL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PARTIAL_NULL',
//         range: range
//      }
//     ,
// {
//         label: 'PARTIAL_ZERO',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PARTIAL_ZERO',
//         range: range
//      }
//     ,
// {
//         label: 'ALWAYS_NULL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ALWAYS_NULL',
//         range: range
//      }
//     ,
// {
//         label: 'ALWAYS_ZERO',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ALWAYS_ZERO',
//         range: range
//      }
//     ,
// {
//         label: 'DATASET',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATASET',
//         range: range
//      }
//     ,
// {
//         label: 'DATASET_PRIORITY',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATASET_PRIORITY',
//         range: range
//      }
//     ,
// {
//         label: 'ERRORCODE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ERRORCODE',
//         range: range
//      }
//     ,
// {
//         label: 'ERRORLEVEL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ERRORLEVEL',
//         range: range
//      }
//     ,
// {
//         label: 'RULE_PRIORITY',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RULE_PRIORITY',
//         range: range
//      }
//     ,
// {
//         label: 'COMPUTED',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'COMPUTED',
//         range: range
//      }
//     ,
// {
//         label: 'RENAME',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RENAME',
//         range: range
//      }
//     ,
// {
//         label: 'PARTITION',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PARTITION',
//         range: range
//      }
//     ,
// {
//         label: 'BY',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'BY',
//         range: range
//      }
//     ,
// {
//         label: 'ORDER',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ORDER',
//         range: range
//      }
//     ,
// {
//         label: 'ASC',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ASC',
//         range: range
//      }
//     ,
// {
//         label: 'DESC',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DESC',
//         range: range
//      }
//     ,
// {
//         label: 'DATA',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATA',
//         range: range
//      }
//     ,
// {
//         label: 'POINTS',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'POINTS',
//         range: range
//      }
//     ,
// {
//         label: 'RANGE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RANGE',
//         range: range
//      }
//     ,
// {
//         label: 'BETWEEN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'BETWEEN',
//         range: range
//      }
//     ,
// {
//         label: 'PRECEDING',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PRECEDING',
//         range: range
//      }
//     ,
// {
//         label: 'FOLLOWING',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FOLLOWING',
//         range: range
//      }
//     ,
// {
//         label: 'CURRENT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CURRENT',
//         range: range
//      }
//     ,
// {
//         label: 'POINT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'POINT',
//         range: range
//      }
//     ,
// {
//         label: 'UNBOUNDED',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'UNBOUNDED',
//         range: range
//      }
//     ,
// {
//         label: 'USING',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'USING',
//         range: range
//      }
//     ,
// {
//         label: 'CALC',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CALC',
//         range: range
//      }
//     ,
// {
//         label: 'AGGREGATE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'AGGREGATE',
//         range: range
//      }
//     ,
// {
//         label: 'KEEP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'KEEP',
//         range: range
//      }
//     ,
// {
//         label: 'DROP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DROP',
//         range: range
//      }
//     ,
// {
//         label: 'FILTER',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FILTER',
//         range: range
//      }
//     ,
// {
//         label: 'TO',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'TO',
//         range: range
//      }
//     ,
// {
//         label: 'APPLY',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'APPLY',
//         range: range
//      }
//     ,
// {
//         label: 'FIRST_VALUE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FIRST_VALUE',
//         range: range
//      }
//     ,
// {
//         label: 'LAG',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LAG',
//         range: range
//      }
//     ,
// {
//         label: 'LAST_VALUE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LAST_VALUE',
//         range: range
//      }
//     ,
// {
//         label: 'RANK',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RANK',
//         range: range
//      }
//     ,
// {
//         label: 'RATIO_TO_REPORT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RATIO_TO_REPORT',
//         range: range
//      }
//     ,
// {
//         label: 'LEAD',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LEAD',
//         range: range
//      }
//     ,
// {
//         label: 'UNPIVOT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'UNPIVOT',
//         range: range
//      }
//     ,
// {
//         label: 'PIVOT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'PIVOT',
//         range: range
//      }
//     ,
// {
//         label: 'SUBSPACE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'SUBSPACE',
//         range: range
//      }
//     ,
// {
//         label: 'NOT_IN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NOT_IN',
//         range: range
//      }
//     ,
// {
//         label: 'IDENTIFIERMEMBERSHIP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'IDENTIFIERMEMBERSHIP',
//         range: range
//      }
//     ,
// {
//         label: 'SUM',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'SUM',
//         range: range
//      }
//     ,
// {
//         label: 'AVG',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'AVG',
//         range: range
//      }
//     ,
// {
//         label: 'COUNT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'COUNT',
//         range: range
//      }
//     ,
// {
//         label: 'MEDIAN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'MEDIAN',
//         range: range
//      }
//     ,
// {
//         label: 'MIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'MIN',
//         range: range
//      }
//     ,
// {
//         label: 'MAX',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'MAX',
//         range: range
//      }
//     ,
// {
//         label: 'STDDEV_POP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'STDDEV_POP',
//         range: range
//      }
//     ,
// {
//         label: 'STDDEV_SAMP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'STDDEV_SAMP',
//         range: range
//      }
//     ,
// {
//         label: 'VAR_POP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'VAR_POP',
//         range: range
//      }
//     ,
// {
//         label: 'VAR_SAMP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'VAR_SAMP',
//         range: range
//      }
//     ,
// {
//         label: 'RETURN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RETURN',
//         range: range
//      }
//     ,
// {
//         label: 'MEASURE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'MEASURE',
//         range: range
//      }
//     ,
// {
//         label: 'COMPONENT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'COMPONENT',
//         range: range
//      }
//     ,
// {
//         label: 'DIMENSION',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DIMENSION',
//         range: range
//      }
//     ,
// {
//         label: 'ATTRIBUTE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'ATTRIBUTE',
//         range: range
//      }
//     ,
// {
//         label: 'VIRAL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'VIRAL',
//         range: range
//      }
//     ,
// {
//         label: 'FLOAT_CONSTANT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FLOAT_CONSTANT',
//         range: range
//      }
//     ,
// {
//         label: 'INNER_JOIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'INNER_JOIN',
//         range: range
//      }
//     ,
// {
//         label: 'LEFT_JOIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'LEFT_JOIN',
//         range: range
//      }
//     ,
// {
//         label: 'FULL_JOIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FULL_JOIN',
//         range: range
//      }
//     ,
// {
//         label: 'CROSS_JOIN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'CROSS_JOIN',
//         range: range
//      }
//     ,
// {
//         label: 'GROUP',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'GROUP',
//         range: range
//      }
//     ,
// {
//         label: 'EXCEPT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'EXCEPT',
//         range: range
//      }
//     ,
// {
//         label: 'BOOLEAN_CONSTANT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'BOOLEAN_CONSTANT',
//         range: range
//      }
//     ,
// {
//         label: 'NULL_CONSTANT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NULL_CONSTANT',
//         range: range
//      }
//     ,
// {
//         label: 'STRING',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'STRING',
//         range: range
//      }
//     ,
// {
//         label: 'INTEGER',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'INTEGER',
//         range: range
//      }
//     ,
// {
//         label: 'FLOAT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'FLOAT',
//         range: range
//      }
//     ,
// {
//         label: 'BOOLEAN',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'BOOLEAN',
//         range: range
//      }
//     ,
// {
//         label: 'DATE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATE',
//         range: range
//      }
//     ,
// {
//         label: 'NUMBER',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'NUMBER',
//         range: range
//      }
//     ,
// {
//         label: 'TIME_PERIOD',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'TIME_PERIOD',
//         range: range
//      }
//     ,
// {
//         label: 'DURATION',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DURATION',
//         range: range
//      }
//     ,
// {
//         label: 'SCALAR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'SCALAR',
//         range: range
//      }
//     ,
// {
//         label: 'TIME',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'TIME',
//         range: range
//      }
//     ,
// {
//         label: 'RULESET',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'RULESET',
//         range: range
//      }
//     ,
// {
//         label: 'DATAPOINT',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATAPOINT',
//         range: range
//      }
//     ,
// {
//         label: 'DATAPOINT_ON_VD',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATAPOINT_ON_VD',
//         range: range
//      }
//     ,
// {
//         label: 'DATAPOINT_ON_VAR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'DATAPOINT_ON_VAR',
//         range: range
//      }
//     ,
// {
//         label: 'HIERARCHICAL',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'HIERARCHICAL',
//         range: range
//      }
//     ,
// {
//         label: 'HIERARCHICAL_ON_VD',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'HIERARCHICAL_ON_VD',
//         range: range
//      }
//     ,
// {
//         label: 'HIERARCHICAL_ON_VAR',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'HIERARCHICAL_ON_VAR',
//         range: range
//      }
//     ,
// {
//         label: 'SET',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'SET',
//         range: range
//      }
//     ,
// {
//         label: 'STRUCTURE',
//         kind: monaco.languages.CompletionItemKind.Keyword,
//         insertText: 'STRUCTURE',
//         range: range
//      }]
// };


