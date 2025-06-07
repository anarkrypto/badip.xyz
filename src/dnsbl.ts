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

	buildDnsHttpApi(dnsbl: string, ip: string) {
		const reverseIP = ip.split(".").reverse().join(".");
		const name = `${reverseIP}.${dnsbl}`;
		const httpApi = `${this.dnsAPI}${name}`;
		return { name, httpApi };
	}

	async checkRecordExists(
		dnsbl: string,
		ip: string,
		signal?: AbortSignal
	): Promise<boolean> {
		const { name, httpApi } = this.buildDnsHttpApi(dnsbl, ip);

		try {
			const response = await fetch(httpApi, { signal });
			const data = await response.json<DNSResponse>();

			if (typeof data.Status !== "number") {
				throw new Error (`Invalid Status type: ${typeof data.Status}`);
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

			const found: string[] = [];
			const controller = new AbortController();
			const signal = controller.signal;
			let resolved = false;

			const promises = this.dnsbls.map(async (dnsbl) => {
				const exists = await this.checkRecordExists(dnsbl, ip, signal);
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
