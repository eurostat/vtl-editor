import { MultiplyMode } from './multiplyMode';
import { StatementType } from './statementType';

const identifierPrefix = "<";
const identifierPostfix = ">";
const alternativesPrefix = "{";
const alternativesPostfix = "}¹";
const optionalPrefix = "{";
const optionalPostfix = "}";
const zeromorePrefix = "{";
const zeromorePostfix = "}*";
const onemorePrefix = "{";
const onemorePostfix = "}+";

export class SyntaxLink {
    private _chain: SyntaxLink[] = [];
    private _keywords: string[] = [];
    private _alternatives: boolean = false;
    private _snippet: string = "";
    private _value: string = "";
    private _multiplied: MultiplyMode = MultiplyMode.None;
    private _type: StatementType = StatementType.None;

    constructor(value?: string) {
        if (value) this._value = value;
    }

    add(entry: SyntaxLink) {
        this._chain.push(entry);
        if (this._alternatives || !this.hasKeyword()) this._keywords.push(...entry._keywords);
        this.constructSnippet();
    }

    collapse() {
        this._chain = this._chain.filter((link) => !link.isEmpty());
        if (this._alternatives && this._chain.length < 2) this._alternatives = false;
        if (this._chain.length === 1) {
            const link = this._chain[0];
            this._chain = link._chain;
            this._keywords = link._keywords;
            this._alternatives = link._alternatives;
            this._snippet = link._snippet;
            this._value = link._value;
            if (this._multiplied !== link._multiplied && link._multiplied !== MultiplyMode.None) {
                this._multiplied = this._multiplied === MultiplyMode.None
                    ? link._multiplied
                    : MultiplyMode.Zeromore;
            }
            this._type = link._type;
        }
        this.constructSnippet();
    }

    constructSnippet() {
        if (this.hasValue()) {
            this._snippet = this.multiplyPrefix()
                + (this.isType([StatementType.Rule, StatementType.Operand])
                    ? identifierPrefix + this._value + identifierPostfix
                    : this._value)
                + this.multiplyPostfix();
            if (this.hasChain()) console.warn("Link with chain and value " + this._value);
        } else {
            if (this._alternatives) {
                this._snippet = (this.isMultiplied() ? this.multiplyPrefix() : alternativesPrefix)
                    + this._chain.map((link) => link._snippet).join(" | ")
                    + (this.isMultiplied() ? this.multiplyPostfix() : alternativesPostfix);
            } else {
                this._snippet = this._chain.map((link) => link._snippet).join(" ");
            }
        }
    }

    private multiplyPrefix(): string {
        switch (this._multiplied) {
            case MultiplyMode.None:
                return "";
            case MultiplyMode.Optional:
                return optionalPrefix;
            case MultiplyMode.Onemore:
                return onemorePrefix;
            case MultiplyMode.Zeromore:
                return zeromorePrefix;
        }
    }

    private multiplyPostfix(): string {
        switch (this._multiplied) {
            case MultiplyMode.None:
                return "";
            case MultiplyMode.Optional:
                return optionalPostfix;
            case MultiplyMode.Onemore:
                return onemorePostfix;
            case MultiplyMode.Zeromore:
                return zeromorePostfix;
        }
    }

    contains(value: string) {
        return this._chain.some((entry) => entry._value === value);
    }

    get alternatives(): boolean {
        return this._alternatives;
    }

    set alternatives(alternatives: boolean) {
        this._alternatives = alternatives;
    }

    get value(): string {
        return this._value;
    }

    set keyword(value: string) {
        this._value = value;
        this._keywords.push(this._value);
        this._type = StatementType.Keyword;
        this.constructSnippet();
    }

    set operator(value: string) {
        this._value = value;
        this._type = StatementType.Operator;
        this.constructSnippet();
    }

    set operand(value: string) {
        this._value = value;
        this._type = StatementType.Operand;
        this.constructSnippet();
    }

    set rule(value: string) {
        this._value = value;
        this._type = StatementType.Rule;
        this.constructSnippet();
    }

    get snippet(): string {
        return this._snippet;
    }

    get multiplied(): MultiplyMode {
        return this._multiplied;
    }

    set multiplied(value: MultiplyMode) {
        this._multiplied = value;
    }

    private isType(types: StatementType[]): boolean {
        return types.includes(this._type);
    }

    hasKeyword = (): boolean => this._keywords.length !== 0;
    hasChain = (): boolean => this._chain.length !== 0;
    hasValue = (): boolean => this._value !== "";
    isEmpty = (): boolean => !this.hasChain() && !this.hasValue();
    isMultiplied = (): boolean => this._multiplied === MultiplyMode.Optional
        || this._multiplied === MultiplyMode.Onemore
        || this._multiplied === MultiplyMode.Zeromore;
}