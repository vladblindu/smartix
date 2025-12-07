// __bin/gen-conf/paths.ts
import path from 'path';

export class Paths {
    readonly projectRoot: string;
    readonly defaultConfigPath: string;
    readonly resourcesConfigDir: string;
    readonly outputDir: string;

    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.defaultConfigPath = path.join(projectRoot, '__config', 'default.yaml');
        this.resourcesConfigDir = path.join(projectRoot, '__resources', 'config');
        this.outputDir = path.join(projectRoot, 'src', 'lib', 'config');
    }
}
