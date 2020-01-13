import { FormControl } from '@angular/forms';

export function noEmptyValueValidator(
  control: FormControl,
): { emptyValue: boolean } | null {
  const controlValue = control.value;
  if (controlValue) {
    const isEmptyValue = controlValue.trim().length === 0;
    if (!isEmptyValue) return null;
  }
  return { emptyValue: true };
}
