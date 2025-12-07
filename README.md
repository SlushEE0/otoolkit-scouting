This repository contains the Scouting application component of the wider Optix
Toolkit. The Optix Toolkit is a collection of tools used by FRC Team Optix 3749
for team operations; this repo focuses on the Scouting functionality (match &
pit scouting, form collection, and visualization).

Key points:

- The app is optimized for mobile use in pit/match scouting and includes
  configurable scouting forms, uploads, and basic charts.

Quick overview

- Features

  - Mobile-first scouting forms (match & pit)
  - Uploads and progress UI for response submissions
  - Data visualization components for analyzing scouting results

- Tech stack
  - Frontend: Next.js (App Router) + React + TypeScript
  - Backend: PocketBase (self-hosted) for auth and storage
  - Styling/UI: Tailwind CSS and shadcn/ui components

Quick start (component)

1. Install dependencies

   ```powershell
   bun install
   # or
   npm install
   ```

2. Configure PocketBase URL

   Create `.env.local` in the project root (if you don't already have one):

   ```env
   NEXT_PUBLIC_PB_URL=http://localhost:30090
   ```

3. Start PocketBase

   PocketBase runs separately in the `otoolkit-pb` folder located at the
   repository root. On Windows you can run the binary directly from that folder,
   or use WSL if preferred. Example (from the root of this repo):

   ```powershell
   # from the repo root
   cd .\otoolkit-pb
   # If you have the pocketbase binary available on Windows
   .\pocketbase.exe serve --dir=. --http=:30090 --log=pb.log
   # Or from WSL (if you prefer):
   # wsl ./LocalStart.sh
   ```

4. Run the Scouting app dev server

   ```powershell
   # from the project root (this repo)
   bun run dev
   # or
   npm run dev
   ```

   Then open: http://localhost:3000

Notes

- This repo is intended to be used together with the PocketBase instance in
  `otoolkit-pb` (included alongside this component in the Optix Toolkit source).
- If you're integrating into a different monorepo layout, ensure
  `NEXT_PUBLIC_PB_URL` points to your running PocketBase instance.

Contributing

If you'd like to contribute to the Scouting app component:

1. Fork this repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make changes and run the dev server locally
4. Push and open a pull request

License

This component is released under the MIT License — see the top-level `LICENSE`
file for details.

Contact

If you have questions or issues, open a GitHub issue on this repository and tag
@SlushEE0 or any of the project maintainers.

-- Optix Toolkit (Scouting component)
