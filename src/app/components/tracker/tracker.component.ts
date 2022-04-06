import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Observable, startWith, withLatestFrom } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { TrackerService } from 'src/app/services/tracker.service';

@Component({
  selector: 'fc-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {

  descriptionForm: FormGroup;
  filteredDescriptions$: Observable<string[]>;

  constructor(public tracker: TrackerService, private fb: FormBuilder, private storage: StorageService) {

    //Init the description form
    this.descriptionForm = this.fb.group({
      description: [this.storage.loadLastEvent()?.description || '', Validators.required]
    });

    const descriptionField = this.descriptionForm.get('description');

    //Disable the form when recording
    this.tracker.isRecording$.subscribe( isRecording => {
      if(isRecording) {
        descriptionField?.disable();
      } else {
        descriptionField?.enable();
      }
    });

    //Bind the description field to the tracker service
    const valueChanges$ = descriptionField!.valueChanges.pipe(map(val => '' + val));
    this.tracker.setActivityDescriptionsStream(valueChanges$);

    //Fill the description autocomplete with al the acitivity desciption from the tracker service
    this.filteredDescriptions$ = descriptionField!.valueChanges.pipe(
      startWith(''),
      withLatestFrom(this.tracker.descriptions$.pipe(startWith([]))),
      map(([value, descriptions]) => this.filter(value, descriptions))
    );
  }

  ngOnInit(): void {

  }

  /**
   * Filter the autocomplete options based on current description field value
   * @param value
   * @param descriptions
   * @returns
   */
  private filter(value: string, descriptions: string[]): string[] {
    const filterValue = ('' + value).toLowerCase();
    const filteredDescriptions = descriptions.filter(option => option.toLowerCase().includes(filterValue))
    return filteredDescriptions;
  }
}
