import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { IFormTabLabels } from '@modules/flights-filter/models/tabs-labels';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ValidationService } from '@core/utils/validation.service';
import { FilterTabsDeeplinkHelper } from 'app/helpers/filter-tabs-deeplink.helper';
import { RedirectService } from '@core/services/redirect.service';
import { FilterPopupHelper } from 'app/helpers/filter-popups.helper';
import { TabFormSharedService } from '../../services/tab-form-shared.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'vy-form-email',
  templateUrl: './form-email.component.html'
})
export class FormEmailComponent implements OnInit, OnDestroy {
  public emailForm: FormGroup;
  public displayErrors: boolean;

  public isFocusBookingCode: boolean;
  public isFocusEmail: boolean;

  @Input() TabFormSharedService : TabFormSharedService;

  @Input() componentLabels: IFormTabLabels;
  @Input() isCheckinPage: boolean;
  @Output() showModalEvent = new EventEmitter();

  @ViewChild('bookingCodeInput') bookingCodeInput: ElementRef;
  @ViewChild('emailInput') emailInput: ElementRef;
  private componentSubscriptions: Subscription;

  constructor(private builder: FormBuilder,
    private validationService: ValidationService,
    private filterTabsDeeplinkHelper: FilterTabsDeeplinkHelper,
    private redirectService: RedirectService,
    private filterPopupHelper: FilterPopupHelper) { }

  ngOnInit() {

    this.emailForm = this.builder.group({
      bookingCode: ['', this.validationService.bookingCodeValidator()],
      purchaserEmail: ['', this.validationService.emailValidator(true)]
    });

    this.doSubscriptions();

  }

  private doSubscriptions(): void {
    this.componentSubscriptions = new Subscription();

    this.componentSubscriptions.add(this.TabFormSharedService.sharedFormRx.subscribe(value => {
      if( !_.isNil(value) ){
        this.emailForm.controls['bookingCode'].setValue(value.bookingCode);
        this.emailForm.controls['purchaserEmail'].setValue(value.buyerEmail);
      }
      
    }));

    this.componentSubscriptions.add(this.TabFormSharedService.sharedErrorsRx.subscribe(value => {
      this.displayErrors = value;
    }))
  }

  ngOnDestroy() {
    this.componentSubscriptions.unsubscribe();
  }

  /** convenience getter for easy access to form fields */
  public get formControls(): FormGroup["controls"] { return this.emailForm.controls; }

  public getBookingCodeErrorMessage(): string {
    return this.formControls.bookingCode.hasError('required') ?
      this.componentLabels.bookingInput.emptyFieldErrorMessage :
      this.componentLabels.bookingInput.invalidFieldErrorMessage;
  }

  public getEmailErrorMessage(): string {
    return this.formControls.purchaserEmail.hasError('required') ?
      this.componentLabels.buyerEmailInput.emptyFieldErrorMessage :
      this.componentLabels.buyerEmailInput.invalidFieldErrorMessage;
  }

  public pushRequestedInformation(): void {
    
    if (!this.emailForm.valid) {
      this.TabFormSharedService.updateSharedErrorsValue(true);
    } else {
      const urlToRedirect = this.isCheckinPage ? this.filterTabsDeeplinkHelper
        .getCheckInDeeplink(this.formControls.bookingCode.value, this.formControls.purchaserEmail.value) :
        this.filterTabsDeeplinkHelper
          .getYourReservationDeeplink(this.formControls.bookingCode.value, this.formControls.purchaserEmail.value)
      this.TabFormSharedService.updateSharedErrorsValue(false);
      this.redirectService.redirect(urlToRedirect);
    }
  }

  public showBookingCodeErrors(): boolean {
    return this.displayErrors && !this.formControls.bookingCode.valid && !this.isFocusBookingCode;
  }

  public showEmailErrors(): boolean {
    return this.displayErrors && !this.formControls.purchaserEmail.valid && !this.isFocusEmail;
  }

  public focusBookingCode(): void {
    this.bookingCodeInput.nativeElement.focus();
    this.isFocusBookingCode = true;
    this.filterPopupHelper.isTabsInputBookingActive = true;
  }

  public focusEmail(): void {
    this.emailInput.nativeElement.focus();
    this.isFocusEmail = true;
    this.filterPopupHelper.isTabsInputEmailActive = true;
  }

  public clickOutsideBooking(target: any): void {
    this.isFocusBookingCode = false;
    this.filterPopupHelper.isTabsInputBookingActive = false;
  }

  public clickOutsideEmail(target: any): void {
    this.isFocusEmail = false;
    this.filterPopupHelper.isTabsInputEmailActive = false;
  }

  public showModal(): void {
    this.showModalEvent.emit();
  }

  public changeValueInput(bookingCode: HTMLInputElement, buyerEmail : HTMLInputElement) {
    this.TabFormSharedService.updateSharedFormValue({ bookingCode: bookingCode.value,  buyerEmail: buyerEmail.value });
  }
}
