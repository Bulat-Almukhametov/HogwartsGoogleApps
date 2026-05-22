<!-- Questions-to-developer.md
     Purpose: collect explicit answers from the project owner to clarify
     architecture, setup, deployment, and unknowns needed by an agent.
-->

# Questions to Developer

Please answer each question below. If a question is not applicable, write "N/A". For short answers put the value on the "Answer:" line. For longer context, add additional notes under "Notes:".

-- Template --

- Question: (one-line question)
- Answer: (one-line answer)
- Notes: (optional, free-form)

Fill in each question under the appropriate section.

---

**Project Overview**

1. Question: What is the primary goal of this repository? (user-facing product, learning project, internal tool, etc.)
   Answer: learning project
   Notes:

2. Question: Who are the primary users/consumers of the app in `apps/reports`? (staff, students, automation)
   Answer: staff
   Notes:

3. Question: What is the expected release cadence and versioning policy? (semver, manual tags, etc.)
   Answer: There is no policy yet. Please choose any simple one. Add to the instructions, readme, and apply to all necessary config files
   Notes:.

**Architecture & Structure**

4. Question: Confirm intended architecture: Angular SPA in `apps/reports` + build → GAS-compatible artifacts via `deploy-scripts/angular-resources-to-gas.js` → deployed with `clasp`. Is that correct?
   Answer: The main app is a Google Scripts project. The main app's code is available remotely from Google servers. In the root `package.json` file there is a `google-apps-script` project config to deal with this Google Apps Script project on Google servers. Clasp is just a cli tool from Google. NX Monorepo apps under `apps/` folder are embedded apps for Google Scripts App project. In the future there will be another apps.
   Notes: refer to `package.json` `nx` targets and `deploy-scripts`.

5. Question: Are there other apps or libs planned in the monorepo beyond `reports`? If yes, which ones?
   Answer: Yes, I can't answer yet.
   Notes: see `nx.json` implicitDependencies.

6. Question: Are there runtime constraints for the Apps Script (e.g., Apps Script runtime version, memory/time limits) that impact how the Angular app is built or what features are allowed?
   Answer: Angular apps are just static files (html/js) for the Apps Script. They're building and deploying during CI/CD. Google Apps Scripts project just has corresponding files where the output from angular app build will be copied to.
   Notes: `deploy-scripts/angular-resources-to-gas.js` script copies an output from angular apps build to corresponding files in temporary folder. This temporary folder has uploaded from Google Apps Script project files. Then the modifed files will be uploaded back to Google.

7. Question: Is there any server-side component besides Google Apps Script (e.g., cloud functions, backend APIs)?
   Answer: No.
   Notes:

**Development Setup**

8. Question: Which package manager should contributors use (npm, pnpm, yarn)? Any workspace preference?
   Answer: npm.
   Notes:

9. Question: Is there a required Node.js version and global tools (e.g., `clasp`) that contributors should install? Provide exact versions if required.
   Answer: 24.x
   Notes: The node version can be get from workflow project. In the future it'll be specified in `package.json` file.

10. Question: Is there a `.env` (or secrets) file expected for local development? If yes, where is it stored and which variables are required? (For example: `GOOGLE_SCRIPT_PROJECT_ID`, credentials)
    Answer: There is only one `.env` file which is not commiting to git. It's located in the root directory.
    Notes: `package.json` references `.env` via `@dotenvx/dotenvx`.

11. Question: Are there any special local setup steps beyond `npm install`/`nx` commands? (e.g., `npx clasp login`, service account setup)
    Answer:
    Notes:

**Build, Test & Lint**

12. Question: What is the expected build command for local testing and for preparing GAS artifacts? Provide the exact `nx` or npm commands.
    Answer:
    Notes: `package.json` `nx` targets show a `build` and `clasp` target.

13. Question: Which test runner is preferred and how should tests be executed? (`nx test`, `npm test`, jest config)
    Answer:
    Notes: there's a `jest.config.ts` in root and `apps/reports/jest.config.ts`.

14. Question: Are there unit/e2e test expectations for the GAS-deployed code? If so, which parts are covered?
    Answer:
    Notes:

15. Question: Are there formatting and lint rules contributors must follow (Prettier, ESLint config)? Any automated hooks (husky)?
    Answer:
    Notes:

**CI / CD**

16. Question: Is there an existing CI pipeline (GitHub Actions, CircleCI, etc.)? If yes, where are the configs and what steps run (build, test, deploy)?
    Answer:
    Notes:

