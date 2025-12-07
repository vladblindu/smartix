// __bin/gen-conf/merger.ts

export class Merger {

    deepMerge(defaultValue: any, overrideValue: any): any {
        if (overrideValue === undefined) return defaultValue;
        if (defaultValue === undefined) return overrideValue;

        // arrays: full replace
        if (Array.isArray(defaultValue) || Array.isArray(overrideValue)) {
            return overrideValue;
        }

        // non-objects: override wins
        if (typeof defaultValue !== 'object' || typeof overrideValue !== 'object') {
            return overrideValue;
        }

        const result: Record<string, any> = { ...defaultValue };
        for (const key of Object.keys(overrideValue)) {
            result[key] = this.deepMerge(defaultValue[key], overrideValue[key]);
        }
        return result;
    }

    mergeTopLevel(defaults: Record<string, any>, overrides: (key: string) => Record<string, any> | null) {
        const merged: Record<string, any> = {};
        for (const key of Object.keys(defaults)) {
            const defaultValue = defaults[key];
            const overrideValue = overrides(key);
            if (overrideValue) {
                merged[key] = this.deepMerge(defaultValue, overrideValue);
            } else {
                merged[key] = defaultValue;
            }
        }
        return merged;
    }
}
