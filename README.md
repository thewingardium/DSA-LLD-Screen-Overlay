
# DSA Companion Overlay

A powerful, transparent overlay application designed to sit on top of your coding environment (VS Code, IntelliJ, LeetCode in browser, etc.) and assist you with Data Structures & Algorithms (DSA) and Low-Level Design (LLD) problems.

Powered by AI, this tool can visually read your problem statements, generate conceptual explanations with analogies, and dynamically render UML diagrams directly on your screen without you ever needing to Alt-Tab or switch windows.

---

## 🌟 Features

- **Global Shortcuts**: Trigger analyses, queue screenshots, and toggle visibility without your mouse.
- **Glassmorphism Design**: A sleek, translucent UI that doesn't obstruct your code.
- **Cross-Platform**: Works natively on both macOS and Windows.
- **UML Rendering**: Automatically detects LLD problems and renders interactive, zoomable Mermaid diagrams.
- **Math Formatting**: Beautifully renders LaTeX equations and algorithmic complexities.
- **Invisible to Screen Shares**: Built-in privacy prevents the overlay from showing up on Zoom, Google Meet, or Teams.
- **Multi-Screenshot Workflow**: Capture massive problem statements in chunks before processing them all at once.

---

## 🛠️ Prerequisites

This overlay application acts as a UI for the `agy` AI CLI. For the app to function, you **must** have the `agy` tool installed and accessible in your system PATH.

1. Install the `agy` CLI tool globally on your system.
2. Verify it is working by opening a terminal or command prompt and running:
   ```bash
   agy --version
   ```
   *(If this command fails, the overlay application will not work).*

---

## 📦 Installation & Setup

### Development Mode

1. Clone or download this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run electron-dev
   ```

### Building for Production (Portable Executables)

You can package the application into a standalone executable that doesn't require Node.js to run (though `agy` is still required on the target machine).

**To build for macOS (.app / .dmg):**
```bash
npm run dist:mac
```
The output will be placed in the `release/` folder.

**To build for Windows (.exe):**
```bash
npm run dist:win
```
The output will be placed in the `release/` folder. This generates a portable `.exe` that can be run instantly without installation.

---

## ⌨️ Shortcuts & Workflow

The app runs silently in the background and is entirely controlled via global keyboard shortcuts.

### Default Shortcuts

- <kbd>Ctrl</kbd> + <kbd>Option</kbd> + <kbd>O</kbd> : **Toggle Visibility**
  - Instantly hides or shows the overlay panel.
  
- <kbd>Ctrl</kbd> + <kbd>Option</kbd> + <kbd>C</kbd> : **Queue Screenshot**
  - Captures the current screen and adds it to a queue. Useful for very long problem statements that require you to scroll down. You'll see a badge indicating how many screenshots are queued.

- <kbd>Ctrl</kbd> + <kbd>Option</kbd> + <kbd>A</kbd> : **Analyze Screen / Queue**
  - **If the queue is empty:** Takes a single screenshot of whatever is currently on your screen and analyzes it.
  - **If the queue has items:** Processes all queued screenshots simultaneously, then clears the queue.

- <kbd>Ctrl</kbd> + <kbd>Option</kbd> + <kbd>S</kbd> : **Toggle Scroll Mode**
  - By default, the overlay is completely "click-through" so it doesn't interfere with your IDE. Pressing this shortcut locks your mouse to the overlay so you can scroll through the AI's explanation, resize the panel, or zoom into UML diagrams. Press it again to return control to your IDE.

- <kbd>Ctrl</kbd> + <kbd>Option</kbd> + <kbd>R</kbd> : **Retry Analysis**
  - Retakes a screenshot and regenerates the response if the AI didn't quite get it right the first time.

---

## 📐 Resizing & Zooming

- **Resizing the Panel**: Enter **Scroll Mode** (<kbd>Ctrl</kbd>+<kbd>Option</kbd>+<kbd>S</kbd>), then hover over the left edge of the overlay pane. Click and drag left or right to expand the width of the reading area.
- **Zooming UML Diagrams**: While in **Scroll Mode**, hover your mouse over any generated Mermaid diagram. Use your scroll wheel (or trackpad) to zoom in/out, and click & drag to pan around complex architecture diagrams.

---

## 🔒 Privacy Note
The application uses native OS content protection flags. If you are screen-sharing your entire desktop in a meeting, the overlay will remain visible to you, but will be completely hidden from your viewers.
