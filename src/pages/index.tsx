import React, { useEffect, useRef, useState } from "react";

import { BaseView, Button, Column, H1, Row, TextInput } from "aidos-ui/dist";
import { init } from "@/three/scene";
import { PointsMaterial, SRGBColorSpace, TextureLoader, Vector3 } from "three";
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
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  const z = Math.random() * (maxZ - minZ) + minZ;
  return new Vector3(x, y, z).normalize();
}

export default function Home() {
  const [magnitude, setMagnitude] = useState(0.5);

  const operationsRef = useRef({
    twistXY: (angle: number) => {},
    twistXZ: (angle: number) => {},
    twistYZ: (angle: number) => {},
  });
  useEffect(() => {
    const root = document.getElementById("three");

    if (root == null) {
      throw new Error("Could not find root");
    }

    const api = init(root);

    const vectors: Array<any> = [];

    for (let i = 0; i < 10000; i++) {
      vectors.push(
        api.render.vector(
          // randomDirection()
          randomDirection({ minX: 0 })
          // i.toString()
        )
      );
    }

    // const sprite = new TextureLoader().load("disc.png");
    // sprite.colorSpace = SRGBColorSpace;

    // const dotMaterial = new PointsMaterial({
    //   color: 0xff0000,
    //   size: 0.025,
    //   map: sprite,
    //   alphaTest: 0.5,
    //   transparent: true,
    // });

    // for (let i = 0; i < 100; i++) {
    //   vectors.push(
    //     api.render.vector(
    //       // randomDirection()
    //       randomDirection({
    //         minX: -0.4,
    //         maxX: -0.5,
    //         minY: -0.4,
    //         maxY: -0.5,
    //         minZ: -0.5,
    //         maxZ: -0.5,
    //       }),
    //       dotMaterial
    //       // i.toString()
    //     )
    //   );
    // }

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

    function twist(plane: Multivector, angle: number) {
      const torsion = Multivector.torsion(plane);

      for (const vector of vectors) {
        const result = torsion.twist(
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

    function twistXY(angle: number) {
      const x = Multivector.vector(1, 1);
      const y = Multivector.vector(1, 2);
      twist(x.product(y), angle);
    }

    function twistXZ(angle: number) {
      const x = Multivector.vector(1, 1);
      const z = Multivector.vector(1, 3);
      twist(x.product(z), angle);
    }

    function twistYZ(angle: number) {
      const y = Multivector.vector(1, 2);
      const z = Multivector.vector(1, 3);
      twist(y.product(z), angle);
    }

    function inflate(direction: Vector3) {
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

    operationsRef.current.twistXY = twistXY;
    operationsRef.current.twistXZ = twistXZ;
    operationsRef.current.twistYZ = twistYZ;
  }, []);

  return (
    <Column jsStyle={{ height: "100%" }} padding="medium" gap="medium">
      <H1>Elastic encryption</H1>
      <Row gap="medium">
        <TextInput
          placeholder="Magnitude"
          value={magnitude}
          type="number"
          onValueChange={(value) => setMagnitude(parseFloat(value))}
        />
        <Button
          label="Twist XY"
          onClick={() => operationsRef.current.twistXY(magnitude)}
          color="positive"
        />
        <Button
          label="Twist XZ"
          onClick={() => operationsRef.current.twistXZ(magnitude)}
          color="positive"
        />
        <Button
          label="Twist YZ"
          onClick={() => operationsRef.current.twistYZ(magnitude)}
          color="positive"
        />
      </Row>
      <BaseView grow relative id="three" />
    </Column>
  );
}
