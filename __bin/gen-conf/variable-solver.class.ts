// __bin/gen-conf/ConfigResolver.ts
import type { ResolvedVariables } from './variables-table.class';

export class ConfigResolver {
    constructor(private readonly vars: ResolvedVariables) {}

    private resolveString(input: string): string {
        if (!input.includes('$')) return input;

        return input.replace(/\$([a-zA-Z0-9_]+)/g, (match, name) => {
            const value = this.vars[name];
            return value !== undefined ? value : match; // keep as-is if unknown
        });
    }

    private resolveNode(node: any): any {
        if (typeof node === 'string') {
            return this.resolveString(node);
        }

        if (Array.isArray(node)) {
            return node.map((item) => this.resolveNode(item));
        }

        if (node && typeof node === 'object') {
            const out: Record<string, any> = {};
            for (const [key, value] of Object.entries(node)) {
                // Strip out variable *definitions* (keys starting with "$")
                if (key.startsWith('$')) continue;

                out[key] = this.resolveNode(value);
            }
            return out;
        }

        return node;
    }

    resolveConfig(root: Record<string, any>): Record<string, any> {
        return this.resolveNode(root);
    }
}
