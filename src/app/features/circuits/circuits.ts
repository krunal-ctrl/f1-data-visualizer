import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-circuits',
  imports: [CommonModule],
  templateUrl: './circuits.html',
  styleUrl: './circuits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Circuits {

}
