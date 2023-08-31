import React, { useEffect } from "react";

import { BaseView, Column, H1, Row } from "aidos-ui/dist";
import { init } from "@/three/scene";
import { Vector3 } from "three";
import { Multivector } from "@/Multivector";

function randomDirection({
  minX = -1,
  maxX = 1,
  minY = -1,
  maxY = 1,
  minZ = -1,
  maxZ = 1,
}: {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  minZ?: number;
  maxZ?: number;
} = {}) {
  const x = 2 * Math.random() - 1;
  const y = 2 * Math.random() - 1;
  const z = 2 * Math.random() - 1;
  // return new Vector3().randomDirection().normalize();
  return new Vector3(
    x > maxX ? maxX : x < minX ? minX : x,
    y > maxY ? maxY : y < minY ? minY : y,
    z > maxZ ? maxZ : z < minZ ? minZ : z
  ).normalize();
}

export default function Home() {
  useEffect(() => {
    const root = document.getElementById("three");

    if (root == null) {
      throw new Error("Could not find root");
    }

    const api = init(root);

    const vectors: Array<mixed> = [];

    for (let i = 0; i < 10000; i++) {
      vectors.push(
        api.render.vector(
          // randomDirection()
          randomDirection({ minX: 0 })
          // i.toString()
        )
      );
    }

    function inflateRandom() {
      const direction = randomDirection();
      inflate(direction);
    }

    function inflateX() {
      inflate(new Vector3(1, 0, 0));
    }

    function inflateY() {
      inflate(new Vector3(0, 1, 0));
    }

    function inflateZ() {
      inflate(new Vector3(0, 0, 1));
    }

    function mix(plane: Multivector, angle: number) {
      const mixation = Multivector.mixation(plane);

      for (const vector of vectors) {
        const result = mixation.mix(
          Multivector.vector(vector.x(), 1)
            .add(Multivector.vector(vector.y(), 2))
            .add(Multivector.vector(vector.z(), 3)),
          angle
        );
        const x = result.component(1);
        const y = result.component(2);
        const z = result.component(3);
        vector.animate(new Vector3(x, y, z));
      }
    }

    function mixXY(angle: number) {
      const x = Multivector.vector(1, 1);
      const y = Multivector.vector(1, 2);
      mix(x.product(y), angle);
    }

    function inflate(direction) {
      const inflation = Multivector.inflation(
        Multivector.vector(direction.x, 1)
          .add(Multivector.vector(direction.y, 2))
          .add(Multivector.vector(direction.z, 3))
      );

      for (const vector of vectors) {
        const result = inflation.inflate(
          Multivector.vector(vector.x(), 1)
            .add(Multivector.vector(vector.y(), 2))
            .add(Multivector.vector(vector.z(), 3)),
          0.1
        );
        const x = result.component(1);
        const y = result.component(2);
        const z = result.component(3);
        vector.animate(new Vector3(x, y, z));
      }
    }

    // @ts-ignore
    window.inflate = inflate;
    // @ts-ignore
    window.inflateX = inflateX;
    // @ts-ignore
    window.inflateY = inflateY;
    // @ts-ignore
    window.inflateZ = inflateZ;
    // @ts-ignore
    window.mixXY = mixXY;
  }, []);

  return (
    <Column jsStyle={{ height: "100%" }} padding="medium">
      <H1>MultivectorJS</H1>
      <BaseView grow relative id="three" />
    </Column>
  );
}
