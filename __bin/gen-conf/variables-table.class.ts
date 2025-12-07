// __bin/gen-conf/variable-table.class.ts

export type RawVariables = Record<string, string>;
export type ResolvedVariables = Record<string, string>;

export class VariableTable {
    private readonly rawVars: RawVariables = {};
    private readonly resolvedVars: ResolvedVariables = {};
    private readonly maxDepth = 20;

    collectFromConfig(config: Record<string, any>) {
        const walk = (node: any) => {
            if (!node || typeof node !== 'object') return;

            for (const [key, value] of Object.entries(node)) {
                if (key.startsWith('$') && typeof value === 'string') {
                    const name = key.slice(1); // strip leading "$"
                    this.rawVars[name] = value;
                }
                if (value && typeof value === 'object') {
                    walk(value);
                }
            }
        };

        walk(config);
    }

    private resolveOne(name: string, depth = 0, stack: Set<string> = new Set()): string {
        if (this.resolvedVars[name] !== undefined) {
            return this.resolvedVars[name];
        }

        const raw = this.rawVars[name];
        if (raw === undefined) {
            // Unknown variable – keep as $name (or throw if you prefer strict mode)
            return `$${name}`;
        }

        if (depth > this.maxDepth) {
            throw new Error(`Variable resolution depth exceeded for "${name}" (cyclic reference?)`);
        }

        if (stack.has(name)) {
            throw new Error(`Cyclic variable reference detected involving "${name}"`);
        }

        stack.add(name);

        const resolved = raw.replace(/\$([a-zA-Z0-9_]+)/g, (match, refName) => {
            // self-reference handled via recursion
            return this.resolveOne(refName, depth + 1, stack);
        });

        stack.delete(name);
        this.resolvedVars[name] = resolved;
        return resolved;
    }

    resolveAll(): ResolvedVariables {
        for (const name of Object.keys(this.rawVars)) {
            this.resolveOne(name);
        }
        return { ...this.resolvedVars };
    }
}
