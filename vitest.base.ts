import { defineConfig } from 'vitest/config';

/** Vitest config shared by the sites: runs the unit tests matching `include`, and does not fail when there are none. */
export function kitVitest(include: string[]) {
    return defineConfig({
        test: {
            include,
            passWithNoTests: true,
        },
    });
}
