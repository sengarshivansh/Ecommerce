# Product images

Drop product photos in this folder. Vite copies everything under `public/`
into `dist/` untouched, so a file here is served by the static site at the
matching path:

```
public/products/iphone.jpg   ->   https://<your-site>/products/iphone.jpg
```

Set a product's **Image URL** to the leading-slash path — `/products/iphone.jpg` —
and the browser resolves it against this site. An absolute `https://...` URL to
an external host works too; the field accepts either.

## Guidelines

- **Size:** ~600 px wide is plenty. Cards render at roughly 300×150.
- **Weight:** 50–150 KB each. JPEG or WebP.
- **Naming:** lowercase, hyphenated, matching the product — `mechanical-keyboard.jpg`.
- **Licensing:** use Unsplash or Pexels (free for commercial use, no attribution
  required). Don't hotlink or copy images from retailer sites.

If a product has no image, or the file is missing, the UI falls back to a
coloured square with the product's initial — see `src/components/ui/product-image.tsx`.
