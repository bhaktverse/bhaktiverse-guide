UPDATE public.audio_library
SET url_status = 'ok',
    content_type = CASE
      WHEN audio_url ILIKE '%.ogg' THEN 'application/ogg'
      ELSE COALESCE(content_type, 'audio/mpeg')
    END,
    last_error = NULL,
    last_checked_at = now()
WHERE id IN (
  'fe0173e9-6ee4-48c2-a60f-bd970428672e', '968d8e7a-5075-4ee9-96ec-7eda932ddef6',
  'e2d45d9d-b8db-4c24-a0b6-d60fab6ee797', '853fd52c-1336-4d89-843a-a7dcc92ca16b',
  'd00ee794-aadf-43e4-97e6-f32e32c91bd8', '87c682aa-0abf-4a62-a387-1b727d73a7e3',
  'f9cd83e6-704b-48c4-8a52-b468da7aab05', 'a3d0dd6a-65b9-44b4-bb64-9b2e47562d11',
  '79c95d6c-b38e-4cb4-9524-0f7243c3bc79', 'a8f89503-17f3-4181-9e6d-d66699570da3',
  'c1c4c34e-7283-4964-95b9-f6c8860df77a', 'a76d5e43-5544-4e42-937f-865abbfc29d9',
  'e86d89f0-2550-4e61-90f7-095b725baae8', '85175a98-7742-4012-a3e3-c9727062f679',
  '9a1d4703-073c-4264-9b7b-bae4326df760', 'e04df17d-48eb-4a3b-b4ca-8b79cd34b538',
  '9bdf4063-33c1-4097-84a6-982f1b5bbb58', 'ecaf0f85-0b0d-42cf-91e3-6fe31ca88adf',
  'be2ea986-2ed8-4a40-996a-3184dc920112', '8d98a3e4-8de6-474b-87c8-755d36b55280',
  '7575b9d9-ad93-43c5-8d04-a0a0991b2817', 'bacba494-967c-451b-a377-2e3af7ac1124',
  '46287749-b6c9-483c-8ebb-003592293802', 'a7a3e72a-13b2-4e3f-a52e-526f4231a54e',
  '7f220db1-9c90-4671-84f2-7d4642f5ff24'
)
AND url_status = 'broken';