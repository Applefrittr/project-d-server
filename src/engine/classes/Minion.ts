import settings from "../settings.json";
import roundHundrethPercision from "../utils/roundHundrethPercision";
import handleObjectCollision from "../utils/handleObjectCollision";
import vectorSteerToTarget from "../utils/vectorSteerToTarget";
import GameObject from "./GameObject";
import Vector from "./Vector";
import getDistanceBetweenVectors from "../utils/getDistanceBetweenVectors";
import vectorIntersectsObject from "../utils/vectorIntersectsObject";

export default class Minion extends GameObject {
  team: string | null = null;
  argoRange = 500;
  lookAhead = new Vector(0, 0);
  lookAhead2x = new Vector(0, 0);
  radius = settings["minion-radius"];
  prevAttackTime: number = 0;
  visionConeWidth: number = Math.PI / 4;
  visConeRight: number = 0;
  visConeLeft: number = 0;
  immediateCollisionThreat: GameObject | null = null;

  // assigns Minion to a team and positions Vectors on canvas -> function is invoked when spawnWave is called during main Game loop
  assignTeam(team: "red" | "blue") {
    this.team = team;
    if (team === "blue") {
      this.position.update(
        settings["arena-width"] / 2,
        settings["tower-radius"] + 50
      );
    } else {
      this.position.update(
        settings["arena-width"] / 2,
        settings["arena-height"] - settings["tower-radius"] - 50
      );
    }
  }

  // iterates through the Set of opposing team GameObjects to detect potential targets and assigns the closest one to the Minion as the target
  // skips if Minion is inCombat
  detectTarget(oppTeam: Set<GameObject>) {
    if (this.inCombat) return;
    let currTarget: GameObject | null = null,
      targetDistance: number | null = Infinity;

    for (const minion of oppTeam) {
      const currDistance = getDistanceBetweenVectors(
        this.position,
        minion.position
      );
      if (currDistance < this.argoRange && currDistance < targetDistance) {
        currTarget = minion;
        targetDistance = currDistance;
      }
    }

    // Set closest target if one exists in argo range of Minion, otherwise set opposing Fortress as target
    if (currTarget) {
      this.target = currTarget;
    } else {
      this.target = [...oppTeam][0];
    }
  }

  // Path adjustments to Minions target vector as it apporaches/collides with other objects on the same team
  adjustPathingToTarget(team: Set<GameObject>) {
    // return if Minion is currently in Combat -> we don't want to adjust a Minion's pathing if it is currently fighting an enemy
    if (this.inCombat) return;

    let closestCollisionThreat: GameObject | null = null;
    let closestCollisionThreatDist = Infinity;

    // loop through Set of team Game Objects
    // iterate over the team in REVERSE ORDER OF INSERTION to ensure new Team Objects dont push Minion into older team Objects
    for (const obj of Array.from(team).reverse()) {
      // skip collision detection for the Minion against itself
      if (this.id === obj.id) continue;

      // calc distance between Minion and curr Game Object
      const dist = getDistanceBetweenVectors(this.position, obj.position);

      // call handleTeamCollision if Minion collides another team Game Object
      if (dist < this.radius * 2) {
        handleObjectCollision(this, obj);
        continue;
      }

      // check to see if Minion's Look Ahead vectors intersect w/ curr Game Object
      // if so, set the closest one to the Minions immediateCollisonTreat prop
      if (
        vectorIntersectsObject(
          obj,
          this.lookAhead,
          this.lookAhead2x,
          this.position
        )
      ) {
        if (
          !closestCollisionThreat ||
          (dist < closestCollisionThreatDist && closestCollisionThreat)
        ) {
          closestCollisionThreat = obj;
          closestCollisionThreatDist = dist;
        }
      }
    }
    this.immediateCollisionThreat = closestCollisionThreat;
  }

  // Minion avoids colliding with another team GameObject that is closest.  The avoidance vector is added to Minion's current vector
  // to attempt to move Minion around collsion threat.  Subtly changes vector based on a scaler as to provide a smooth
  // direction change
  collisionAvoidance() {
    if (this.immediateCollisionThreat) {
      const avoidX = this.immediateCollisionThreat.position.x;
      const avoidY = this.immediateCollisionThreat.position.y;

      const avoidanceVector = new Vector(
        this.lookAhead.x - avoidX,
        this.lookAhead.y - avoidY
      )
        .normalize()
        .scaler(settings["avoidance-force"]);

      this.velocity.update(
        roundHundrethPercision(this.velocity.x + avoidanceVector.x),
        roundHundrethPercision(this.velocity.y + avoidanceVector.y)
      );
    }
  }

  // attack logic, subtract hps from target based on interval while in combat (collided with target)
  attack(currMs: number) {
    if (this.target) {
      if (currMs - this.prevAttackTime < settings["minion-attack-cooldown"])
        return;
      this.prevAttackTime = currMs;
      this.target.hitPoints -= 10;
    }
  }

  // reset Minion back to Game Minion pool once hitpoints reach zero
  destroy(team: Set<GameObject>) {
    team.delete(this);
    this.team = null;
    super.reset();
    return;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (typeof this.team === "string") {
      // draw Minion body
      ctx.beginPath();
      ctx.fillStyle = this.team;
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      // TEMP - Display hitpoints, ID, and Vector direction
      ctx.fillStyle = "black";
      ctx.font = "16px serif";
      ctx.fillText(this.hitPoints.toString(), this.position.x, this.position.y);
      ctx.fillText(
        JSON.stringify(this.velocity),
        this.position.x,
        this.position.y + 16
      );

      ctx.beginPath();
      ctx.strokeStyle = "black";
      // ctx.moveTo(this.position.x, this.position.y);
      // ctx.lineTo(this.lookAhead.x, this.lookAhead.y);
      ctx.arc(this.lookAhead.x, this.lookAhead.y, 5, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "orange";
      // ctx.moveTo(this.position.x, this.position.y);
      // ctx.lineTo(this.lookAhead2x.x, this.lookAhead2x.y);
      ctx.arc(this.lookAhead2x.x, this.lookAhead2x.y, 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  update(ctx: CanvasRenderingContext2D | null) {
    // update direction vectors, position coordinates and draw to canvas
    if (ctx && typeof this.team === "string" && this.target) {
      // detect if Minion is colliding with it's target; if so, set directional vectors to 0, otherwise call vectorSteerToTarget(this)
      if (
        getDistanceBetweenVectors(this.position, this.target.position) <=
        this.radius * 2
      ) {
        this.velocity.update(0, 0);
        handleObjectCollision(this, this.target);
        this.inCombat = true;
      }
      // if not collided, update position by current velocity, accounting for steering and avoidance vectors
      else {
        this.inCombat = false;
        // steer vector towards current Target
        vectorSteerToTarget(this);

        // avoid immediate collison threats -> team GameObjects
        if (this.immediateCollisionThreat) {
          this.collisionAvoidance();
        }

        this.position.update(
          roundHundrethPercision(this.position.x + this.velocity.x),
          roundHundrethPercision(this.position.y + this.velocity.y)
        );

        // update lookahead vectors -> used to determine collision avoidance
        this.lookAhead.update(
          this.position.x +
            this.velocity.x * (settings["minion-look-ahead-max"] / 2),
          this.position.y +
            this.velocity.y * (settings["minion-look-ahead-max"] / 2)
        );

        this.lookAhead2x.update(
          this.position.x + this.velocity.x * settings["minion-look-ahead-max"],
          this.position.y + this.velocity.y * settings["minion-look-ahead-max"]
        );
      }

      this.draw(ctx);
    }
  }
}
