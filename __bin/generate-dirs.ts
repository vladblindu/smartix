#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

/**
 * Resolve $var references inside values
 */
function resolveVariables(
    input: Record<string, string>
): Record<string, string> {
    const resolved: Record<string, string> = {};

    const resolveValue = (value: string): string => {
        return value.replace(/\$([a-zA-Z0-9_]+)/g, (_, key) => {
            if (!resolved[key] && input[key]) {
                resolved[key] = resolveValue(input[key]);
            }
            return resolved[key] ?? `$${key}`;
        });
    };

    for (const key of Object.keys(input)) {
        resolved[key] = resolveValue(input[key]);
    }

    return resolved;
}

// Paths
const PROJECT_ROOT = process.cwd();
const YAML_PATH = path.join(PROJECT_ROOT, '__config', 'dirs.yaml');
const OUTPUT_PATH = path.join(
    PROJECT_ROOT,
    'src/lib/config/dirs.ts'
);

// Load YAML
const yamlRaw = fs.readFileSync(YAML_PATH, 'utf8');
const parsed = yaml.parse(yamlRaw) as {
    dirs: Record<string, string>;
};

if (!parsed?.dirs) {
    throw new Error('dirs.yaml must contain a top-level "dirs" object');
}

// Resolve $vars
const resolvedDirs = resolveVariables(parsed.dirs);

// Generate TS output
const generated = `/* AUTO-GENERATED FILE
 * DO NOT EDIT MANUALLY
 * Source: __config/dirs.yaml
 */

export const dirs = ${JSON.stringify(resolvedDirs, null, 2)} as const;

export type DirsConfig = typeof dirs;
`;

// Ensure output dir exists
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

// Write file
fs.writeFileSync(OUTPUT_PATH, generated, 'utf8');

console.log('✅ dirs.ts generated successfully at:');
console.log('   ', OUTPUT_PATH);
