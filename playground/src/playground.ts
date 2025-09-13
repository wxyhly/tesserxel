import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { indentUnit } from "@codemirror/language";
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import examples from './exampleList';
import { hello201 } from './hello20';
const LS_HTML = 'cm-playground-html';
const LS_JS = 'cm-playground-js';
const params = new URLSearchParams(window.location.search);
let lang = params.get("lang") || (navigator.languages.join(",").includes("zh") ? "zh" : "en");

const translations = {
    en: {
        htmlSource: "HTML Source",
        jsSource: "JS Source",
        result: "Result",
        console: "Console",
        runMessage: "Running JS...",
        refreshed: 'Preview refreshed',
        htmlSaved: 'HTML saved to localStorage',
        jsSaved: 'JS saved to localStorage',
        popupBlocked: 'Popup blocked',
        previewTitle: 'Preview',
        uncaughtError: 'Uncaught Error',
        title: "Tesserxel Playground",
        autorun: "Auto Run",
        runBtn: "▶ Run",
        preview: "Preview",
        maximize: "⛶",
        save: "Save",
        openWin: "Open in New Window",
        clear: "Clear",
        htmlFooter: "Language: HTML",
        jsFooter: "Language: JavaScript",
        previewFooter: "Rendered in isolated iframe",
        consoleFooter: "Captures console.log / warn / error and uncaught exceptions",
        examplesMenu: "Example Scenes",
        loadExample: "Load example"
    },
    zh: {
        htmlSource: "HTML源码",
        jsSource: "JS源码",
        result: "结果",
        console: "控制台",
        runMessage: "正在运行JS...",
        refreshed: '已刷新预览',
        htmlSaved: 'HTML 已保存到 localStorage',
        jsSaved: 'JS 已保存到 localStorage',
        popupBlocked: '弹窗被拦截',
        previewTitle: '预览',
        uncaughtError: '未捕获的错误',
        title: "Tesserxel Playground",
        autorun: "自动运行",
        runBtn: "▶ 运行",
        preview: "网页预览",
        maximize: "⛶",
        save: "保存",
        openWin: "新窗口打开",
        clear: "清空",
        htmlFooter: "语言：HTML",
        jsFooter: "语言：JavaScript",
        previewFooter: "在隔离的 iframe 中渲染",
        consoleFooter: "捕获 console.log / warn / error 以及未捕获异常",
        examplesMenu: "示例场景",
        loadExample: "加载示例"
    }
};
const t: Record<string, string> = translations[lang] || translations.en;
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t[key] || key;
    });
}

applyTranslations();
const defaultExample = hello201;
const defaultHTML = defaultExample.html[lang];
const defaultJS = defaultExample.js[lang];
// const loadedExamples

const htmlEditor = new EditorView({
    state: EditorState.create({
        doc: localStorage.getItem(LS_HTML) ?? defaultHTML,
        extensions: [
            lineNumbers(),
            highlightActiveLine(),
            history(),
            keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
            html(),
            EditorState.tabSize.of(4),
            indentUnit.of("    "),
            oneDark,
            EditorView.updateListener.of(v => { if (v.docChanged && autorun.checked) scheduleRun(); })
        ]
    }),
    parent: document.getElementById('htmlEditor')
});

const jsEditor = new EditorView({
    state: EditorState.create({
        doc: localStorage.getItem(LS_JS) ?? defaultJS,
        extensions: [
            lineNumbers(),
            highlightActiveLine(),
            history(),
            EditorState.tabSize.of(4),
            indentUnit.of("    "),
            keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
            javascript(),
            oneDark,
            EditorView.updateListener.of(v => { if (v.docChanged && autorun.checked) scheduleRun(); })
        ]
    }),
    parent: document.getElementById('jsEditor')
});

const consoleEl = document.getElementById('console');
function appendConsole(type: string, ...args: any[]) {
    const line = document.createElement('div');
    line.textContent = `[${type.toUpperCase()}] ` + args.map(pretty).join(' ');
    if (type === 'error') line.style.color = '#ff6b6b';
    else if (type === 'warn') line.style.color = '#ffd166';
    else if (type === 'info') line.style.color = '#268535';
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}
function pretty(v) {
    if (typeof v === 'object') { try { return JSON.stringify(v); } catch { return String(v); } }
    return String(v);
}
function clearConsole() { consoleEl.textContent = ''; }
document.getElementById('clearConsole').addEventListener('click', clearConsole);

const iframe = document.getElementById('preview') as HTMLIFrameElement;
const autorun = document.getElementById('autorun') as HTMLInputElement;
const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
runBtn.addEventListener('click', run);
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') { e.preventDefault(); run(); }
});

let runTimer = null;
function scheduleRun() { clearTimeout(runTimer); runTimer = setTimeout(run, 300); }
// bilingual version of your snippet
function run() {
    clearConsole();
    const htmlCode = htmlEditor.state.doc.toString();
    const jsCode = jsEditor.state.doc.toString();

    const src = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.previewTitle}</title>
