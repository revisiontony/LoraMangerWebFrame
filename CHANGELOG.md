# Changelog

## [Unreleased]

### Added
- Multi-strategy port discovery:
    - **Strategy 1:** Checks the current window origin (same as Lora Manager launch button).
    - **Strategy 2:** Smarter server-side scanning that includes the active ComfyUI port and host.
    - **Strategy 3:** Enhanced client-side brute force fallback.
- Support for varied hostnames (`127.0.0.1`, `localhost`, and custom request hosts).
- Improved server-side port scanning (ports 8000-8005) for higher accuracy and bypass of browser CORS/caching.
- Verification logic in scan to ensure the found port is actually hosting the Lora Manager.
- Force reload capability when re-scanning for ports.
- Automatic port scanning on startup.
- "Port Scan" button to manually trigger port discovery.
- Port scan status logging to console.

### Changed
- Replaced "Update / Go" button with "Port Scan" button.
- Updated README with port scanning instructions.
- Improved startup reliability with proactive port discovery.

### Bug Fix
- Fixed  bug when switching workflows or new workflows are opened the smartport scan does not  affect those workflows.
