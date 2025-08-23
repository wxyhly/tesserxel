import { wgsl } from "@iizukak/codemirror-lang-wgsl";
import { basicSetup } from "codemirror"
import { Decoration, DecorationSet, EditorView, keymap, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { StateField, RangeSetBuilder, StateEffect, EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
const setErrorLines = StateEffect.define<number[]>();

const errorLineTheme = EditorView.baseTheme({
  ".cm-error-line": {
    outline: 'red solid',
    backgroundColor: 'rgb(255, 0, 0, 0.1)',
    borderRadius: '5px',
    outlineOffset: '-2px',
  }
});

const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    for (let e of tr.effects) {
      if (e.is(setErrorLines)) {
        const builder = new RangeSetBuilder<Decoration>();
        for (let lineNumber of e.value) {
          const line = tr.newDoc.line(lineNumber); // 行号从 1 开始
          builder.add(line.from, line.from, Decoration.line({ class: "cm-error-line" }));
        }
        return builder.finish();
      }
    }
    return deco.map(tr.changes);
  },
  provide: f => EditorView.decorations.from(f)
});


const wgslCompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/(\/\/\/\s?@?)?[\w@]*/);
  if (!word) return null;
  const wordAfterPoint = context.matchBefore(/\.[\w@]*/);
  if (word.from == word.to && !context.explicit) return null;
  let suggestions = [
    { label: "/// @moveSpeed:", type: "keyword", info: "/// @moveSpeed: <float>  // default 0.1" },
    { label: "/// @background:", type: "keyword", info: "/// @background: <black|white|(R,G,B)>  // default (255,255,255)" },
    { label: "/// @resolution:", type: "keyword", info: "/// @resolution: <integer power of 2>  // default 512" },
    { label: "/// @stereoEyeOffset:", type: "keyword", info: "/// @stereoEyeOffset: <float>  // default 0.1" },
    { label: "/// @camCtrl: trackball(", type: "keyword", info: "/// @camCtrl: trackball(center.x,center.y,center.z,center.w)  // default (0,0,0,1)" },
    { label: "/// @camCtrl: freefly", type: "keyword", info: "/// @camCtrl: freefly" },
    { label: "/// @opacity:", type: "keyword", info: "/// @opacity: <float> // default 5" },
    { label: "/// @retinaLayers:", type: "keyword", info: "/// @retinaLayers: <integer> // default 64" },
    { label: "@location", type: "keyword" },
    { label: "@builtin(position)", type: "keyword" },
    { label: "@tetra", type: "keyword" },
    { label: "@vertex", type: "keyword" },
    { label: "@fragment", type: "keyword" },
    { label: "vec4f", type: "type", info: "Vec4 Float32 type" },
    { label: "vec3f", type: "type", info: "Vec3 Float32 type" },
    { label: "vec2f", type: "type", info: "Vec2 Float32 type" },
    { label: "mat4x4f", type: "type", info: "Mat4 Float32 type" },
    { label: "mat3x3f", type: "type", info: "Mat3 Float32 type" },
    { label: "return", type: "keyword" },
    { label: "shadertoyTime", type: "variable", info: "Uniform Float32" },
    { label: "step", type: "function" },
    { label: "smoothstep", type: "function", info: `fn smoothstep(edge0: T, edge1: T, x: T) -> T` },
    { label: "step", type: "function", info: `fn step(edge: T, x: T) -> T;\n Returns 1.0 if edge ≤ x, and 0.0 otherwise. ` },
    { label: "normalize", type: "function", info: `fn normalize(e: vecN<T> ) -> vecN<T>` },
    { label: "mix", type: "function", info: `fn mix(x: T, y: T, a: T) -> T;\n Returns x * (1.0 - a) + y * a.` },
  ];
  if (wordAfterPoint) {
    suggestions = [];
  }

  return {
    from: word.from,
    to: word.to,
    options: suggestions.filter(item => item.label.startsWith(word.text)),
  };
};

export const createCodemirrorEditor = (parent?: Element | DocumentFragment, doc?: string | Text,
  onchange?: () => void, onfocus?: () => void, onblur?: () => void,) => {
  const onChangeHandler = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      showError([]);
      onchange?.();
    }
  });
  const focusExtension = EditorView.domEventHandlers({
    focus(event, view) {
      onfocus?.();
    },
    blur(event, view) {
      onblur?.();
    }
  });
  let v = new EditorView({
    extensions: [
      basicSetup, wgsl(),
      EditorState.tabSize.of(4),
      indentUnit.of("    "),
      keymap.of([indentWithTab]),
      autocompletion({ override: [wgslCompletionSource], }),
      errorLineTheme, errorLineField,
      onChangeHandler, focusExtension
    ],
    parent: parent ?? document.body,
    doc: (doc ?? "") as string,
  });


  const showError = (errs: number[],) => {
    // handle out of range error: do nothing
    if (errs.find(e => e < 0 || e > v.state.doc.lines - 1)) return;
    v.dispatch({
      effects: setErrorLines.of(errs)
    });
    if (errs.length === 1) {
      const line = v.state.doc.line(errs[0]);
      return () => {
        const currentSel = v.state.selection;
        v.dispatch({
          selection: { anchor: line.from },
          scrollIntoView: true
        });
        v.dispatch({ selection: currentSel });
      }
    }
  };
  return { editor: v, showError };
}