export function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export function isRequired(value: string) {
  return value.trim().length > 0;
}
