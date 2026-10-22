UPDATE public.audio_library
SET audio_url = CASE id
  WHEN '517fa897-3f5a-49de-b3f3-f6a9fea99bf1'::uuid THEN 'https://archive.org/download/Ramayana_721/4KISHKANYAA_KANDA.mp3'
  WHEN 'fdb7f6d2-bdf1-47f9-989f-6de1c2a97d0f'::uuid THEN 'https://archive.org/download/BestKrishnaBhajan1-151/Aas%20Rakho%20Satguru%20Ki.mp3'
  WHEN 'fe0173e9-6ee4-48c2-a60f-bd970428672e'::uuid THEN 'https://archive.org/download/AchyutamKeshavam/Achyutam%20Keshavam.mp3'
  WHEN '81847946-824b-4703-802c-2164b1b902a9'::uuid THEN 'https://archive.org/download/BhagawanSatyaSaiBabaSingsBhajans/Baba%20Sings%20Volume_1%2FTrack%2013Shivaya%20parameshwaraya.mp3'
  WHEN '1fcf00ca-aad9-4c48-b0d5-93124b16e00e'::uuid THEN 'https://archive.org/download/01-bajrang-baan/01%20-%20Bajrang%20Baan.mp3'
  WHEN '52347bcc-2fcc-444d-b92f-f59ec478f0e0'::uuid THEN 'https://archive.org/download/HindiBhajanmp3-HanumanChalisaAartiyaan/6-aartiKeejeHanumanLalaKiaarti-Vol-3.mp3'
  WHEN '72d4a0ed-960a-4940-a25e-91237b38c70e'::uuid THEN 'https://archive.org/download/radio-ceylon-08-08-2021-sunday-morning-/Radio%20Ceylon%2008-08-2021~Sunday%20Morning~01%20Bhakti%20Sangeet%20-.mp3'
  WHEN '20c27b95-ea66-4804-a1dc-cc3ba9f27082'::uuid THEN 'https://archive.org/download/VishnuSahasranamamSooryagayathri/Vishnu%20Sahasranamam-Sooryagayathri.mp3'
  WHEN '0eb88009-8c68-4661-b4ae-aa005b17b701'::uuid THEN 'https://archive.org/download/sunderkand4/Sunderkand%20-%201.mp3'
  WHEN '4eed1a33-235c-4ee1-9e1e-73f01de5a880'::uuid THEN 'https://archive.org/download/fptu_aarti-keejei-hanuman-lala-ki/AartiKeejeiHanumanLalaKi.mp3'
  WHEN 'a72b9712-4621-4567-8600-d03ed72701d0'::uuid THEN 'https://archive.org/download/05-shri-hanuman-chalisa/05%20SHRI%20HANUMAN%20CHALISA.mp3'
  ELSE audio_url
END,
url_status = CASE WHEN id = '4eed1a33-235c-4ee1-9e1e-73f01de5a880'::uuid THEN 'broken' ELSE 'ok' END,
content_type = CASE WHEN id = '4eed1a33-235c-4ee1-9e1e-73f01de5a880'::uuid THEN content_type ELSE 'audio/mpeg' END,
last_error = CASE WHEN id = '4eed1a33-235c-4ee1-9e1e-73f01de5a880'::uuid THEN 'Awaiting successful ranged audio verification' ELSE NULL END,
last_checked_at = now()
WHERE id IN (
  '517fa897-3f5a-49de-b3f3-f6a9fea99bf1', 'fdb7f6d2-bdf1-47f9-989f-6de1c2a97d0f',
  'fe0173e9-6ee4-48c2-a60f-bd970428672e', '81847946-824b-4703-802c-2164b1b902a9',
  '1fcf00ca-aad9-4c48-b0d5-93124b16e00e', '52347bcc-2fcc-444d-b92f-f59ec478f0e0',
  '72d4a0ed-960a-4940-a25e-91237b38c70e', '20c27b95-ea66-4804-a1dc-cc3ba9f27082',
  '0eb88009-8c68-4661-b4ae-aa005b17b701', '4eed1a33-235c-4ee1-9e1e-73f01de5a880',
  'a72b9712-4621-4567-8600-d03ed72701d0'
);