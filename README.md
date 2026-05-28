# Verayi

Personal portrait site for Verayi, based on the Ontolize product direction: layered entries, resonance, a detail panel, and owner-only composition controls.

## Development

```bash
npm install
npm run dev
```

## Owner Mode

Public visitors cannot see editing controls. Click `Owner` and enter the edit password from `script.js`; after unlock, `Add`, `Edit`, and `Delete` controls appear and entries are stored in local storage.

This is enough for a simple personal-site editing mode, but it is not server-grade authentication because static-site JavaScript is public. For edits that sync across devices or survive browser data clearing, add a backend identity layer such as Supabase Auth or GitHub-backed CMS.
