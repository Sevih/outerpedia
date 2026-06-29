import { describe, it, expect } from 'vitest';

// Smoke test : vérifie que la stack de test fonctionne.
// À remplacer par de vrais tests au fil du portage (logique, transforms...).
describe('test setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
