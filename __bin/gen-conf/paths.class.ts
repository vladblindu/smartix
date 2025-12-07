import fs from 'fs';
import nodePath from 'path';
import yaml from 'yaml';

type ToolPathsConfig = {
    defaultConfig?: string;
    resourcesConfigDir?: string;
    compiledConfig?: string;
};

type ToolConfig = {
    paths?: ToolPathsConfig;
};

export class Paths {
    readonly projectRoot: string;
    readonly defaultConfigPath: string;
    readonly resourcesConfigDir: string;
    readonly compiledConfigPath: string;

    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;

        const toolConfig = this.parseToolConfig();
        const paths = toolConfig.paths ?? {};

        const defaultConfigRel = paths.defaultConfig ?? '__config/default.yaml';
        const resourcesConfigDirRel = paths.resourcesConfigDir ?? '__resources/config';
        const compiledConfigRel = paths.compiledConfig ?? '__bin/config.compiled.json';

        this.defaultConfigPath = nodePath.resolve(projectRoot, defaultConfigRel);
        this.resourcesConfigDir = nodePath.resolve(projectRoot, resourcesConfigDirRel);
        this.compiledConfigPath = nodePath.resolve(projectRoot, compiledConfigRel);
    }

    private parseToolConfig(): ToolConfig {
        const configPath = nodePath.join(this.projectRoot, '__bin', 'config.yaml');

        if (!fs.existsSync(configPath)) {
            return {};
        }

        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.parse(raw);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(`__bin/config.yaml must contain a YAML mapping at top level`);
        }

        return parsed as ToolConfig;
    }
}
