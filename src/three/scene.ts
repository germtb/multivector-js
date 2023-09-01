import { createElement } from "react";
import {
  AxesHelper,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";

// @ts-ignore
import { TrackballControls } from "three/addons/controls/TrackballControls";

function initCamera({
  scene,
  ratio,
}: {
  scene: Scene;
  ratio: number;
}): PerspectiveCamera {
  const camera = new PerspectiveCamera(75, ratio, 0.1, 100);

  camera.position.set(0.5, 0.5, 1.5); // all components equal
  camera.lookAt(scene.position);

  return camera;
}

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
  const defaultMaterial = new MeshBasicMaterial({ color: 0x00ff00 });

  const axesHelper = new AxesHelper(1);
  scene.add(axesHelper);

  const sphereGeometry = new SphereGeometry(1, 32, 32);
  // const sphereMaterial = new MeshBasicMaterial({
  //   color: 0xeeeeee,
  // });
  // sphereMaterial.transparent = true;
  // sphereMaterial.opacity = 0.1;
  // const sphere = new Mesh(sphereGeometry, sphereMaterial);
  // scene.add(sphere);

  const geo = new EdgesGeometry(sphereGeometry); // or WireframeGeometry
  const wireframeMaterial = new LineBasicMaterial({ color: 0xffffff });
  wireframeMaterial.transparent = true;
  wireframeMaterial.opacity = 0.2;
  const wireframe = new LineSegments(geo, wireframeMaterial);
  scene.add(wireframe);

  const sceneState: {
    animate: boolean;
    listeners: Set<() => void>;
    labels: Array<{ update: () => void }>;
  } = {
    animate: true,
    listeners: new Set(),
    labels: [],
  };

  function animate() {
    if (sceneState.animate) {
      controls.update();
      for (const label of sceneState.labels) {
        label.update();
      }
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      for (const cb of sceneState.listeners) {
        cb();
      }
    }
  }

  animate();

  const sprite = new TextureLoader().load("disc.png");
  sprite.colorSpace = SRGBColorSpace;

  const dotMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    map: sprite,
    alphaTest: 0.5,
    transparent: true,
  });

  const vector = (v: Vector3, material?: PointsMaterial, label?: string) => {
    const state = {
      v,
    };
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute([v.x, v.y, v.z], 3)
    );
    const dot = new Points(geometry, material ?? dotMaterial);
    scene.add(dot);

    // const geometry = new BufferGeometry().setFromPoints([origin, v]);
    // const line = new Line(geometry, material);
    // scene.add(line);

    if (label != null) {
      const element = document.createElement("div");
      const text = document.createTextNode(label);
      element.appendChild(text);
      root.appendChild(element);
      element.style.position = "absolute";
      element.style.width = "100px";
      element.style.height = "100px";
      element.style.color = "white";

      sceneState.labels.push({
        update: () => {
          const deviceCoordinates = state.v.clone().project(camera);
          element.style.left = `${((deviceCoordinates.x + 1) / 2) * width}px`;
          element.style.top = `${(-(deviceCoordinates.y - 1) / 2) * height}px`;
        },
      });
    }

    return {
      animate: (end: Vector3, duration: number = 100) => {
        let localTime = 0;

        onFrame(
          () => {
            localTime++;

            const interpolation = state.v.lerp(end, localTime / duration);
            geometry.attributes.position.setXYZ(
              0,
              interpolation.x,
              interpolation.y,
              interpolation.z
            );

            geometry.attributes.position.needsUpdate = true;
          },
          100,
          () => {
            state.v = end;
          }
        );
      },
      x: () => state.v.x,
      y: () => state.v.y,
      z: () => state.v.z,
    };
  };

  function onFrame(cb: () => void, duration?: number, onFinish?: () => void) {
    const callback = () => {
      if (duration != null) {
        duration--;

        if (duration <= 0) {
          sceneState.listeners.delete(callback);
          onFinish?.();
        }
      }

      cb();
    };

    sceneState.listeners.add(callback);

    return {
      unsubscribe: () => {
        sceneState.listeners.delete(callback);
      },
    };
  }

  return {
    onFrame,
    render: {
      vector,
    },
    stop: () => {
      sceneState.animate = false;
    },
    resume: () => {
      sceneState.animate = true;
      animate();
    },
  };
}
