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

const assetNames = [
    "flame",
    "explosion"
];

const allAssets = [
    "assets/flame/flame.json",
    "assets/flame/flame_motion.json",
    "assets/explosion/explosion.json",
    "assets/explosion/explosion_motion.json"
]

allAssets
    .reduce((loader, asset) => loader.add(asset), app.loader)
    .load(setup);

function setup(loader, cache) {
    let regularSprite;
    let opticalSprite;
    let assetName = assetNames[1];

    function detachFromParent(sprite) {
        if (sprite && sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
    }

    function setupAsset(assetName) {
        detachFromParent(regularSprite);
        detachFromParent(opticalSprite);

        const motionJson = `assets/${assetName}/${assetName}_motion.json`;
        const flowData = cache[motionJson].data.meta;
        const totalFrames = flowData.tiles.total;

        regularSprite = AnimatedSprite.fromFrames(Array(totalFrames).fill().map((_, n) =>
            `${assetName}_${n}.png`)
        );

        regularSprite.anchor.set(1, 0.5);
        regularSprite.scale.set(2);
        container.addChildAt(regularSprite, 0);

        opticalSprite = new FlowSprite({
            atlas: Texture.from(`${assetName}.png`),
            motionVectors: Texture.from(`${assetName}_motion.png`),
            tiles: flowData.tiles,
            motionEstimation: flowData.motionEstimation
        });
        opticalSprite.motionFlow = 1;
        opticalSprite.anchor.set(0, 0.5);
        opticalSprite.scale.set(2);
        container.addChildAt(opticalSprite, 0);
    }

    const text = new Text("", { fontSize: 36, fill: "#fff" });
    text.anchor.set(0.5, 0);
    container.addChild(text);

    const totalFrames = () => regularSprite.textures.length;

    let gui;
    const controls = {
        reset: () => {
            regularSprite.gotoAndPlay(0)
            opticalSprite.gotoAndPlay(0)
        },
        get currentTexture () {
            return Math.trunc(opticalSprite.currentFrameIndex);
        },
        set currentTexture (value) {
            regularSprite.gotoAndPlay(Math.trunc(value));
            opticalSprite.gotoAndPlay(Math.trunc(value));
        },
        get animationFps () {
            return regularSprite.animationSpeed * 60;
        },
        set animationFps (value) {
            regularSprite.animationSpeed = value / 60;
            opticalSprite.animationSpeed = value / 60;
        },
        get motionFlow () {
            return opticalSprite.motionFlow;
        },
        set motionFlow (value) {
            opticalSprite.motionFlow = value;
        },
        get asset () { return assetName; },
        set asset (value) {
            assetName = value;
            setupAsset(assetName);
            controls.animationFps = 5;
            controls.reset();

            if (gui) gui.destroy();

            gui = new dat.GUI();

            gui.add(controls, "asset", assetNames);
            gui.add(controls, "reset");
            gui.add(controls, "animationFps", 0, 30, 0.01);
            gui.add(controls, "motionFlow", 0, 5, 0.01);
            gui.add(controls, "currentTexture", 0, totalFrames()).listen();
        }
    };

    controls.asset = assetName;

    app.ticker.add(delta => {
        text.position.set(0, -container.height / 2);
        text.text = controls.currentTexture;
    });
}
