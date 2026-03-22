INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public avatar read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "User avatar upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
CREATE POLICY "User avatar update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
