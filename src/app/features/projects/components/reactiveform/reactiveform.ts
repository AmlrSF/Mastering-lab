import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidatorFn,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// ══════════════════════════════════════════════════════════════════
// PARTIE 2 — Custom validators (custom-validators.ts inlined)
// ══════════════════════════════════════════════════════════════════

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const errors: Record<string, boolean> = {};

    if (!(/[A-Z]/.test(value)))                          errors['noUppercase']  = true;
    if (!(/[a-z]/.test(value)))                          errors['noLowercase']  = true;
    if (!(/[0-9]/.test(value)))                          errors['noNumber']     = true;
    if (!(/[!@#$%^&*(),.?":{}|<>]/.test(value)))        errors['noSpecial']    = true;
    if (value.length < 8)                                errors['tooShort']     = true;

    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  };
}

export function matchPasswordValidator(pass1: string, pass2: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const p1 = group.get(pass1)?.value;
    const p2 = group.get(pass2)?.value;
    return p1 && p2 && p1 !== p2 ? { mustMatch: true } : null;
  };
}

// ══════════════════════════════════════════════════════════════════
// PARTIE 2 Q2 — Async validator (UserService inlined)
// ══════════════════════════════════════════════════════════════════

const EXISTING_EMAILS = ['test@test.com', 'admin@admin.com', 'user@user.com'];

function emailExistsValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    return timer(800).pipe(
      map(() => EXISTING_EMAILS.includes(control.value) ? { emailExists: true } : null)
    );
  };
}

// ══════════════════════════════════════════════════════════════════
// PARTIE 4 Q2 — Min competences validator
// ══════════════════════════════════════════════════════════════════

function minCompetencesValidator(min: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const arr = group.get('competences') as FormArray;
    if (!arr || arr.length === 0) return null;
    return arr.length < min ? { minCompetences: { required: min, actual: arr.length } } : null;
  };
}

// ══════════════════════════════════════════════════════════════════
// PARTIE 6 Q1 — ValidationService (inlined)
// ══════════════════════════════════════════════════════════════════

export class ValidationService {
  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors || !control.touched) return '';
    const e = control.errors;
    if (e['required'])         return 'Ce champ est obligatoire.';
    if (e['email'])            return 'Format email invalide.';
    if (e['minlength'])        return `Minimum ${e['minlength'].requiredLength} caractères.`;
    if (e['maxlength'])        return `Maximum ${e['maxlength'].requiredLength} caractères.`;
    if (e['min'])              return `Valeur minimale : ${e['min'].min}.`;
    if (e['max'])              return `Valeur maximale : ${e['max'].max}.`;
    if (e['pattern'])          return 'Format invalide.';
    if (e['passwordStrength']) return 'Le mot de passe ne respecte pas les critères.';
    if (e['mustMatch'])        return 'Les mots de passe ne correspondent pas.';
    if (e['emailExists'])      return 'Cet email est déjà utilisé.';
    return 'Champ invalide.';
  }

  hasError(control: AbstractControl | null, errorType: string): boolean {
    return !!control && control.touched && control.hasError(errorType);
  }
}

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

type ActiveSection =
  | 'p1-basic'
  | 'p1-validation'
  | 'p1-contact'
  | 'p2-password'
  | 'p2-async'
  | 'p3-builder'
  | 'p4-emails'
  | 'p4-competences'
  | 'p5-address'
  | 'p5-multi-address';

@Component({
  selector: 'reactiveform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reactiveform.html'
})
export class EmailListComponent implements OnInit {

  activeSection: ActiveSection = 'p1-basic';
  validationService = new ValidationService();

  // ── PARTIE 1 Q1 — Basic email form ─────────────────────────────
  basicForm!: FormGroup;
  basicSubmitted = false;

  // ── PARTIE 1 Q3 — Contact form ─────────────────────────────────
  contactForm!: FormGroup;
  contactSubmitted = false;

  // ── PARTIE 2 Q1 — Password form ────────────────────────────────
  passwordForm!: FormGroup;
  passwordSubmitted = false;
  showPassword = false;
  showConfirm  = false;

  // ── PARTIE 2 Q2 — Async email form ─────────────────────────────
  asyncForm!: FormGroup;
  asyncSubmitted = false;

  // ── PARTIE 3 — FormBuilder user form ───────────────────────────
  userForm!: FormGroup;
  userSubmitted = false;

  // ── PARTIE 4 Q1 — Email FormArray ──────────────────────────────
  emailArrayForm!: FormGroup;
  emailArraySubmitted = false;
  readonly EMAIL_TYPES = ['Personnel', 'Professionnel', 'Autre'];

  // ── PARTIE 4 Q2 — Competences FormArray ────────────────────────
  competencesForm!: FormGroup;
  competencesSubmitted = false;

  // ── PARTIE 5 Q1 — Nested address form ──────────────────────────
  addressForm!: FormGroup;
  addressSubmitted = false;

