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