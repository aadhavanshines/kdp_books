import { describe, expect, it } from 'vitest';
import { addressSchema } from './addressSchema';

const valid = {
  label: 'Home',
  name: 'Asha Rao',
  phone: '+91 98765 43210',
  line1: 'Flat 4B, Palm Residency',
  line2: '5th Block, 80 Feet Road',
  landmark: '',
  areaId: 'blr-koramangala',
  pincode: '560095',
};

describe('addressSchema', () => {
  it('accepts a valid address and normalises the phone number', () => {
    expect(addressSchema.parse(valid).phone).toBe('9876543210');
  });

  it.each([
    ['phone', '12345'],
    ['phone', '5876543210'],
    ['pincode', '012345'],
    ['pincode', '5600'],
    ['line1', ''],
  ])('rejects a bad %s (%s)', (field, value) => {
    expect(addressSchema.safeParse({ ...valid, [field]: value }).success).toBe(false);
  });
});
