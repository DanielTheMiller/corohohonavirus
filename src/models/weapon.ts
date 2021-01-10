import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { Projectile, ProjectileType } from "./projectile";
import { Vector2d } from "./vector2d";

const MAX_AMMO: number = 50;
const TIME_BETWEEN_SHOTS: number = 200;

export class Weapon {
    gameCanvas: GameCanvasComponent;
    lastFiredTime: number;
    ammo: number = MAX_AMMO;
    weaponType: WeaponType;
    projectileType: ProjectileType;
    firedBullets: Projectile[] = [];

    constructor(gameCanvas: GameCanvasComponent, type: WeaponType){
        this.gameCanvas = gameCanvas;
        this.weaponType = type;
        this.lastFiredTime = 0;
        switch(type){
            case(WeaponType.Vacinate):
                this.projectileType = ProjectileType.SYRINGE;
                break;
            case (WeaponType.Iscolate):
                this.projectileType = ProjectileType.ICECUBE;
                break;
            case (WeaponType.Exterminate):
                this.projectileType = ProjectileType.BULLET;
                break;
        }
    }

    //Move bullets, check for collisions
    moveBullets(): void{
        if (this.firedBullets.length > 0){
            for (let bulletIndex = 0; bulletIndex < this.firedBullets.length; bulletIndex++){
                let bullet: Projectile = this.firedBullets[bulletIndex];
                bullet.moveAndAct();
            }
        }
    }

    drawBullets(): void{
        if (this.firedBullets.length > 0){
            for (let bulletIndex = 0; bulletIndex < this.firedBullets.length; bulletIndex++){
                let bullet: Projectile = this.firedBullets[bulletIndex];
                bullet.draw();
            }
        }
    }

    removeBullet(projectile: Projectile): void{
        this.firedBullets = this.firedBullets.filter(x => x != projectile);
    }

    fire(): void {
        console.log("WEAPON FIRE!!")
        //Start shootin'
        if (this.gameCanvas.inputDirection.fire && this.ammo > 0 && new Date().getTime() - this.lastFiredTime > TIME_BETWEEN_SHOTS){//If they are firing, and if time has passed, and if they have ammo
            this.firedBullets.push(new Projectile(this, this.projectileType));
            this.lastFiredTime = new Date().getTime();
            this.ammo = this.ammo - 1;
        }
    }
}

export enum WeaponType {
    Vacinate,
    Iscolate,
    Exterminate
}