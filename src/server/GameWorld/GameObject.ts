import type Body from "./physics/Body.ts";

export default abstract class GameObject {
  protected _body: Body;
  get body() { return this._body; }

  constructor(body: Body) {
    this._body = body;
  }
}