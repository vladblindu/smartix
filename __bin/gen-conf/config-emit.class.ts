import fs from 'fs';
import nodePath from 'path';

export class ConfigEmitter {
    constructor(private readonly projectRoot: string) {}

    private toIdentifier(key: string): string {
        const cleaned = key.replace(/[^a-zA-Z0-9_]/g, '_');
        return /^[A-Za-z_]/.test(cleaned) ? cleaned : `cfg_${cleaned}`;
    }

    private capitalize(key: string): string {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    emitAll(resolvedConfig: Record<string, any>, configRootRelative: string) {
        const outputDir = nodePath.resolve(this.projectRoot, configRootRelative);

        fs.mkdirSync(outputDir, { recursive: true });

        const topLevelKeys = Object.keys(resolvedConfig);
        if (topLevelKeys.length === 0) {
            console.warn('⚠️ No top-level keys found in resolved config.');
            return;
        }

        for (const key of topLevelKeys) {
            const value = resolvedConfig[key];
            const identifier = this.toIdentifier(key);
            const typeName = `${this.capitalize(identifier)}Config`;
            const outputPath = nodePath.join(outputDir, `${key}.ts`);

            const fileContent = `/* AUTO-GENERATED FILE
 * DO NOT EDIT MANUALLY
 * Source defaults: __config/default.yaml
 * Overrides: __resources/config/${key}.yaml (if present)
 * Variables resolved globally across the full config instance.
 */

export const ${identifier} = ${JSON.stringify(value, null, 2)} as const;

// Suggested type:
// export type ${typeName} = typeof ${identifier};
`;

            fs.writeFileSync(outputPath, fileContent, 'utf8');
            console.log(`✅ Generated ${outputPath}`);
        }

        console.log('🎉 All config files generated.');
    }
}
