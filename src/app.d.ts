// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// noinspection JSUnusedGlobalSymbols

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isAuthenticated: boolean;
			apiKey?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
