-- Import processed product data
USE ai_recommendation_db;

-- Insert categories
INSERT IGNORE INTO categories (category_name, description) VALUES ('Art Supplies', 'Products in Art Supplies category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Clothing - Footwear', 'Products in Clothing - Footwear category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Food - Baking Goods', 'Products in Food - Baking Goods category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Food - Condiments', 'Products in Food - Condiments category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Food - Snacks', 'Products in Food - Snacks category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Home', 'Products in Home category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Pets', 'Products in Pets category');
INSERT IGNORE INTO categories (category_name, description) VALUES ('Travel', 'Products in Travel category');

-- Insert products
INSERT IGNORE INTO products (name, category_id, price, description, brand, rating, image_url, stock_quantity, is_active) VALUES
('Inspirational Wall Art', (SELECT category_id FROM categories WHERE category_name = 'Home'), 932.46, 'tempus vel pede morbi porttitor lorem id ligula suspendisse ornare consequat lectus in est risus auctor sed tristique in', 'Fivebridge', 3.4, 'http://dummyimage.com/244x100.png/cc0000/ffffff', 100, true),
('Mango Chutney', (SELECT category_id FROM categories WHERE category_name = 'Food - Condiments'), 138.39, 'mi integer ac neque duis bibendum morbi non quam nec dui luctus rutrum', 'Abata', 4.3, 'http://dummyimage.com/183x100.png/cc0000/ffffff', 100, true),
('Travel Pillow', (SELECT category_id FROM categories WHERE category_name = 'Travel'), 967.81, 'id consequat in consequat ut nulla sed accumsan felis ut at', 'Dabtype', 1.8, 'http://dummyimage.com/245x100.png/cc0000/ffffff', 100, true),
('Gluten-Free Pancake Mix', (SELECT category_id FROM categories WHERE category_name = 'Food - Baking Goods'), 920.89, 'sed vestibulum sit amet cursus id turpis integer aliquet massa id lobortis convallis tortor risus dapibus', 'Devbug', 3.3, 'http://dummyimage.com/220x100.png/dddddd/000000', 100, true),
('Dog Collar', (SELECT category_id FROM categories WHERE category_name = 'Pets'), 238.65, 'tellus in sagittis dui vel nisl duis ac nibh fusce lacus purus aliquet at feugiat non pretium quis lectus suspendisse', 'Devbug', 4.5, 'http://dummyimage.com/135x100.png/dddddd/000000', 100, true),
('Handheld Garment Steamer', (SELECT category_id FROM categories WHERE category_name = 'Home'), 936.36, 'fermentum justo nec condimentum neque sapien placerat ante nulla justo aliquam quis turpis eget elit', 'Browsezoom', 3.8, 'http://dummyimage.com/103x100.png/5fa2dd/ffffff', 100, true),
('Spinach Artichoke Dip', (SELECT category_id FROM categories WHERE category_name = 'Food - Snacks'), 988.9, 'donec ut dolor morbi vel lectus in quam fringilla rhoncus mauris', 'Gabspot', 2.3, 'http://dummyimage.com/115x100.png/5fa2dd/ffffff', 100, true),
('Canvas High-Top Sneakers', (SELECT category_id FROM categories WHERE category_name = 'Clothing - Footwear'), 314.04, 'nisl nunc nisl duis bibendum felis sed interdum venenatis turpis enim blandit mi in porttitor pede justo eu massa donec', 'Ozu', 2.2, 'http://dummyimage.com/217x100.png/dddddd/000000', 100, true),
('Soft Plush Throw Blanket', (SELECT category_id FROM categories WHERE category_name = 'Home'), 571.08, 'sit amet nulla quisque arcu libero rutrum ac lobortis vel dapibus at diam nam tristique tortor', 'Browsebug', 4.4, 'http://dummyimage.com/168x100.png/cc0000/ffffff', 100, true),
('Digital Drawing Tablet', (SELECT category_id FROM categories WHERE category_name = 'Art Supplies'), 944.38, 'turpis enim blandit mi in porttitor pede justo eu massa donec dapibus duis at velit eu est', 'Topicshots', 3.4, 'http://dummyimage.com/165x100.png/cc0000/ffffff', 100, true);

