-- Functional GIN index backing the plainto_tsquery search in
-- src/lib/catalog/queries.ts. Postgres can reuse this index instead of
-- computing to_tsvector per row on every search as the catalogue grows
-- toward hundreds of products.
CREATE INDEX "products_search_idx" ON "products" USING gin (
	to_tsvector('english', "name" || ' ' || coalesce("description", ''))
);
