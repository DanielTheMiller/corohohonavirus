import { Elf } from "src/classes/elf";
import { ElfHealthState } from "src/models/ElfHealthState";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameStateManager {

    private _alive: number = 1000;
    private _dead: number = 0;
    private _notVacinated: number = 800;
    private _infected: number = 200;
    private _vacinated: number = 0;
    private _recovered: number = 0;

    private _onScreenAlive: number = 0;
    private _onScreenNotVacinated: number = 0;
    private _onScreenInfected: number = 0;
    private _onScreenVacinated: number = 0;
    private _onScreenRecovered: number = 0;
    private _onScreenDead: number = 0;

    constructor() {

    }

    elfRemovedFromScreen(elf: Elf){
        this._onScreenVacinated -= elf.healthState == ElfHealthState.VACINATED ? 1 : 0;
        this._onScreenNotVacinated -= elf.healthState == ElfHealthState.NOT_VACINATED ? 1 : 0;
        this._onScreenInfected -= elf.healthState == ElfHealthState.INFECTED ? 1 : 0;
        this._onScreenRecovered -= elf.healthState == ElfHealthState.RECOVERED ? 1 : 0;
        this._onScreenDead -= elf.healthState == ElfHealthState.DEAD ? 1 : 0;
        this._onScreenAlive -= elf.healthState != ElfHealthState.DEAD ? 1 : 0;
    }

    public getNextElfHealthStateToSpawn(): ElfHealthState {
        let aliveOffscreen = this._alive-this._onScreenAlive;
        let notVacinatedOffscreen = this._notVacinated - this._onScreenNotVacinated;
        let infectedOffscreen = this._infected - this._onScreenInfected;
        let vacinatedOffscreen = this._vacinated - this._onScreenVacinated;
        let recoveredOffscreen = this._recovered - this._onScreenRecovered;
        let randomIndex = Math.ceil(Math.random()*aliveOffscreen);
        switch(true){
            case(randomIndex <= notVacinatedOffscreen):{          
                this._onScreenNotVacinated++;
                return ElfHealthState.NOT_VACINATED;
            }
            case(randomIndex-notVacinatedOffscreen <= infectedOffscreen):{
                //SPAWN ILL
                this._onScreenInfected++;
                return ElfHealthState.INFECTED;
            }
            case (randomIndex-notVacinatedOffscreen-infectedOffscreen <= vacinatedOffscreen):{
                //SPAWN IMUNISED
                this._onScreenVacinated++;
                return ElfHealthState.VACINATED;
            }
            case (randomIndex-notVacinatedOffscreen-infectedOffscreen-vacinatedOffscreen <= recoveredOffscreen):{
                //SPAWN RECOVERED
                this._onScreenRecovered++;
                return ElfHealthState.RECOVERED;
            }
        }
        return ElfHealthState.NOT_VACINATED;
    }

    newElfInfection(onScreen: boolean = true) {
        this._notVacinated--;
        this._infected++;       
        if (onScreen){
            this._onScreenNotVacinated--;
            this._onScreenInfected++;
        }
    }

    newElfVacination() {

    }

    newElfRecovery(onScreen: boolean = true) {
        this._infected--;
        this._recovered++;
        if (onScreen){
            this._onScreenInfected--;
            this._onScreenRecovered++;
        }
    }

    healthyElfDied(){
        this._notVacinated--;
        this._dead++;
        this._onScreenNotVacinated--;
        this._onScreenDead++;
    }

    illElfDied(onScreen: boolean = true){
        this._infected--;
        this._dead++;
        if (onScreen){
            this._onScreenInfected--;
            this._onScreenDead++;
        }
    }
}