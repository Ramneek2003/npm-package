export function validatePhoneNumber(phoneNumber: string) {
  const pattern = /^\+91\d{10}$/;
  return pattern.test(phoneNumber);
}
