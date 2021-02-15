import { ViewChild, ElementRef, Component, AfterViewInit, HostListener, NgZone } from '@angular/core';
import { Background } from 'src/classes/background';
import { Elf } from 'src/classes/elf';
import { InputDirections } from 'src/classes/inputDirection';
import { Vector2d } from 'src/classes/vector2d';
import * as nipplejs from 'nipplejs';
import { AssetManager } from 'src/classes/assetManager';
import { Weapon, WeaponType } from 'src/classes/weapon';
import { RefillStation } from 'src/classes/refillStation';
import { ProjectileType } from 'src/classes/projectile';
import { GridManager } from 'src/classes/GridManager';
import { TrackableObject, TrackableObjectType } from 'src/classes/TrackableObject';
import { GameStateManager } from 'src/services/GameStateManager';
import { ElfHealthState } from 'src/models/ElfHealthState';
import { ImageRef } from 'src/models/ImageRef';

const ELF_SPAWN_INTERVAL: number = 2500;
const REFILL_SPAWN_INTERVAL: number = 15000;
const SPREADING_INTERVAL: number = 1000;

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.css']
})

export class GameCanvasComponent implements AfterViewInit {

  constructor(ngZone: NgZone, gameStateManager: GameStateManager) {
    this.assetManager = new AssetManager(() => {this.spawnElf()});
    this.ngZone = ngZone;
    this.gameStateManager = gameStateManager;
  }
  
  @ViewChild('myCanvas')
  myCanvas?: ElementRef<HTMLCanvasElement>; 
  context?: CanvasRenderingContext2D;
  background?: Background;
  elves: Elf[] = [];
  mainElf: Elf;
  refillStations: RefillStation[] = [];
  deltaTime: number = 0.1;

  assetManager: AssetManager;
  gridManager: GridManager;
  gameStateManager: GameStateManager;
  
  pos:Vector2d = new Vector2d();
  walkDir:Vector2d = new Vector2d();
  inputDirection:InputDirections = new InputDirections();
  key:string = "";
  ngZone: NgZone;
  nippleManager;
  regions: [Vector2d,Elf][];

  vacinateGun: Weapon = new Weapon(this, WeaponType.Vacinate);
  isolateGun: Weapon = new Weapon(this, WeaponType.Iscolate);
  exterminateGun: Weapon = new Weapon(this, WeaponType.Exterminate);
  weapons: Weapon[] = [this.vacinateGun, this.isolateGun, this.exterminateGun];
  currentWeapon: Weapon = this.vacinateGun;

  //Game Logic
  timeLastElfSpawned: number = 0;
  timeLastAmmoStationSpawned: number = 0;
  timeDiseaseLastSpread: number = 0;

  connectBackground() {
    if (this.myCanvas != undefined && this.myCanvas != null && this.context != null){
      this.background = new Background(this);
    }
  }
  
  spawnElf() {
    if (this.myCanvas != undefined && this.myCanvas != null && this.context != null && this.mainElf == null){
      this.gridManager = new GridManager(this);
      this.connectBackground();
      this.mainElf = new Elf(this);
      this.elves.push(this.mainElf);
    }
  }

