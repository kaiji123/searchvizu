# Selected projects: production to local development

This feature is a manual, selective development-copy workflow, not a continuous synchronization service. It has been tested against synthetic data in the development deployment only. Production remains unconfigured until the corresponding frontend and Convex functions are deployed there. Do not use it for confidential or regulated data until the entire system and the researcher's permissions have been reviewed.

## Create a workspace

1. Sign in as studio administrator on the **source** site, open the request and select **Start working**. This only marks the project for work; it does not change the client-visible status or automatically write to your computer. The studio may later remove it from the selection without deleting an existing copy.
2. On the development computer, sign in to the Convex CLI with an account authorized to administer both deployments. Configure this repository's `.env.local` for the personal **development** deployment and its `STUDIO_ADMIN_USER_ID`. Do not point the local frontend or `.env.local` at production. Do not use a `CONVEX_DEPLOY_KEY` with this tool; it refuses to run when one is present.
3. Run the command shown in the source dashboard, replacing `SOURCE` with `prod` for a real production request or `dev` for a synthetic development request:

   ```text
   npm run workspace -- --source prod --project <source-request-id>
   ```

4. The command reads the **selected** source request using deployment-admin CLI access and creates a separate request in the `dev` deployment. It copies the title, brief and visualisation type exactly; the brief can contain client information and is not automatically anonymized. It does not copy contact information, accounts, project status, visualizations or files. The development copy belongs to the configured development studio administrator, not the production researcher.
5. It creates `src/components/viz/private/projects/<source>-<source-request-id>/` containing a placeholder `Visualisation.tsx` and generic `README.md`. This is code scaffolding, not an automatically registered or finished visualization. Client text and credentials must not be committed there. The local production-to-development mapping, source brief and file metadata go in gitignored `.data/project-workspaces/<source>-<source-request-id>/source.json`.
6. To copy a particular file **to the local gitignored workspace**, rerun with its ID as printed by the first command (repeat `--file` to select more than one):

   ```text
   npm run workspace -- --source prod --project <source-request-id> --file <file-id>
   ```

   Each selected source file is saved under its file ID within the same `.data` folder; its original name and metadata are recorded in `source.json`. The local files are **not uploaded into the development Convex project**. Use only files you are authorized to copy, and handle local retention and device security appropriately.

Open the code folder in your editor, use synthetic or sanitized data by default, and implement the project component. Follow [Project workspaces](project-workspaces.md) to register, test and deploy the code. The production request and its visualization are not automatically updated; attachment to the real client project is a separate step after review and deployment.

## Boundaries and limitations

- The studio action and the local CLI are two steps; a website cannot write into a local repository just by selecting a project. The script requires a CLI login with deployment-administrator privileges. It invokes internal functions; ordinary portal accounts cannot invoke these functions. Do not share production CLI access or deploy keys with untrusted tools.
- The source environment must be chosen explicitly. The command always imports to the configured `dev` deployment; it refuses to run unless `.env.local` specifies a `dev:` deployment and no deployment key overrides it. Do not change `.env.local` to production to use this tool.
- Running again returns the same development request and does not overwrite existing code or the development brief. It can copy newly specified files that are not already present. The local manifest's source brief and file list are refreshed, but there is no production change detection, conflict resolution, continuous sync, or automatic import of files to the development database. A partially failed multi-file download can leave earlier files in `.data`; it never overwrites an existing local copy.
- Only the most recent 100 file records are listed. Unselecting prevents future exports but does not remove previously copied data or code. Clean up local and development data according to the agreed retention policy.
- Source request IDs and filenames may be sensitive metadata; do not put them in a public repository or share console output casually. The source/development mapping in the `workspaceImports` table is deployment-specific. Never use a production project ID as proof of access.
- Backend functions that read selected data and file bytes are internal and callable by a deployment administrator; no client-facing endpoint exposes them. The local process captures file contents in memory and writes them under `.data`, but a deployment administrator has broad access to source data. Review access controls, auditing, malware handling, and data processing terms before production use.
- The synthetic integration check creates a separate development request and work-selection record, and copies a synthetic file locally. It removes the local synthetic files without recursive deletion but leaves synthetic records in the development database. It does not test production or prove compliance.
