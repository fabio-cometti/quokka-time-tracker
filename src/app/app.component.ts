import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { map, Observable, of, startWith, tap, withLatestFrom } from 'rxjs';
import { PwaService } from './services/pwa.service';
import { StorageService } from './services/storage.service';
import { TrackerService } from './services/tracker.service';

/**
 * Main component
 */
@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  defaultTitle = 'Quokka Time Tracker'
  title = this.defaultTitle;

  constructor(
    public tracker: TrackerService,
    private ts: Title,
    public pwa: PwaService){}

  ngOnInit(): void {

    this.tracker.blink$.pipe(map(blink => {
      const suffix = blink ? '•' : '';
      return `${this.defaultTitle} ${suffix}`;
    })).subscribe( title => this.ts.setTitle(title));
  }

  /**
   * Manage the installation of the app as a PWA
   */
  installPwa(): void {
    this.pwa.promptEvent.prompt();
  }
}