17. Question: Is deployment to Google Apps Script automated from CI? If yes, how are credentials supplied securely (secrets manager, service account)?
    Answer:
    Notes:

**Deployment & Google Apps Script (clasp)**

18. Question: Which Google Script project ID(s) should `clasp` target (for `pull`/`clone`/`push`)? Where are these IDs stored (env var `GOOGLE_SCRIPT_PROJECT_ID`?)
    Answer:
    Notes:

19. Question: Are there multiple GAS projects/environments (dev/prod)? If yes, how do we switch between them?
    Answer:
    Notes:

20. Question: Who owns the Google Workspace account used for `clasp` and deployment? Is a service account used or interactive login?
    Answer:
    Notes:

21. Question: Does the repository require any special `manifest.json` or Apps Script settings for OAuth scopes, authorized domains, or library dependencies?
    Answer:
    Notes: check `dist/gas` output manifest after build.

22. Question: Are there manual post-deploy steps required (e.g., enabling APIs, setting triggers, publishing as web app)?
    Answer:
    Notes:

**Environment, Secrets & Credentials**

23. Question: Which environment variables are required in `.env` to run builds and `clasp` commands? Please list and provide intended values or example values.
    Answer:
    Notes:

24. Question: Are any secrets stored in a vault or other external secret manager? If so, how should contributors obtain access?
    Answer:
    Notes:

25. Question: Does the project use any Google Cloud service accounts or APIs that require IAM roles? Provide details.
    Answer:
    Notes:

**Data Sources & APIs**

26. Question: What are the primary data sources for the reports app? (Google Sheets, BigQuery, REST APIs, internal DB)
    Answer:
    Notes: point to code that fetches data if known.

27. Question: Are there rate limits or quotas we must consider for the data sources (e.g., Google Sheets read limits)?
    Answer:
    Notes:

28. Question: Are there any third-party APIs or SDKs that require API keys or credentials? Where should they be configured?
    Answer:
    Notes:

**UX, Features & Requirements**

29. Question: What are the core user journeys the `reports` app must support? (e.g., generate PDF report, send email, view dashboard)
    Answer:
    Notes:

30. Question: Are accessibility or localization requirements (i18n) important for this app?
    Answer:
    Notes:

31. Question: Are there any constraints on external resources (fonts, CDNs) because the app is packaged into GAS HTML service?
    Answer:
    Notes:

**Frontend Implementation Details**

32. Question: Which parts of the UI are dynamic vs server-rendered? Which components are the single source of truth for state?
    Answer:
    Notes: you can reference `apps/reports/src/app/components`.

33. Question: Are there performance expectations (initial load time, bundle size) due to GAS-hosted delivery?
    Answer:
    Notes:

**Testing & QA**

34. Question: What level of test coverage is required for PRs? Are there specific tests that must pass before merging?
    Answer:
    Notes:

35. Question: Is there a QA/staging environment for manual verification? If yes, how is it provisioned?
    Answer:
    Notes:

**Security & Access Control**

36. Question: Which team members should have `clasp` deployment access? How is access granted/managed?
    Answer:
    Notes:

37. Question: Any data privacy/regulatory concerns (student data, PII) that affect storage, retention, or logging?
    Answer:
    Notes:

38. Question: Are there required logging/monitoring/alerting for errors in the deployed Apps Script project? If yes, how are logs reviewed?
    Answer:
    Notes:

**Maintenance & Ownership**

39. Question: Who is the primary maintainer or point of contact for this repo? Provide name and contact method.
    Answer:
    Notes:

40. Question: Are there any known technical debt items or planned refactors we should be aware of?
    Answer:
    Notes:

41. Question: Are there parts of the codebase that are intentionally experimental or in-progress and should not be touched?
    Answer:
    Notes:

**Miscellaneous**

42. Question: Where do you want agents to open follow-up issues/PRs? Which labels or templates should be used?
    Answer:
    Notes:

43. Question: Are there legal/licensing constraints (e.g., data sharing restrictions) we must follow beyond the `MIT` license declared in `package.json`?
    Answer:
    Notes:

44. Question: Any non-obvious commands, developer tips, or gotchas that new contributors should be told up-front?
    Answer:
    Notes:

---

If you prefer, answer inline by editing this file directly in the repository. For quick replies, you can copy/paste the question number and your short answer in a reply to the agent.

Thank you — your answers will help the agent automate tasks and produce safe, accurate changes.
