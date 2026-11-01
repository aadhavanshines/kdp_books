import { addressLine, asDefault, defaultAddress, formatPhone, isValidPhone, isValidPincode } from './address';
import type { Address } from './types';

const home: Address = {
  id: 'addr_home',
  label: 'Home',
  recipient: 'Riya Sharma',
  line1: 'Flat 3B, Seabreeze Apartments',
  line2: '12 Lake View Road',
  landmark: null,
  locality: 'Lakeside',
  city: 'Northbay',
  pincode: '560102',
  location: { x: 500, y: 500 },
  isDefault: false,
};
const work: Address = { ...home, id: 'addr_work', label: 'Work', line2: '', isDefault: true };

describe('address helpers', () => {
  it('joins the address lines, skipping empty ones', () => {
    expect(addressLine(home)).toBe('Flat 3B, Seabreeze Apartments, 12 Lake View Road');
    expect(addressLine(work)).toBe('Flat 3B, Seabreeze Apartments');
  });

  it('picks the default address, else the first', () => {
    expect(defaultAddress([home, work])?.id).toBe('addr_work');
    expect(defaultAddress([home])?.id).toBe('addr_home');
    expect(defaultAddress(undefined)).toBeUndefined();
  });

  it('builds an update that makes an address the default', () => {
    expect(asDefault(home)).toMatchObject({ label: 'Home', pincode: '560102', isDefault: true });
  });
});

describe('phone and pincode', () => {
  it('formats a mobile number in two groups', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765 43210');
  });

  it('accepts only 10-digit Indian mobile numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('1234567890')).toBe(false);
    expect(isValidPhone('98765')).toBe(false);
    expect(isValidPhone('98765432101')).toBe(false);
  });

  it('accepts 6-digit pincodes that do not start with 0', () => {
    expect(isValidPincode('560102')).toBe(true);
    expect(isValidPincode('060102')).toBe(false);
    expect(isValidPincode('56010')).toBe(false);
    expect(isValidPincode('56010a')).toBe(false);
  });
});
