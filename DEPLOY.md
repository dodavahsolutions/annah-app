# Anna — React App Build & Deploy Guide

## What's in this folder

A complete React + TypeScript + Vite app for the Anna Scotland Mortgage Advisor.

## Features included
- ✅ Real AI chat powered by Claude via anna-proxy.php
- ✅ Full Scotland-wide knowledge base system prompt
- ✅ PDF & document upload with citation extraction
- ✅ Lead capture modal (fires after 3rd message) → Google Sheets
- ✅ 7 interactive calculators (Repayment, Affordability, LBTT, LTV, Overpayment, Remortgage, BTL)
- ✅ Collapsible sidebar with all Scottish areas and topics as clickable prompts
- ✅ Chat export to .txt
- ✅ Framer Motion animations throughout
- ✅ Fully responsive (mobile sheet drawers)

---

## Step 1 — Install dependencies

```bash
npm install
```

This installs all packages including pdfjs-dist for PDF reading.

---

## Step 2 — Configure your API key

Open `src/lib/anna.ts` and update:

```typescript
// Line ~4: The proxy URL (leave as-is if using anna-proxy.php on Hostinger)
export const PROXY_URL = 'anna-proxy.php';

// Line ~8: Your Google Sheets webhook URL (optional)
export const SHEETS_WEBHOOK = 'https://script.google.com/macros/s/YOUR_URL/exec';
```

---

## Step 3 — Build for production

```bash
npm run build
```

This creates a `dist/` folder with compiled static files.

---

## Step 4 — Deploy to Hostinger

1. Upload **everything inside `dist/`** to your Hostinger `public_html/` folder
2. Also upload `anna-proxy.php` (from the separate file) to the same folder
3. Edit `anna-proxy.php` on Hostinger and add your Anthropic API key

Your folder on Hostinger should look like:
```
public_html/
  index.html          ← from dist/
  assets/             ← from dist/assets/
    index-xxx.js
    index-xxx.css
  anna-proxy.php      ← upload separately
```

---

## Step 5 — Test

Visit your domain. Anna should load with the full UI.

---

## Local development

```bash
npm run dev
```

Runs at http://localhost:5173 — note: AI chat won't work locally without a running proxy.
To test AI locally, temporarily change PROXY_URL in `src/lib/anna.ts` to call the Anthropic API directly (add your key).

---

## Troubleshooting

**Chat not working**: Check anna-proxy.php has your API key and allowed_origin matches your domain.

**PDFs not uploading**: The pdfjs-dist worker loads from CDN. Ensure internet access on device.

**Build errors**: Run `npm install` first. Node.js 18+ required.

---

## Google Sheets setup

1. Go to sheets.google.com → create "Anna Leads" sheet
2. Extensions → Apps Script → paste contents of `anna-google-apps-script.js`
3. Deploy as Web App → Anyone can access
4. Copy the URL into `SHEETS_WEBHOOK` in `src/lib/anna.ts`
5. Rebuild with `npm run build`
