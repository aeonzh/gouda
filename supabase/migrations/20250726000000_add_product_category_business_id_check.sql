-- Create a function to check if product's category_id belongs to the same business_id
CREATE OR REPLACE FUNCTION check_product_category_business_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    category_business_id uuid;
BEGIN
    IF NEW.category_id IS NOT NULL THEN
        SELECT business_id INTO category_business_id
        FROM categories
        WHERE id = NEW.category_id;

        IF category_business_id IS NULL THEN
            RAISE EXCEPTION 'Category with ID % does not exist.', NEW.category_id;
        END IF;

        IF NEW.business_id IS DISTINCT FROM category_business_id THEN
            RAISE EXCEPTION 'Product business_id (%) does not match category business_id (%).', NEW.business_id, category_business_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Create a trigger to call the function before insert or update on products table
CREATE TRIGGER trg_check_product_category_business_id
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_category_business_id();