<style>body{font:14px ui-sans-serif,system-ui; padding:12px}</style>
<script>
(function () {
  const _raf = window.requestAnimationFrame;
  const _caf = window.cancelAnimationFrame;

  let paused = false;
  let pending = new Map(); // 存储暂停时的回调
  let idCounter = 1;

  window.requestAnimationFrame = function (callback) {
    if (paused) {
      // 自己生成一个假的 id
      const fakeId = idCounter++;
      pending.set(fakeId, callback);
      return fakeId;
    } else {
      return _raf(callback);
    }
  };

  window.cancelAnimationFrame = function (id) {
    if (paused && pending.has(id)) {
      pending.delete(id);
    } else {
      _caf(id);
    }
  };

  // 提供控制方法
  window.pauseRAF = function () {
    paused = true;
  };

  window.resumeRAF = function () {
    if (!paused) return;
    paused = false;
    // 把积压的回调重新投递给真正的 RAF
    for (const [id, cb] of pending) {
      _raf(cb);
    }
    pending.clear();
  };
})();
</script>
</head>
<body>
${htmlCode}
<script>
(()=>{
  const send=(type,...args)=>parent.postMessage({type,from:'preview',args:JSON.stringify(args)},'*');
  const orig = {log: console.log, warn: console.warn, error: console.error};
  console.log = (...a)=>{send('log',...a); orig.log(...a)};
  console.warn = (...a)=>{send('warn',...a); orig.warn(...a)};
  console.error= (...a)=>{send('error',...a); orig.error(...a)};
  window.addEventListener('error', (ev)=>{ orig.log(ev);send('error', String(ev.error||ev.message||'${t.uncaughtError}')); });
  window.addEventListener('unhandledrejection', (e)=>{ const ev = e.reason; orig.log(ev);send('error', String(ev.error||ev.message||'${t.uncaughtError}')); });
})();
<\/script>
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">
${jsCode}
<\/script>
</body>
</html>`;
    iframe.srcdoc = src;
    appendConsole('info', t.refreshed);
}

window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    if (data && data.from === 'preview' && data.type) {
        appendConsole(data.type, ...(JSON.parse(data.args) ?? []));
    }
});

document.getElementById('saveHtml').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem(LS_HTML, htmlEditor.state.doc.toString());
    appendConsole('info', t.htmlSaved);
});
document.getElementById('saveJs').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem(LS_JS, jsEditor.state.doc.toString());
    appendConsole('info', t.jsSaved);
});

document.getElementById('openWin').addEventListener('click', (e) => {
    e.preventDefault();
    const w = window.open('', '_blank');
    if (!w) { appendConsole('warn', t.popupBlocked); return; }
    const htmlCode = htmlEditor.state.doc.toString();
    const jsCode = jsEditor.state.doc.toString();
    w.document.open();
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.previewTitle}</title></head>
<body>${htmlCode}
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">${jsCode}</script></body></html>`);
    w.document.close();
});

const grid = document.getElementById('grid');
let currentMaximized: string | null = null;

function maximizePanel(cardId: string) {
    grid.classList.add('maximized');
    grid.querySelectorAll('.card').forEach(c => c.classList.remove('maximized'));

    const card = document.getElementById(cardId);
    card.classList.add('maximized');
    iframe.contentWindow[cardId !== "card-preview" ? "pauseRAF" : "resumeRAF"]();
    currentMaximized = cardId;

    updateSwitchButtons(cardId);
}

function restorePanels() {
    grid.classList.remove('maximized');
    grid.querySelectorAll('.card').forEach(c => c.classList.remove('maximized'));
    currentMaximized = null;
    iframe.contentWindow["resumeRAF"]();
    // 清空所有 switch-buttons
    document.querySelectorAll('.switch-buttons').forEach(el => (el.innerHTML = ""));
}

function updateSwitchButtons(activeId: string) {
    // 先清空所有
    document.querySelectorAll('.switch-buttons').forEach(el => (el.innerHTML = ""));

    const activeCard = document.getElementById(activeId);
    const container = activeCard.querySelector('.switch-buttons') as HTMLElement;

    ["card-html", "card-js", "card-preview", "card-console"]
        .filter(id => id !== activeId)
        .forEach(id => {
            const btn = document.createElement("button");
            btn.textContent = document.querySelector(`#${id} h2`)?.textContent ?? id;
            btn.className = "switch-btn";
            btn.onclick = () => maximizePanel(id);
            container.appendChild(btn);
        });
}

document.querySelectorAll('.maximize-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cardId = btn.getAttribute('data-card');
        const card = document.getElementById(cardId);
        if (card.classList.contains('maximized')) {
            restorePanels();
        } else {
            maximizePanel(cardId);
        }
    });
});


function renderMenu(container: HTMLElement, items: typeof examples, lang: "zh" | "en") {
    items.forEach((item) => {
        if (item.type === "submenu") {
            const details = document.createElement("details");
            details.className = "submenu";

            const summary = document.createElement("summary");
            summary.textContent = item.label[lang];
            details.appendChild(summary);

            const ul = document.createElement("ul");
            renderMenu(ul, item.children, lang);
            details.appendChild(ul);

            container.appendChild(details);
        } else if (item.type === "item") {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "item";
            btn.textContent = item.label[lang];
            btn.addEventListener("click", async () => {
                console.log(t["loadExample"] + `: ${item.label[lang]}`);
                const e = await item.example();
                htmlEditor.dispatch({ changes: { from: 0, to: htmlEditor.state.doc.length, insert: e.html[lang] } });
                jsEditor.dispatch({ changes: { from: 0, to: jsEditor.state.doc.length, insert: e.js[lang] } });
                if (autorun.checked) scheduleRun();
            });
            li.appendChild(btn);
            container.appendChild(li);
        }
    });
}

run();
document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("examplesMenu");
    if (!dropdown.contains(e.target as Node)) {
        document.querySelectorAll("details[open]").forEach(d => d.removeAttribute("open"));
    }
});
renderMenu(document.querySelector(".dropdown"), examples, lang as "zh" | "en");
