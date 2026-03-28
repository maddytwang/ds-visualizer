# ds-visualizer

A retro-styled data structures visualizer with modern capabilities for LeetCode practice.

## Getting Started

### 1. Install Node.js and npm

Download and install Node.js (npm is included) from https://nodejs.org — grab the LTS version.

Verify:

```bash
node --version
npm --version
```

### 2. Clone the repo and install dependencies

```bash
git clone https://github.com/maddytwang/ds-visualizer.git
cd ds-visualizer
npm install
```

### 3. Add your Anthropic API key

Get an API key from https://console.anthropic.com.

**Option A — `.env` file** (don't commit this):

```bash
echo "VITE_ANTHROPIC_API_KEY=sk-your-key-here" > .env
```

**Option B — shell export** (no file needed):

```bash
export VITE_ANTHROPIC_API_KEY=sk-your-key-here
```

### 4. Run the app

```bash
npm run dev
```

Then open http://localhost:xxxx in your browser.

## Why not just use Claude or ChatGPT or whatever other AI exists?

This looks cooler that's all. You could also draw your own diagrams if you wanted. Up to you though.
