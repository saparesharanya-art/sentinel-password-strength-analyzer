# Sentinel Password Strength Analyzer

A privacy-first password security project built for the TiraneX task.

## Features
- Password length and complexity analysis
- 0–100 strength score
- Estimated entropy calculation
- Common-password and pattern checks
- Strong password generator
- Local password-reuse demonstration using SHA-256 hashes
- Password visibility toggle
- Copy-to-clipboard
- Responsive cybersecurity-themed UI
- No plaintext password sent to a backend

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build for production

```bash
npm run build
```

The production files are created in `dist/`.

## Security note

This is an educational project. The local reuse feature stores SHA-256 hashes in browser localStorage for demonstration. For a real production authentication system, passwords should be handled with a slow password hashing algorithm such as Argon2id/bcrypt on the server, with secure authentication architecture and breach-password screening.
