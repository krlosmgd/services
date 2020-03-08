import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class TabFormSharedService {

  private sharedFormSubject : BehaviorSubject<string>;
  private sharedErrorsSubject : BehaviorSubject<boolean>;

  constructor() { 
    this.sharedFormSubject = new BehaviorSubject<string>(null);
    this.sharedErrorsSubject = new BehaviorSubject<boolean>(false);
  }

  public updateSharedFormValue(value: string): void {
    this.sharedFormSubject.next(value);
  }

  public get sharedFormRx(): Observable<string> {
    return this.sharedFormSubject.asObservable();
  }

  public updateSharedErrorsValue(value: boolean): void {
    this.sharedErrorsSubject.next(value);
  }

  public get sharedErrorsRx(): Observable<boolean> {
    return this.sharedErrorsSubject.asObservable();
  }
}
