import { Group, Material, Mesh, MeshPhysicalMaterial, Scene } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

interface SavedMaterialState {
    material: Material;
    transparent: boolean;
    depthWrite: boolean;
    transmission: number;
}

const exportGLTF = (saveTarget: Scene | Group | Mesh, baseName?: string) => {
    baseName = baseName ? baseName : `scene${Date.now().toString().slice(-4)}`;

    const exporter = new GLTFExporter();

    const savedStates: SavedMaterialState[] = []; //导出前：保存并重置材质的透明/透射属性

    saveTarget.traverse((obj) => {
        if (!(obj instanceof Mesh)) return;
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of materials) {
            savedStates.push({
                material: mat,
                transparent: mat.transparent,
                depthWrite: mat.depthWrite,
                transmission: mat instanceof MeshPhysicalMaterial ? mat.transmission : 0,
            });
            mat.transparent = false;
            mat.depthWrite = true;
            if (mat instanceof MeshPhysicalMaterial) {
                mat.transmission = 0;
            }
        }
    });

    const restoreMaterials = () => {
        for (const saved of savedStates) {
            saved.material.transparent = saved.transparent;
            saved.material.depthWrite = saved.depthWrite;
            if (saved.material instanceof MeshPhysicalMaterial) {
                saved.material.transmission = saved.transmission;
            }
        }
    };

    exporter.parse(
        saveTarget,
        (gltf) => {
            restoreMaterials();
            let blob: Blob;
            let filename: string;

            if (gltf instanceof ArrayBuffer) {
                blob = new Blob([gltf], { type: "application/octet-stream" });
                filename = `${baseName}.glb`;
            } else {
                const json = JSON.stringify(gltf);
                blob = new Blob([json], { type: "application/json" });
                filename = `${baseName}.gltf`;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },
        (err) => {
            restoreMaterials();
            if (err) console.error(err);
        },
    );
};

export default exportGLTF;
