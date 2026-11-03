import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config shared by the sites: serves the built site with `npm run preview` and runs the tests in Chromium.
 * Set PW_CHROMIUM_PATH to use a Chromium other than the one Playwright installed.
 */
export function kitPlaywright({ port, testDir }: { port: number; testDir: string }) {
    const chromiumPath = process.env.PW_CHROMIUM_PATH;
    return defineConfig({
        testDir,
        webServer: {
            command: `npm run preview -- --port ${port} --ignore-lock`,
            url: `http://localhost:${port}`,
            reuseExistingServer: !process.env.CI,
            gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
        },
        use: {
            baseURL: `http://localhost:${port}`,
        },
        projects: [
            {
                name: 'chromium',
                use: {
                    ...devices['Desktop Chrome'],
                    ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
                },
            },
        ],
    });
}
