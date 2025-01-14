-- tabels
-- 1. users
create table users(
  id serial primary key,
  name varchar(100),
  email text
);

-- 2. books
create table books(
    isbn varchar(20) primary key,
    title text,
    author varchar(100),
    summary text,
    cover_url text,
    amazon_url text
);

-- 3. reviews
-- timestamp value example
create table reviews(
  id serial primary key,
  review text,
  rating integer,
  create_date timestamp,
  update_date timestamp,
  book_id varchar(20) references books(isbn)
);

-- relationship tables

-- many to many relationship between users and books table
-- one user can read multiple books
-- one book is read by multiple users
create table user_book(
  user_id integer references users(id),
  book_id varchar(20) references books(isbn),
  primary key(user_id,book_id) 
);


-- one to many relationship between users and reviews table. One user can write many reviews for multiple books. 
-- One review can't be written by multiple users
create table user_review( 
  user_id integer references users(id),
  review_id integer references reviews(id), 
  primary key(user_id,review_id) 
);

-- ********** NOT REQUIRED AS OF NOW *********
-- one to many or many to one relationship between book and review table
-- one book can have multiple reviews written by multiple users
-- one review can't include multiple books reviews
create book_review(
 id serial primary key,
 review_id integer references reviews(id)
);

-- insert sample data into tables
insert into users(name, email) values('Wahdat','Safia','wahdat.safia@gmail.com'), ('Safia','Rashid','safia.rashid@gmail.com');

insert into books(isbn,title,author,summary,cover_url,amazon_url) values ('978-0123-189-234','Harry Potter - Goblet of Fire','J.K. Rowling',
'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
'https://covers.openlibrary.org/b/isbn/0385472579-M.jpg','https://amazon.com/'), 
('978-0123-189-897','Harry Potter - Prisoners of Azkaban','J.K. Rowling',
'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
'https://covers.openlibrary.org/b/isbn/0385472579-M.jpg','https://amazon.com/'), 
('978-0123-189-389','Harry Potter - The socceres stone','J.K. Rowling',
 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385l/40121378._SY500_.jpg',
  'https://amazon.com/'); 


insert into reviews(review, rating, create_date, update_date, book_id) values('A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
8,'Aug 12, 2023','Aug 12, 2023','978-0123-189-234'), 
('A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.', 
8,'Aug 12, 2023','Aug 12, 2023','978-0123-189-897'),  
('A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.', 
8,'Aug 12, 2023','Aug 12, 2023','978-0123-189-389');

insert into user_book(user_id, book_id) values(1, '978-0123-189-234'), (1, '978-0123-189-897'), (1, '978-0123-189-389');

-- query get all books and their reviews read by a particular user

select * from books b
join reviews r
on r.book_id = b.isbn
where b.isbn in (
  select book_id 
  from user_book
  where user_id = currentUserId);

select name, email
from users
where id = currentUserId;


select b.isbn, b.title, b.author, b.summary, b.cover_url, b.amazon_url, r.review, r.rating, r.create_date 
from books b
join reviews r
on r.book_id = b.isbn
where b.isbn in (
  select book_id 
  from user_book
  where user_id = 1);
