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

	responseThreshold: number

	constructor(dnsbls: string[], responseThreshold?: number) {
		this.dnsbls = dnsbls;
		this.responseThreshold = responseThreshold || this.dnsbls.length
	}

	async checkRecordExists(name: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.dnsAPI}${name}`);
			const data = await response.json<DNSResponse>();
			return data.Status === 0;
		} catch (error) {
			console.error(`Error checking record ${name}. Details: ${error}`);
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
					if (found.length >= this.responseThreshold) {
						resolve(found)
					}
				}
				console.log(`${dnsbl} ${exists} ${this.responseThreshold}`)
			})

			await Promise.all(promises)

			resolve(found) 
		})
	}
}
