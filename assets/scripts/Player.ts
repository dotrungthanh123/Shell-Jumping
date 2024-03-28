import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3, CCFloat, sp, Collider2D, Contact2DType, PhysicsSystem2D, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

  @property(CCFloat) topSpeed: number
  @property(CCFloat) jumpForce: number
  @property(CCFloat) acceleration: number
  @property(CCFloat) friction: number
  @property(CCFloat) gravity: number

  private curPos: Vec3
  private direction: Vec3
  private speed: number
  private accelerating: boolean
  private verSpeed: number
  private onGround: boolean

  onEnable() {
    input.on(Input.EventType.KEY_PRESSING, this.getKeyPress, this)
    input.on(Input.EventType.KEY_DOWN, this.getKeyPress, this)
    input.on(Input.EventType.KEY_DOWN, this.getKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.getKeyUp, this)
  }

  start() {
    this.curPos = this.node.position
    this.direction = new Vec3()
    this.speed = 0
    this.accelerating = false
    this.verSpeed = 0

    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // Registering global contact callback functions
    if (PhysicsSystem2D.instance) {
      PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  update(deltaTime: number) {
    // let preSpeedSign = Math.sign(this.speed)
    // this.speed -= this.friction * deltaTime * Math.sign(this.speed) * (this.accelerating ? 0 : 1)
    // if (preSpeedSign * Math.sign(this.speed) < 0) this.speed = 0

    this.verSpeed -= this.gravity * deltaTime * (this.onGround ? 0 : 1)

    Vec3.multiplyScalar(this.direction, Vec3.RIGHT, this.speed * deltaTime)
    Vec3.scaleAndAdd(this.direction, this.direction, Vec3.UP, this.verSpeed * deltaTime)

    Vec3.add(this.curPos, this.curPos, this.direction)

    this.node.setPosition(this.curPos)
  }

  onDisable() {
    input.off(Input.EventType.KEY_PRESSING, this.getKeyPress, this)
    input.off(Input.EventType.KEY_DOWN, this.getKeyPress, this)
    input.off(Input.EventType.KEY_UP, this.getKeyUp, this)
  }

  getKeyPress(event: EventKeyboard) {
    let increasedSpeed
    switch (event.keyCode) {
      case KeyCode.ARROW_RIGHT:
        // this.speed = Math.abs(this.speed)
        // increasedSpeed = this.speed + this.acceleration
        // this.speed = increasedSpeed > this.topSpeed ? this.topSpeed : increasedSpeed

        // this.accelerating = true

        this.speed = this.topSpeed
        break
      case KeyCode.ARROW_LEFT:
        // this.speed = this.speed * -Math.sign(this.speed)
        // increasedSpeed = this.speed - this.acceleration
        // this.speed = increasedSpeed < -this.topSpeed ? -this.topSpeed : increasedSpeed

        // this.accelerating = true

        this.speed = -this.topSpeed
        break
    }
  }

  getKeyDown(event: EventKeyboard) {
    if (event.keyCode == KeyCode.SPACE) {
      if (this.onGround) this.verSpeed = this.jumpForce
    }
  }

  getKeyUp(event: EventKeyboard) {
    if (event.keyCode == KeyCode.ARROW_LEFT || event.keyCode == KeyCode.ARROW_RIGHT) {
      // this.accelerating = false

      this.speed = 0
    }
  }

  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    this.verSpeed = 0
    this.onGround = true
  }

  onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    this.onGround = false
  }
}


