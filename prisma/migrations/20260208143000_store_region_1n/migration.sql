-- Change store-region relation from 1:1 to 1:N

ALTER TABLE store
  DROP FOREIGN KEY fk_store_region;

-- Drop the unique index that enforced 1:1
ALTER TABLE store
  DROP INDEX region_id;

-- Add a non-unique index for FK + performance
ALTER TABLE store
  ADD INDEX idx_store_region_id (region_id);

-- Re-add FK
ALTER TABLE store
  ADD CONSTRAINT fk_store_region
  FOREIGN KEY (region_id)
  REFERENCES region(region_id);
