UPDATE public.audio_library
SET audio_url = CASE id
  WHEN '408951f4-e377-4d81-933e-3f00856c80e2'::uuid THEN 'https://archive.org/download/ghar-mein-padharo-gajanan-ji_202409/Ghar-Mein-Padharo-Gajanan-Ji.mp3'
  WHEN '4eed1a33-235c-4ee1-9e1e-73f01de5a880'::uuid THEN 'https://archive.org/download/fptu_aarti-keejei-hanuman-lala-ki/AartiKeejeiHanumanLalaKi.mp3'
  ELSE audio_url
END,
url_status = 'ok',
content_type = 'audio/mpeg',
last_error = NULL,
last_checked_at = now()
WHERE id IN (
  '517fa897-3f5a-49de-b3f3-f6a9fea99bf1', 'fdb7f6d2-bdf1-47f9-989f-6de1c2a97d0f',
  'fe0173e9-6ee4-48c2-a60f-bd970428672e', '81847946-824b-4703-802c-2164b1b902a9',
  '1fcf00ca-aad9-4c48-b0d5-93124b16e00e', '52347bcc-2fcc-444d-b92f-f59ec478f0e0',
  '72d4a0ed-960a-4940-a25e-91237b38c70e', '20c27b95-ea66-4804-a1dc-cc3ba9f27082',
  '0eb88009-8c68-4661-b4ae-aa005b17b701', '4eed1a33-235c-4ee1-9e1e-73f01de5a880',
  'a72b9712-4621-4567-8600-d03ed72701d0', '408951f4-e377-4d81-933e-3f00856c80e2'
);