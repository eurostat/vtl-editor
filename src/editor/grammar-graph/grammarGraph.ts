import { CharStreams, CommonTokenStream, Lexer, Parser } from 'antlr4ts';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import a4grammar from 'raw-loader!../../grammar/antlr4/ANTLRv4Parser.g4';
import { ANTLRv4Lexer } from '../../grammar/antlr4/ANTLRv4Lexer';
import { ANTLRv4Parser } from '../../grammar/antlr4/ANTLRv4Parser';
import { VocabularyPack } from '../vocabularyPack';
import { GrammarStatement } from './grammarStatement';
import { RuleToken } from './ruleToken';
import { rgxEscape, rgxReplace, RuleTokenizer } from './ruleTokenizer';
import { StatementType } from './statementType';
import { SyntaxCollection } from './syntaxCollection';
import { SyntaxLink } from './syntaxLink';

export class GrammarGraph<L extends Lexer, P extends Parser> {
    private vocabulary: VocabularyPack<L, P>;
    private readonly tokenizer: RuleTokenizer<L, P>;
    private readonly rules: Map<string, GrammarStatement> = new Map<string, GrammarStatement>();
    private readonly operators: Map<string, GrammarStatement> = new Map<string, GrammarStatement>();
    private readonly keywords: SyntaxCollection = new SyntaxCollection();
    private root: GrammarStatement | undefined;

    constructor(vocabulary: VocabularyPack<L, P>, grammar: string) {
        this.vocabulary = vocabulary;
        this.tokenizer = new RuleTokenizer(vocabulary);
        if (grammar && grammar.length > 0) this.processRaw(grammar);
    }

    private processAntlr(grammar: string) {
        // Strip import wrapping, comments, newlines and tabulators
        let processed = a4grammar
            .replace(/^export default "|(\\[rnt])+|";$/g, " ");
        console.log(processed);
        const lexer = new ANTLRv4Lexer(CharStreams.fromString(processed));
        // lexer.removeErrorListeners();
        // lexer.addErrorListener(new ConsoleErrorListener());
//         let token:Token | undefined | null = lexer.nextToken();
// let i = 0;
//         while (token !== null && token !== undefined && i < 100) {
//             if (token.type !== ANTLRv4Lexer.WS) {
//                 let tokenTypeName = lexer.vocabulary.getSymbolicName(token.type);
//                    console.log('token type: ' + tokenTypeName + ' / ' + token.type);
//             }
//             token = lexer.nextToken();
//             i++;
//         }

        const tokens = new CommonTokenStream(lexer as Lexer);
        console.log(tokens);
        const parser = new ANTLRv4Parser(tokens);
        // parser.removeErrorListeners();
        //parser.addErrorListener(new ConsoleErrorListener());

        const tree = parser["grammarSpec"]();

        console.log(tree.toStringTree(parser.ruleNames));

    }

    private processRaw(grammar: string) {
        // Strip import wrapping, comments, newlines and tabulators
        let processed = grammar
            .replace(/^export default "|\/\*.*?\*\/|(\\[rnt])+|";$/g, " ");

        // Replace literal tokens with names from vocabulary
        this.vocabulary.getLiteralNames().forEach((literal, index) => {
            const symbolic = this.vocabulary.symbolicName(index);
            if (!!literal && processed.includes(literal)) {
                // Escape all RegExp special characters first
                processed = processed.replace(
                    new RegExp(literal.replace(rgxEscape, rgxReplace), "g"),
                    " " + symbolic + " ");
            }
        });

        // Split grammar into rules
        processed.split(";")
            .filter((value) => value.includes(":"))
            .forEach((value, index, array) => {
                let colon = value.indexOf(":");
                const name = this.tokenizer.ruleName(
                    value.substr(0, colon).trim(), index);
                const tokens = this.tokenizer.tokenize(
                    value.substr(++colon).trim().replace(/ +/g, " "));
                this.addRule(name, tokens);
            });

        // Resolve remaining statements and collect operators
        this.rules.forEach((rule) =>
            rule.resolveStatements(this.rules, this.operators, new Map<string, GrammarStatement>()));

        // Resolve syntax of functions and operators
        this.rules.forEach((rule) => rule.resolveSyntax(this.keywords));
        this.keywords.distinct();
        console.log(this.keywords);

        // Find root
        const rule0 = this.vocabulary.ruleName(0);
        if (rule0) this.root = this.rules.get(rule0);
        console.log(this.rules);

        console.log(new Map(
            (Array.from(this.rules, ([key, value]) => [key, value.syntax])
                .filter((value) => value[1].length !== 0) as [string, SyntaxLink[]][])
                //.map((value) => [value[0], value[1].snippet])
            ));
    }

    private addRule(name: string, tokens: RuleToken[]): GrammarStatement {
        const rule = new GrammarStatement(StatementType.Rule, tokens, name);
        this.rules.set(name, rule);
        rule.processRule();
        return rule;
    }

    public rootName() {
        return !!this.root ? this.root.name : undefined;
    }
}