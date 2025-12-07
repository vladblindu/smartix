// src/hooks.server.ts
import type {Handle} from '@sveltejs/kit'
import {json, redirect} from '@sveltejs/kit'
import {API_KEY} from '$env/static/private'

const PUBLIC_PATHS = new Set<string>([
    '/auth',          // login page we'll make later
    '/auth/login',    // login POST endpoint
    '/favicon.ico'
])

function isPublicPath(pathname: string) {
    if (PUBLIC_PATHS.has(pathname)) return true
    // allow SvelteKit assets and static files
    if (pathname.startsWith('/_app/')) return true
    return pathname.startsWith('/static/')

}

export const handle: Handle = async ({event, resolve}) => {
    const {url, cookies, request} = event
    const {pathname} = url

    // Default
    event.locals.isAuthenticated = false

    // 1) Try cookie
    const cookieKey = cookies.get('api_key')

    // 2) Try header (for programmatic/API/WebSocket clients later)
    const headerKey = request.headers.get('x-api-key')

    const providedKey = cookieKey ?? headerKey ?? undefined

    if (providedKey && providedKey === API_KEY) {
        event.locals.isAuthenticated = true
        event.locals.apiKey = providedKey
    }

    // Always let public routes through
    if (isPublicPath(pathname)) {
        return resolve(event)
    }

    // If authenticated, proceed normally
    if (event.locals.isAuthenticated) {
        return resolve(event)
    }

    // Unauthenticated request

    const accept = request.headers.get('accept') ?? ''
    const wantsHtml = accept.includes('text/html')

    // For page navigation (SSR/CSR), redirect to /auth
    if (wantsHtml) {
        throw redirect(303, '/auth')
    }

    // For API/fetch requests, return 401 JSON
    return json({error: 'Unauthorized'}, {status: 401})
}
