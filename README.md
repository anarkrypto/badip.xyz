# BAD IP API

Detect bad IPS on your network and applications with this JSON REST API built with TypeScript and [Hono](https://hono.dev), designed to run on [Cloudflare Workers](https://workers.cloudflare.com).

## Overview

 The primary purpose of this API is to detect bad IP addresses. It checks whether an IP address is associated with proxies, spammers, or abusers by querying various DNS-based blacklists (DNSBLs).

 It Offers two search strategies: **quick** and **full**.
  - **Quick**: Resolves as soon as it finds the IP address in any blacklist.
  - **Full**: Searches in all configured blacklists before returning a result.

 **Demo**: [https://api.badip.xyz/103.183.106.19?strategy=full](https://api.badip.xyz/103.183.106.19?strategy=full)

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run in development:

   ```bash
   npm run dev
   ```

## Usage

### Making API Requests

You can make a GET request to the API by passing the IP address as a parameter. Here's an example using `curl`:

```bash
curl http://localhost:8787/123.11.22.33&strategy=full
```

- Replace `http://localhost:8787` with the actual URL of your API.
- Specify the IP address you want to check.
- Use the `strategy` parameter to choose between "quick" or "full" search strategies.

### Response

The API will respond with a JSON object containing information about the the IP address:

```json
{
  "success": true,
  "isBad": true,
  "blacklists": ["dnsbl.example.info"]
}
```

- `success`: A boolean indicating whether the request was successful.
- `isBad`: A boolean indicating whether the IP address is classified as "bad" or not.
- `blacklists`: List of DNSBLs where the ip is listed. Returns only 1 when using the quick strategy.

## Configuration

You can customize the DNSBLs to query by editing the [config.ts](src/config.ts) file. 

Note that Cloudflare Workers currently only supports 6 simultaneous requests, so the more DNSBLs you add, the longer it will take to search with the "full" strategy.

### Deployment

1. Deploy the API to Cloudflare Workers. Ensure you have the [Cloudflare Workers](https://www.cloudflare.com/plans/developer-platform/) configured with your Cloudflare account.

   ```bash
   npx wrangler publish
   ```

2. This may require authentication to your Cloudflare account. Once the API is deployed, you will receive a unique URL endpoint where the API is accessible.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

If you'd like to contribute to this project or report issues, please open an issue or submit a pull request on the GitHub repository.

## Acknowledgments

Special thanks to the DNSBLs maintainers for their contributions to a better internet.
