BEGIN;
  TRUNCATE message, 
  portal
  RESTART IDENTITY CASCADE;

  INSERT INTO portal (id)
    VALUES ('fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'), 
    ('bd0e943f-ad24-44f7-be27-10bdfba016c1'), 
    ('6551b75b-4933-4f27-9293-198d9998b770');

  INSERT INTO message (content, author, create_timestamp, portal_id)
    VALUES 
      ('Super awesome message', 'James', now() - INTERVAL '1 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '1 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Jim', now() - INTERVAL '2 DAYS', 'bd0e943f-ad24-44f7-be27-10bdfba016c1'),
      ('Super awesome message', 'John', now() - INTERVAL '2 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Joey', now() - INTERVAL '2 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Jack', now() - INTERVAL '2 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Joey', now() - INTERVAL '2 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Jim', now() - INTERVAL '3 DAYS', 'bd0e943f-ad24-44f7-be27-10bdfba016c1'),
      ('Super awesome message', 'James', now() - INTERVAL '3 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '4 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '5 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Tom', now() - INTERVAL '6 DAYS', 'bd0e943f-ad24-44f7-be27-10bdfba016c1'),
      ('Super awesome message', 'James', now() - INTERVAL '6 DAYS', 'bd0e943f-ad24-44f7-be27-10bdfba016c1'),
      ('Super awesome message', 'James', now() - INTERVAL '7 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Sally', now() - INTERVAL '7 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Sally', now() - INTERVAL '8 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'Jim', now() - INTERVAL '9 DAYS', 'bd0e943f-ad24-44f7-be27-10bdfba016c1'),
      ('Super awesome message', 'Sally', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98'),
      ('Super awesome message', 'James', now() - INTERVAL '10 DAYS', 'fed4a91b-300f-4a62-bfe5-63b2bfcc3f98');

COMMIT;