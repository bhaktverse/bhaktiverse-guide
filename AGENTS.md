# Project architecture rules

- Keep audio URL verification in the shared server-side audio helper used by health checks and repairs, so catalogue visibility depends on one consistent HTTPS, host, MIME, and file-signature standard.