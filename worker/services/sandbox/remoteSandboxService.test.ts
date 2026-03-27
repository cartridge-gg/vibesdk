import { describe, expect, it } from 'vitest';

import { extractUpstreamReference, formatUpstreamError } from './remoteSandboxService';

describe('remoteSandboxService diagnostics', () => {
    it('extracts a reference from the upstream error body', () => {
        expect(extractUpstreamReference('internal error; reference = s1pnb56nk5k0flsf9bab8ksn', {})).toBe('s1pnb56nk5k0flsf9bab8ksn');
    });

    it('falls back to upstream headers when the body has no reference', () => {
        expect(extractUpstreamReference('internal error', { 'x-request-id': 'req_123' })).toBe('req_123');
    });

    it('includes status, reference, and truncated body in the formatted error', () => {
        const body = `${'x'.repeat(995)}reference = tlsmr0rmn9pleh4jcvc478vq`;
        const result = formatUpstreamError({
            endpoint: '/instances',
            method: 'POST',
            status: 500,
            statusText: 'Internal Server Error',
            body,
            responseHeaders: {},
        });

        expect(result.error).toContain('Runner service POST /instances failed');
        expect(result.error).toContain('status=500');
        expect(result.error).toContain('reference=tlsmr0rmn9pleh4jcvc478vq');
        expect(result.error).toContain('body=');
        expect(result.upstreamBody).toContain('[truncated ');
        expect(result.upstreamReference).toBe('tlsmr0rmn9pleh4jcvc478vq');
    });
});
