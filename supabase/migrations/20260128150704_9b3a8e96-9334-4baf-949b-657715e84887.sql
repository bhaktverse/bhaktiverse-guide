-- Allow users to delete their own playlists
CREATE POLICY "Delete own playlists" 
ON public.playlists 
FOR DELETE 
USING (auth.uid() = user_id);