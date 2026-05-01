-- Defense-in-depth: explicit restrictive policy preventing non-admins from inserting/updating user_roles
CREATE POLICY "Restrict role mutations to admins only"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));