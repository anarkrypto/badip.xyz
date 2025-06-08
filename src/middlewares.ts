import { Context } from 'hono'

export const errorHandler = (err: Error, c: Context) => {
	if (err instanceof Error) {
		return c.json({ success: false, error: err.message }, 500);
	}
	return c.json({ success: false, error: "Unknown error" }, 500);
};
