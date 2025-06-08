import { Context, Next } from "hono";
import { Env } from "./env";

export const errorHandler = (err: Error, c: Context) => {
	if (err instanceof Error) {
		return c.json({ success: false, error: err.message }, 500);
	}
	return c.json({ success: false, error: "Unknown error" }, 500);
};

const CORS_HEADERS = {
	"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Max-Age": "86400",
	Vary: "Origin"
};

const getCorsOrigin = (
	origin: string | null,
	allowedOrigins: string[]
): string | null => {
	if (!origin) return null;
	if (allowedOrigins.includes("*")) return "*";
	return allowedOrigins.includes(origin) ? origin : null;
};

const getAllowedOrigins = (envOrigins: string | undefined): string[] => {
	if (!envOrigins) return ["*"];
	const origins = envOrigins
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean);
	return origins.length ? origins : ["*"];
};

export const corsMiddleware = () => {
	return async (c: Context<Env>, next: Next) => {
		const origin = c.req.header("Origin") || null;
		const allowedOrigins = getAllowedOrigins(c.env.ALLOWED_ORIGINS);
		const responseOrigin = getCorsOrigin(origin, allowedOrigins);

		// Handle preflight requests
		if (c.req.method === "OPTIONS") {
			if (!responseOrigin) {
				return c.text("", 204); // Deny CORS by omitting header
			}
			return c.text("", 204, {
				...CORS_HEADERS,
				"Access-Control-Allow-Origin": responseOrigin
			});
		}

		// Set CORS headers for other requests
		c.header("Access-Control-Allow-Origin", responseOrigin || "");
		c.header(
			"Access-Control-Allow-Methods",
			CORS_HEADERS["Access-Control-Allow-Methods"]
		);
		c.header(
			"Access-Control-Allow-Headers",
			CORS_HEADERS["Access-Control-Allow-Headers"]
		);
		c.header("Vary", CORS_HEADERS.Vary);

		await next();

		if (c.res.status >= 400 && responseOrigin) {
			c.res.headers.set("Access-Control-Allow-Origin", responseOrigin);
			c.res.headers.set("Vary", CORS_HEADERS.Vary);
		}
	};
};