  trySpawnAssets() {
    //Spawn them in the direction they're heading
    let thisTime = new Date().getTime();
    if (this.mainElf == null){
      return;
    }
    if (thisTime- this.timeLastElfSpawned > ELF_SPAWN_INTERVAL){
      let randomSpawnPos = this.gridManager.getRandomSpawnLocation();
      let elfHealthState: ElfHealthState = this.gameStateManager.getNextElfHealthStateToSpawn();
      let elf: Elf = new Elf(this, true, randomSpawnPos, elfHealthState, false);
      this.elves.push(elf);
      this.timeLastElfSpawned = thisTime;
    }
    if (thisTime - this.timeLastAmmoStationSpawned > REFILL_SPAWN_INTERVAL){
      let projectileType:ProjectileType;
      let stationImage: HTMLImageElement;
      switch(Math.ceil(Math.random()*3)){
        case(1):{
          projectileType = ProjectileType.BULLET;
          stationImage = this.assetManager.getImage(ImageRef.BULLET_STATION);
          break;
        }
        case(2):{
          projectileType = ProjectileType.ICECUBE;
          stationImage = this.assetManager.getImage(ImageRef.SNOW_STATION);
          break;
        }
        case(3):{
          projectileType = ProjectileType.SYRINGE;
          stationImage = this.assetManager.getImage(ImageRef.VACINE_STATION);
          break;
        }
      }
      let spawnOffset: Vector2d = this.gridManager.getRandomSpawnLocation();
      this.refillStations.push(new RefillStation(this, projectileType, spawnOffset));
      this.timeLastAmmoStationSpawned = thisTime;
    }
  }

  despawnObject(object: TrackableObject){
    switch (object.type){
      case(TrackableObjectType.Elf):
        this.removeElf(object as Elf);
        break;
      case(TrackableObjectType.RefillStation):
        this.removeStation(object);
        break;
    }
  }

  removeElf(elf: Elf){
    this.gameStateManager.elfRemovedFromScreen(elf);
    this.elves = this.elves.filter(x => x != elf);
  }

  removeStation(refillStation: TrackableObject){
    this.refillStations = this.refillStations.filter(x => x != refillStation);
  }

  ngAfterViewInit(): void {
    console.log("After View Init");
    if (this.myCanvas != undefined && this.myCanvas != null){
      this.setupTouchInputs();
      this.myCanvas.nativeElement.width = window.innerWidth;
      this.myCanvas.nativeElement.height = window.innerHeight;
      let theContext = this.myCanvas.nativeElement.getContext("2d");
      if (theContext != null){
        this.context = theContext;
        this.ngZone.runOutsideAngular(() => this.gameLoop());
      } else {
        console.warn("NO CONTEXT!!");
      }  
    }else{
      console.warn("NO CANVAS!?");
    }
  }

  setupTouchInputs():void{
    this.nippleManager = nipplejs.create({
      zone: document.getElementById('staticNipple'),
      mode: 'static',
      position: {left: '15%', top: '90%'},
      color: 'green'
    });
    this.nippleManager.on('move', (event, nip) => {
      let x = nip.vector.x;
      let y = nip.vector.y;
      this.inputDirection.reset();
      switch (true){
        case (x <= -0.95):
          this.inputDirection.left = true;
          this.inputDirection.sprint = true;
          break;
        case (x < -0.3):
          this.inputDirection.left = true;
          break; 
        case (x >= 0.95):
          this.inputDirection.right = true;
          this.inputDirection.sprint = true;
          break;
        case (x > 0.3):
          this.inputDirection.right = true;
          break;
      }
      switch (true){
        case (y <= -0.95):
          this.inputDirection.sprint = true;
          this.inputDirection.down = true;
          break;
        case (y < -0.3):
          this.inputDirection.down = true;
          break;
        case (y >= 0.95):
          this.inputDirection.up = true;
          this.inputDirection.sprint = true;
          break;
        case (y > 0.3):
          this.inputDirection.up = true;
          break;
      }
    });
    this.nippleManager.on('end', () => {
      this.inputDirection.reset();
    });
  }
  
  clearCanvas() {
    if (this.context && this.myCanvas){
      this.context.setTransform(1,0,0,1,0,0);
      this.context.clearRect(0, 0, this.myCanvas.nativeElement.width, this.myCanvas.nativeElement.height);
    }else{
      console.warn("Unsuccessful clear");
    }
  }
 
