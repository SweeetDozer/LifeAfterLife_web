import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, ".", "");
    var apiProxyTarget = env.VITE_API_PROXY_TARGET;
    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: apiProxyTarget
                ? {
                    "/api": {
                        target: apiProxyTarget,
                        changeOrigin: true
                    }
                }
                : undefined
        }
    };
});
