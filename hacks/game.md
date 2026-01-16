---
layout: default
permalink: /ubuntu
title: Ubuntu Terminal Simulator
---

# Ubuntu Terminal Simulator

A fully functional Ubuntu terminal simulation with filesystem, commands, and interactive features.

<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #1a1a2e;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            font-family: 'Ubuntu Mono', 'Consolas', 'Monaco', monospace;
        }

        .terminal-window {
            width: 100%;
            max-width: 900px;
            background: #300a24;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        }

        .terminal-header {
            background: linear-gradient(to bottom, #4a4a4a, #3a3a3a);
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .terminal-buttons {
            display: flex;
            gap: 8px;
        }

        .terminal-btn {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .terminal-btn:hover {
            opacity: 0.8;
        }

        .btn-close { background: #ff5f56; }
        .btn-minimize { background: #ffbd2e; }
        .btn-maximize { background: #27ca40; }

        .terminal-title {
            flex: 1;
            text-align: center;
            color: #ccc;
            font-size: 13px;
        }

        .terminal-body {
            padding: 15px;
            height: 500px;
            overflow-y: auto;
            background: rgba(48, 10, 36, 0.95);
            position: relative;
        }

        .terminal-body::-webkit-scrollbar {
            width: 8px;
        }

        .terminal-body::-webkit-scrollbar-track {
            background: #1a0514;
        }

        .terminal-body::-webkit-scrollbar-thumb {
            background: #5a2a4a;
            border-radius: 4px;
        }

        .output-line {
            color: #fff;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .output-line.error {
            color: #ff6b6b;
        }

        .output-line.success {
            color: #69ff69;
        }

        .output-line.info {
            color: #87ceeb;
        }

        .output-line.directory {
            color: #5c9eff;
            font-weight: bold;
        }

        .output-line.executable {
            color: #69ff69;
        }

        .input-line {
            display: flex;
            align-items: center;
            margin-top: 5px;
        }

        .prompt {
            color: #8ae234;
            font-size: 14px;
            white-space: nowrap;
        }

        .prompt .user {
            color: #8ae234;
        }

        .prompt .at {
            color: #fff;
        }

        .prompt .host {
            color: #8ae234;
        }

        .prompt .colon {
            color: #fff;
        }

        .prompt .path {
            color: #729fcf;
        }

        .prompt .dollar {
            color: #fff;
        }

        #command-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            outline: none;
            margin-left: 8px;
            caret-color: #fff;
        }

        .cursor-blink {
            animation: blink 1s step-end infinite;
        }

        @keyframes blink {
            50% { opacity: 0; }
        }

        .welcome-art {
            color: #ff7f00;
        }

        .tab-completion {
            color: #aaa;
            margin-left: 5px;
        }

        table.file-list {
            border-collapse: collapse;
            width: 100%;
        }

        table.file-list td {
            padding: 2px 15px 2px 0;
        }

        .man-header {
            color: #fff;
            font-weight: bold;
            text-decoration: underline;
        }

        .man-section {
            color: #87ceeb;
            font-weight: bold;
            margin-top: 10px;
        }

        /* Nano Editor Styles */
        .nano-editor {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000080;
            display: flex;
            flex-direction: column;
            font-family: inherit;
            z-index: 100;
        }

        .nano-header {
            background: #fff;
            color: #000;
            padding: 2px 10px;
            text-align: center;
            font-weight: bold;
        }

        .nano-content {
            flex: 1;
            padding: 5px 10px;
            overflow-y: auto;
        }

        .nano-textarea {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            resize: none;
            outline: none;
        }

        .nano-footer {
            background: #000;
            color: #fff;
            padding: 5px 10px;
        }

        .nano-shortcuts {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .nano-shortcut {
            color: #fff;
        }

        .nano-shortcut span {
            background: #fff;
            color: #000;
            padding: 0 3px;
            margin-right: 3px;
        }

        .nano-status {
            color: #fff;
            text-align: center;
            padding: 2px;
            background: #000080;
        }
    </style>

<div class="terminal-window">
        <div class="terminal-header">
            <div class="terminal-buttons">
                <div class="terminal-btn btn-close" onclick="closeTerminal()"></div>
                <div class="terminal-btn btn-minimize" onclick="minimizeTerminal()"></div>
                <div class="terminal-btn btn-maximize" onclick="maximizeTerminal()"></div>
            </div>
            <div class="terminal-title">user@ubuntu: ~</div>
        </div>
        <div class="terminal-body" id="terminal-body">
            <div id="output"></div>
            <div class="input-line">
                <span class="prompt" id="prompt">
                    <span class="user">user</span><span class="at">@</span><span class="host">ubuntu</span><span class="colon">:</span><span class="path">~</span><span class="dollar">$</span>
                </span>
                <input type="text" id="command-input" autofocus autocomplete="off" spellcheck="false">
            </div>
        </div>
    </div>

<script>
        // Virtual File System
        const fileSystem = {
            '/': {
                type: 'dir',
                contents: {
                    'home': { type: 'dir', contents: {
                        'user': { type: 'dir', contents: {
                            'Documents': { type: 'dir', contents: {
                                'notes.txt': { type: 'file', content: 'My personal notes\n==================\n\n- Learn Linux commands\n- Practice terminal navigation\n- Master shell scripting' },
                                'todo.txt': { type: 'file', content: '1. Complete project\n2. Review code\n3. Write documentation' },
                                'report.pdf': { type: 'file', content: '[Binary PDF content]' }
                            }},
                            'Downloads': { type: 'dir', contents: {
                                'image.png': { type: 'file', content: '[Binary image data]' },
                                'setup.sh': { type: 'file', content: '#!/bin/bash\necho "Installing..."\napt update\napt upgrade -y', executable: true }
                            }},
                            'Desktop': { type: 'dir', contents: {} },
                            'Music': { type: 'dir', contents: {
                                'playlist.m3u': { type: 'file', content: '#EXTM3U\n/home/user/Music/song1.mp3\n/home/user/Music/song2.mp3' }
                            }},
                            'Pictures': { type: 'dir', contents: {} },
                            'Videos': { type: 'dir', contents: {} },
                            '.bashrc': { type: 'file', content: '# ~/.bashrc: executed by bash for non-login shells.\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\n# History settings\nHISTCONTROL=ignoreboth\nHISTSIZE=1000\nHISTFILESIZE=2000\n\n# Aliases\nalias ll=\'ls -alF\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\'' },
                            '.bash_history': { type: 'file', content: 'ls\ncd Documents\ncat notes.txt\npwd\nclear' },
                            '.profile': { type: 'file', content: '# ~/.profile: executed by the command interpreter for login shells.\n\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\n\nPATH="$HOME/bin:$HOME/.local/bin:$PATH"' }
                        }}
                    }},
                    'etc': { type: 'dir', contents: {
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nuser:x:1000:1000:User,,,:/home/user:/bin/bash' },
                        'hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n127.0.1.1\tubuntu\n\n::1\tip6-localhost ip6-loopback\nfe00::0\tip6-localnet' },
                        'hostname': { type: 'file', content: 'ubuntu' },
                        'os-release': { type: 'file', content: 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.3 LTS"\nVERSION_ID="22.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"' }
                    }},
                    'var': { type: 'dir', contents: {
                        'log': { type: 'dir', contents: {
                            'syslog': { type: 'file', content: 'Jan 16 10:00:01 ubuntu systemd[1]: Started Daily apt download activities.\nJan 16 10:00:02 ubuntu kernel: [    0.000000] Linux version 5.15.0-generic' },
                            'auth.log': { type: 'file', content: 'Jan 16 09:55:01 ubuntu sudo: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/usr/bin/apt update' }
                        }},
                        'www': { type: 'dir', contents: {
                            'html': { type: 'dir', contents: {
                                'index.html': { type: 'file', content: '<!DOCTYPE html>\n<html>\n<head><title>Welcome</title></head>\n<body><h1>It works!</h1></body>\n</html>' }
                            }}
                        }}
                    }},
                    'usr': { type: 'dir', contents: {
                        'bin': { type: 'dir', contents: {
                            'python3': { type: 'file', content: '[Binary]', executable: true },
                            'node': { type: 'file', content: '[Binary]', executable: true },
                            'vim': { type: 'file', content: '[Binary]', executable: true }
                        }},
                        'share': { type: 'dir', contents: {
                            'doc': { type: 'dir', contents: {} }
                        }}
                    }},
                    'tmp': { type: 'dir', contents: {} },
                    'root': { type: 'dir', contents: {} },
                    'bin': { type: 'dir', contents: {
                        'bash': { type: 'file', content: '[Binary]', executable: true },
                        'ls': { type: 'file', content: '[Binary]', executable: true },
                        'cat': { type: 'file', content: '[Binary]', executable: true }
                    }},
                    'dev': { type: 'dir', contents: {
                        'null': { type: 'file', content: '' },
                        'zero': { type: 'file', content: '' },
                        'random': { type: 'file', content: '' }
                    }},
                    'proc': { type: 'dir', contents: {
                        'cpuinfo': { type: 'file', content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 158\nmodel name\t: Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz\ncpu MHz\t\t: 3192.000\ncache size\t: 12288 KB\ncpu cores\t: 6' },
                        'meminfo': { type: 'file', content: 'MemTotal:       16384000 kB\nMemFree:         8234567 kB\nMemAvailable:   12456789 kB\nBuffers:          234567 kB\nCached:          3456789 kB' },
                        'version': { type: 'file', content: 'Linux version 5.15.0-91-generic (buildd@lcy02-amd64-051) (gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0)' }
                    }}
                }
            }
        };

        // Terminal State
        let currentPath = '/home/user';
        let commandHistory = [];
        let historyIndex = -1;
        let env = {
            USER: 'user',
            HOME: '/home/user',
            PWD: '/home/user',
            SHELL: '/bin/bash',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            HOSTNAME: 'ubuntu',
            PS1: '\\u@\\h:\\w\\$'
        };
        let aliases = {
            'll': 'ls -alF',
            'la': 'ls -A',
            'l': 'ls -CF',
            '..': 'cd ..',
            'cls': 'clear'
        };

        const output = document.getElementById('output');
        const input = document.getElementById('command-input');
        const terminalBody = document.getElementById('terminal-body');
        const promptElement = document.getElementById('prompt');
        const titleElement = document.querySelector('.terminal-title');

        // Show welcome message
        function showWelcome() {
            const welcome = `<span class="welcome-art">
 _   _ _                 _         _____                   _             _
| | | | |               | |       |_   _|                 (_)           | |
| | | | |__  _   _ _ __ | |_ _   _  | | ___ _ __ _ __ ___  _ _ __   __ _| |
| | | | '_ \\| | | | '_ \\| __| | | | | |/ _ \\ '__| '_ \` _ \\| | '_ \\ / _\` | |
| |_| | |_) | |_| | | | | |_| |_| | | |  __/ |  | | | | | | | | | | (_| | |
 \\___/|_.__/ \\__,_|_| |_|\\__|\\__,_| \\_/\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|
</span>
<span class="info">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)</span>

<span class="output-line">System information as of ${new Date().toLocaleString()}</span>

<span class="output-line">  System load:  0.08               Processes:             234</span>
<span class="output-line">  Usage of /:   45.2% of 49.12GB   Users logged in:       1</span>
<span class="output-line">  Memory usage: 23%                IPv4 address for eth0: 192.168.1.100</span>
<span class="output-line">  Swap usage:   0%</span>

<span class="info">Type 'help' for available commands.</span>
`;
            output.innerHTML = welcome;
        }

        // Resolve path
        function resolvePath(path) {
            if (!path) return currentPath;

            let resolved;
            if (path.startsWith('/')) {
                resolved = path;
            } else if (path === '~' || path.startsWith('~/')) {
                resolved = path.replace('~', '/home/user');
            } else {
                resolved = currentPath + '/' + path;
            }

            // Normalize path
            const parts = resolved.split('/').filter(p => p !== '');
            const stack = [];

            for (const part of parts) {
                if (part === '..') {
                    stack.pop();
                } else if (part !== '.') {
                    stack.push(part);
                }
            }

            return '/' + stack.join('/');
        }

        // Get node at path
        function getNode(path) {
            const resolved = resolvePath(path);
            if (resolved === '/') return fileSystem['/'];

            const parts = resolved.split('/').filter(p => p !== '');
            let current = fileSystem['/'];

            for (const part of parts) {
                if (!current || current.type !== 'dir' || !current.contents[part]) {
                    return null;
                }
                current = current.contents[part];
            }

            return current;
        }

        // Get parent directory
        function getParent(path) {
            const resolved = resolvePath(path);
            const parts = resolved.split('/').filter(p => p !== '');
            parts.pop();
            return '/' + parts.join('/');
        }

        // Get display path
        function getDisplayPath() {
            if (currentPath === '/home/user') return '~';
            if (currentPath.startsWith('/home/user/')) return '~' + currentPath.slice(10);
            return currentPath;
        }

        // Update prompt
        function updatePrompt() {
            const displayPath = getDisplayPath();
            promptElement.innerHTML = `<span class="user">user</span><span class="at">@</span><span class="host">ubuntu</span><span class="colon">:</span><span class="path">${displayPath}</span><span class="dollar">$</span>`;
            titleElement.textContent = `user@ubuntu: ${displayPath}`;
            env.PWD = currentPath;
        }

        // Print output
        function print(text, className = '') {
            const line = document.createElement('div');
            line.className = 'output-line' + (className ? ' ' + className : '');
            line.innerHTML = text;
            output.appendChild(line);
            scrollToBottom();
        }

        function scrollToBottom() {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        // Commands
        const commands = {
            help: () => {
                return `<span class="info">Available commands:</span>

<span class="success">Navigation:</span>
  cd [dir]          Change directory
  pwd               Print working directory
  ls [options] [path]  List directory contents

<span class="success">File Operations:</span>
  cat [file]        Display file contents
  touch [file]      Create empty file
  mkdir [dir]       Create directory
  rm [-r] [path]    Remove file or directory
  cp [src] [dest]   Copy file
  mv [src] [dest]   Move/rename file
  head [-n N] file  Show first N lines
  tail [-n N] file  Show last N lines
  wc [file]         Word, line, character count

<span class="success">Search & Filter:</span>
  find [path] -name [pattern]  Find files
  grep [pattern] [file]        Search in file
  which [command]              Locate command

<span class="success">System:</span>
  echo [text]       Print text
  date              Show current date/time
  whoami            Print current user
  hostname          Print hostname
  uname [-a]        System information
  uptime            System uptime
  free [-h]         Memory usage
  df [-h]           Disk usage
  ps [aux]          Process list
  top               Process monitor (static)
  kill [pid]        Kill process
  history           Command history

<span class="success">Utilities:</span>
  clear             Clear terminal
  env               Show environment variables
  export VAR=val    Set environment variable
  alias [name=cmd]  Create alias
  man [command]     Manual pages
  cal               Show calendar
  bc                Basic calculator
  exit              Exit terminal

<span class="success">Editor & Scripts:</span>
  nano [file]       Open text editor (Ctrl+O save, Ctrl+X exit)
  chmod +x [file]   Make file executable
  bash [script]     Run shell script
  ./script          Execute script (needs chmod +x first)

<span class="success">Operators:</span>
  |                 Pipe output
  >                 Redirect output to file
  >>                Append to file
  &&                Chain commands`;
            },

            ls: (args) => {
                let showHidden = false;
                let longFormat = false;
                let path = '';

                for (const arg of args) {
                    if (arg.startsWith('-')) {
                        if (arg.includes('a') || arg.includes('A')) showHidden = true;
                        if (arg.includes('l')) longFormat = true;
                    } else {
                        path = arg;
                    }
                }

                const node = getNode(path || currentPath);
                if (!node) return `<span class="error">ls: cannot access '${path}': No such file or directory</span>`;
                if (node.type !== 'dir') return path;

                const entries = Object.entries(node.contents);
                if (entries.length === 0) return '';

                let result = [];

                for (const [name, item] of entries.sort((a, b) => a[0].localeCompare(b[0]))) {
                    if (!showHidden && name.startsWith('.')) continue;

                    if (longFormat) {
                        const isDir = item.type === 'dir';
                        const isExec = item.executable;
                        const perms = isDir ? 'drwxr-xr-x' : (isExec ? '-rwxr-xr-x' : '-rw-r--r--');
                        const size = item.content ? item.content.length : 4096;
                        const date = 'Jan 16 10:00';
                        const colorClass = isDir ? 'directory' : (isExec ? 'executable' : '');
                        const displayName = isDir ? `<span class="${colorClass}">${name}/</span>` :
                                           (isExec ? `<span class="${colorClass}">${name}*</span>` : name);
                        result.push(`${perms}  1 user user ${String(size).padStart(8)} ${date} ${displayName}`);
                    } else {
                        if (item.type === 'dir') {
                            result.push(`<span class="directory">${name}/</span>`);
                        } else if (item.executable) {
                            result.push(`<span class="executable">${name}*</span>`);
                        } else {
                            result.push(name);
                        }
                    }
                }

                return longFormat ? result.join('\n') : result.join('  ');
            },

            cd: (args) => {
                const target = args[0] || '~';
                const resolved = resolvePath(target);
                const node = getNode(resolved);

                if (!node) return `<span class="error">cd: ${target}: No such file or directory</span>`;
                if (node.type !== 'dir') return `<span class="error">cd: ${target}: Not a directory</span>`;

                currentPath = resolved === '' ? '/' : resolved;
                updatePrompt();
                return '';
            },

            pwd: () => currentPath,

            cat: (args) => {
                if (args.length === 0) return `<span class="error">cat: missing operand</span>`;

                let result = [];
                for (const path of args) {
                    const node = getNode(path);
                    if (!node) {
                        result.push(`<span class="error">cat: ${path}: No such file or directory</span>`);
                    } else if (node.type === 'dir') {
                        result.push(`<span class="error">cat: ${path}: Is a directory</span>`);
                    } else {
                        result.push(node.content);
                    }
                }
                return result.join('\n');
            },

            echo: (args) => {
                let text = args.join(' ');
                // Handle environment variables
                text = text.replace(/\$(\w+)/g, (match, varName) => env[varName] || '');
                text = text.replace(/\$\{(\w+)\}/g, (match, varName) => env[varName] || '');
                // Remove quotes
                text = text.replace(/^["']|["']$/g, '');
                return text;
            },

            mkdir: (args) => {
                if (args.length === 0) return `<span class="error">mkdir: missing operand</span>`;

                for (const dir of args) {
                    const resolved = resolvePath(dir);
                    const parentPath = getParent(resolved);
                    const parent = getNode(parentPath);
                    const name = resolved.split('/').pop();

                    if (!parent) return `<span class="error">mkdir: cannot create directory '${dir}': No such file or directory</span>`;
                    if (parent.contents[name]) return `<span class="error">mkdir: cannot create directory '${dir}': File exists</span>`;

                    parent.contents[name] = { type: 'dir', contents: {} };
                }
                return '';
            },

            touch: (args) => {
                if (args.length === 0) return `<span class="error">touch: missing operand</span>`;

                for (const file of args) {
                    const resolved = resolvePath(file);
                    const parentPath = getParent(resolved);
                    const parent = getNode(parentPath);
                    const name = resolved.split('/').pop();

                    if (!parent) return `<span class="error">touch: cannot touch '${file}': No such file or directory</span>`;
                    if (!parent.contents[name]) {
                        parent.contents[name] = { type: 'file', content: '' };
                    }
                }
                return '';
            },

            rm: (args) => {
                let recursive = false;
                let files = [];

                for (const arg of args) {
                    if (arg === '-r' || arg === '-rf' || arg === '-R') {
                        recursive = true;
                    } else {
                        files.push(arg);
                    }
                }

                if (files.length === 0) return `<span class="error">rm: missing operand</span>`;

                for (const file of files) {
                    const resolved = resolvePath(file);
                    const parentPath = getParent(resolved);
                    const parent = getNode(parentPath);
                    const name = resolved.split('/').pop();

                    if (!parent || !parent.contents[name]) {
                        return `<span class="error">rm: cannot remove '${file}': No such file or directory</span>`;
                    }

                    const node = parent.contents[name];
                    if (node.type === 'dir' && !recursive) {
                        return `<span class="error">rm: cannot remove '${file}': Is a directory</span>`;
                    }

                    delete parent.contents[name];
                }
                return '';
            },

            cp: (args) => {
                if (args.length < 2) return `<span class="error">cp: missing operand</span>`;

                const src = args[args.length - 2];
                const dest = args[args.length - 1];

                const srcNode = getNode(src);
                if (!srcNode) return `<span class="error">cp: cannot stat '${src}': No such file or directory</span>`;
                if (srcNode.type === 'dir') return `<span class="error">cp: -r not specified; omitting directory '${src}'</span>`;

                const destResolved = resolvePath(dest);
                let destParent, destName;

                const destNode = getNode(dest);
                if (destNode && destNode.type === 'dir') {
                    destParent = destNode;
                    destName = src.split('/').pop();
                } else {
                    destParent = getNode(getParent(destResolved));
                    destName = destResolved.split('/').pop();
                }

                if (!destParent) return `<span class="error">cp: cannot create '${dest}': No such file or directory</span>`;

                destParent.contents[destName] = { ...srcNode };
                return '';
            },

            mv: (args) => {
                if (args.length < 2) return `<span class="error">mv: missing operand</span>`;

                const src = args[0];
                const dest = args[1];

                const srcResolved = resolvePath(src);
                const srcParent = getNode(getParent(srcResolved));
                const srcName = srcResolved.split('/').pop();

                if (!srcParent || !srcParent.contents[srcName]) {
                    return `<span class="error">mv: cannot stat '${src}': No such file or directory</span>`;
                }

                const srcNode = srcParent.contents[srcName];
                const destResolved = resolvePath(dest);
                let destParent, destName;

                const destNode = getNode(dest);
                if (destNode && destNode.type === 'dir') {
                    destParent = destNode;
                    destName = srcName;
                } else {
                    destParent = getNode(getParent(destResolved));
                    destName = destResolved.split('/').pop();
                }

                if (!destParent) return `<span class="error">mv: cannot move '${src}' to '${dest}': No such file or directory</span>`;

                destParent.contents[destName] = srcNode;
                delete srcParent.contents[srcName];
                return '';
            },

            date: () => new Date().toString(),

            whoami: () => 'user',

            hostname: () => 'ubuntu',

            uname: (args) => {
                if (args.includes('-a')) {
                    return 'Linux ubuntu 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
                }
                return 'Linux';
            },

            clear: () => {
                output.innerHTML = '';
                return '';
            },

            history: () => {
                return commandHistory.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`).join('\n');
            },

            env: () => {
                return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
            },

            export: (args) => {
                for (const arg of args) {
                    const match = arg.match(/^(\w+)=(.*)$/);
                    if (match) {
                        env[match[1]] = match[2];
                    }
                }
                return '';
            },

            alias: (args) => {
                if (args.length === 0) {
                    return Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
                }
                for (const arg of args) {
                    const match = arg.match(/^(\w+)=(.*)$/);
                    if (match) {
                        aliases[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
                    }
                }
                return '';
            },

            grep: (args) => {
                if (args.length < 2) return `<span class="error">grep: missing arguments</span>`;

                const pattern = args[0];
                const filePath = args[1];
                const node = getNode(filePath);

                if (!node) return `<span class="error">grep: ${filePath}: No such file or directory</span>`;
                if (node.type === 'dir') return `<span class="error">grep: ${filePath}: Is a directory</span>`;

                const lines = node.content.split('\n');
                const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));

                return matches.map(line => {
                    return line.replace(new RegExp(`(${pattern})`, 'gi'), '<span class="error">$1</span>');
                }).join('\n');
            },

            find: (args) => {
                let searchPath = '.';
                let pattern = '*';

                for (let i = 0; i < args.length; i++) {
                    if (args[i] === '-name' && args[i + 1]) {
                        pattern = args[i + 1];
                        i++;
                    } else if (!args[i].startsWith('-')) {
                        searchPath = args[i];
                    }
                }

                const results = [];
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

                function search(node, path) {
                    if (node.type === 'dir') {
                        for (const [name, child] of Object.entries(node.contents)) {
                            const fullPath = path + '/' + name;
                            if (regex.test(name)) results.push(fullPath);
                            search(child, fullPath);
                        }
                    }
                }

                const startNode = getNode(searchPath);
                if (!startNode) return `<span class="error">find: '${searchPath}': No such file or directory</span>`;

                search(startNode, resolvePath(searchPath));
                return results.join('\n');
            },

            which: (args) => {
                if (args.length === 0) return '';
                const cmd = args[0];
                const builtins = ['cd', 'pwd', 'echo', 'export', 'alias', 'history', 'exit'];

                if (builtins.includes(cmd)) return `${cmd}: shell built-in command`;
                if (commands[cmd]) return `/usr/bin/${cmd}`;
                return `${cmd} not found`;
            },

            head: (args) => {
                let lines = 10;
                let file = '';

                for (let i = 0; i < args.length; i++) {
                    if (args[i] === '-n' && args[i + 1]) {
                        lines = parseInt(args[i + 1]);
                        i++;
                    } else {
                        file = args[i];
                    }
                }

                if (!file) return `<span class="error">head: missing operand</span>`;

                const node = getNode(file);
                if (!node) return `<span class="error">head: cannot open '${file}': No such file or directory</span>`;
                if (node.type === 'dir') return `<span class="error">head: ${file}: Is a directory</span>`;

                return node.content.split('\n').slice(0, lines).join('\n');
            },

            tail: (args) => {
                let lines = 10;
                let file = '';

                for (let i = 0; i < args.length; i++) {
                    if (args[i] === '-n' && args[i + 1]) {
                        lines = parseInt(args[i + 1]);
                        i++;
                    } else {
                        file = args[i];
                    }
                }

                if (!file) return `<span class="error">tail: missing operand</span>`;

                const node = getNode(file);
                if (!node) return `<span class="error">tail: cannot open '${file}': No such file or directory</span>`;
                if (node.type === 'dir') return `<span class="error">tail: ${file}: Is a directory</span>`;

                const allLines = node.content.split('\n');
                return allLines.slice(-lines).join('\n');
            },

            wc: (args) => {
                if (args.length === 0) return `<span class="error">wc: missing operand</span>`;

                let results = [];
                for (const file of args) {
                    const node = getNode(file);
                    if (!node) {
                        results.push(`<span class="error">wc: ${file}: No such file or directory</span>`);
                        continue;
                    }
                    if (node.type === 'dir') {
                        results.push(`<span class="error">wc: ${file}: Is a directory</span>`);
                        continue;
                    }

                    const content = node.content;
                    const lines = content.split('\n').length;
                    const words = content.split(/\s+/).filter(w => w).length;
                    const chars = content.length;

                    results.push(`  ${lines}  ${words} ${chars} ${file}`);
                }
                return results.join('\n');
            },

            uptime: () => {
                const hours = Math.floor(Math.random() * 100) + 1;
                return ` 10:00:00 up ${hours} days,  2:30,  1 user,  load average: 0.08, 0.03, 0.01`;
            },

            free: (args) => {
                const human = args.includes('-h');
                if (human) {
                    return `               total        used        free      shared  buff/cache   available
Mem:            15Gi       3.2Gi       8.0Gi       234Mi       4.2Gi        12Gi
Swap:          2.0Gi          0B       2.0Gi`;
                }
                return `               total        used        free      shared  buff/cache   available
Mem:        16384000     3355443     8388608      239616     4404019    12582912
Swap:        2097152           0     2097152`;
            },

            df: (args) => {
                const human = args.includes('-h');
                if (human) {
                    return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   22G   25G  47% /
tmpfs           7.8G     0  7.8G   0% /dev/shm
/dev/sda2       100G   45G   50G  48% /home`;
                }
                return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 23068672  26843545  47% /
tmpfs            8192000        0   8192000   0% /dev/shm
/dev/sda2      104857600 47185920  52428800  48% /home`;
            },

            ps: (args) => {
                if (args.includes('aux')) {
                    return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 169836 13256 ?        Ss   09:00   0:02 /sbin/init
root           2  0.0  0.0      0     0 ?        S    09:00   0:00 [kthreadd]
user        1234  0.0  0.2 225648 18432 pts/0    Ss   09:30   0:00 -bash
user        5678  0.1  0.5 456789 45678 pts/0    S+   10:00   0:01 node app.js
user        9012  0.0  0.1 123456 12345 pts/0    R+   10:05   0:00 ps aux`;
                }
                return `    PID TTY          TIME CMD
   1234 pts/0    00:00:00 bash
   9012 pts/0    00:00:00 ps`;
            },

            top: () => {
                return `top - 10:00:00 up 5 days,  2:30,  1 user,  load average: 0.08, 0.03, 0.01
Tasks: 234 total,   1 running, 233 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  0.7 sy,  0.0 ni, 96.8 id,  0.2 wa,  0.0 hi,  0.0 si
MiB Mem :  16000.0 total,   8234.5 free,   3355.4 used,   4410.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  12345.6 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   5678 user      20   0  456789  45678  23456 S   0.3   0.3   0:01.23 node
   1234 user      20   0  225648  18432  12345 S   0.0   0.1   0:00.45 bash
      1 root      20   0  169836  13256   8901 S   0.0   0.1   0:02.34 systemd

<span class="info">(Press q to quit - simulated static view)</span>`;
            },

            kill: (args) => {
                if (args.length === 0) return `<span class="error">kill: missing operand</span>`;
                return '';
            },

            man: (args) => {
                if (args.length === 0) return `<span class="error">What manual page do you want?</span>`;

                const manPages = {
                    ls: `<span class="man-header">LS(1)                     User Commands                    LS(1)</span>

<span class="man-section">NAME</span>
       ls - list directory contents

<span class="man-section">SYNOPSIS</span>
       ls [OPTION]... [FILE]...

<span class="man-section">DESCRIPTION</span>
       List information about the FILEs (the current directory by default).

       <span class="success">-a, --all</span>
              do not ignore entries starting with .

       <span class="success">-l</span>
              use a long listing format

       <span class="success">-h, --human-readable</span>
              with -l, print sizes in human readable format`,

                    cd: `<span class="man-header">CD(1)                     User Commands                    CD(1)</span>

<span class="man-section">NAME</span>
       cd - change the working directory

<span class="man-section">SYNOPSIS</span>
       cd [dir]

<span class="man-section">DESCRIPTION</span>
       Change the current directory to dir. The variable HOME is the default dir.`,

                    cat: `<span class="man-header">CAT(1)                    User Commands                   CAT(1)</span>

<span class="man-section">NAME</span>
       cat - concatenate files and print on the standard output

<span class="man-section">SYNOPSIS</span>
       cat [OPTION]... [FILE]...

<span class="man-section">DESCRIPTION</span>
       Concatenate FILE(s) to standard output.`
                };

                const page = args[0].toLowerCase();
                if (manPages[page]) return manPages[page];
                return `<span class="error">No manual entry for ${args[0]}</span>`;
            },

            cal: () => {
                const now = new Date();
                const month = now.toLocaleString('default', { month: 'long' });
                const year = now.getFullYear();
                const today = now.getDate();

                let cal = `     ${month} ${year}\nSu Mo Tu We Th Fr Sa\n`;

                const firstDay = new Date(year, now.getMonth(), 1).getDay();
                const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

                let day = 1;
                for (let i = 0; i < 6; i++) {
                    let week = '';
                    for (let j = 0; j < 7; j++) {
                        if (i === 0 && j < firstDay) {
                            week += '   ';
                        } else if (day > daysInMonth) {
                            break;
                        } else {
                            const dayStr = day === today ?
                                `<span class="info">${String(day).padStart(2)}</span>` :
                                String(day).padStart(2);
                            week += dayStr + ' ';
                            day++;
                        }
                    }
                    cal += week + '\n';
                    if (day > daysInMonth) break;
                }

                return cal;
            },

            bc: (args) => {
                if (args.length === 0) {
                    return `<span class="info">bc - An arbitrary precision calculator language
Enter expressions like: echo "2+2" | bc</span>`;
                }
                try {
                    const expr = args.join(' ');
                    // Safe evaluation for basic math
                    const result = Function('"use strict"; return (' + expr.replace(/[^0-9+\-*/.()%\s]/g, '') + ')')();
                    return String(result);
                } catch (e) {
                    return `<span class="error">syntax error</span>`;
                }
            },

            exit: () => {
                print('<span class="info">logout</span>');
                setTimeout(() => {
                    document.body.innerHTML = '<div style="color:#fff;text-align:center;margin-top:40vh;font-family:monospace;">Session terminated. Refresh to restart.</div>';
                }, 500);
                return '';
            },

            nano: (args) => {
                if (args.length === 0) {
                    openNano('', null);
                } else {
                    const filePath = args[0];
                    const node = getNode(filePath);
                    if (node && node.type === 'dir') {
                        return `<span class="error">nano: ${filePath}: Is a directory</span>`;
                    }
                    const content = node ? node.content : '';
                    openNano(content, filePath);
                }
                return '';
            },

            chmod: (args) => {
                if (args.length < 2) return `<span class="error">chmod: missing operand</span>`;
                const mode = args[0];
                const filePath = args[1];
                const node = getNode(filePath);
                if (!node) return `<span class="error">chmod: cannot access '${filePath}': No such file or directory</span>`;
                if (mode === '+x' || mode === '755' || mode === '777') {
                    node.executable = true;
                } else if (mode === '-x' || mode === '644') {
                    node.executable = false;
                }
                return '';
            },

            bash: (args) => {
                if (args.length === 0) return `<span class="error">bash: missing script file</span>`;
                const filePath = args[0];
                const scriptArgs = args.slice(1);
                return runScript(filePath, scriptArgs);
            },

            sh: (args) => {
                return commands.bash(args);
            },

            source: (args) => {
                return commands.bash(args);
            },

            '.': (args) => {
                return commands.bash(args);
            }
        };

        // Nano Editor
        let nanoActive = false;
        let nanoFilePath = null;

        function openNano(content, filePath) {
            nanoActive = true;
            nanoFilePath = filePath;

            const fileName = filePath ? filePath.split('/').pop() : 'New Buffer';

            const nanoHtml = `
                <div class="nano-editor" id="nano-editor">
                    <div class="nano-header">GNU nano 6.2 &nbsp;&nbsp;&nbsp;&nbsp; ${fileName}</div>
                    <div class="nano-content">
                        <textarea class="nano-textarea" id="nano-textarea" spellcheck="false">${escapeHtml(content)}</textarea>
                    </div>
                    <div class="nano-status" id="nano-status"></div>
                    <div class="nano-footer">
                        <div class="nano-shortcuts">
                            <div class="nano-shortcut"><span>^G</span> Help</div>
                            <div class="nano-shortcut"><span>^O</span> Write Out</div>
                            <div class="nano-shortcut"><span>^X</span> Exit</div>
                            <div class="nano-shortcut"><span>^K</span> Cut</div>
                            <div class="nano-shortcut"><span>^U</span> Paste</div>
                            <div class="nano-shortcut"><span>^W</span> Where Is</div>
                        </div>
                    </div>
                </div>
            `;

            terminalBody.insertAdjacentHTML('beforeend', nanoHtml);
            const textarea = document.getElementById('nano-textarea');
            textarea.focus();

            textarea.addEventListener('keydown', handleNanoKeydown);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        let nanoCutBuffer = '';

        function handleNanoKeydown(e) {
            const textarea = document.getElementById('nano-textarea');
            const status = document.getElementById('nano-status');

            if (e.ctrlKey) {
                if (e.key === 'x' || e.key === 'X') {
                    e.preventDefault();
                    closeNano(false);
                } else if (e.key === 'o' || e.key === 'O') {
                    e.preventDefault();
                    saveNanoFile();
                } else if (e.key === 's' || e.key === 'S') {
                    e.preventDefault();
                    saveNanoFile();
                } else if (e.key === 'k' || e.key === 'K') {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const lines = textarea.value.split('\n');
                    let charCount = 0;
                    let lineIndex = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (charCount + lines[i].length >= start) {
                            lineIndex = i;
                            break;
                        }
                        charCount += lines[i].length + 1;
                    }
                    nanoCutBuffer = lines[lineIndex];
                    lines.splice(lineIndex, 1);
                    textarea.value = lines.join('\n');
                    status.textContent = '[ Cut 1 line ]';
                    setTimeout(() => status.textContent = '', 2000);
                } else if (e.key === 'u' || e.key === 'U') {
                    e.preventDefault();
                    if (nanoCutBuffer) {
                        const start = textarea.selectionStart;
                        const before = textarea.value.substring(0, start);
                        const after = textarea.value.substring(start);
                        textarea.value = before + nanoCutBuffer + '\n' + after;
                        status.textContent = '[ Pasted 1 line ]';
                        setTimeout(() => status.textContent = '', 2000);
                    }
                } else if (e.key === 'g' || e.key === 'G') {
                    e.preventDefault();
                    status.textContent = '[ Help not available in this simulation ]';
                    setTimeout(() => status.textContent = '', 2000);
                } else if (e.key === 'w' || e.key === 'W') {
                    e.preventDefault();
                    status.textContent = '[ Search: Type in terminal after exit ]';
                    setTimeout(() => status.textContent = '', 2000);
                }
            }
        }

        function saveNanoFile() {
            const textarea = document.getElementById('nano-textarea');
            const status = document.getElementById('nano-status');
            const content = textarea.value;

            if (!nanoFilePath) {
                status.textContent = '[ Error: No filename. Use nano <filename> ]';
                setTimeout(() => status.textContent = '', 2000);
                return;
            }

            const resolved = resolvePath(nanoFilePath);
            const parentPath = getParent(resolved);
            const parent = getNode(parentPath);
            const name = resolved.split('/').pop();

            if (!parent) {
                status.textContent = '[ Error: Directory does not exist ]';
                setTimeout(() => status.textContent = '', 2000);
                return;
            }

            if (!parent.contents[name]) {
                parent.contents[name] = { type: 'file', content: '', executable: false };
            }
            parent.contents[name].content = content;

            status.textContent = `[ Wrote ${content.split('\n').length} lines ]`;
            setTimeout(() => status.textContent = '', 2000);

            document.querySelector('.nano-header').textContent = 'GNU nano 6.2      ' + name;
        }

        function closeNano(save) {
            const editor = document.getElementById('nano-editor');
            if (editor) {
                editor.remove();
            }
            nanoActive = false;
            nanoFilePath = null;
            input.focus();
        }

        // Shell Script Execution
        function runScript(filePath, scriptArgs) {
            const node = getNode(filePath);
            if (!node) return `<span class="error">bash: ${filePath}: No such file or directory</span>`;
            if (node.type === 'dir') return `<span class="error">bash: ${filePath}: Is a directory</span>`;

            const content = node.content;
            const lines = content.split('\n');
            let output = [];
            let scriptEnv = { ...env, '0': filePath };

            // Set positional parameters
            scriptArgs.forEach((arg, i) => {
                scriptEnv[String(i + 1)] = arg;
            });
            scriptEnv['@'] = scriptArgs.join(' ');
            scriptEnv['#'] = String(scriptArgs.length);

            for (let line of lines) {
                line = line.trim();

                // Skip empty lines and comments
                if (!line || line.startsWith('#')) continue;

                // Variable substitution
                line = line.replace(/\$(\w+)/g, (match, varName) => scriptEnv[varName] || env[varName] || '');
                line = line.replace(/\$\{(\w+)\}/g, (match, varName) => scriptEnv[varName] || env[varName] || '');
                line = line.replace(/\$(\d+)/g, (match, num) => scriptEnv[num] || '');

                // Handle variable assignment
                const assignMatch = line.match(/^(\w+)=(.*)$/);
                if (assignMatch) {
                    scriptEnv[assignMatch[1]] = assignMatch[2].replace(/^["']|["']$/g, '');
                    continue;
                }

                // Handle sleep (simulated)
                if (line.startsWith('sleep ')) {
                    continue; // Skip sleep in simulation
                }

                // Handle if/then/else/fi (basic)
                if (line === 'then' || line === 'else' || line === 'fi' || line === 'do' || line === 'done') {
                    continue;
                }
                if (line.startsWith('if ') || line.startsWith('while ') || line.startsWith('for ')) {
                    continue; // Skip control structures in basic simulation
                }

                // Execute the command
                const result = executeCommand(line);
                if (result) output.push(result);
            }

            return output.join('\n');
        }

        // Handle ./ execution
        function handleDotSlash(cmdLine) {
            if (cmdLine.startsWith('./')) {
                const parts = cmdLine.split(/\s+/);
                const script = parts[0].substring(2);
                const args = parts.slice(1);
                const node = getNode(script);

                if (!node) return `<span class="error">bash: ${cmdLine}: No such file or directory</span>`;
                if (node.type === 'dir') return `<span class="error">bash: ${cmdLine}: Is a directory</span>`;
                if (!node.executable) return `<span class="error">bash: ${cmdLine}: Permission denied</span>`;

                return runScript(script, args);
            }
            return null;
        }

        // Execute command
        function executeCommand(cmdLine) {
            if (!cmdLine.trim()) return '';

            // Handle ./ script execution
            const dotSlashResult = handleDotSlash(cmdLine.trim());
            if (dotSlashResult !== null) return dotSlashResult;

            // Handle pipes
            if (cmdLine.includes('|')) {
                const parts = cmdLine.split('|').map(p => p.trim());
                let output = '';

                for (const part of parts) {
                    if (output) {
                        // Feed output as argument to next command
                        const [cmd, ...args] = part.split(/\s+/);
                        if (cmd === 'grep' && args.length === 1) {
                            const pattern = args[0];
                            const lines = output.split('\n');
                            output = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase())).join('\n');
                        } else if (cmd === 'head') {
                            let n = 10;
                            if (args[0] === '-n' && args[1]) n = parseInt(args[1]);
                            output = output.split('\n').slice(0, n).join('\n');
                        } else if (cmd === 'tail') {
                            let n = 10;
                            if (args[0] === '-n' && args[1]) n = parseInt(args[1]);
                            output = output.split('\n').slice(-n).join('\n');
                        } else if (cmd === 'wc') {
                            const lines = output.split('\n').length;
                            const words = output.split(/\s+/).filter(w => w).length;
                            const chars = output.length;
                            output = `  ${lines}  ${words} ${chars}`;
                        } else if (cmd === 'sort') {
                            output = output.split('\n').sort().join('\n');
                        } else if (cmd === 'uniq') {
                            output = [...new Set(output.split('\n'))].join('\n');
                        }
                    } else {
                        output = executeCommand(part);
                    }
                }
                return output;
            }

            // Handle output redirection
            if (cmdLine.includes('>>')) {
                const [cmd, file] = cmdLine.split('>>').map(p => p.trim());
                const output = executeCommand(cmd);
                const node = getNode(file);
                if (node && node.type === 'file') {
                    node.content += '\n' + output;
                } else {
                    const parentPath = getParent(resolvePath(file));
                    const parent = getNode(parentPath);
                    const name = file.split('/').pop();
                    if (parent) {
                        parent.contents[name] = { type: 'file', content: output };
                    }
                }
                return '';
            }

            if (cmdLine.includes('>') && !cmdLine.includes('>>')) {
                const [cmd, file] = cmdLine.split('>').map(p => p.trim());
                const output = executeCommand(cmd);
                const parentPath = getParent(resolvePath(file));
                const parent = getNode(parentPath);
                const name = file.split('/').pop();
                if (parent) {
                    parent.contents[name] = { type: 'file', content: output };
                }
                return '';
            }

            // Handle && chaining
            if (cmdLine.includes('&&')) {
                const parts = cmdLine.split('&&').map(p => p.trim());
                let lastOutput = '';
                for (const part of parts) {
                    lastOutput = executeCommand(part);
                    if (lastOutput.includes('class="error"')) break;
                }
                return lastOutput;
            }

            // Parse command
            const tokens = cmdLine.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
            if (tokens.length === 0) return '';

            let cmd = tokens[0];
            let args = tokens.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

            // Check aliases
            if (aliases[cmd]) {
                const aliasTokens = aliases[cmd].split(/\s+/);
                cmd = aliasTokens[0];
                args = [...aliasTokens.slice(1), ...args];
            }

            // Execute
            if (commands[cmd]) {
                return commands[cmd](args);
            }

            return `<span class="error">${cmd}: command not found</span>`;
        }

        // Handle input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdLine = input.value;

                // Show the command in output
                const promptHtml = promptElement.innerHTML;
                print(`<span class="prompt">${promptHtml}</span> ${cmdLine}`);

                if (cmdLine.trim()) {
                    commandHistory.push(cmdLine);
                    historyIndex = commandHistory.length;

                    const result = executeCommand(cmdLine);
                    if (result) print(result);
                }

                input.value = '';
                scrollToBottom();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    input.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion
                const parts = input.value.split(' ');
                const last = parts[parts.length - 1];

                if (last) {
                    const dir = last.includes('/') ? getParent(resolvePath(last)) : currentPath;
                    const prefix = last.includes('/') ? last.split('/').pop() : last;
                    const node = getNode(dir);

                    if (node && node.type === 'dir') {
                        const matches = Object.keys(node.contents).filter(n => n.startsWith(prefix));
                        if (matches.length === 1) {
                            parts[parts.length - 1] = last.includes('/') ?
                                last.substring(0, last.lastIndexOf('/') + 1) + matches[0] :
                                matches[0];
                            input.value = parts.join(' ');
                        } else if (matches.length > 1) {
                            print(`<span class="prompt">${promptElement.innerHTML}</span> ${input.value}`);
                            print(matches.join('  '));
                        }
                    }
                }
            } else if (e.key === 'c' && e.ctrlKey) {
                print(`<span class="prompt">${promptElement.innerHTML}</span> ${input.value}^C`);
                input.value = '';
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                commands.clear();
            }
        });

        // Window controls
        function closeTerminal() {
            document.querySelector('.terminal-window').style.display = 'none';
        }

        function minimizeTerminal() {
            document.querySelector('.terminal-window').style.transform = 'scale(0.1)';
            setTimeout(() => {
                document.querySelector('.terminal-window').style.transform = 'scale(1)';
            }, 1000);
        }

        function maximizeTerminal() {
            const tw = document.querySelector('.terminal-window');
            tw.style.maxWidth = tw.style.maxWidth === '100%' ? '900px' : '100%';
        }

        // Focus input on click
        terminalBody.addEventListener('click', () => input.focus());

        // Initialize
        showWelcome();
        updatePrompt();
        input.focus();
    </script>

## Features

### Supported Commands
- **Navigation**: `cd`, `pwd`, `ls` (with `-a`, `-l` flags)
- **File Operations**: `cat`, `touch`, `mkdir`, `rm` (`-r`), `cp`, `mv`, `head`, `tail`, `wc`
- **Search**: `find`, `grep`, `which`
- **System Info**: `date`, `whoami`, `hostname`, `uname`, `uptime`, `free`, `df`, `ps`, `top`
- **Utilities**: `echo`, `clear`, `env`, `export`, `alias`, `man`, `history`, `cal`, `bc`
- **Control**: `exit`, `kill`

### Features
- Full virtual filesystem with `/home`, `/etc`, `/var`, `/usr`, `/proc`, etc.
- Command history (↑/↓ arrows)
- Tab completion for files and directories
- Pipe support (`|`) for chaining commands
- Output redirection (`>`, `>>`)
- Command chaining (`&&`)
- Environment variables (`$VAR`, `${VAR}`)
- Aliases (predefined `ll`, `la`, `l`, `cls`)
- Ctrl+C to cancel, Ctrl+L to clear
- Colorized output (directories blue, executables green, errors red)
- Man pages for common commands
- Working `grep` with highlighting
- Interactive window controls (close, minimize, maximize)

### How to Use
1. Copy the HTML code above
2. Save as an `.html` file
3. Open in a web browser
4. Start typing commands!

Try these commands to get started:
```bash
ls -la
cd Documents
cat notes.txt
find /home -name "*.txt"
ps aux | grep node
echo "Hello World" > test.txt
history
```
