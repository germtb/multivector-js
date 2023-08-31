import {
  BufferGeometry,
  Line,
  MeshBasicMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { initCamera } from "./scene";

export function init(root: HTMLElement) {
  const { width, height } = root.getBoundingClientRect();
  const ratio = width / height;

  const scene = new Scene();
  const camera = initCamera({ scene, ratio });
  const controls = new TrackballControls(camera, root);
  const renderer = new WebGLRenderer();

  renderer.setSize(width, height);
  root.appendChild(renderer.domElement);

  const origin = new Vector3(0, 0, 0);
  const x = new Vector3(1, 0, 0);
  const y = new Vector3(0, 1, 0);
  const z = new Vector3(0, 0, 1);
  const axisMaterial = new MeshBasicMaterial({ color: 15658734 });
  const defaultMaterial = new MeshBasicMaterial({ color: 65280 });

  const state = { animate: true, listeners: new Set<() => void>() };

  function animate() {
    if (state.animate) {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      for (const cb of state.listeners) {
        cb();
      }
    }
  }

  animate();

  const vector = (
    v: Vector3,
    material: MeshBasicMaterial = defaultMaterial
  ) => {
    const geometry = new BufferGeometry().setFromPoints([origin, v]);
    const line = new Line(geometry, material);
    scene.add(line);

    return {
      update: (v: Vector3) => {
        geometry.attributes.position.setXYZ(1, v.x, v.y, v.z);
        line.vert;
      },
    };
  };

  vector(x, axisMaterial);
  vector(y, axisMaterial);
  vector(z, axisMaterial);

  return {
    onFrame: (cb: () => void) => {
      state.listeners.add(cb);

      return {
        unsubscribe: () => {
          state.listeners.delete(cb);
        },
      };
    },
    render: {
      vector,
    },
    stop: () => {
      state.animate = false;
    },
    resume: () => {
      state.animate = true;
      animate();
    },
  };
}
