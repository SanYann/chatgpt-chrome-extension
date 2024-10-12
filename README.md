# ChatGPT Chrome Extension

This is a Chrome extension that integrates ChatGPT functionality into your browser, allowing you to interact with it directly through a sidebar interface.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The ChatGPT Chrome Extension provides quick access to ChatGPT directly within your browser. It enables you to interact with ChatGPT through a sidebar, enhancing your browsing experience with AI-powered assistance.

## Features

- Integrates with OpenAI's ChatGPT API.
- Provides a responsive sidebar interface within Chrome.
- Allows users to quickly interact with ChatGPT from any webpage.
- Supports content injection using the content script (`contentScript.js`).

## Installation

To install the extension locally:

1. Clone the repository or download the project files:

   ```bash
   git clone https://github.com/SanYann/chatgpt-chrome-extension.git
   cd chatgpt-chrome-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer mode** by clicking the toggle switch in the top right corner.

4. Click on the **Load unpacked** button and select the directory where you have extracted the `chatgpt-chrome-extension` folder.

5. The extension should now be installed and visible in your browser's toolbar.

## Usage

Once installed, the ChatGPT Chrome Extension will be accessible from your browser's toolbar. Here's how to use it:

1. Click on the ChatGPT icon in the toolbar to open the sidebar.
2. Enter your query or message, and ChatGPT will respond directly in the sidebar.
3. You can interact with ChatGPT while browsing different websites without needing to leave the page.

### Customization

- The appearance of the sidebar can be modified by editing the `style.css` file.
- If you need to make changes to the extension's behavior, you can modify the `contentScript.js` file, which controls how the content script interacts with the webpage.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
