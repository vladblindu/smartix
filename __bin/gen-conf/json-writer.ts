// __bin/gen-conf/ConfigJsonWriter.ts
import fs from 'fs';
import path from 'path';
import type { Paths } from './paths.class';

export class JsonWriter {
    constructor(private readonly paths: Paths) {}

    write(compiledConfig: Record<string, any>) {
        const targetPath = this.paths.compiledConfigPath;
        const dir = path.dirname(targetPath);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(targetPath, JSON.stringify(compiledConfig, null, 2), 'utf8');

        console.log(`💾 Compiled JSON config written to ${targetPath}`);
    }
}
