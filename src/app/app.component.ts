import { Component } from '@angular/core';
import * as CanvasJS from '../assets/canvasjs.min';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    '../../node_modules/anychart/dist/css/anychart-ui.min.css',
    '../../node_modules/anychart/dist/fonts/css/anychart-font.min.css'
  ]
})
export class AppComponent {
  title = 'WeatherSearch';
}
