# TubeLoopPlayer

## Overview

TubeLoopPlayer is a client-side web application that allows users to register YouTube videos and play them in loop or shuffle modes. Designed for users who want to repeatedly enjoy their favorite music or videos, it saves playlists persistently using browser localStorage (with migration support for legacy cookies). The app is intended to be deployed via GitHub Pages.

---

## Target Users

- General English-speaking users
- Users who want to loop YouTube videos
- Users seeking a simple and lightweight playlist management tool

---

## Functional Requirements

### Playlist Management

- Users can **manually input YouTube video URLs** to add them to the playlist.
- Only **one playlist** is supported, saved persistently in browser localStorage.
- Videos in the playlist are played **sequentially**.

### Playback Modes

- **Loop Mode**: After reaching the end of the playlist, playback restarts from the beginning.
- **Shuffle Mode**: Videos are played in a randomized order.
- Loop and shuffle modes can be **toggled independently**.
- Default settings: **Loop ON, Shuffle OFF**.

### UI Controls

- Add, remove, and clear playlist functionality.
- Play and pause controls.
- Toggle switches for loop and shuffle modes.

---

## Non-Functional Requirements

- **Responsive design** for mobile, tablet, and desktop.
- **Modern browser support** (latest versions of Chrome, Edge, Safari, Firefox).
- **English UI**.
- Fully client-side implementation with no server required.
- Data persistence via **browser localStorage** (legacy cookies imported on load).
- Deployment via **GitHub Pages**.
- Uses React Router v7 (no SSR).

---

## Technical Stack

| Item | Details |
| --- | --- |
| Framework | React (SPA) |
| Routing | React Router v7 (client-side only) |
| Data Storage | Cookies (video ID array and playback mode settings) |
| Deployment | GitHub Pages |
| Backend | Not required |

---

## Future Enhancements (Optional)

- Support for multiple playlists
- Playlist export/import functionality
- Custom video embedding and playback settings
- Sharing playlists with other users
