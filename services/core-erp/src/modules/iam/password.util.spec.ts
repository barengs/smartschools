import { hashSecret, verifySecret } from './password.util';

describe('password.util', () => {
  it('hashes and verifies matching secret', async () => {
    const hash = await hashSecret('SmartSchool#2026');
    expect(hash).toContain(':');
    await expect(verifySecret('SmartSchool#2026', hash)).resolves.toBe(true);
    await expect(verifySecret('WrongPassword', hash)).resolves.toBe(false);
  });

  it('rejects malformed stored hash', async () => {
    await expect(verifySecret('abc', 'malformed')).resolves.toBe(false);
  });
});

