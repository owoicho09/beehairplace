import "dotenv/config";

import { db } from "@/lib/db";
import { categories, deliverySettings, storeSettings } from "@/lib/db/schema";

async function main() {
  console.log("Seeding categories...");
  await db
    .insert(categories)
    .values([
      { name: "Wigs", slug: "wigs", sortOrder: 0 },
      { name: "Bundles", slug: "bundles", sortOrder: 1 },
      { name: "Closures", slug: "closures", sortOrder: 2 },
    ])
    .onConflictDoNothing({ target: categories.slug });

  console.log("Seeding store settings...");
  await db
    .insert(storeSettings)
    .values({
      id: 1,
      storeName: "Bee Hairplace",
      address: "Abuja, Nigeria",
      openingHours: "Mon–Sat, 10am–7pm",
    })
    .onConflictDoNothing({ target: storeSettings.id });

  console.log("Seeding delivery settings...");
  await db
    .insert(deliverySettings)
    .values({ id: 1, flatFee: "3000" })
    .onConflictDoNothing({ target: deliverySettings.id });

  console.log("Done. Create an admin with: npm run create-admin");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
