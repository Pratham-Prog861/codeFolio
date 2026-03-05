# CodeFolio

A mobile developer portfolio app built with **Expo (React Native)**. Explore GitHub profiles, browse trending repositories, and generate a shareable developer resume card — all in one place.

## Features

### GitHub Profile Viewer

- Search any GitHub username and instantly view their profile
- Avatar, name, bio, location, followers/following stats
- Top 5 repositories sorted by stars
- GitHub contribution graph
- Open profile in browser or share the link

### Repo Explorer

- Browse **trending GitHub repositories** powered by the GitHub Search API
- Filter by time range: Today / This Week / This Month
- Filter by programming language (JavaScript, TypeScript, Python, Rust, Go, and more)
- Each card shows stars, forks, language, and links directly to the repo

### GitHub Resume Generator

- Enter a username to auto-generate a **codeFolio film-card style developer resume**
- Sections: Developer Profile · GitHub Stats · Top Repositories · Top Languages · Contribution Graph
- **Export as Image** — capture and save the resume card to your device
- **Export as PDF** — generate a beautifully formatted PDF resume
- Share or open the profile directly from the screen

## Tech Stack

| Technology               | Purpose                        |
| ------------------------ | ------------------------------ |
| Expo SDK 55              | React Native framework         |
| Expo Router              | File-based navigation          |
| TypeScript               | Type safety                    |
| GitHub REST API          | Profile, repo, and search data |
| `react-native-view-shot` | Resume image capture           |
| `expo-print`             | PDF generation                 |
| `expo-sharing`           | Native share / save sheet      |
| `expo-web-browser`       | In-app browser links           |

## Project Structure

```bash
app/
  _layout.tsx          # Tab navigation layout
  index.tsx            # GitHub Profile Viewer screen
  repoExplorer.tsx     # Trending Repo Explorer screen
  githubResume.tsx     # GitHub Resume Generator screen
components/
  ProfileCard.tsx      # User profile card
  RepoCard.tsx         # Repository card (profile screen)
  ResumeCard.tsx       # Statistics section card
  ContributionGraph.tsx# Contribution heatmap
  TrendingRepoCard.tsx # Trending repo card
hooks/
  useTrendingRepos.ts  # Data fetching hook for trending repos
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (recommended) or npm
- [Expo Go](https://expo.dev/go) on your phone, or an Android/iOS emulator

### Install dependencies

```bash
bun install
# or
npm install
```

### Start the app

```bash
# Local network (LAN)
bun run start

# Android emulator
bun run android

# iOS simulator
bun run ios

# Tunnel (for external devices)
bun run start:tunnel
```

## Screenshots

| Profile Viewer         | Repo Explorer         | Resume Generator         |
| ---------------------- | --------------------- | ------------------------ |
| Search any GitHub user | Browse trending repos | Generate & export resume |
| <img src="assets/screenshots/ProfileScreen.jpeg"/> | <img src="assets/screenshots/ExploreScreen.jpeg" /> | <img src="assets/screenshots/GithubResumeScreen.jpeg" /> |
## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

Built by [@Pratham-Prog861](https://github.com/Pratham-Prog861)
