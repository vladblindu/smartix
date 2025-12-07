import type { Paths } from './paths.class';

import { Yaml } from './yaml.class';
import { Merger } from './merger.class';
import { VariableTable } from './variables-table.class';
import { ConfigResolver } from './variable-solver.class';
import { ConfigEmitter } from './config-emit.class';
import { JsonWriter } from './json-writer';

export class ConfigGenerator {
    private readonly loader: Yaml;
    private readonly merger: Merger;
    private readonly emitter: ConfigEmitter;
    private readonly jsonWriter: JsonWriter;

    constructor(private readonly paths: Paths) {
        this.loader = new Yaml(paths);
        this.merger = new Merger();
        this.emitter = new ConfigEmitter(paths.projectRoot);
        this.jsonWriter = new JsonWriter(paths);
    }

    run() {
        console.log('📄 Loading default config...');
        const defaults = this.loader.loadDefaults();

        console.log('🔧 Merging per-key overrides...');
        const merged = this.merger.mergeTopLevel(defaults, (key: string) =>
            this.loader.loadOverride(key)
        );

        console.log('📌 Collecting variables from merged config...');
        const varTable = new VariableTable();
        varTable.collectFromConfig(merged);
        const resolvedVars = varTable.resolveAll();

        console.log('🔄 Applying variables and stripping variable definitions...');
        const finalConfig = new ConfigResolver(resolvedVars).resolveConfig(merged);

        console.log('💾 Writing compiled JSON config for __bin utilities...');
        this.jsonWriter.write(finalConfig);

        // 🔧 Determine TS output dir from processed app config
        const dirs = finalConfig.dirs;
        let configRootRel = 'src/lib/config'; // sensible fallback

        if (dirs && typeof dirs.configRoot === 'string') {
            configRootRel = dirs.configRoot;
        } else {
            console.warn(
                '⚠️ No dirs.configRoot found in final config; using default "src/lib/config"'
            );
        }

        console.log(`📝 Emitting TypeScript config files to ${configRootRel}...`);
        this.emitter.emitAll(finalConfig, configRootRel);
    }
}
