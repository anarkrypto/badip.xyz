type DNSResponse = {
	Status: number;
}

export default class DNSBLs {
	/*
        Google JSON API for DNS over HTTPS (DoH)
        https://developers.google.com/speed/public-dns/docs/doh/json
    */
	readonly dnsAPI = "https://dns.google/resolve?name=";

	dnsbls: string[];

	threshold: number

	constructor(dnsbls: string[], threshold?: number) {
		this.dnsbls = dnsbls;
		this.threshold = threshold || this.dnsbls.length
	}

	async checkRecordExists(name: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.dnsAPI}${name}`);
			const data = await response.json<DNSResponse>();

			if (typeof data.Status !== 'number') {
				console.error('Invalid Status type:', typeof data.Status, data);
				return false;
			}

			return data.Status === 0;
		} catch (error) {
			console.error(`Error checking record ${name}:`, error);
			return false;
		}
	}

	searchByIP(ip: string): Promise<string[]> {
		return new Promise(async (resolve) => {

			const reverseIP = ip.split(".").reverse().join(".");

			const found: string[] = []

			const promises = this.dnsbls.map(async (dnsbl) => {
				const exists = await this.checkRecordExists(`${reverseIP}.${dnsbl}`);
				if (exists){
					found.push(dnsbl);
					if (found.length >= this.threshold) {
						resolve(found)
					}
				}
				console.log(`${dnsbl} ${exists} ${this.threshold}`)
			})

			await Promise.all(promises)

			resolve(found) 
		})
	}
}
