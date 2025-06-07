type DNSResponse = {
	Status: number;
};

export default class DNSBLs {
	readonly dnsAPI = "https://dns.google/resolve?name=";
	dnsbls: string[];
	threshold: number;

	constructor(dnsbls: string[], threshold?: number) {
		this.dnsbls = dnsbls;
		this.threshold = threshold || this.dnsbls.length;
	}

	async checkRecordExists(
		name: string,
		signal?: AbortSignal
	): Promise<boolean> {
		try {
			const response = await fetch(`${this.dnsAPI}${name}`, { signal });
			const data = await response.json<DNSResponse>();

			if (typeof data.Status !== "number") {
				console.error("Invalid Status type:", typeof data.Status, data);
				return false;
			}

			return data.Status === 0;
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				return false;
			}
			console.error(`Error checking record ${name}:`, error);
			return false;
		}
	}

	searchByIP(ip: string): Promise<string[]> {
		return new Promise((resolve) => {
			if (this.dnsbls.length === 0) {
				resolve([]);
				return;
			}

			const reverseIP = ip.split(".").reverse().join(".");
			const found: string[] = [];
			const controller = new AbortController();
			const signal = controller.signal;
			let resolved = false;

			const promises = this.dnsbls.map(async (dnsbl) => {
				const exists = await this.checkRecordExists(
					`${reverseIP}.${dnsbl}`,
					signal
				);
				if (exists) {
					found.push(dnsbl);
					if (found.length >= this.threshold && !resolved) {
						resolved = true;
						controller.abort();
						resolve(found);
					}
				}
			});

			Promise.all(promises).finally(() => {
				if (!resolved) {
					resolved = true;
					resolve(found);
				}
			});
		});
	}
}
