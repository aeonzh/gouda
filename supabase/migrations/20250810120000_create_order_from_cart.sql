-- create_order_from_cart RPC with optional idempotency key
CREATE    OR REPLACE FUNCTION public.create_order_from_cart (user_id uuid, business_id uuid, idempotency_key text DEFAULT NULL) returns jsonb language plpgsql security definer
SET       search_path = public AS $$
declare
  v_cart_id uuid;
  v_order_id uuid;
  v_total numeric := 0;
begin
  -- Find cart
  select c.id into v_cart_id
  from carts c
  where c.user_id = create_order_from_cart.user_id
    and c.business_id = create_order_from_cart.business_id
  limit 1;

  if v_cart_id is null then
    raise exception 'Cart not found for user and business';
  end if;

  -- Compute total
  select coalesce(sum(ci.quantity * ci.price_at_time_of_add),0)
    into v_total
  from cart_items ci
  where ci.cart_id = v_cart_id;

  if v_total <= 0 then
    raise exception 'Cart is empty';
  end if;

  -- Insert order
  insert into orders (user_id, business_id, total_amount, status)
  values (create_order_from_cart.user_id, create_order_from_cart.business_id, v_total, 'pending')
  returning id into v_order_id;

  -- Insert order items from cart
  insert into order_items (order_id, product_id, quantity, price_at_time_of_order)
  select v_order_id, ci.product_id, ci.quantity, ci.price_at_time_of_add
  from cart_items ci
  where ci.cart_id = v_cart_id;

  -- Clear cart
  delete from cart_items where cart_id = v_cart_id;

  -- Return created order
  return to_jsonb((select o from orders o where o.id = v_order_id));
end;
$$;

-- Note: Idempotency key is currently ignored at DB level to avoid schema drift.
