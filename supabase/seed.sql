-- Sample shop items for Rondje Rekenen
insert into shop_items (name, category, cost, asset_key) values
  ('Rode pet',        'hat',         20, 'hat_red'),
  ('Blauwe muts',     'hat',         30, 'hat_blue'),
  ('Toverhoed',       'hat',         80, 'hat_wizard'),
  ('Geel shirt',      'shirt',       25, 'shirt_yellow'),
  ('Gestreept shirt', 'shirt',       40, 'shirt_stripe'),
  ('Superheldcape',   'shirt',      100, 'shirt_cape'),
  ('Zonnebril',       'accessory',   35, 'acc_sunglasses'),
  ('Strik',           'accessory',   20, 'acc_bowtie'),
  ('Gouden ketting',  'accessory',   90, 'acc_chain')
on conflict do nothing;
