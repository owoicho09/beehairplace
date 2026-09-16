"use server";

import { getCatalogPage, type CatalogFilters } from "./queries";

export async function loadMoreProducts(filters: CatalogFilters) {
  return getCatalogPage(filters);
}
