#version 100
precision mediump float;

uniform sampler2D uAtlas;             // Main atlas
uniform sampler2D uMotionVectors;     // Motion vectors atlas
uniform ivec2     uTiles;             // Tiling dimensions
uniform int       uTotalTiles;        // Total amount of tiles
uniform vec2      uMotionEstimation;  // Motion estimation for motion vector
uniform float     uPercentage;        // Percentage of the animation changes on each call
uniform float     uStrength;
varying vec2      vTextureCoord;

uniform vec3     uTint;

vec2 getTileFromIndex(int tileIndex) {
    return vec2(
        int(mod(float(tileIndex), float(uTiles.x))),
        int(float(tileIndex) / float(uTiles.x))
    );
}

vec4 sampleTile (sampler2D tex, int index, vec2 uv, vec2 motion) {
    vec2 tileSize = 1.0 / vec2(uTiles);
    vec2 subUv = uv * tileSize;
    vec2 tile = getTileFromIndex(index);
    return texture2D(tex, subUv + tile * tileSize + motion);
}

void main() {
    float tileIndex = mod(uPercentage, float(uTotalTiles));
    float frameBlending = fract(tileIndex);

    int motionOffset = 0;
    vec2 motionOrder = vec2(1.0);

    vec2 currentMotion = sampleTile(uMotionVectors, int(tileIndex) + motionOffset, vTextureCoord, vec2(0)).rg * 2.0 - 1.0;
    vec2 nextMotion = sampleTile(uMotionVectors, int(tileIndex) + 1 + motionOffset, vTextureCoord, vec2(0)).rg * 2.0 - 1.0;

    vec2 currentDistort = (motionOrder * -currentMotion) * frameBlending * uMotionEstimation;
    vec2 nextDistort = (motionOrder * nextMotion) * (1.0 - frameBlending) * uMotionEstimation;

    vec4 currentTexture = sampleTile(uAtlas, int(tileIndex), vTextureCoord, currentDistort * uStrength);
    vec4 nextTexture = sampleTile(uAtlas, int(tileIndex) + 1, vTextureCoord, nextDistort * uStrength);

    gl_FragColor = mix(currentTexture, nextTexture, frameBlending);
}
