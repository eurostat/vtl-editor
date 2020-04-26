import { keywordRgx } from '../vocabularyPack';
import { MultiplyMode } from './multiplyMode';
import { RuleToken } from './ruleToken';
import { RuleTokenizer } from './ruleTokenizer';
import { StatementMetadata } from './statementMetadata';
import { StatementType } from './statementType';
import { SyntaxCollection } from './syntaxCollection';
import { SyntaxLink } from './syntaxLink';
import { TokenType } from './tokenType';

const terminators: string[] = ["EOL", "EOF"];

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
    private readonly metadata: StatementMetadata[] = [];
    private readonly tokens: RuleToken[] = [];
    private token: RuleToken | undefined;
    syntax: SyntaxLink | undefined;

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
            case TokenType.Keyword:
                this.type = StatementType.Keyword;
                this._label = token.identifier;
                this.unresolved = true;
                break;
            case TokenType.Operator:
                this.type = StatementType.Operator;
                this._label = token.identifier;
                this.unresolved = true;
                break;
            case TokenType.Operand:
                this.type = StatementType.Operand;
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
                             operators: Map<string, GrammarStatement>,
                             visited: Map<string, GrammarStatement>) {
        if (this.name) {
            if (visited.has(this.name)) return;
            visited.set(this.name, this);
        }
        this.statements.forEach((statement, index, statements) => {
            if (statement.unresolved && statement.name) {
                if (statement.isToken([TokenType.Rule])) {
                    const rule = rules.get(statement.name);
                    if (rule) {
                        if (rule !== statement) {
                            if (!rule.label && !!statement.label) rule.label = statement.label;
                            statements[index] = rule;
                        }
                        rule.resolveStatements(rules, operators, visited);
                    } else {
                        console.warn("Unknown rule in graph " + statement.name);
                    }
                } else if (statement.isToken([TokenType.Keyword, TokenType.Operator, TokenType.Operand]) ) {
                    const operator = operators.get(statement.name);
                    if (operator) {
                        if (operator !== statement) statements[index] = operator;
                    } else {
                        statement.unresolved = false;
                        operators.set(statement.name, statement);
                    }
                }
            } else {
                statement.resolveStatements(rules, operators, visited);
            }
        });
    }

    public resolveSyntax() {
        let syntax = new SyntaxLink();
        switch (this.type) {
            case StatementType.Rule: {
                if (this.statements.length === 1) {
                    syntax = this.statements[0].constructLink(false);
                    break;
                }
                let link: SyntaxLink | undefined;
                if (this.alternatives) {
                    syntax.alternatives = true;
                    this.statements.forEach((statement) => {
                            link = statement.constructLink(false);
                            if (link.hasKeyword()) syntax.add(link);
                    });
                } else {
                    this.statements.forEach((statement) => {
                        link = statement.constructLink(syntax.hasKeyword());
                        if (syntax.hasKeyword() || link.hasKeyword()) {
                            syntax.add(link);
                        }
                    });
                }
                break;
            }
            case StatementType.Block: {
                break;
            }
            case StatementType.Keyword: {
                if (!!this.value) syntax.keyword = this.value;
                else console.warn("Keyword without value " + this.name);
                break;
            }
            case StatementType.Operator: {
                if (!!this.value) syntax.operator = this.value;
                else console.warn("Operator without value " + this.name);
                break;
            }
            case StatementType.Operand: {
                if (!!this.name) syntax.operand = this.name;
                else console.warn("Operand without name");
                break;
            }
            default:
                console.warn("Unknown statement type " + this.type);
        }
        if (syntax.hasKeyword()) {
            syntax.collapse();
            this.syntax = syntax;
        }
    }

    private constructLink(keyword: boolean): SyntaxLink {
        let syntax = new SyntaxLink();
        syntax.multiplied = this.multiplied;
        switch (this.type) {
            case StatementType.Rule: {
                if (this.statements.length === 1) syntax = this.statements[0].constructLink(false);
                else if (!!this.name) syntax.rule = this.name;
                break;
            }
            case StatementType.Block: {
                if (this.statements.length === 1) {
                    syntax = this.statements[0].constructLink(keyword);
                    break;
                }
                let link: SyntaxLink | undefined;
                if (this.alternatives) {
                    syntax.alternatives = true;
                    this.statements.forEach((statement) => {
                        link = statement.constructLink(keyword);
                        if (keyword || link.hasKeyword()) {
                            syntax.add(link);
                        }
                    });
                } else {
                    this.statements.forEach((statement) => {
                        link = statement.constructLink(keyword || syntax.hasKeyword());
                        if (keyword || syntax.hasKeyword() || link.hasKeyword()) {
                            syntax.add(link);
                        }
                    });
                }
                break;
            }
            case StatementType.Keyword: {
                if (!!this.value) syntax.keyword = this.value;
                else console.warn("Keyword without value " + this.name);
                break;
            }
            case StatementType.Operator: {
                if (!!this.value) syntax.operator = this.value;
                else console.warn("Operator without value " + this.name);
                break;
            }
            case StatementType.Operand: {
                if (!!this.name) syntax.operand = this.name;
                else console.warn("Operand without name");
                break;
            }
            default:
                console.warn("Unknown statement type " + this.type);
        }
        syntax.collapse();
        return syntax;
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
                        if (previous.notEmpty() || this.value === "if")
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
        if (this.value === "if") {
            console.log(visited);
            console.log("ceil data " + this.name);
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
        if (this.multiplied === token.multiplied || token.multiplied === MultiplyMode.None) return;
        this.multiplied = this.multiplied === MultiplyMode.None
            ? token.multiplied
            : MultiplyMode.Zeromore;
    }

    private isToken(types: TokenType[]): boolean {
        return !!this.token && types.includes(this.token.type);
    }
}