# CTF__CaptureTheFlag

NEXUS CTF

NEXUS CTF is a web-based Capture The Flag platform designed around practical cybersecurity challenges. Players can access challenge nodes, solve security-focused problems, submit flags, and track their progress through a team-based dashboard.

**Challenge Categories**

The platform includes four challenges covering different cybersecurity concepts:

Web Security – The Hidden Header
Cryptography – The Caesar's Shifted Cipher
Reverse Engineering – The Bytecode Vault
Forensics – The Corrupted Archive

The challenges are worth between 100 and 200 points depending on their difficulty/category.

**Features**

Interactive CTF challenge dashboard
Multiple cybersecurity categories
Team-based challenge participation
Team token sharing
Challenge status tracking
Challenge timers
Flag submission system
Penalty system for tab switching and focus loss
Challenge reset functionality
Leaderboard integration
Dark-themed cybersecurity interface
Challenge Mechanics

Each challenge provides a different type of problem. The challenge interface includes descriptions, interactive challenge areas, and a flag submission form. Challenge progress is tracked as UNATTEMPTED, IN_PROGRESS, or SOLVED.

The platform also records elapsed solving time and applies penalties when the participant switches tabs or loses browser focus during an active challenge.

**Technologies Used**

HTML5
CSS3
JavaScript
Tailwind CSS
Browser APIs
REST API integration
Local Storage
Cookie-based team authentication

**Purpose**

The project demonstrates how cybersecurity concepts can be converted into interactive CTF challenges. It provides a controlled environment where participants can 
practice areas such as web security, cryptography, reverse engineering, and digital forensics.

## How to run locally

1. Ensure you have Node.js installed.
2. Clone this repository or copy the directory.
3. Run \`npm install\` to install dependencies.
4. Run \`npm start\` (or \`node server.js\`) to start the server.
5. Open your browser and navigate to \`http://localhost:3000\`.

## How to deploy publicly

You can use services like [Render](https://render.com), [Railway](https://railway.app), or [Vercel](https://vercel.com) (for static/serverless). Since we are using an SQLite database (file-based), deploying to Render or Railway as a Node.js background service is highly recommended.

**Steps for Render.com:**

1. Push this code to a GitHub repository.
2. Log into Render and create a new "Web Service".
3. Connect your GitHub repository.
4. Set the Build Command to: \`npm install\`
5. Set the Start Command to: \`node server.js\`
6. (Important) If you want the database to persist across restarts, add a "Disk" to your Render service and mount it to the directory containing \`database.sqlite\`. Otherwise, team data will reset on every deployment or server restart.

Alternatively, use **Ngrok** to share your local server:

1. Run \`npm start\` locally.
2. Run \`ngrok http 3000\`.
3. Share the Ngrok \`https\` URL with participants.

## Challenge Flags Reference

1. **Web:** \`FLAG{web_master_headers_unlocked}\`
2. **Crypto:** \`FLAG{crypto_analysis_success_2026}\`
3. **RevEng:** \`FLAG{reverse_engineer_master_mind}\`
4. **Forensics:** \`FLAG{forensics_deep_dive_complete}\`















The project demonstrates how cybersecurity concepts can be converted into interactive CTF challenges. It provides a controlled environment where participants can practice areas such as web security, cryptography, reverse engineering, and digital forensics.
