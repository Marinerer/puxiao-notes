import { Color, NormalBlending, LessEqualDepth } from "three";
import type { Blending, DepthModes } from "three";
import { uniform, vec4, positionWorld, normalWorld, cameraPosition, float } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

interface FresnelStop {
    value: number;
    position: number;
    power: number;
}

interface FresnelConfig {
    edge?: number;
    center?: number;
    biasEdge?: number;
    biasCenter?: number;
    power?: number;
    blendMode?: "add" | "multiply";
    invert?: boolean;
    gradientStops?: FresnelStop[];
}

interface MeshFresnelMaterialOptions {
    color?: Color;
    opacity?: number;
    emissive?: Color;
    emissiveIntensity?: number;
    baseColorFresnel?: FresnelConfig;
    opacityFresnel?: FresnelConfig;
    emissiveFresnel?: FresnelConfig;
    blending?: Blending;
    depthTest?: boolean;
    depthFunc?: DepthModes;
    depthWrite?: boolean;
    debug?: boolean;
}

const DEFAULT_FRESNEL: Required<Omit<FresnelConfig, "gradientStops">> = {
    edge: 0.2,
    center: 1,
    biasEdge: 0,
    biasCenter: 0.6,
    power: 1,
    blendMode: "multiply",
    invert: false,
};

class MeshFresnelMaterial extends MeshBasicNodeMaterial {
    readonly uBaseColor = uniform(new Color(0xcccccc));
    readonly uEmissive = uniform(new Color(0x000000));
    readonly uEmissiveIntensity = uniform(0);

    readonly uBcEdge = uniform(DEFAULT_FRESNEL.edge);
    readonly uBcCenter = uniform(DEFAULT_FRESNEL.center);
    readonly uBcBiasEdge = uniform(DEFAULT_FRESNEL.biasEdge);
    readonly uBcBiasCenter = uniform(DEFAULT_FRESNEL.biasCenter);
    readonly uBcPower = uniform(DEFAULT_FRESNEL.power);
    uBcBlendMode: "add" | "multiply" = DEFAULT_FRESNEL.blendMode;
    uBcInvert = DEFAULT_FRESNEL.invert;

    readonly uOpacity = uniform(0.6);
    readonly uOpEdge = uniform(DEFAULT_FRESNEL.edge);
    readonly uOpCenter = uniform(DEFAULT_FRESNEL.center);
    readonly uOpBiasEdge = uniform(DEFAULT_FRESNEL.biasEdge);
    readonly uOpBiasCenter = uniform(DEFAULT_FRESNEL.biasCenter);
    readonly uOpPower = uniform(DEFAULT_FRESNEL.power);
    uOpBlendMode: "add" | "multiply" = DEFAULT_FRESNEL.blendMode;
    uOpInvert = DEFAULT_FRESNEL.invert;

    readonly uEmEdge = uniform(DEFAULT_FRESNEL.edge);
    readonly uEmCenter = uniform(DEFAULT_FRESNEL.center);
    readonly uEmBiasEdge = uniform(DEFAULT_FRESNEL.biasEdge);
    readonly uEmBiasCenter = uniform(DEFAULT_FRESNEL.biasCenter);
    readonly uEmPower = uniform(DEFAULT_FRESNEL.power);
    uEmBlendMode: "add" | "multiply" = DEFAULT_FRESNEL.blendMode;
    uEmInvert = DEFAULT_FRESNEL.invert;

