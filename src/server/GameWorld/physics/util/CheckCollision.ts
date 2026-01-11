import Vec2 from "@shared/util/Vec2.ts";
import BoxShape from "../shapes/BoxShape.ts";
import type Body from "../Body.ts";
import CircleShape from "../shapes/CircleShape.ts";
import type Shape from "../shapes/Shape.ts";

export class CheckCollisionUtil {
  private constructor() {}

  static checkCircleRotatedBoxCollision(circlePosition: Vec2, circleRadius: number, boxPosition: Vec2, offset: Vec2, boxAngle: number, boxWidth: number, boxHeight: number): boolean {
      const rectPos = new Vec2(-boxWidth / 2, -boxHeight / 2);
      const rectCenter = offset.sub(rectPos).rotateLocal(-boxAngle);
      const rotatedCirclePosition = circlePosition.sub(boxPosition).subLocal(rectCenter)
          .rotateLocal(boxAngle);

      const closestX = Math.max(rectPos.x,
          Math.min(rotatedCirclePosition.x, rectPos.x + boxWidth));
      const closestY = Math.max(rectPos.y,
          Math.min(rotatedCirclePosition.y, rectPos.y + boxHeight));

      const distX = rotatedCirclePosition.x - closestX;
      const distY = rotatedCirclePosition.y - closestY;

      return (distX * distX + distY * distY) <= circleRadius**2;
  }

  static checkBoxBoxCollision(a: Body, shapeA: BoxShape, b: Body, shapeB: BoxShape, ignoreOutFill: boolean = false): boolean {
      const aMin = a.position.add(shapeA.offset);
      const aMax = aMin.add(shapeA.width, shapeA.height);
      const bMin = b.position.add(shapeB.offset);
      const bMax = bMin.add(shapeB.width, shapeB.height);

      if (shapeA.isFillOut && !ignoreOutFill) return bMin.x <= aMin.x || bMax.x >= aMax.x || bMin.y <= aMin.y || bMax.y >= aMax.y;
      else if (shapeB.isFillOut && !ignoreOutFill) return aMin.x <= bMin.x || aMax.x >= bMax.x || aMin.y <= bMin.y || aMax.y >= bMax.y;
      else return aMin.x <= bMax.x && aMax.x >= bMin.x && aMin.y <= bMax.y && aMax.y >= bMin.y;
  }

  static checkCircleCircleCollision(a: Body, shapeA: CircleShape, b: Body, shapeB: CircleShape): boolean {
    const dist = a.position.sub(b.position).length();
    return dist <= shapeA.radius + shapeB.radius;
  }

  static checkCircleBoxCollision(circleBody: Body, circleShape: CircleShape, boxBody: Body, boxShape: BoxShape, includeBoxAngle: boolean = false, ignoreOutFill: boolean = false): boolean {
    /* circleBody.position // Позиция круга
    circleShape.radius // r
    boxBody.position + boxShape.offset; // Позиция левого верхнего угла прямоугольника
    boxShape.angle; // Угол поворота прямоугольника (относительно той точки, к которой прицеплен прямоугольник должен учитываться offset и position)
    boxShape.width; // w
    boxShape.height; // h */
    if ((includeBoxAngle || boxShape.isSensor) && !boxShape.isFillOut && !ignoreOutFill) {
      return this.checkCircleRotatedBoxCollision(
        new Vec2(circleBody.position.x, circleBody.position.y),
        circleShape.radius,
        new Vec2(boxBody.position.x, boxBody.position.y),
        new Vec2(boxShape.offset.x, boxShape.offset.y),
        boxShape.angle,
        boxShape.width,
        boxShape.height
      );
    } else {
      if (boxShape.isFillOut && !ignoreOutFill) {
        return (circleBody.position.x - circleShape.radius < boxBody.position.x + boxShape.offset.x ||
                circleBody.position.x + circleShape.radius > boxBody.position.x + boxShape.offset.x + boxShape.width ||
                circleBody.position.y - circleShape.radius < boxBody.position.y + boxShape.offset.y ||
                circleBody.position.y + circleShape.radius > boxBody.position.y + boxShape.offset.y + boxShape.height);
      } else {
        const closestX = Math.max(boxBody.position.x + boxShape.offset.x,
            Math.min(circleBody.position.x, boxBody.position.x + boxShape.offset.x + boxShape.width));
        const closestY = Math.max(boxBody.position.y + boxShape.offset.y,
            Math.min(circleBody.position.y, boxBody.position.y + boxShape.offset.y + boxShape.height));

        const distX = circleBody.position.x - closestX;
        const distY = circleBody.position.y - closestY;

        return (distX * distX + distY * distY) <= (circleShape.radius**2);
      }
    }
  }
}

export default function CheckCollision(bodyA: Body, shapeA: Shape, bodyB: Body, shapeB: Shape, includeBoxAngle: boolean = false, ignoreOutFill: boolean = false) {
  if (!shapeA || !shapeB) {
    console.error("shapeA || shapeB is undefined");
    return false;
  }

  if      (shapeA instanceof BoxShape && shapeB instanceof BoxShape) return CheckCollisionUtil.checkBoxBoxCollision(bodyA, shapeA, bodyB, shapeB, ignoreOutFill);
  else if (shapeA instanceof CircleShape && shapeB instanceof CircleShape) return CheckCollisionUtil.checkCircleCircleCollision(bodyA, shapeA, bodyB, shapeB);
  else if (shapeA instanceof BoxShape && shapeB instanceof CircleShape) return CheckCollisionUtil.checkCircleBoxCollision(bodyB, shapeB, bodyA, shapeA, includeBoxAngle, ignoreOutFill);
  else if (shapeA instanceof CircleShape && shapeB instanceof BoxShape) return CheckCollisionUtil.checkCircleBoxCollision(bodyA, shapeA, bodyB, shapeB, includeBoxAngle, ignoreOutFill);
  else {
    console.error(`Can't check ${shapeA.constructor.name} + ${shapeB.constructor.name} collision!`);
    return false;
  }
}