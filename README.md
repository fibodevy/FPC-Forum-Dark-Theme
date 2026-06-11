# FPC Forum Dark Theme

Dark theme + Pascal syntax highlighter for the [FPC/Lazarus forum](https://forum.lazarus.freepascal.org/), bundled into a single userscript.

## Features

- **Dark theme** - palette-driven restyle of the whole forum (dark navy), built on the default SMF look
- **Pascal syntax highlighter** for code blocks: keywords, types, numbers (decimal/hex/binary/char codes), strings, comments, compiler directives, plus line numbers
- Handles newer FPC syntax (FPC Unleashed): interpolated strings - `$'value: {x:0.00}'` is colored like in the IDE, format masks included - plus `match`, inline `var` declarations and other new constructs, all colored accordingly

## Install

1. Install a userscript manager:
   - Firefox: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - Chrome and Chromium-based browsers: [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. Click to install the script:

   **[fpc_forum_dark.user.js](https://github.com/fibodevy/fpc-forum-dark-theme/raw/refs/heads/main/fpc_forum_dark.user.js)**

## Updates

The script updates itself - Tampermonkey re-checks the install URL periodically (usually once a day) and picks up new versions from this repo automatically.
