-- Allow users to update their own palm readings (needed for is_shared toggle)
CREATE POLICY "Users update own palm readings"
ON public.palm_reading_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);