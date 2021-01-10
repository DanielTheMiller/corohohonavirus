import { Component, OnInit, Output, Input,EventEmitter } from '@angular/core';
import { Weapon } from 'src/models/weapon';

@Component({
  selector: 'app-fire-button',
  templateUrl: './fire-button.component.html',
  styleUrls: ['./fire-button.component.css']
})
export class FireButtonComponent implements OnInit {

  constructor() { }

  @Output() fire = new EventEmitter<boolean>();
  @Input() vacineGun: Weapon;
  @Input() isoGun: Weapon;
  @Input() gunGun: Weapon;

  fireButtonDown() {
    console.log("Fire button down");
    this.fire.emit(true);
  }

  fireButtonUp() {
    this.fire.emit(false);
  }

  ngOnInit(): void {
  }
  
}
