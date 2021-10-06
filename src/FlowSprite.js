import { Geometry, Shader, Mesh, ObservablePoint, UPDATE_PRIORITY, Ticker } from "pixi.js";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

export class FlowSprite extends Mesh {
    constructor({ atlas, motionVectors, tiles, motionEstimation }) {
        const width = atlas.width / tiles.w;
        const height = atlas.height / tiles.h;

        const data = {
            vertexPosition: [ 0, height, width, height, width, 0, 0, 0 ],
            vertexUVs: [ 0, 0, 1, 0, 1, 1, 0, 1 ],
            index: [0, 1, 2, 0, 2, 3],
        }
        const uniforms = {
            uPercentage: 0,
            uAtlas: atlas,
            uMotionVectors: motionVectors,
            uTiles: [tiles.w, tiles.h],
            uTotalTiles: tiles.total,
            uMotionEstimation: motionEstimation,
            uStrength: 1
        };
        const geometry = new Geometry();
        geometry
            .addAttribute("aVertexPosition", data.vertexPosition, 2)
            .addAttribute("aCoordinates", data.vertexUVs, 2)
            .addIndex(data.index);

        const shader = Shader.from(vertex, fragment, uniforms);
        super(geometry, shader);
        this._uniforms = uniforms;

        this.anchor = new ObservablePoint(() => {
            this.pivot.set(
                this.anchor.x * this.width,
                this.anchor.y * this.height
            )
        });

        this._playing = false;
        this._currentTime = 0;
        this.animationSpeed = 1;
    }

    get motionFlow () {
        return this._uniforms.uStrength;
    }

    set motionFlow (value) {
        return this._uniforms.uStrength = value;
    }

    get currentFrameIndex () {
        return this._currentTime % this._uniforms.uTotalTiles;
    }

    stop () {
        if (!this._playing) {
            return;
        }

        this._playing = false;
        Ticker.shared.remove(this.update, this);
    }

    play () {
        if (this._playing) {
            return;
        }

        this._playing = true;
        Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
    }

    gotoAndPlay (n) {
        this._currentTime = n;
        this.play();
    }

    update (deltaTime) {
        if (!this._playing) {
            return;
        }

        const elapsed = this.animationSpeed * deltaTime;
        this._currentTime += elapsed;
        this._uniforms.uPercentage = this._currentTime;
    }
}