    constructor(options?: MeshFresnelMaterialOptions) {
        super();
        this.transparent = true;
        this.blending = options?.blending ?? NormalBlending;
        this.depthTest = options?.depthTest ?? true;
        this.depthFunc = options?.depthFunc ?? LessEqualDepth;
        this.depthWrite = options?.depthWrite ?? false;

        const debug = options?.debug ?? false;
        const bc = options?.baseColorFresnel;
        const op = options?.opacityFresnel;
        const em = options?.emissiveFresnel;

        if (bc) {
            if (bc.edge !== undefined) this.uBcEdge.value = bc.edge;
            if (bc.center !== undefined) this.uBcCenter.value = bc.center;
            if (bc.biasEdge !== undefined) this.uBcBiasEdge.value = bc.biasEdge;
            if (bc.biasCenter !== undefined) this.uBcBiasCenter.value = bc.biasCenter;
            if (bc.power !== undefined) this.uBcPower.value = bc.power;
            if (bc.blendMode) this.uBcBlendMode = bc.blendMode;
            if (bc.invert !== undefined) this.uBcInvert = bc.invert;
        }
        if (op) {
            if (op.edge !== undefined) this.uOpEdge.value = op.edge;
            if (op.center !== undefined) this.uOpCenter.value = op.center;
            if (op.biasEdge !== undefined) this.uOpBiasEdge.value = op.biasEdge;
            if (op.biasCenter !== undefined) this.uOpBiasCenter.value = op.biasCenter;
            if (op.power !== undefined) this.uOpPower.value = op.power;
            if (op.blendMode) this.uOpBlendMode = op.blendMode;
            if (op.invert !== undefined) this.uOpInvert = op.invert;
        }
        if (em) {
            if (em.edge !== undefined) this.uEmEdge.value = em.edge;
            if (em.center !== undefined) this.uEmCenter.value = em.center;
            if (em.biasEdge !== undefined) this.uEmBiasEdge.value = em.biasEdge;
            if (em.biasCenter !== undefined) this.uEmBiasCenter.value = em.biasCenter;
            if (em.power !== undefined) this.uEmPower.value = em.power;
            if (em.blendMode) this.uEmBlendMode = em.blendMode;
            if (em.invert !== undefined) this.uEmInvert = em.invert;
        }
        if (options?.color) this.uBaseColor.value.copy(options.color);
        if (options?.opacity !== undefined) this.uOpacity.value = options.opacity;
        if (options?.emissive) this.uEmissive.value.copy(options.emissive);
        if (options?.emissiveIntensity !== undefined)
            this.uEmissiveIntensity.value = options.emissiveIntensity;

        const viewDir = cameraPosition.sub(positionWorld).normalize();
        const worldNormal = normalWorld.normalize();
        const rawDot = viewDir.dot(worldNormal).abs();

        if (debug) {
            const useBc = !!bc;
            const useOp = !useBc && !!op;
            const df = useBc
                ? this.uBcInvert
                    ? float(1).sub(rawDot)
                    : rawDot
                : useOp
                  ? this.uOpInvert
                      ? float(1).sub(rawDot)
                      : rawDot
                  : em
                    ? this.uEmInvert
                        ? float(1).sub(rawDot)
                        : rawDot
                    : rawDot;
            const de = useBc ? this.uBcBiasEdge : useOp ? this.uOpBiasEdge : this.uEmBiasEdge;
            const dc = useBc ? this.uBcBiasCenter : useOp ? this.uOpBiasCenter : this.uEmBiasCenter;
            const dp = useBc ? this.uBcPower : useOp ? this.uOpPower : this.uEmPower;
            this.colorNode = vec4(df.sub(de).div(dc.sub(de).max(1e-6)).clamp(0, 1).pow(dp).xxx, 1);
            return;
        }

        const colorNode = bc
            ? (() => {
                  const f = (this.uBcInvert ? float(1).sub(rawDot) : rawDot)
                      .sub(this.uBcBiasEdge)
                      .div(this.uBcBiasCenter.sub(this.uBcBiasEdge).max(1e-6))
                      .clamp(0, 1)
                      .pow(this.uBcPower);
                  const r = this.uBcEdge.add(this.uBcCenter.sub(this.uBcEdge).mul(f));
                  return this.uBcBlendMode === "add"
                      ? this.uBaseColor.rgb.add(r)
                      : this.uBaseColor.rgb.mul(r);
              })()
            : this.uBaseColor.rgb;

        const emBase = this.uEmissive.rgb.mul(this.uEmissiveIntensity);
        const emNode = em
            ? (() => {
                  const f = (this.uEmInvert ? float(1).sub(rawDot) : rawDot)
                      .sub(this.uEmBiasEdge)
                      .div(this.uEmBiasCenter.sub(this.uEmBiasEdge).max(1e-6))
                      .clamp(0, 1)
                      .pow(this.uEmPower);
                  const r = this.uEmEdge.add(this.uEmCenter.sub(this.uEmEdge).mul(f));
                  return this.uEmBlendMode === "add" ? emBase.add(r) : emBase.mul(r);
              })()
            : emBase;

        const alphaNode = op
            ? (() => {
                  const f = (this.uOpInvert ? float(1).sub(rawDot) : rawDot)
                      .sub(this.uOpBiasEdge)
                      .div(this.uOpBiasCenter.sub(this.uOpBiasEdge).max(1e-6))
                      .clamp(0, 1)
                      .pow(this.uOpPower);
                  const r = this.uOpEdge.add(this.uOpCenter.sub(this.uOpEdge).mul(f));
                  return this.uOpBlendMode === "add" ? this.uOpacity.add(r) : this.uOpacity.mul(r);
              })()
            : this.uOpacity;

        this.colorNode = vec4(colorNode.add(emNode), alphaNode);
    }

    static createDepthPrePassMaterial(): MeshBasicNodeMaterial {
        const mat = new MeshBasicNodeMaterial();
        mat.colorWrite = false;
        mat.depthWrite = true;
        mat.depthTest = true;
        mat.depthFunc = LessEqualDepth;
        mat.colorNode = vec4(1);
        return mat;
    }
}

export type { MeshFresnelMaterialOptions, FresnelConfig, FresnelStop };
export default MeshFresnelMaterial;

//使用示例
// const meshFresnelMaterial = new MeshFresnelMaterial({
//     color: new Color(0, 0, 0),
//     emissive: new Color(0.35, 0.35, 0.35),
//     emissiveIntensity: 1,
//     opacity: 0.5,
//     opacityFresnel: { edge: 0, center: 1, biasCenter: 0.6, invert: true },
//     blending: AdditiveBlending,
// });
