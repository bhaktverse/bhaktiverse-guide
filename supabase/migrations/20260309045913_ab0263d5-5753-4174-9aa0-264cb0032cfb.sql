DROP POLICY IF EXISTS "Users update own palm readings" ON palm_reading_history;
CREATE POLICY "Users update own palm readings" ON palm_reading_history
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);