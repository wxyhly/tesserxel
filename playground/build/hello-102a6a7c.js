const hello100 = {
    html: {
        zh: `<!-- Tesserxel Playground 已经自动引入了importmap并标记了type="module"，因此不需要下面的代码。如果自己写工程则需要。
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">
// 在此写js代码
</script>
-->
<!-- 创建画布对象 -->
<canvas></canvas>`,
        en: `<!-- Tesserxel Playground has already included the importmap and marked type="module",
     so the following code is not needed. If you set up your own project, it is required.
<script type="importmap">
{  
  "imports": {
    "tesserxel": "../build/esm/tesserxel.js",
    "tesserxel/math": "../build/esm/math/math.js"
  }
}  
</script>
<script type="module">
// Write JS code here
</script>
-->
<!-- create canvas element -->
<canvas></canvas>`
    },
    js: {
        zh: `import {math} from "tesserxel"
// 默认定义一个四维向量需要这样书写：
let v1 = new math.Vec4(1,2,3,4);
console.log(v1);
// 引入捷径可以简化
const Vec4 = math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);`, en: `import {math} from "tesserxel"
// By default, defining a 4D vector requires this syntax:
let v1 = new math.Vec4(1,2,3,4);
console.log(v1);
// Introducing a shortcut can simplify it
const Vec4 = math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);
`
    },
};
const hello101 = {
    html: {
        zh: `<!-- 引入umd格式的tesserxel.js文件，这将在javascript中引入名叫tesserxel的全局变量 -->
<script src="https://wxyhly.github.io/tesserxel/build/tesserxel.js" type="text/javascript"></script>
<!-- 创建画布对象 -->
<canvas></canvas>`,
        en: `<!-- load tesserxel.js file of UMD format, this will introduce a global variable named tesserxel in JavaScript -->
<script src="https://wxyhly.github.io/tesserxel/build/tesserxel.js" type="text/javascript"></script>
<!-- create canvas element -->
<canvas></canvas>`
    },
    js: {
        zh: `// 默认定义一个四维向量需要这样书写：
let v1 = new tesserxel.math.Vec4(1,2,3,4);
console.log(v1);
// 引入捷径可以简化
const Vec4 = tesserxel.math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);`, en: `// By default, defining a 4D vector requires this syntax:
let v1 = new tesserxel.math.Vec4(1,2,3,4);
console.log(v1);
// Introducing a shortcut can simplify it
const Vec4 = tesserxel.math.Vec4;
let v2 = new Vec4(2,3,4,5);
console.log(v2);
`
    },
};

export { hello100, hello101 };
