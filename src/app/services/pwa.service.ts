import { Injectable } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';

/**
 * Service for managing PWA features
 */
@Injectable({
  providedIn: 'root'
})
export class PwaService {

  promptEvent!: any;

  constructor(private swUpdate: SwUpdate) {
    //Listen for new version of the application is available. When available ask the user if proceed with update
    swUpdate.versionUpdates.subscribe(event => {
      if (this.askUserToUpdate()) {
        window.location.reload();
      }
    });

    window.addEventListener('beforeinstallprompt', event => {
      this.promptEvent = event;
    });
  }

  /**
   *
   * @returns Ask to the user if want to update the application
   */
  askUserToUpdate() {
    return window.confirm('Update application?');
  }
}
