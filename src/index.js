import { Application, Container, Text, AnimatedSprite, Texture } from "pixi.js";
import { FlowSprite } from "./FlowSprite";
import * as dat from "dat.gui";

const app = new Application({
    resizeTo: window,
});
document.body.appendChild(app.view);
const container = new Container();
app.stage.addChild(container);

const onResize = () => {
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
}
window.addEventListener("resize", onResize);
onResize();

const flameJson = "assets/flame/flame.json";
const flameMotionJson = "assets/flame/flame_motion.json";

app.loader
    .add(flameJson)
    .add(flameMotionJson)
    .load(setup);

function setup(loader, cache) {
    const flowData = cache[flameMotionJson].data.meta;
    const totalFrames = flowData.tiles.total;
    const fps = 30;
    const imageUrls = Array(totalFrames).fill().map((_, n) => `flame_${n}.png`);

    const sprite1 = AnimatedSprite.fromFrames(imageUrls);
    sprite1.anchor.set(1.5, 0.5);
    sprite1.scale.set(2);
    container.addChild(sprite1);

    const sprite2 = new FlowSprite({
        atlas: Texture.from("flame.png"),
        motionVectors: Texture.from("flame_motion.png"),
        tiles: flowData.tiles,
        motionEstimation: flowData.motionEstimation
    });
    sprite2.motionFlow = 0;
    sprite2.anchor.set(0.5, 0.5);
    sprite2.scale.set(2);
    sprite2.animationSpeed = 0.23 * 0.23;
    container.addChild(sprite2);

    const sprite3 = new FlowSprite({
        atlas: Texture.from("flame.png"),
        motionVectors: Texture.from("flame_motion.png"),
        tiles: flowData.tiles,
        motionEstimation: flowData.motionEstimation
    });
    sprite3.motionFlow = 1;
    sprite3.anchor.set(-0.5, 0.5);
    sprite3.scale.set(2);
    container.addChild(sprite3);

    const text = new Text("heyy", { fontSize: 36, fill: "#fff" });
    text.anchor.set(0.5, 0);
    container.addChild(text);

    const controls = {
        reset: () => {
            sprite1.gotoAndPlay(0)
            sprite2.gotoAndPlay(0)
            sprite3.gotoAndPlay(0)
        },
        get currentTexture () {
            return Math.trunc(sprite2.currentFrameIndex);
        },
        set currentTexture (value) {
            sprite1.gotoAndPlay(Math.trunc(value));
            sprite2.gotoAndPlay(Math.trunc(value));
            sprite3.gotoAndPlay(Math.trunc(value));
        },
        get speed () {
            return sprite2.animationSpeed * totalFrames / fps;
        },
        set speed (value) {
            sprite1.animationSpeed = value * fps / totalFrames;
            sprite2.animationSpeed = value * fps / totalFrames;
            sprite3.animationSpeed = value * fps / totalFrames;
        }
    };
    const gui = new dat.GUI();
    gui.add(controls, "reset");
    gui.add(controls, "speed", 0, 1, 0.01).listen();
    gui.add(controls, "currentTexture", 0, 16, 0.01).listen();
    controls.speed = 0.2;
    controls.reset();

    app.ticker.add(delta => {
        text.position.set(0, -container.height / 2);
        text.text = controls.currentTexture;
    });
}
