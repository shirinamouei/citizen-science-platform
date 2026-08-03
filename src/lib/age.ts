const MINIMUM_AGE = 18;

export function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function isMinor(dob: string): boolean {
  const age = calculateAge(dob);
  return age !== null && age < MINIMUM_AGE;
}

export const MINIMUM_AGE_DISCLAIMER = "You must be 18 or older to submit data.";
