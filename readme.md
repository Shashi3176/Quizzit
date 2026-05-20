# Quiz Platform

A real-time quiz platform built with Next.js, Prisma, and WebSocket/SSE technology for seamless communication between participants and moderators.

## Features

### Core Functionality
- Create and manage quiz rooms
- Add, edit, and delete questions with multiple question types
- Invite participants to join rooms
- Host quiz sessions with real-time question release
- Participants can answer questions within time limits
- Leaderboard updates in real-time
- Quiz analytics and performance tracking

### Real-Time Communication

#### WebSocket (Participants)
- **Question Release**: Instantly broadcasts new questions to all participants when the host advances
- **Leaderboard Updates**: Updates participant rankings in real-time as answers are submitted
- **Quiz End Event**: Notifies participants when the quiz is completed
- **Reconnection Handling**: Automatic reconnection if the WebSocket connection drops

#### Server-Sent Events (Moderators)
- **Answer Submissions**: Real-time notifications when participants submit answers
- **Connection Status**: Heartbeat events to maintain connection health
- **Analytics Updates**: Live statistics on question performance

## Getting Started

### Prerequisites
- Node.js 18 or later
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