  // ── PARTIE 5 Q2 — Multi-address FormArray ──────────────────────
  multiAddressForm!: FormGroup;
  multiAddressSubmitted = false;
  readonly ADDRESS_TYPES = ['Domicile', 'Travail', 'Autre'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildBasicForm();
    this.buildContactForm();
    this.buildPasswordForm();
    this.buildAsyncForm();
    this.buildUserForm();
    this.buildEmailArrayForm();
    this.buildCompetencesForm();
    this.buildAddressForm();
    this.buildMultiAddressForm();
  }

  setSection(s: ActiveSection): void { this.activeSection = s; }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 1 Q1 — Basic form
  // ══════════════════════════════════════════════════════════════

  private buildBasicForm(): void {
    this.basicForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get basicEmail() { return this.basicForm.get('email'); }

  onBasicSubmit(): void {
    this.basicSubmitted = true;
    if (this.basicForm.invalid) { this.basicForm.markAllAsTouched(); return; }
    alert('Email soumis : ' + this.basicForm.value.email);
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 1 Q3 — Contact form
  // ══════════════════════════════════════════════════════════════

  private buildContactForm(): void {
    this.contactForm = this.fb.group({
      nom:       ['', [Validators.required, Validators.minLength(2)]],
      prenom:    ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^0[1-9][0-9]{8}$/)]],
      message:   ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get cNom()       { return this.contactForm.get('nom'); }
  get cPrenom()    { return this.contactForm.get('prenom'); }
  get cEmail()     { return this.contactForm.get('email'); }
  get cTelephone() { return this.contactForm.get('telephone'); }
  get cMessage()   { return this.contactForm.get('message'); }

  onContactSubmit(): void {
    this.contactSubmitted = true;
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    alert('Contact soumis !\n' + JSON.stringify(this.contactForm.value, null, 2));
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 2 Q1 — Password strength
  // ══════════════════════════════════════════════════════════════

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group(
      {
        password:        ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: matchPasswordValidator('password', 'confirmPassword') }
    );
  }

  get pPassword()        { return this.passwordForm.get('password'); }
  get pConfirmPassword() { return this.passwordForm.get('confirmPassword'); }

  get passwordChecks(): Record<string, boolean> {
    const v = this.pPassword?.value || '';
    return {
      uppercase: /[A-Z]/.test(v),
      lowercase: /[a-z]/.test(v),
      number:    /[0-9]/.test(v),
      special:   /[!@#$%^&*(),.?":{}|<>]/.test(v),
      length:    v.length >= 8
    };
  }

  onPasswordSubmit(): void {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    alert('Mot de passe valide !');
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 2 Q2 — Async validator
  // ══════════════════════════════════════════════════════════════

  private buildAsyncForm(): void {
    this.asyncForm = this.fb.group({
      email: ['',
        [Validators.required, Validators.email],
        [emailExistsValidator()]
      ]
    });
  }

  get asyncEmail() { return this.asyncForm.get('email'); }

  onAsyncSubmit(): void {
    this.asyncSubmitted = true;
    if (this.asyncForm.invalid) { this.asyncForm.markAllAsTouched(); return; }
    alert('Email disponible : ' + this.asyncForm.value.email);
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 3 — FormBuilder user form
  // ══════════════════════════════════════════════════════════════

  private buildUserForm(): void {
    this.userForm = this.fb.group({
      nom:    ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email:  ['', [Validators.required, Validators.email]],
      age:    [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      ville:  ['', Validators.required]
    });
  }

  get uNom()    { return this.userForm.get('nom'); }
  get uPrenom() { return this.userForm.get('prenom'); }
  get uEmail()  { return this.userForm.get('email'); }
  get uAge()    { return this.userForm.get('age'); }
  get uVille()  { return this.userForm.get('ville'); }

  markFormGroupTouched(): void {
    Object.values(this.userForm.controls).forEach(c => c.markAsTouched());
  }

  resetUserForm(): void {
    this.userSubmitted = false;
    this.userForm.reset();
  }

  onUserSubmit(): void {
    this.userSubmitted = true;
    if (this.userForm.invalid) { this.markFormGroupTouched(); return; }
    alert('Utilisateur soumis !\n' + JSON.stringify(this.userForm.value, null, 2));
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 4 Q1 — Email FormArray
  // ══════════════════════════════════════════════════════════════

  private buildEmailArrayForm(): void {
    this.emailArrayForm = this.fb.group({
      emails: this.fb.array([this.createEmailControl()])
    });
  }

  get emails(): FormArray {
    return this.emailArrayForm.get('emails') as FormArray;
  }

  createEmailControl(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      type:  ['Personnel', Validators.required]
    });
  }

  addEmail(): void    { this.emails.push(this.createEmailControl()); }
  removeEmail(i: number): void { this.emails.removeAt(i); }

  getEmailControl(i: number): AbstractControl {
    return this.emails.at(i).get('email')!;
  }

  isEmailRowInvalid(i: number): boolean {
    const g = this.emails.at(i) as FormGroup;
    return g.invalid && (g.touched || this.emailArraySubmitted);
  }

  getEmailError(i: number): string {
    const c = this.getEmailControl(i);
    if (!c.touched && !this.emailArraySubmitted) return '';
    if (c.hasError('required')) return 'L\'adresse email est obligatoire.';
    if (c.hasError('email'))    return 'Format email invalide.';
    return '';
  }

  get validEmails(): any[] {
    return (this.emailArrayForm.value.emails ?? [])
      .filter((e: any) => e.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email));
  }

  onEmailArraySubmit(): void {
    this.emailArraySubmitted = true;
    if (this.emailArrayForm.invalid) { this.emailArrayForm.markAllAsTouched(); return; }
    alert('Emails sauvegardés !\n' + JSON.stringify(this.emailArrayForm.value.emails, null, 2));
  }

  resetEmailForm(): void {
    this.emailArraySubmitted = false;
    this.emailArrayForm.reset();
    while (this.emails.length > 1) this.emails.removeAt(1);
    this.emails.at(0).patchValue({ email: '', type: 'Personnel' });
    this.emails.at(0).markAsPristine();
    this.emails.at(0).markAsUntouched();
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 4 Q2 — Competences FormArray
  // ══════════════════════════════════════════════════════════════

  private buildCompetencesForm(): void {
    this.competencesForm = this.fb.group(
      { competences: this.fb.array([]) },
      { validators: minCompetencesValidator(3) }
    );
  }

  get competences(): FormArray {
    return this.competencesForm.get('competences') as FormArray;
  }

  createCompetenceControl(): FormGroup {
    return this.fb.group({
      nom:    ['', Validators.required],
      niveau: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  addCompetence(): void    { this.competences.push(this.createCompetenceControl()); }
  removeCompetence(i: number): void { this.competences.removeAt(i); }

  getCompetenceNom(i: number):    AbstractControl { return this.competences.at(i).get('nom')!; }
  getCompetenceNiveau(i: number): AbstractControl { return this.competences.at(i).get('niveau')!; }

  onCompetencesSubmit(): void {
    this.competencesSubmitted = true;
    if (this.competencesForm.invalid) { this.competencesForm.markAllAsTouched(); return; }
    alert('Compétences soumises !\n' + JSON.stringify(this.competencesForm.value, null, 2));
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 5 Q1 — Nested address
  // ══════════════════════════════════════════════════════════════

  private buildAddressForm(): void {
    this.addressForm = this.fb.group({
      nom:    ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email:  ['', [Validators.required, Validators.email]],
      adresse: this.fb.group({
        rue:        ['', Validators.required],
        codePostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
        ville:      ['', Validators.required],
        pays:       ['France', Validators.required]
      })
    });
  }

  get adresse(): FormGroup { return this.addressForm.get('adresse') as FormGroup; }
  get aNom()        { return this.addressForm.get('nom'); }
  get aPrenom()     { return this.addressForm.get('prenom'); }
  get aEmail()      { return this.addressForm.get('email'); }
  get aRue()        { return this.adresse.get('rue'); }
  get aCodePostal() { return this.adresse.get('codePostal'); }
  get aVille()      { return this.adresse.get('ville'); }
  get aPays()       { return this.adresse.get('pays'); }

  onAddressSubmit(): void {
    this.addressSubmitted = true;
    if (this.addressForm.invalid) { this.addressForm.markAllAsTouched(); return; }
    alert('Adresse soumise !\n' + JSON.stringify(this.addressForm.value, null, 2));
  }

  // ══════════════════════════════════════════════════════════════
  // PARTIE 5 Q2 — Multi-address FormArray
  // ══════════════════════════════════════════════════════════════

  private buildMultiAddressForm(): void {
    this.multiAddressForm = this.fb.group({
      nom:       ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      adresses:  this.fb.array([this.createAddressGroup()])
    });
  }

  get adresses(): FormArray {
    return this.multiAddressForm.get('adresses') as FormArray;
  }

  createAddressGroup(): FormGroup {
    return this.fb.group({
      type:       ['Domicile', Validators.required],
      rue:        ['', Validators.required],
      codePostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      ville:      ['', Validators.required]
    });
  }

  addAddress(): void        { this.adresses.push(this.createAddressGroup()); }
  removeAddress(i: number): void { this.adresses.removeAt(i); }

  onMultiAddressSubmit(): void {
    this.multiAddressSubmitted = true;
    if (this.multiAddressForm.invalid) { this.multiAddressForm.markAllAsTouched(); return; }
    alert('Formulaire soumis !\n' + JSON.stringify(this.multiAddressForm.value, null, 2));
  }

  // ══════════════════════════════════════════════════════════════
  // Shared UI helpers
  // ══════════════════════════════════════════════════════════════

  inputClass(ctrl: AbstractControl | null, submitted = false): string {
    if (!ctrl) return 'border-gray-300';
    if (ctrl.pristine && !submitted) return 'border-gray-300';
    return ctrl.invalid
      ? 'border-red-400 focus:ring-red-200'
      : 'border-green-400 focus:ring-green-200';
  }

  errMsg(ctrl: AbstractControl | null): string {
    return this.validationService.getErrorMessage(ctrl);
  }
}