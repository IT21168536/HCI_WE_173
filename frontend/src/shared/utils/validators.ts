export function isEmail(value: string) {
  const trimmed = value.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isRequired(value: string) {
  return value.trim().length > 0;
}

/** Sri Lankan mobile/landline numbers, with or without +94 / spaces / dashes. */
export function isPhone(value: string) {
  const digits = value.replace(/[\s-]/g, '');
  return /^(\+94|0)?\d{9}$/.test(digits);
}

/** Rider contact fields use the local 10-digit format, with digits only. */
export function isTenDigitPhone(value: string) {
  return /^\d{10}$/.test(value.replace(/[\s-]/g, ''));
}

/** Current Sri Lankan driving licence format used by this app, e.g. B1234567. */
export function isDrivingLicence(value: string) {
  return /^[A-Za-z]\d{7}$/.test(value.trim());
}

/** Common modern registration forms, e.g. WP BCD-4582 or CAB-1234. */
export function isVehicleRegistration(value: string) {
  return /^(?:[A-Za-z]{2}\s)?[A-Za-z]{2,3}-?\d{4}$/.test(value.trim());
}

export function isPersonName(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 60 && !/\d/.test(trimmed);
}

export function isPassword(value: string) {
  return value.length >= 6 && value.length <= 64 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export function isAddress(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 5 && trimmed.length <= 120;
}

export function isShortName(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 60;
}

export function isTextWithin(value: string | null | undefined, maxLength: number) {
  return (value?.trim().length ?? 0) <= maxLength;
}

export function parsePositiveNumber(value: string) {
  const number = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function parseWholeNumber(value: string) {
  const number = Number(value.trim());
  return Number.isInteger(number) && number >= 0 ? number : null;
}
