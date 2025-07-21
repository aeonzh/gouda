import { faker } from '@faker-js/faker';
import { createSeedClient } from '@snaplet/seed';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function main() {
  const seed = await createSeedClient({
    connect: true,
  });

  // Client for AUTH operations (will become authenticated as the last user)
  const supabaseAuth = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
  // A separate, CLEAN client for administrative DATA operations
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  faker.seed(123);

  await seed.$resetDatabase();

  await supabaseAuth.auth.signUp({
    email: 'admin@example.com',
    options: {
      data: {
        email_verified: true,
        role: 'admin',
        username: 'admin',
      },
    },
    password: '123Abc',
  });

  for (let i = 0; i < 5; i++) {
    await supabaseAuth.auth.signUp({
      email: faker.internet.email({ provider: 'example.com' }),
      options: {
        data: {
          avatar_url: faker.image.personPortrait(),
          email_verified: true,
          full_name: faker.person.fullName(),
          role: 'user',
          username: faker.internet.username(),
        },
      },
      password: '123Abc',
    });
  }

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id');

  // Create organisations and link profiles to organisations as members
  const { members, organisations } = await seed.organisations(
    (x) =>
      x(3, () => ({
        address_line1: faker.location.streetAddress(),
        address_line2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        deleted_at: null,
        image_url: faker.image.url(),
        members: (x) =>
          x(3, () => ({
            deleted_at: null,
            role_in_business: faker.helpers.arrayElement([
              'owner',
              'sales_agent',
              'customer',
            ]),
          })),
        name: faker.company.name(),
        postal_code: faker.location.zipCode(),
        state: faker.location.state(),
        status: 'approved',
      })),
    { connect: { profiles } },
  );
  // Create categories for organisations
  const categories = await seed.categories((x) =>
    x({ max: 10, min: 2 }, () => ({
      deleted_at: null,
      name: faker.commerce.department(),
      products: (x) =>
        x({ max: 10, min: 2 }, () => ({
          deleted_at: null,
          description: faker.commerce.productDescription(),
          image_url: faker.image.urlLoremFlickr(),
          name: faker.commerce.productName(),
          price: faker.number.float({ fractionDigits: 2 }),
          status: faker.helpers.arrayElement([
            'draft',
            'published',
            'rejected',
          ]),
          stock_quantity: faker.number.int({ max: 100, min: 0 }),
        })),
    })),
  );

  // // Create orders
  // const orders = await seed.orders(
  //   (x) =>
  //     x(5, () => ({
  //       total_amount: faker.number.float({ fractionDigits: 2 }),
  //       status: faker.helpers.arrayElement([
  //         'pending',
  //         'processing',
  //         'completed',
  //         'cancelled',
  //       ]),
  //       order_items: (x) =>
  //         x(15, () => ({
  //           quantity: faker.number.int({ min: 1, max: 5 }),
  //           price_at_time_of_order: faker.number.float({ fractionDigits: 2 }),
  //         })),
  //     })),
  //   { connect: { profiles, organisations } },
  // );

  process.exit();
}

main();
