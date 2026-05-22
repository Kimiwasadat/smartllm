This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Security Testing

SmartLLM incorporates several security measures and testing workflows:

- **Security Review:** Read our [`SECURITY_REVIEW.md`](./SECURITY_REVIEW.md) for a baseline review against the OWASP Top 10 risks. It includes current mitigations and future improvement areas (TODOs).
- **SAST (Static Application Security Testing):** We use GitHub CodeQL and Semgrep for static code analysis, along with `npm audit` for dependency vulnerability checks. These run automatically on pushes and pull requests to the `main` branch.
- **DAST (Dynamic Application Security Testing):** We provide an OWASP ZAP baseline scan workflow that can be triggered manually via GitHub Actions (`workflow_dispatch`). Ensure `ZAP_TARGET_URL` is set in your repository's variables or secrets.

**Running locally:**
- SAST: You can run `npm audit` locally to check for dependency vulnerabilities, or install the Semgrep CLI (`brew install semgrep` or via `pip`) to run `semgrep scan`.
- DAST: You can run OWASP ZAP locally using their desktop application or Docker images against your local development server.
