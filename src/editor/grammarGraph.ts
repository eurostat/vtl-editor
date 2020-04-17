import { CharStreams, CommonTokenStream, Lexer, Parser } from 'antlr4ts';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import a4grammar from 'raw-loader!../grammar/antlr4/ANTLRv4Parser.g4';
import { ANTLRv4Lexer } from '../grammar/antlr4/ANTLRv4Lexer';
import { ANTLRv4Parser } from '../grammar/antlr4/ANTLRv4Parser';
import { MultiplyMode, rgxEscape, rgxReplace, RuleToken, RuleTokenizer, TokenType } from './ruleTokenizer';
import { keywordRgx, VocabularyPack } from './vocabularyPack';

export enum StatementType {
    None = " ",
    Rule = "r",
    Block = "b",
    Atom = "a",
    Operator = "o",
    Unknown = "u"
}

const terminators: string[] = ["EOL", "EOF"];

export class GrammarGraph<L extends Lexer, P extends Parser> {
    private vocabulary: VocabularyPack<L, P>;
    private readonly tokenizer: RuleTokenizer<L, P>;
    private readonly rules: Map<string, GrammarStatement> = new Map<string, GrammarStatement>();
    private readonly operands: Map<string, GrammarStatement> = new Map<string, GrammarStatement>();
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
        this.vocabulary.literalNames.forEach((literal, index) => {
            const symbolic = this.vocabulary.symbolicNames[index];
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

        // Resolve remaining statements and collect operands
        this.rules.forEach((rule) =>
            rule.resolveStatements(this.rules, this.operands, new Map<string, GrammarStatement>()));

        // Find root
        this.root = this.rules.get(this.vocabulary.ruleNames[0]);
        // Mark root and subsequent statements as primaries (appearing at the line beginning)
        this.root?.markPrimary();
        const instructions = this.root?.constructSyntax(new SyntaxCollection(), new Map<string, GrammarStatement>());
        console.log(this.rules);
        console.log(instructions);
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

export class SyntaxCollection {
    entries: SyntaxEntry[] = [];
    terminated = false;

    add(syntax: string, terminated?: boolean) {
        if (!this.contains(syntax)) {
            const entry = new SyntaxEntry(
                syntax, (typeof terminated !== "undefined" && terminated));
            this.terminated = (this.terminated || this.entries.length === 0) && entry.terminated;
            this.entries.push(entry);
        }
    }

    addAll(syntaxes: SyntaxCollection) {
        if (syntaxes.notEmpty()) {
            this.terminated = (this.terminated || this.entries.length === 0) && syntaxes.terminated;
            const values = this.entries.map((entry) => entry.value);
            syntaxes.entries//.filter((entry) => !values.some((value) => value === entry.value))
                .forEach((entry) => this.entries.push(entry));
        }
    }

    merge(syntaxes: SyntaxCollection, delimiter: string) {
        if (!this.terminated && syntaxes.notEmpty()) {
            this.entries = this.entries.reduce((expanded, entry) => {
                if (entry.terminated) {
                    expanded.push(entry);
                } else {
                    syntaxes.entries.forEach((syntax) =>
                        expanded.push(new SyntaxEntry(entry.value + delimiter + syntax.value, syntax.terminated)));
                }
                return expanded;
            }, [] as SyntaxEntry[]);
            this.terminated = !this.entries.some((entry) => !entry.terminated);
        }
    }

    contains(value: string) {
        return false;
        // return this.entries.map((entry) => entry.value).some((entry) => entry === value);
    }

    isEmpty = () => this.entries.length === 0;
    notEmpty = (): boolean => this.entries.length !== 0;
    size = () => this.entries.length;
}

export class SyntaxEntry {
    value: string;
    terminated: boolean;

    constructor(value: string, terminated: boolean) {
        this.value = value;
        this.terminated = terminated;
    }
}

export class GrammarStatement {
    private type: StatementType = StatementType.None;
    private _name: string | undefined;
    private _label: string | undefined;
    private _value: string | undefined;
    private _primary: boolean = false;
    private alternatives: boolean = false;
    private unresolved: boolean = false;
    private multiplied: MultiplyMode = MultiplyMode.None;
    private greedy: boolean = false;
    private readonly statements: GrammarStatement[] = [];
    private readonly tokens: RuleToken[] = [];
    private token: RuleToken | undefined;

    constructor(type: StatementType, tokens: RuleToken[], name?: string) {
        this.type = type;
        this.tokens = tokens;
        if (name) this._name = name;
    }

    public processRule() {
        if (this.tokens.length === 0 || this.statements.length !== 0 || this.token) return;
        let tokens = this.tokens;

        // ruleBlock and ruleAltList Antlr4 rule
        if (tokens.length === 1) {
            this.processToken(tokens[0]);
            return;
        }
        let statements = RuleTokenizer.alternatives(tokens);
        if (statements.length === 1) {
            this.processRuleAlternative(statements[0]);
        } else if (statements.length > 1) {
            this.alternatives = true;
            statements.forEach((statement) => this.addRuleAlternative(statement));
        }
    }

    private addRuleAlternative(tokens: RuleToken[]) {
        if (tokens.length === 0) return;
        const statement = new GrammarStatement(StatementType.Block, tokens);
        this.statements.push(statement);
        statement.processRuleAlternative(tokens);
    }

    private processRuleAlternative(tokens: RuleToken[]) {
        if (tokens.length === 0) return;
        // labeledAlt Antlr4 rule
        if (tokens.length === 1) {
            this.processToken(tokens[0]);
            return;
        }
        const hashIndex = tokens.findIndex((token) => token.type === TokenType.Hash);
        if (hashIndex > -1) {
            this._label = tokens.slice(hashIndex + 1).map((token) => token.name).join("");
            tokens = tokens.slice(0, hashIndex);
        }
        this.processElements(tokens);
    }

    private processElements(tokens: RuleToken[]) {
        if (tokens.length === 0) return;
        // alternative Antlr4 rule
        if (tokens.length === 1) {
            this.processToken(tokens[0]);
            return;
        }
        let i = 0;
        let token = tokens[0];
        const length = tokens.length;
        while (i < tokens.length) {
            token = tokens[i];
            switch (token.type) {
                case TokenType.Identifier: {
                    // labeledElement Antlr4 rule
                    if (i + 2 < length) {
                        const assign = tokens[++i];
                        const element = tokens[++i];
                        if (assign.isAssign()) {
                            if (element.type === TokenType.Lparen && element.sibling) {
                                element.label(token.name);
                                const index = tokens.indexOf(element.sibling);
                                if (index > i) {
                                    this.addBlock(tokens.slice(i, index + 1));
                                    i = index;
                                }
                                break;
                            } else if (element.isAtom()) {
                                element.label(token.name);
                                this.addAtom(element);
                                break;
                            }
                        }
                    }
                    console.error("Missing or mismatched token(s) after identifier");
                    break;
                }
                case TokenType.Lparen: {
                    // ebnf Antlr4 rule
                    if (token.sibling) {
                        const index = tokens.indexOf(token.sibling);
                        if (index > i) {
                            this.addBlock(tokens.slice(i, index + 1));
                            i = index;
                        }
                    } else {
                        console.error("Missing right parenthesis token");
                    }
                    break;
                }
                default:
                    if (token.isAtom()) {
                        // atom Antlr4 rule
                        this.addAtom(token);
                    } else {
                        console.warn("Unexpected token " + token.name + " of type " + token.type);
                    }
            }
            i++;
        }
    }

    private addAtom(token: RuleToken) {
        const statement = new GrammarStatement(StatementType.Atom, [token]);
        this.statements.push(statement);
        statement.processToken(token);
    }

    private processToken(token: RuleToken) {
        this.token = token;
        this._name = token.name;
        this._value = token.value;
        this.multiply(token);
        switch (token.type) {
            case TokenType.Rule:
                this.type = StatementType.Rule;
                if (!this._label) this._label = token.identifier;
                this.unresolved = true;
                break;
            case TokenType.Operator:
                this.type = StatementType.Operator;
                this._label = token.identifier;
                this.unresolved = true;
                break;
            default:
                console.warn("Unexpected token " + token.name + " of type " + token.type);
        }
    }

    private addBlock(tokens: RuleToken[]) {
        if (tokens.length === 0) return;
        const statement = new GrammarStatement(StatementType.Block, tokens);
        this.statements.push(statement);
        statement.processBlock(tokens);
    }

    public processBlock(tokens: RuleToken[]) {
        const left = tokens[0];
        const right = tokens[tokens.length - 1];
        if (left.type === TokenType.Lparen && right.type === TokenType.Rparen
            && left.sibling === right) {
            this.multiply(right);
            this._label = left.identifier;
            tokens = RuleTokenizer.unnest(tokens);
            // altList Antldir4 rule
            let statements = RuleTokenizer.alternatives(tokens);
            if (statements.length === 1) {
                this.processElements(statements[0]);
            } else if (statements.length > 1) {
                this.alternatives = true;
                statements.forEach((statement) => this.addAlternative(statement));
            }
        } else {
            console.error("Missing parenthesis tokens in block");
        }
    }

    private addAlternative(tokens: RuleToken[]) {
        if (tokens.length === 0) return;
        const statement = new GrammarStatement(StatementType.Block, tokens);
        this.statements.push(statement);
        statement.processElements(tokens);
    }

    public resolveStatements(rules: Map<string, GrammarStatement>,
                             operands: Map<string, GrammarStatement>,
                             visited: Map<string, GrammarStatement>) {
        if (this.name) {
            if (visited.has(this.name)) return;
            visited.set(this.name, this);
        }
        this.statements.forEach((statement, index, statements) => {
            if (statement.unresolved && statement.name) {
                if (statement.isToken(TokenType.Rule)) {
                    const rule = rules.get(statement.name);
                    if (rule) {
                        if (rule !== statement) {
                            if (!rule.label && !!statement.label) rule.label = statement.label;
                            statements[index] = rule;
                        }
                        rule.resolveStatements(rules, operands, visited);
                    } else {
                        console.warn("Unknown rule in graph " + statement.name);
                    }
                } else if (statement.isToken(TokenType.Operator)) {
                    const operand = operands.get(statement.name);
                    if (operand) {
                        if (operand !== statement) statements[index] = operand;
                    } else {
                        statement.unresolved = false;
                        operands.set(statement.name, statement);
                    }
                }
            } else {
                statement.resolveStatements(rules, operands, visited);
            }
        });
    }

    public constructSyntax(previous: SyntaxCollection, visited: Map<string, GrammarStatement>): SyntaxCollection {
        const combined: SyntaxCollection = new SyntaxCollection();
        let visiset = false;

        if (previous.size() > 1000) return combined;
        // if (previous.notEmpty()) console.log(previous.entries);
        switch (this.type) {
            case StatementType.Rule: {
                if (this.name) {
                    if (visited.has(this.name)) {
                        if (previous.notEmpty()) combined.add("<" + this.name + ">");
                        break;
                    }
                    visited.set(this.name, this);
                    visiset = true;

                    let syntaxes: SyntaxCollection = new SyntaxCollection();
                    if (this.alternatives) {
                        this.statements.forEach((statement) => {
                            syntaxes.addAll(statement.constructSyntax(previous, visited));
                        });
                    } else {
                        this.statements.forEach((statement) => {
                            if (syntaxes.isEmpty()) syntaxes.addAll(statement.constructSyntax(previous, visited));
                            else syntaxes.merge(statement.constructSyntax(syntaxes, visited), " ");
                        });
                    }
                    combined.addAll(syntaxes);
                    break;
                } else {
                    console.warn("Unnamed rule " + this.name);
                }
                break;
            }
            case StatementType.Block: {
                let syntaxes: SyntaxCollection = new SyntaxCollection();
                if (this.alternatives) {
                    this.statements.forEach((statement) => {
                        syntaxes.addAll(statement.constructSyntax(previous, visited));
                    });
                } else {
                    this.statements.forEach((statement) => {
                        if (syntaxes.isEmpty()) syntaxes.addAll(statement.constructSyntax(previous, visited));
                        else syntaxes.merge(statement.constructSyntax(syntaxes, visited), " ");
                    });
                }
                combined.addAll(syntaxes);
                break;
            }
            case StatementType.Operator: {
                if (!!this.value) {
                    if (previous.notEmpty() || keywordRgx.test(this.value)) {
                        if (previous.notEmpty() || this.value === "check")
                        combined.add(this.value, !!this.name && terminators.includes(this.name));
                    }
                } else {
                    if (previous.notEmpty() && !!this.name) {
                        combined.add("<" + this.name.toLocaleLowerCase() + ">", terminators.includes(this.name));
                    }
                }
                break;
            }
            default:
                console.warn("Unknown statement type " + this.type);
        }
        if (visiset && !!this.name) visited.delete(this.name);
        if (this.name === "joinExpr") {
            console.log("join data");
            console.log(previous);
            console.log(combined);
        }
        return combined;
    }

    public markPrimary() {
        if (this._primary) return;
        this._primary = true;
        if (this.statements.length !== 0) {
            if (this.alternatives) {
                this.statements.forEach((statement) => statement.markPrimary())
            } else {
                this.statements[0].markPrimary();
                let i = 1;
                while (i < this.statements.length && this.statements[i - 1].isOptional()) {
                    this.statements[i++].markPrimary();
                }
            }
        }
    }

    public isOptional(): boolean {
        return this.multiplied === MultiplyMode.Optional
            || this.multiplied === MultiplyMode.Zeromore;
    }

    public is(type: StatementType): boolean {
        return this.type === type;
    }

    get name(): string | undefined {
        return this._name;
    }

    get label(): string | undefined {
        return this._label;
    }

    set label(label: string | undefined) {
        this._label = label;
    }

    get value(): string | undefined {
        return this._value;
    }

    get primary(): boolean {
        return this._primary;
    }

    private multiply(token: RuleToken) {
        this.greedy = this.greedy || token.greedy;
        if (this.multiplied === token.multiplied) return;
        this.multiplied = this.multiplied === MultiplyMode.None
            ? token.multiplied
            : MultiplyMode.Zeromore;
    }

    private isToken(type: TokenType): boolean {
        return !!this.token && this.token.type === type;
    }
}
