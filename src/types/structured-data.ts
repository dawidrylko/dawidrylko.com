import type { Person, Thing, WithContext } from 'schema-dts';

/**
 * A schema.org entity serialized as JSON-LD, including the `@context` field.
 * Thin alias over schema-dts' `WithContext` so page-level annotations stay
 * consistent and pages don't each reach for `WithContext` directly.
 */
export type StructuredData<T extends Thing> = WithContext<T>;

/** Shared person entity reused across pages as `author` / `mainEntity`. */
export type PersonStructuredData = StructuredData<Person>;
