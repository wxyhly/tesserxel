const diceHTML = `<canvas></canvas>
<label style="position:absolute;color:white;left:0px;right:0px"><input type="checkbox">严格对齐模式 (按大键盘1-8对齐点位)</label>`;
const diceJs = `import * as tesserxel from "tesserxel"
const FOUR = tesserxel.four;
const { Vec4, Rotor } = tesserxel.math;
const canvas = document.querySelector("canvas");
const app = await FOUR.App.create({ canvas });
// 背景设为天蓝色，为突出骰子，因此降低不透明度
// [0.8,1,1,0.1] 等同于 { r: 0.8, g: 1, b: 1, a: 0.1 }
app.scene.setBackgroundColor([0.8, 1, 1, 0.1]);
// 把不透明度总体上限拉高
app.retinaController.setOpacity(10);
let cubeGeometry = new FOUR.TesseractGeometry();
// 通过运行在GPU上的Wgsl片元着色器代码来绘制骰子点数
let material = new FOUR.LambertMaterial(new FOUR.WgslTexture(\`
const red = vec4f(1.0,0.0,0.0,1.0);
const blue = vec4f(0.0,0.0,0.8,1.0);
// 通过一个常量数组储存1-8点的不同颜色
const arr = array<vec4f,8>(red,red,blue,blue,blue,red,blue,blue);
fn main(uvw:vec4f)->vec4f{
    var pattern:f32;
    // 通过贴图坐标的w分量判断是哪个面，然后使用球的距离公式来判断是否在球点图形内
    // 如0号面为半径0.5，位于原点的球
    if(uvw.w<0.5){pattern=step(length(uvw.xyz),0.5);}
    else if(uvw.w<1.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.28);}
    else if(uvw.w<2.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.38,0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,-0.38,-0.38)),0.28)+step(length(uvw.xyz),0.28);}
    else if(uvw.w<3.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.46,0.0,-0.46)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.46,0.0,0.46)),0.28);}
    else if(uvw.w<4.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28)+step(length(uvw.xyz),0.28);}
    else if(uvw.w<5.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.35,-0.35,-0.35)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,0.35)),0.28);}
    else if(uvw.w<6.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.38,0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,0.38,-0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.38,-0.38,-0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.38,-0.38,0.38)),0.28)+step(distance(uvw.xyz,vec3<f32>(0.46,0.0,-0.46)),0.28)+step(distance(uvw.xyz,vec3<f32>(-0.46,0.0,0.46)),0.28)+step(length(uvw.xyz),0.28);}
    else if(uvw.w<7.5){pattern=step(distance(uvw.xyz,vec3<f32>(0.35,0.35,0.35)),0.3)+step(distance(uvw.xyz,vec3<f32>(-0.35,-0.35,-0.35)),0.3);}
    // 按刚才的计算结果选择背景或球点的颜色
    return mix(vec4f(1.0,1.0,1.0,0.1),arr[u32(uvw.w+0.5)],pattern);
}
\`, "main"));
let dice_mesh = new FOUR.Mesh(cubeGeometry, material);
dice_mesh.alwaysUpdateCoord = true;
app.scene.add(dice_mesh);
app.scene.add(new FOUR.AmbientLight(0.3));
app.scene.add(new FOUR.DirectionalLight(
    [1, 1.1, 1.2],
    new Vec4(-1, 1, 0, 1).norms()
));
app.camera.position.w = 3.0;
// 我们这次不控制相机，而是控制骰子本身，第二个参数设为false，表示控制物体模式
app.controllerRegistry.add(new tesserxel.util.ctrl.TrackBallController(dice_mesh, false));
// 切换点数的控制器
class DiceCtrl {
    dice; // 要控制的对象
    target; // 旋转的目标位置，用于过渡动画
    damp = 0.2; // 过渡动画每帧向目标前进的比例
    constructor(dice) {
        this.dice = dice;
    }
    update(state) {
        // 把当前需要切换的点位的初始朝向记下来，若没按键则是null
        let dir = null;
        if (state.isKeyHold("Digit1")) {
            dir = Vec4.xNeg;
        }
        if (state.isKeyHold("Digit2")) {
            dir = Vec4.y;
        }
        if (state.isKeyHold("Digit3")) {
            dir = Vec4.z;
        }
        if (state.isKeyHold("Digit4")) {
            dir = Vec4.wNeg;
        }
        if (state.isKeyHold("Digit5")) {
            dir = Vec4.w;
        }
        if (state.isKeyHold("Digit6")) {
            dir = Vec4.zNeg;
        }
        if (state.isKeyHold("Digit7")) {
            dir = Vec4.yNeg;
        }
        if (state.isKeyHold("Digit8")) {
            dir = Vec4.x;
        }
        if (dir) {
            const strictAlign = document.querySelector("input[type='checkbox']").checked;
            if (strictAlign) {
                // 如果是严格对齐模式
                // 直接把初始朝向旋转到面向相机即可
                this.target = Rotor.lookAt(dir, Vec4.w);
            } else {
                // 否则从当前朝向出发去做lookAt，允许自转自由度
                // 该点位默认的朝向dir目前已经被骰子的rotation旋转到了currentDir的位置上
                const currentDir = dir.rotate(this.dice.rotation);
                // 生成一个把currentDir转到正前方的旋转r
                const r = Rotor.lookAt(currentDir, Vec4.w);
                // 然后在骰子现有的rotation之上，再执行旋转r，得到骰子的最终朝向
                this.target = r.mul(this.dice.rotation);
            }
        }
        if (this.target) {
            // 生成从this.dice.rotation出发，到target但只旋转了this.damp比例
            this.dice.rotation = Rotor.slerp(this.dice.rotation, this.target, this.damp);
            // distanceSqrTo函数是距离的平方，不直接用距离可减少一次开方运算
            if (this.dice.rotation.distanceSqrTo(this.target) < 1e-4) {
                // 若距目标已很接近，则停止动画
                this.target = null;
            }
        }
    }
}
// 然后我们注册这个控制器
app.controllerRegistry.add(new DiceCtrl(dice_mesh));
app.run();`;
const mat102 = {
    html: { zh: diceHTML, en: diceHTML.replace("严格对齐模式 (按大键盘1-8对齐点位)","Strict Alignment Mode (Using main keyboard 1–8 keys)") },
    js: {
        zh: diceJs, en: diceJs.replace("背景设为天蓝色，为突出骰子，因此降低不透明度", "Set the background to sky blue, and lower the opacity to highlight the dice")
            .replace("[0.8,1,1,0.1] 等同于 { r: 0.8, g: 1, b: 1, a: 0.1 }", "[0.8,1,1,0.2] is equivalent to { r: 0.8, g: 1, b: 1, a: 0.2 }")
            .replace("把不透明度总体上限拉高", "Increase the overall upper limit of opacity")
            .replace("通过运行在GPU上的Wgsl片元着色器代码来绘制骰子点数", "Render dice pips using WGSL fragment shader code running on the GPU")
            .replace("通过一个常量数组储存1-8点的不同颜色", "Store the colors of pips 1–8 in a constant array")
            .replace("通过贴图坐标的w分量判断是哪个面，然后使用球的距离公式来判断是否在球点图形内", "Use the w component of texture coordinates to determine the face, then use the sphere distance formula to check whether a point lies within a pip")
            .replace("如0号面为半径0.5，位于原点的球", "For example, face 0 corresponds to a sphere centered at the origin with radius 0.5")
            .replace("按刚才的计算结果选择背景或球点的颜色", "Select either the background or the pip color based on the computed result")
            .replace("我们这次不控制相机，而是控制骰子本身，第二个参数设为false，表示控制物体模式", "This time we do not control the camera, but the dice itself; the second parameter is set to false to indicate object-control mode")
            .replace("切换点数的控制器", "Controller for switching dice faces")
            .replace("要控制的对象", "The object to control")
            .replace("旋转的目标位置，用于过渡动画", "Target rotation, used for transition animation")
            .replace("过渡动画每帧向目标前进的比例", "Proportion of progress toward the target per frame in transition animation")
            .replace("把当前需要切换的点位的初始朝向记下来，若没按键则是null", "Record the initial orientation of the face to switch to; null if no key is pressed")
            .replace("如果是严格对齐模式", "If strict alignment mode is enabled")
            .replace("直接把初始朝向旋转到面向相机即可", "Directly rotate the initial orientation to face the camera")
            .replace("否则从当前朝向出发去做lookAt，允许自转自由度", "Otherwise, perform lookAt starting from the current orientation, allowing spin freedom")
            .replace("该点位默认的朝向dir目前已经被骰子的rotation旋转到了currentDir的位置上", "The default orientation dir for this face has already been rotated to currentDir by the dice's current rotation")
            .replace("生成一个把currentDir转到正前方的旋转r", "Generate a rotation r that rotates currentDir to the front")
            .replace("然后在骰子现有的rotation之上，再执行旋转r，得到骰子的最终朝向", "Then apply r on the dice’s current rotation to get the final orientation")
            .replace("生成从this.dice.rotation出发，到target但只旋转了this.damp比例", "Generate a rotation starting from this.dice.rotation toward target, but only covering this.damp of the path")
            .replace("distanceSqrTo函数是距离的平方，不直接用距离可减少一次开方运算", "The distanceSqrTo function computes squared distance, avoiding a square root operation")
            .replace("若距目标已很接近，则停止动画", "Stop the animation if the dice is already very close to the target")
            .replace("然后我们注册这个控制器", "Then register this controller")
    },
};
export { mat102 };