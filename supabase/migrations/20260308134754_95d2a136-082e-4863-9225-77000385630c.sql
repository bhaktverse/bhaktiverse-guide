ALTER TABLE palm_reading_history ADD COLUMN IF NOT EXISTS user_name varchar(255);
ALTER TABLE palm_reading_history ADD COLUMN IF NOT EXISTS user_dob date;