  gameLoop() {
    this.trySpawnAssets();
    this.inputDirection.getWalkDirFromInput(this.walkDir);
    if (this.inputDirection.fire){
      console.log(this.currentWeapon, this.vacinateGun, this.isolateGun);
      this.currentWeapon.fire();
    }
    let positionUpdated = this.pos.translate(this.walkDir);
    //if (positionUpdated){
      this.clearCanvas();
      this.gridManager?.clearGrid();
      this.background?.update();
    //}
    for (let elfIndex = 0; elfIndex < this.elves.length; elfIndex++)
    {
      let elf = this.elves[elfIndex];
      elf?.move();//Has crashed before without nullcheck
    }
    // For performance reasons, we will first map to a temp array, sort and map the temp array to the objects array.
    let elvesMap = this.elves.map(function (el, index) {
      return { index : index, value : el.getY() };
    }).sort(function (a, b) {
      return a.value - b.value;
    });

    for (let weaponIndex = 0; weaponIndex < this.weapons.length; weaponIndex++){
      let weapon = this.weapons[weaponIndex];
      weapon.moveBullets();
    }

    // We finaly rebuilt our sorted objects array.
    let elvesSortedByDistance = elvesMap.map((el) =>  {
      return this.elves[el.index];
    });
    for (let refillIndex = 0; refillIndex < this.refillStations.length; refillIndex++){
      let refillStation = this.refillStations[refillIndex];
      refillStation.draw();
    }

    for (let elfIndex = 0; elfIndex < elvesSortedByDistance.length; elfIndex++)
    {
      let elf = elvesSortedByDistance[elfIndex];
      elf.render();
    }
    
    for (let weaponIndex = 0; weaponIndex < this.weapons.length; weaponIndex++){
      let weapon = this.weapons[weaponIndex];
      weapon.drawBullets();
    }
    this.perpetuateDisease()
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  perpetuateDisease(){
    let timeNow = new Date().getTime();
    if (timeNow - this.timeDiseaseLastSpread > SPREADING_INTERVAL){ 
      for (let elfIndex = 0; elfIndex < this.elves.length; elfIndex++)
      {
        let elf = this.elves[elfIndex];
        if (elf.healthState == ElfHealthState.NOT_VACINATED && elf.contactedIllElf){
          console.log("Elf contracting virus")
          //Time to chance it
          if (Math.ceil(Math.random()*100) <= 80){
            //They've caught the bug
            elf.infect();
          }else{
            elf.contactedIllElf = false;
          }
        }
      }
      this.timeDiseaseLastSpread = timeNow;
    }
  }

  fireButtonChange(change: boolean){
    this.inputDirection.fire = change;
  }

  toggleWeapon(){
    let currentWeaponIndex = this.weapons.indexOf(this.currentWeapon);
    this.currentWeapon = this.weapons[(currentWeaponIndex+1)%this.weapons.length];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    switch(event.key.toUpperCase()){
      case 'W': this.inputDirection.up = true; break;
      case 'S': this.inputDirection.down = true; break;
      case 'A': this.inputDirection.left = true; break;
      case 'D': this.inputDirection.right = true; break;
      case 'E': this.inputDirection.fire = true; break;
      case 'Q': this.toggleWeapon(); break;
      case 'ARROWUP': this.inputDirection.up = true; break;
      case 'ARROWDOWN': this.inputDirection.down = true; break;
      case 'ARROWLEFT': this.inputDirection.left = true; break;
      case 'ARROWRIGHT': this.inputDirection.right = true; break;
      case 'SHIFT' : this.inputDirection.sprint = true; break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) { 
    switch(event.key.toUpperCase()){
      case 'W': this.inputDirection.up = false; break;
      case 'S': this.inputDirection.down = false; break;
      case 'A': this.inputDirection.left = false; break;
      case 'D': this.inputDirection.right = false; break;
      case 'E': this.inputDirection.fire = false; break;
      case 'ARROWUP': this.inputDirection.up = false; break;
      case 'ARROWDOWN': this.inputDirection.down = false; break;
      case 'ARROWLEFT': this.inputDirection.left = false; break;
      case 'ARROWRIGHT': this.inputDirection.right = false; break;
      case 'SHIFT' : this.inputDirection.sprint = false; break;
    }
  }
}
