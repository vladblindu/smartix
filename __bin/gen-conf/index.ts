#!/usr/bin/env ts-node

import { Paths } from './paths.class';
import { ConfigGenerator } from './config-generator.class';

function main() {
    const paths = new Paths();
    const generator = new ConfigGenerator(paths);
    generator.run();
}

main();
