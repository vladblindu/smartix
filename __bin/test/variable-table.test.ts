import { describe, it, expect } from 'vitest';
import { VariableTable } from '../gen-conf/variables-table.class';

describe('VariableTable', () => {
    it('collects and resolves simple variables', () => {
        const config = {
            $resourceRoot: '__resources',
            something: {
                $configRoot: '$resourceRoot/config'
            }
        };

        const table = new VariableTable();
        table.collectFromConfig(config);
        const resolved = table.resolveAll();

        expect(resolved.resourceRoot).toBe('__resources');
        expect(resolved.configRoot).toBe('__resources/config');
    });

    it('resolves chains of variables', () => {
        const config = {
            $a: 'alpha',
            $b: '$a-beta',
            $c: '$b-gamma'
        };

        const table = new VariableTable();
        table.collectFromConfig(config);
        const resolved = table.resolveAll();

        expect(resolved.a).toBe('alpha');
        expect(resolved.b).toBe('alpha-beta');
        expect(resolved.c).toBe('alpha-beta-gamma');
    });

    it('handles nested objects with variables', () => {
        const config = {
            level1: {
                $root: '/root',
                nested: {
                    $child: '$root/child'
                }
            }
        };

        const table = new VariableTable();
        table.collectFromConfig(config);
        const resolved = table.resolveAll();

        // collected from both levels
        expect(resolved.root).toBe('/root');
        expect(resolved.child).toBe('/root/child');
    });

    it('throws on cyclic variable references', () => {
        const config = {
            $a: '$b',
            $b: '$a'
        };

        const table = new VariableTable();
        table.collectFromConfig(config);

        expect(() => table.resolveAll()).toThrow(/Cyclic variable reference/i);
    });
});
