import Vec2 from "@shared/util/Vec2.ts";
import type Body from "../Body.ts";
import BoxShape from "../shapes/BoxShape.ts";
import MathUtil from "@shared/util/MathUtil.ts";
import CircleShape from "../shapes/CircleShape.ts";
import type Shape from "../shapes/Shape.ts";

export class ResolveCollisionUtil {
        // DEFAULT VARIANT
        static resolveBoxBoxCollision(bodyA: Body, shapeA: BoxShape, bodyB: Body, shapeB: BoxShape): Vec2 | null {
          // Outfill
          if (shapeA.isFillOut) return this.resolveBoxWithOutFillBoxCollision(bodyB, shapeB, bodyA, shapeA);
          else if (shapeB.isFillOut) return this.resolveBoxWithOutFillBoxCollision(bodyA, shapeA, bodyB, shapeB);

          const aMin = bodyA.position.add(shapeA.offset);
          const aMax = aMin.add(shapeA.width, shapeA.height);
          const bMin = bodyB.position.add(shapeB.offset);
          const bMax = bMin.add(shapeB.width, shapeB.height);

          const overlapX = Math.min(aMax.x, bMax.x) - Math.max(aMin.x, bMin.x);
          const overlapY = Math.min(aMax.y, bMax.y) - Math.max(aMin.y, bMin.y);

          if (overlapX > 0 && overlapY > 0) {
            const correction = new Vec2();
            let normal: Vec2;

            if (overlapX < overlapY) {
              const direction = aMin.x < bMin.x ? 1 : -1;
              correction.set(overlapX * direction, 0);
              normal = new Vec2(direction, 0);
            } else {
              const direction = aMin.y < bMin.y ? 1 : -1;
              correction.set(0, overlapY * direction);
              normal = new Vec2(0, direction);
            }

            if (!bodyA.isStatic && !bodyB.isStatic) {
                bodyA.position.subLocal(correction.x / 2, correction.y / 2);
                bodyB.position.addLocal(correction.x / 2, correction.y / 2);
            } else if (!bodyA.isStatic) bodyA.position.subLocal(correction.x, correction.y);
            else if (!bodyB.isStatic) bodyB.position.subLocal(correction.x, correction.y);

            return normal;
          }

          return null;
        }
        
        private static resolveBoxWithOutFillBoxCollision(box: Body, boxShape: BoxShape, outFillBox: Body, outFillBoxShape: BoxShape): Vec2 | null {
          const bMinX = outFillBox.position.x + outFillBoxShape.offset.x;
          const bMinY = outFillBox.position.y + outFillBoxShape.offset.y;

          const oldPos = box.position.clone();
          box.position.set(
            MathUtil.clamp(box.position.x,
              bMinX + boxShape.width / 2,
              (bMinX + outFillBoxShape.width) - boxShape.width / 2
            ),
            MathUtil.clamp(box.position.y,
              bMinY + boxShape.height / 2,
              (bMinY + outFillBoxShape.height) - boxShape.height / 2
            )
          );

          const normal = box.position.sub(oldPos).normalized();

          return normal.length() > 0 ? normal : null;
        }
        
        static resolveCircleCircleCollision(bodyA: Body, shapeA: CircleShape, bodyB: Body, shapeB: CircleShape): Vec2 | null {
          const displacement = bodyB.position.sub(bodyA.position);
          const distance = displacement.normalize();
          if (distance === 0) return null;

          const overlap = shapeA.radius + shapeB.radius - distance;
          if (overlap > 0) {
            const moveFactor = bodyB.isStatic ? 1 : 2;
            displacement.mulLocal(overlap / moveFactor);

            if (!bodyA.isStatic) bodyA.position.subLocal(displacement);
            if (!bodyB.isStatic) bodyB.position.addLocal(displacement);

            return displacement.normalized();
          }

          return null;
        }

        static resolveBoxCircleCollision(boxBody: Body, boxShape: BoxShape, circleBody: Body, circleShape: CircleShape): Vec2 | null {
          const boxMin = boxBody.position.add(boxShape.offset);
          const boxMax = boxMin.add(boxShape.width, boxShape.height);

          if (boxShape.isFillOut) {
            const clampedX = MathUtil.clamp(circleBody.position.x,
              Math.min(boxMin.x + circleShape.radius, boxMax.x - circleShape.radius),
              Math.max(boxMin.x + circleShape.radius, boxMax.x - circleShape.radius)
            );
            const clampedY = MathUtil.clamp(circleBody.position.y,
              Math.min(boxMin.y + circleShape.radius, boxMax.y - circleShape.radius),
              Math.max(boxMin.y + circleShape.radius, boxMax.y - circleShape.radius)
            );

            const displacement = new Vec2(clampedX, clampedY).subLocal(circleBody.position);
            const normal = displacement.length() > 0 ? displacement.normalized() : null;

            circleBody.position.set(clampedX, clampedY);
            return normal;
          }

          const nearestPoint = new Vec2(
            MathUtil.clamp(circleBody.position.x, boxMin.x, boxMax.x),
            MathUtil.clamp(circleBody.position.y, boxMin.y, boxMax.y)
          );

          let displacement = circleBody.position.sub(nearestPoint);
          const distance = displacement.length();

          if (distance > 0 && distance < circleShape.radius) {
            displacement = displacement.normalized().mulLocal(circleShape.radius - distance);
            if (!boxBody.isStatic) {
              displacement.mulLocal(0.5);
              boxBody.position.subLocal(displacement);
              circleBody.position.addLocal(displacement);
            } else {
              circleBody.position.addLocal(displacement);
            }

            return displacement.normalized();
          }

          return null;
        }
}

export default function ResolveCollision(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape) {
  if (!shapeA || !shapeB) {
    console.error("shapeA || shapeB is undefined");
    return;
  }

  if      (shapeA instanceof BoxShape && shapeB instanceof BoxShape) ResolveCollisionUtil.resolveBoxBoxCollision(bodyA, shapeA, bodyB, shapeB);
  else if (shapeA instanceof CircleShape && shapeB instanceof CircleShape) ResolveCollisionUtil.resolveCircleCircleCollision(bodyA, shapeA, bodyB, shapeB);
  else if (shapeA instanceof BoxShape && shapeB instanceof CircleShape) ResolveCollisionUtil.resolveBoxCircleCollision(bodyA, shapeA, bodyB, shapeB);
  else if (shapeA instanceof CircleShape && shapeB instanceof BoxShape) ResolveCollisionUtil.resolveBoxCircleCollision(bodyB, shapeB, bodyA, shapeA);
  else {
    console.error(`Can't resolve ${shapeA.constructor.name} + ${shapeB.constructor.name} collision!`);
    return;
  }
}