This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Shopify Configuration

This project integrates with Shopify using the Storefront API. To set it up:

1. **Create a Shopify store** (if you don't have one already)
2. **Get your Storefront API credentials**:
   - Go to your Shopify admin panel
   - Navigate to Apps → Develop apps
   - Create a new app or use an existing one
   - Go to "API credentials" tab
   - Create "Storefront API credentials"
3. **Set environment variables** in `.env.local`:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
```

4. **Test the connection**:
   - Visit `http://localhost:3000/api/test-shopify` to verify your configuration (debugging tool)
   - Check the console logs for detailed error information
   - Try adding products to your cart from the website

### Troubleshooting

**Common Issues (Now Resolved):**

✅ **Cart functionality** - Previously had GraphQL variable passing issues, now working correctly
✅ **Shopify connection** - Basic connection established and tested
✅ **API credentials** - Storefront API token configured properly

**If you encounter new issues:**

1. **Verify environment variables** are set correctly in `.env.local`
2. **Check your store domain** - it should be like `yourstore.myshopify.com`
3. **Verify the access token** - it should be the Storefront API token, not the Admin API token
4. **Check API version** - the project uses the 2024-10 API version
5. **Test with the debugging tool** using the `/api/test-shopify` endpoint
6. **Check console logs** in browser dev tools for detailed error information

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
