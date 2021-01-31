## Cloudflare Workers + Contentful

This application uses Contentful as CMS and Cloudflare Workers to deploy websites in minutes.

## Installation

Clone the repository typing (CLI):

```
git clone https://github.com/jaimelias/cloudflare-workers-contentful.git new-project

cd new-project
```

Create 2 KV Namespaces in Cloudflare with names  __CONTENTFUL__ and __GLOBAL_VARS__.

In the __CONTENTFUL__ namespace you'll store your Contentful credentials: `access_token`, `content_type` and `space_id`.

Create a `wrangler.toml` file in the root folder of your project.

Edit `wrangler.toml` with the following params and replace with the Cloudflare crededentials:

```
name = "new-project"
type = "webpack"
account_id = ""
zone_id = ""
route = "example.com/*"
kv_namespaces = [
  { binding = "CONTENTFUL", id = "", preview_id = "" }
]
```

Create the access token typing (CLI):

```
wrangler login
```