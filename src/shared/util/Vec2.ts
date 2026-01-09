import MathUtil from "@shared/util/MathUtil";

export interface Vec2Like {
    x: number;
    y: number;
}

export default class Vec2 {
    /* private _onChange?: () => void;
    set onChange(cb: () => void) { this._onChange = cb; } */

    public x!: number;
    public y!: number;

    constructor();
    constructor(vec: Vec2Like);
    constructor(x: number, y: number);
    constructor(x: number | Vec2Like | null | undefined = 0, y: number = 0) {
        if (!(this instanceof Vec2)) return new Vec2(x as any, y);
        else {
            this.x = typeof x == 'number' ? x : x !== null ? x.x : 0;
            this.y = typeof x == 'number' ? y : x !== null ? x.y : 0;
        }
    }

    add(vec: Vec2Like): Vec2;
    add(x: number, y: number): Vec2;
    add(x: number | Vec2Like, y?: number) {
        return new Vec2(this.x + (typeof x == 'number' ? (x as number) : (x as Vec2Like).x), this.y + (typeof x == 'number' ? (y as number)! : (x as Vec2Like).y));
    }
    addLocal(vec: Vec2Like): this;
    addLocal(x: number, y: number): this;
    addLocal(x: number | Vec2Like, y?: number) {
        this.x += typeof x == 'number' ? x : x.x;
        this.y += typeof x == 'number' ? y! : x.y;
        return this;
    }

    mul(s: number) {
        return new Vec2(this.x * s, this.y * s);
    }
    mulLocal(s: number): this {
        this.x *= s;
        this.y *= s;
        return this;
    }

    neg() {
        return this.mul(-1);
    }
    negLocal() {
        return this.mulLocal(-1);
    }

    sub(vec: Vec2Like): Vec2;
    sub(x: number, y: number): Vec2;
    sub(x: number | Vec2Like, y?: number) {
        return new Vec2(
            this.x - (typeof x == 'number' ? x : x.x),
            this.y - (typeof x == 'number' ? y! : x.y)
        );
    }
    subLocal(x: Vec2Like): this;
    subLocal(x: number, y: number): this;
    subLocal(x: number | Vec2Like, y?: number) {
        this.x -= typeof x === "number" ? x : x.x;
        this.y -= typeof x === "number" ? y! : x.y;
        return this;
    }

    interp(v: Vec2, alpha: number): Vec2;
    interp(x: number, y: number, alpha: number): Vec2;
    interp(xOrVec: number | Vec2, yOrAlpha: number, alpha?: number) {
        if (xOrVec instanceof Vec2 && typeof yOrAlpha === "number") {
            alpha = yOrAlpha;
            yOrAlpha = xOrVec.y;
            xOrVec = xOrVec.x;
        } else if (!(typeof xOrVec === "number" && typeof yOrAlpha === "number" && typeof alpha === "number")) {
            throw new Error(`Invalid arguments for interp`);
        }

        return new Vec2(
            this.x + (xOrVec as number - this.x) * alpha!,
            this.y + (yOrAlpha - this.y) * alpha!
        );
    }
    interpLocal(v: Vec2, alpha: number): this;
    interpLocal(x: number, y: number, alpha: number): this;
    interpLocal(xOrVec: number | Vec2, yOrAlpha: number, alpha?: number) {
        if (xOrVec instanceof Vec2 && typeof yOrAlpha === "number") {
            alpha = yOrAlpha;
            yOrAlpha = xOrVec.y;
            xOrVec = xOrVec.x;
        } else if (!(typeof xOrVec === "number" && typeof yOrAlpha === "number" && typeof alpha === "number")) {
            throw new Error(`Invalid arguments for interp`, {});
        }

        this.x += (xOrVec as number - this.x) * alpha!;
        this.y += (yOrAlpha - this.y) * alpha!;

        return this;
    }

    floor() {
        return new Vec2(Math.floor(this.x), Math.floor(this.y));
    }
    floorLocal() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    
    angle(to: Vec2Like = { x: 0, y: 0 }) { return Math.atan2(to.y - this.y, to.x - this.x); }
    absAngle(to: Vec2Like = { x: 0, y: 0 }) { const angle = Math.atan2(to.y - this.y, to.x - this.x); return angle < 0 ? angle + Math.PI * 2 : angle; }
    distance(to: Vec2Like) { return Math.sqrt((this.x - to.x)**2 + (this.y - to.y)**2); }
    length() { return Math.sqrt(this.x**2 + this.y**2); }
    dot(v: Vec2) { return this.x * v.x + this.y * v.y; }

    set(vec: Vec2Like): this;
    set(x: number, y: number): this;
    set(x: number | Vec2Like, y?: number) {
        this.x = typeof x == 'number' ? x : x.x;
        this.y = typeof x == 'number' ? y! : x.y;
        return this;
    }

    normalize() {
        const length = this.length();
        if (length !== 0) this.mulLocal(1 / length);
        return length;
    }
    normalized() {
        const length = this.length();
        if (length !== 0) this.mulLocal(1 / length);
        return this;
    }

    toArray() {
        return [this.x, this.y];
    }

    toObject(object: Object = {}) {
        return { ...object, x: this.x, y: this.y };
    }

    clone() { return new Vec2(this); }

    eq(vec: Vec2Like): boolean;
    eq(x: number, y: number): boolean;
    eq(x: number | Vec2Like, y?: number) {
        return this.x == (typeof x == 'number' ? x : x.x) && this.y == (typeof x == 'number' ? y! : x.y);
    }

    rotateLocal(angle: number): Vec2 {
        const cosTheta = Math.cos(-angle);
        const sinTheta = Math.sin(-angle);

        this.x = this.x * cosTheta - this.y * sinTheta;
        this.y = this.x * sinTheta + this.y * cosTheta;

        return this;
    }
    rotate(angle: number): Vec2 {
        const cosA = Math.cos(-angle);
        const sinA = Math.sin(-angle);
        return new Vec2(this.x * cosA - this.y * sinA, this.x * sinA + this.y * cosA);
    }

    projectOnto(axis: Vec2): number {
        return this.dot(axis) / axis.dot(axis) * axis.dot(axis) // Проекция на ось
    }

    perpendicular(): Vec2 {
        return new Vec2(-this.y, this.x);
    }

    doPerpendicular(): Vec2 {
        const temp = this.x;
        this.x = -this.y;
        this.y = temp;
        return this;
    }

    clamp(min: Vec2, max: Vec2): Vec2 {
        return new Vec2(
            MathUtil.clamp(this.x, min.x, max.x),
            MathUtil.clamp(this.y, min.y, max.y)
        );
    }
    clampLocal(min: Vec2, max: Vec2): Vec2 {
        this.x = MathUtil.clamp(this.x, min.x, max.x);
        this.y = MathUtil.clamp(this.y, min.y, max.y);
        return this;
    }

    static fromAngle(angle: number) {
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }
}
