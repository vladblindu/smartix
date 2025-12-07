// __bin/gen-conf/Yaml.ts

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import type { Paths } from './paths.class';

export class Yaml {
    
    constructor(private readonly paths: Paths) {}

    private assertRecord(value: unknown, what: string): asserts value is Record<string, any> {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`${what} must be a YAML mapping (object)`);
        }
    }

    loadDefaults(): Record<string, any> {
        if (!fs.existsSync(this.paths.defaultConfigPath)) {
            throw new Error(`Default config not found at ${this.paths.defaultConfigPath}`);
        }
        const raw = fs.readFileSync(this.paths.defaultConfigPath, 'utf8');
        const parsed = yaml.parse(raw);
        this.assertRecord(parsed, 'default.yaml');
        return parsed;
    }

    loadOverride(key: string): Record<string, any> | null {
        const overridePath = path.join(this.paths.resourcesConfigDir, `${key}.yaml`);
        if (!fs.existsSync(overridePath)) {
            return null;
        }
        const raw = fs.readFileSync(overridePath, 'utf8');
        const parsed = yaml.parse(raw);
        this.assertRecord(parsed, `${key}.yaml`);
        return parsed;
    }
}
