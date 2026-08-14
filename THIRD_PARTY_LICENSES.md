# Third-party licenses

MAV Charts depends on third-party open-source software. Package versions are
locked in `package-lock.json`; their upstream license files remain authoritative.

| Dependency / asset | License | Source / local notice |
|---|---|---|
| React and React DOM | MIT | `node_modules/react/LICENSE`, `node_modules/react-dom/LICENSE` |
| Recharts | MIT | `node_modules/recharts/LICENSE` |
| Vite and related build tooling | MIT | package license files under `node_modules` |
| Inter font | SIL Open Font License 1.1 | `public/fonts/LICENSE-Inter.txt` |
| JetBrains Mono font | SIL Open Font License 1.1 | `public/fonts/LICENSE-JetBrainsMono.txt` |
| Montserrat font | SIL Open Font License 1.1 | `public/fonts/LICENSE-Montserrat.txt` |
| Chiron Sung HK font | SIL Open Font License 1.1 | `public/fonts/LICENSE-ChironSungHK.md` |

The Signal visual system embeds Latin-only WOFF2 subsets of the original Chiron
Sung HK bold and heavy italic font files. The font name and outlines are
unmodified; only unused glyphs were removed for web delivery.
