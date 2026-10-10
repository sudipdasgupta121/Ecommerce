export default async function globalTeardown() {
  // fixtures/reset-db.js closes its own pool per call — nothing lingers between runs.
}
