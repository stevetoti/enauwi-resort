-- Allow decimal discount percentages (e.g. 9.4%)
-- Previously INTEGER which forced whole numbers only

-- room_discounts table
ALTER TABLE room_discounts
  DROP CONSTRAINT IF EXISTS room_discounts_discount_percent_check;

ALTER TABLE room_discounts
  ALTER COLUMN discount_percent TYPE NUMERIC(5,2);

ALTER TABLE room_discounts
  ADD CONSTRAINT room_discounts_discount_percent_check
  CHECK (discount_percent > 0 AND discount_percent <= 100);

-- bookings table — discount_percent on each booking
ALTER TABLE bookings
  ALTER COLUMN discount_percent TYPE NUMERIC(5,2) USING discount_percent::NUMERIC(5,2);

-- invoices table — discount_percent shown on invoice
ALTER TABLE invoices
  ALTER COLUMN discount_percent TYPE NUMERIC(5,2) USING discount_percent::NUMERIC(5,2);
