import { faker } from '@faker-js/faker';
import { createSeedClient } from '@snaplet/seed';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function main() {
  const seed = await createSeedClient();

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  faker.seed(123);

  await seed.$resetDatabase();

  await supabase.auth.signUp({
    email: 'admin@example.com',
    password: '123Abc',
    options: {
      data: {
        username: 'admin',
        role: 'admin',
        email_verified: true,
      },
    },
  });

  for (let i = 0; i < 5; i++) {
    await supabase.auth.signUp({
      email: faker.internet.email({ provider: 'example.com' }),
      password: '123Abc',
      options: {
        data: {
          username: faker.internet.username(),
          full_name: faker.person.fullName(),
          avatar_url: faker.image.avatar(),
          role: 'user',
          email_verified: true,
        },
      },
    });
  }

  const { data: profiles } = await supabase.from('profiles').select('id');

  // Create organisations and link profiles to organisations as members
  const { organisations, members } = await seed.organisations(
    (x) =>
      x(3, () => ({
        name: faker.company.name(),
        address_line1: faker.location.streetAddress(),
        address_line2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postal_code: faker.location.zipCode(),
        country: faker.location.country(),
        status: 'approved',
        deleted_at: null,
        members: (x) =>
          x(2, () => ({
            role_in_business: faker.helpers.arrayElement([
              'owner',
              'sales_agent',
              'customer',
            ]),
          })),
      })),
    { connect: { profiles } },
  );

  // Create categories for organisations
  const categories = await seed.categories(
    (x) =>
      x(12, () => ({
        name: faker.commerce.department(),
        products: (x) =>
          x(10, () => ({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            status: faker.helpers.arrayElement([
              'draft',
              'published',
              'rejected',
            ]),
            price: faker.number.float({ fractionDigits: 2 }),
            image_url: faker.image.urlLoremFlickr(),
            stock_quantity: faker.number.int({ min: 0, max: 100 }),
          })),
      })),
    {
      connect: { organisations },
    },
  );

  // Create orders
  const orders = await seed.orders(
    (x) =>
      x(5, () => ({
        total_amount: faker.number.float({ fractionDigits: 2 }),
        status: faker.helpers.arrayElement([
          'pending',
          'processing',
          'completed',
          'cancelled',
        ]),
        order_items: (x) =>
          x(15, () => ({
            quantity: faker.number.int({ min: 1, max: 5 }),
            price_at_time_of_order: faker.number.float({ fractionDigits: 2 }),
          })),
      })),
    { connect: { profiles, organisations } },
  );

  process.exit();
}

main();
