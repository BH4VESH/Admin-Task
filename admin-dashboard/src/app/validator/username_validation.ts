import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";

export function forbiddenCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbiddenCharacters = /[@$!]+/; // Define your pattern for prohibited characters
    const value = control.value;

    if (forbiddenCharacters.test(value)) {
      return { 'forbiddenCharacters': { value: value } };
    }
    return null;
  };

  
}
export function onlyChar(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const alphabeticOnly = /^[a-zA-Z\s]*$/;
    const value = control.value;

    if (!alphabeticOnly.test(value)) {
      return { 'alphabeticOnly': { value: value } };
    }
    return null;
  }
}