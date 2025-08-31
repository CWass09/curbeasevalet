# CurbEase Static Site (Repo-Ready)
Pure static site for Netlify + GitHub. No build step.

## Netlify
- Base directory: (blank)
- Build command: (blank)
- Publish directory: `.` (also set via netlify.toml)

## Routes (in `_redirects`)
/admin /admin.html 200
/mission /mission.html 200
/thank-you /thank-you.html 200
/* /index.html 200

## Admin protection (in `_headers`)
/admin
  Basic-Auth: Wassarman AmwTrw@2425
/admin.html
  Basic-Auth: Wassarman AmwTrw@2425
/admin-app.html
  Basic-Auth: Wassarman AmwTrw@2425

> Change credentials by editing `_headers` and committing.
