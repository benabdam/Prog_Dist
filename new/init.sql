drop table if exists products cascade;
drop table if exists orders cascade;
drop table if exists order_items cascade;
drop table if exists stocks cascade;
drop table if exists favori cascade;
drop table if exists panier cascade;



CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  p_name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  descrip VARCHAR(255),
  img VARCHAR(255)
);

create table panier(
  user_id BIGINT NOT NULL,
  product_id integer NOT NULL,
  size VARCHAR(50) NOT NULL,
  quantite INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);


create table favori(
  id BIGINT,--user
  p_id integer NOT NULL,--product
  size VARCHAR(50) NOT NULL,
  quantite INTEGER NOT NULL,
  FOREIGN KEY (p_id) REFERENCES products(id)
);

CREATE TABLE orders(
  id SERIAL PRIMARY KEY,
  email varchar(255) NOT NULL,
  rue VARCHAR(255) NOT NULL,
  zip varchar(50) NOT NULL,
  city varchar(255) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  total_quantity INTEGER NOT NULL,
  phone INTEGER NOT NULL,
  id_client BIGINT NOT NULL
);

CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (order_id,product_id),
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);


CREATE TABLE stocks(
  taille VARCHAR(50),
  nb_stock INTEGER,
  id_prod INTEGER,
  PRIMARY KEY(taille, id_prod),
  FOREIGN KEY (id_prod) REFERENCES products(id)
);



INSERT INTO products (p_name,price,descrip,img) VALUES
('pantalon',30,'Pantalon 100% coton','media/1.jpg'),
('pantalon',35,'Pantalon Jeans','media/2.jpg'),
('pantalon',29,'Pantalon Jeans noir','media/3.webp'),
('pantalon',40,'Pantalon Coton rouge','media/4.jpg'),
('pantalon',39,'Pantalon 100 Coton bleu','media/5.jpeg'),
('pantalon',32,'Pantalon Jeans','media/6.webp'),
('pantalon',31,'Pantalon Jeans blue','media/7.jpg'),
('chemise',25,'Chemise 100% Coton Bleu','media/8.webp'),
('chemise',27,'Chemise 100% Coton noir','media/9.webp'),
('chemise',27,'Chemise 100% Coton grise','media/10.webp'),
('chemise',29,'Chemise 100% Coton verte','media/11.webp'),
('chemise',35,'Chemise blanche','media/12.jpg'),
('chemise',30,'Chemise Coton','media/13.webp'),
('sweat',40,'Sweat-shirt zippé à message','media/14.webp'),
('sweat',50,'Sweat-shirt maille capuche','media/15.webp'),
('sweat',45,'Sweat-shirt tissu éponge coton','media/16.webp'),
('sweat',43,'Sweat-shirt tissu éponge coton','media/17.webp'),
('veste',70,'Veste légère','media/18.webp'),
('veste',55,'Veste cuir noir','media/19.jpg'),
('veste',50,'Veste Jeans','media/20.webp'),
('veste',60,'Veste Jeans','media/21.webp'),
('veste',57,'Veste légère Nouvelle Collection','media/22.webp'),
('costume',90,'Costume noir Coton','media/23.webp'),
('costume',95,'Costume Collection 2023','media/24.webp'),
('costume',100,'Costume bleu','media/25.webp'),
('pantalon costume',30,'Pantalon Costume noir Coton','media/26.webp'),--
('costume',105,'Costume Dark blue','media/27.webp'),
('pantalon costume',40,'Pantalon Costume bleu','media/28.webp'),--
('chaussures',30,'Mocassin noir','media/29.webp'),
('chaussures',33,'Mocassin beige','media/30.webp'),
('chaussures',31,'NOORS - Baskets basses','media/31.webp'),
('chaussures',32,'Mocassin noir','media/32.webp'),
('chaussures',35,'New Balance - Baskets','media/33.webp'),
('ceinture',15,'Ceinture beige cuir','media/34.webp'),
('ceinture',15,'Ceinture noir cuir','media/35.webp'),
('ceinture',15,'ceinture-en-surpiquee','media/36.jpg'),
('papillon',5,'SET','media/37.webp'),
('papillon',7,'Papillon ','media/38.webp'),
('papillon',6,'Papillon bleu','media/39.jpg'),
('papillon',7,'Papillon noir','media/40.webp'),
('cravate',10,'Cravate noire','media/41.webp'),
('cravate',10,'Cravate Coton','media/42.jpeg'),
('combinaison',100,'Chemise-cravate','media/43.webp'),
('combinaison',150,'Pantalon-chemise','media/44.webp'),
('combinaison',140,'Combinaison business','media/45.webp');

--pantalon
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',20,1),
('M',15,1),
('L',10,1);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',10,2),
('M',11,2),
('L',10,2);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',19,3),
('M',10,3),
('L',3,3);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',18,4),
('M',23,4),
('L',12,4);


INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',12,5),
('M',14,5),
('L',0,5);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',10,6),
('M',5,6),
('L',8,6);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',5,7),
('M',15,7),
('L',1,7);

--chemise
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',5,8),
('M',15,8),
('L',8,8);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',20,9),
('M',25,9),
('L',5,9);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',22,10),
('M',17,10),
('L',9,10);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',12,11),
('M',8,11),
('L',0,11);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',16,12),
('M',17,12),
('L',20,12);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',22,13),
('M',11,13),
('L',2,13);

--sweat
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',20,14),
('M',15,14),
('L',10,14);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',7,15),
('M',9,15),
('L',15,15);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',18,16),
('M',20,16),
('L',19,16);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',19,17),
('M',15,17),
('L',10,17);

--veste
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',20,18),
('M',15,18),
('L',10,18);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',40,19),
('M',15,19),
('L',20,19);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',16,20),
('M',2,20),
('L',19,20);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',19,21),
('M',17,21),
('L',10,21);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',20,22),
('M',15,22),
('L',10,22);

--costume
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',8,23),
('M',9,23),
('L',5,23);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',11,24),
('M',5,24),
('L',8,24);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',17,25),
('M',4,25),
('L',3,25);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',4,26),
('M',6,26),
('L',8,26);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',15,27),
('M',12,27),
('L',10,27);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',19,28),
('M',17,28),
('L',18,28);

--chaussure
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('39',19,29),
('41',16,29),
('42',17,29);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('40',20,30),
('41',15,30),
('42',10,30);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('40',20,31),
('42',15,31),
('43',10,31);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('39',20,32),
('40',15,32),
('41',10,32);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('39',20,33),
('40',15,33),
('41',10,33);

--ceinture

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Taille unique',20,34);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Taille unique',20,35);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Taille unique',20,36);

--papillon
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,37);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,38);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,39);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,40);
--cravate
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,41);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('Sans taille',20,42);

--combinaisons
INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',1,43),
('M',5,43),
('L',7,43);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',8,44),
('M',4,44),
('L',9,44);

INSERT INTO stocks (taille, nb_stock, id_prod) VALUES
('S',7,45),
('M',6,45),
('L',2,45);



