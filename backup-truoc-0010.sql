--
-- PostgreSQL database dump
--

\restrict 5CctqxY9IU4K6oPw3lhB4y2ozKQfUtIXVUxNlxDO4By0MJI2JgEpHUpj30jLEAf

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: book_request_status; Type: TYPE; Schema: public; Owner: bookstore
--

CREATE TYPE public.book_request_status AS ENUM (
    'pending',
    'available',
    'rejected'
);


ALTER TYPE public.book_request_status OWNER TO bookstore;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: bookstore
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'shipping',
    'completed',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO bookstore;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: bookstore
--

CREATE TYPE public.payment_method AS ENUM (
    'cod',
    'bank_transfer'
);


ALTER TYPE public.payment_method OWNER TO bookstore;

--
-- Name: reservation_status; Type: TYPE; Schema: public; Owner: bookstore
--

CREATE TYPE public.reservation_status AS ENUM (
    'active',
    'converted',
    'cancelled',
    'expired'
);


ALTER TYPE public.reservation_status OWNER TO bookstore;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: bookstore
--

CREATE TYPE public.user_role AS ENUM (
    'buyer',
    'admin'
);


ALTER TYPE public.user_role OWNER TO bookstore;

--
-- Name: immutable_unaccent(text); Type: FUNCTION; Schema: public; Owner: bookstore
--

CREATE FUNCTION public.immutable_unaccent(text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$ SELECT public.unaccent('public.unaccent', $1) $_$;


ALTER FUNCTION public.immutable_unaccent(text) OWNER TO bookstore;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    recipient character varying(120) NOT NULL,
    phone character varying(20) NOT NULL,
    line character varying(255) NOT NULL,
    ward character varying(100) NOT NULL,
    district character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.addresses OWNER TO bookstore;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO bookstore;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO bookstore;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.authors (
    id integer NOT NULL,
    name character varying(160) NOT NULL,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.authors OWNER TO bookstore;

--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authors_id_seq OWNER TO bookstore;

--
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- Name: book_authors; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.book_authors (
    book_id integer NOT NULL,
    author_id integer NOT NULL,
    "position" smallint DEFAULT '0'::smallint NOT NULL
);


ALTER TABLE public.book_authors OWNER TO bookstore;

--
-- Name: book_images; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.book_images (
    id integer NOT NULL,
    book_id integer NOT NULL,
    url character varying(500) NOT NULL,
    "position" smallint DEFAULT '0'::smallint NOT NULL
);


ALTER TABLE public.book_images OWNER TO bookstore;

--
-- Name: book_images_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.book_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_images_id_seq OWNER TO bookstore;

--
-- Name: book_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.book_images_id_seq OWNED BY public.book_images.id;


--
-- Name: book_requests; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.book_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255),
    note text,
    status public.book_request_status NOT NULL,
    admin_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.book_requests OWNER TO bookstore;

--
-- Name: book_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.book_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_requests_id_seq OWNER TO bookstore;

--
-- Name: book_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.book_requests_id_seq OWNED BY public.book_requests.id;


--
-- Name: books; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.books (
    id integer NOT NULL,
    category_id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(280) NOT NULL,
    author character varying(255),
    publisher character varying(255),
    published_year smallint,
    cost_price bigint DEFAULT '0'::bigint NOT NULL,
    sale_price bigint NOT NULL,
    condition_pct smallint NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, public.immutable_unaccent((((title)::text || ' '::text) || (COALESCE(author, ''::character varying))::text)))) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_books_condition CHECK (((condition_pct >= 10) AND (condition_pct <= 100))),
    CONSTRAINT ck_books_cost_price CHECK ((cost_price >= 0)),
    CONSTRAINT ck_books_quantity CHECK ((quantity >= 0)),
    CONSTRAINT ck_books_sale_price CHECK ((sale_price >= 0))
);


ALTER TABLE public.books OWNER TO bookstore;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_id_seq OWNER TO bookstore;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.cart_items (
    cart_id integer NOT NULL,
    book_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT ck_cart_items_quantity CHECK ((quantity >= 1))
);


ALTER TABLE public.cart_items OWNER TO bookstore;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carts OWNER TO bookstore;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO bookstore;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(140) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO bookstore;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO bookstore;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    book_id integer NOT NULL,
    title_snapshot character varying(255) NOT NULL,
    unit_price bigint NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO bookstore;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO bookstore;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    from_status public.order_status,
    to_status public.order_status NOT NULL,
    actor_id integer,
    at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO bookstore;

--
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_id_seq OWNER TO bookstore;

--
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    user_id integer NOT NULL,
    status public.order_status NOT NULL,
    payment_method public.payment_method NOT NULL,
    ship_recipient character varying(120) NOT NULL,
    ship_phone character varying(20) NOT NULL,
    ship_address text NOT NULL,
    subtotal bigint NOT NULL,
    shipping_fee bigint DEFAULT '0'::bigint NOT NULL,
    total bigint NOT NULL,
    note text,
    cancelled_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO bookstore;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO bookstore;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO bookstore;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO bookstore;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    book_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    status public.reservation_status NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_reservations_quantity CHECK ((quantity >= 1))
);


ALTER TABLE public.reservations OWNER TO bookstore;

--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_id_seq OWNER TO bookstore;

--
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email public.citext NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(120) NOT NULL,
    phone character varying(20),
    role public.user_role DEFAULT 'buyer'::public.user_role NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO bookstore;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO bookstore;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- Name: book_images id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_images ALTER COLUMN id SET DEFAULT nextval('public.book_images_id_seq'::regclass);


--
-- Name: book_requests id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_requests ALTER COLUMN id SET DEFAULT nextval('public.book_requests_id_seq'::regclass);


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.addresses (id, user_id, recipient, phone, line, ward, district, province, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.alembic_version (version_num) FROM stdin;
0009
\.


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.authors (id, name, bio, created_at, updated_at) FROM stdin;
1	Antoine de Saint-Exupéry	\N	2026-11-06 14:57:20.06854+00	2026-11-06 14:57:20.06854+00
2	Dale Carnegie	\N	2026-11-06 14:57:20.06854+00	2026-11-06 14:57:20.06854+00
3	Paulo Coelho	\N	2026-11-06 14:57:20.06854+00	2026-11-06 14:57:20.06854+00
4	Tô Hoài	\N	2026-11-06 14:57:20.06854+00	2026-11-06 14:57:20.06854+00
\.


--
-- Data for Name: book_authors; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.book_authors (book_id, author_id, "position") FROM stdin;
1	4	0
2	3	0
3	2	0
4	1	0
7	1	0
\.


--
-- Data for Name: book_images; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.book_images (id, book_id, url, "position") FROM stdin;
1	7	/media/books/81b6654a9d0040c6aa1df575053e96b0.webp	0
\.


--
-- Data for Name: book_requests; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.book_requests (id, user_id, title, author, note, status, admin_note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.books (id, category_id, title, slug, author, publisher, published_year, cost_price, sale_price, condition_pct, description, quantity, is_visible, created_at, updated_at) FROM stdin;
1	1	Dế Mèn phiêu lưu ký	de-men-phieu-luu-ky	Tô Hoài	\N	\N	35000	55000	80	Sách cũ: Dế Mèn phiêu lưu ký.	1	t	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
2	1	Nhà giả kim	nha-gia-kim	Paulo Coelho	\N	\N	40000	65000	85	Sách cũ: Nhà giả kim.	1	t	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
3	2	Đắc nhân tâm	dac-nhan-tam	Dale Carnegie	\N	\N	45000	70000	75	Sách cũ: Đắc nhân tâm.	2	t	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
4	3	Hoàng tử bé	hoang-tu-be	Antoine de Saint-Exupéry	\N	\N	30000	50000	90	Sách cũ: Hoàng tử bé.	1	t	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
7	6	Chủ nghĩa khắc kỷ	chu-nghia-khac-ky	Antoine de Saint-Exupéry	\N	2000	1000	0	80	\N	2	t	2026-11-06 15:37:28.399654+00	2026-11-06 15:37:28.399654+00
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.cart_items (cart_id, book_id, quantity) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.carts (id, user_id, created_at, updated_at) FROM stdin;
1	1	2026-11-04 15:54:41.271573+00	2026-11-04 15:54:41.271573+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.categories (id, name, slug, created_at, updated_at) FROM stdin;
1	Văn học	van-hoc	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
3	Thiếu nhi	thieu-nhi	2026-11-04 15:52:36.037529+00	2026-11-04 15:52:36.037529+00
4	test	test	2026-11-05 23:24:39.065909+00	2026-11-05 23:24:39.065909+00
2	Kỹ năng 123	ky-nang-123	2026-11-04 15:52:36.037529+00	2026-11-06 00:14:06.176548+00
5	Truyện trinh thám	truyen-trinh-tham	2026-11-06 00:22:07.180254+00	2026-11-06 00:22:07.180254+00
6	Kỹ năng sốn	ky-nang-son	2026-11-06 00:22:15.592507+00	2026-11-06 00:22:15.592507+00
7	Self-help	self-help	2026-11-06 00:22:24.819292+00	2026-11-06 00:22:24.819292+00
8	Lịch sử	lich-su	2026-11-06 00:22:32.922674+00	2026-11-06 00:22:32.922674+00
9	Tiểu thuyết	tieu-thuyet	2026-11-06 00:22:43.734438+00	2026-11-06 00:22:43.734438+00
10	IT	it	2026-11-06 00:23:05.433213+00	2026-11-06 00:23:05.433213+00
11	test2	test2	2026-11-06 00:23:12.294931+00	2026-11-06 00:23:12.294931+00
12	test3	test3	2026-11-06 00:23:23.22858+00	2026-11-06 00:23:23.22858+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.order_items (id, order_id, book_id, title_snapshot, unit_price, quantity) FROM stdin;
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.order_status_history (id, order_id, from_status, to_status, actor_id, at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.orders (id, code, user_id, status, payment_method, ship_recipient, ship_phone, ship_address, subtotal, shipping_fee, total, note, cancelled_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.reservations (id, user_id, book_id, quantity, status, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.users (id, email, password_hash, full_name, phone, role, is_locked, created_at, updated_at) FROM stdin;
1	admin@example.com	$2b$12$fPN1C8hBd/bXJNS0xoR1FOP4sld00MMi5es9ZJfq3VWMKLu7Jh/a.	Admin	\N	admin	f	2026-11-04 15:49:48.675296+00	2026-11-04 15:52:25.7107+00
\.


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.authors_id_seq', 8, true);


--
-- Name: book_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.book_images_id_seq', 1, true);


--
-- Name: book_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.book_requests_id_seq', 1, false);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.books_id_seq', 7, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.categories_id_seq', 12, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.reservations_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: book_authors book_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_pkey PRIMARY KEY (book_id, author_id);


--
-- Name: book_images book_images_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_images
    ADD CONSTRAINT book_images_pkey PRIMARY KEY (id);


--
-- Name: book_requests book_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_requests
    ADD CONSTRAINT book_requests_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: books books_slug_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_slug_key UNIQUE (slug);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id, book_id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_code_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_code_key UNIQUE (code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_addresses_user_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_addresses_user_id ON public.addresses USING btree (user_id);


--
-- Name: ix_authors_name_trgm; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_authors_name_trgm ON public.authors USING gin (public.immutable_unaccent((name)::text) public.gin_trgm_ops);


--
-- Name: ix_book_authors_author_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_book_authors_author_id ON public.book_authors USING btree (author_id);


--
-- Name: ix_book_images_book_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_book_images_book_id ON public.book_images USING btree (book_id);


--
-- Name: ix_book_requests_user_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_book_requests_user_id ON public.book_requests USING btree (user_id);


--
-- Name: ix_books_author_trgm; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_books_author_trgm ON public.books USING gin (public.immutable_unaccent((COALESCE(author, ''::character varying))::text) public.gin_trgm_ops);


--
-- Name: ix_books_category_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_books_category_id ON public.books USING btree (category_id);


--
-- Name: ix_books_search_vector; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_books_search_vector ON public.books USING gin (search_vector);


--
-- Name: ix_books_title_trgm; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_books_title_trgm ON public.books USING gin (public.immutable_unaccent((title)::text) public.gin_trgm_ops);


--
-- Name: ix_order_items_book_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_order_items_book_id ON public.order_items USING btree (book_id);


--
-- Name: ix_order_items_order_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: ix_order_status_history_order_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_order_status_history_order_id ON public.order_status_history USING btree (order_id);


--
-- Name: ix_orders_status; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_orders_status ON public.orders USING btree (status);


--
-- Name: ix_orders_user_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: ix_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- Name: ix_reservations_book_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_reservations_book_id ON public.reservations USING btree (book_id);


--
-- Name: ix_reservations_status_expires_at; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_reservations_status_expires_at ON public.reservations USING btree (status, expires_at);


--
-- Name: ix_reservations_user_id; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE INDEX ix_reservations_user_id ON public.reservations USING btree (user_id);


--
-- Name: uq_addresses_one_default_per_user; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE UNIQUE INDEX uq_addresses_one_default_per_user ON public.addresses USING btree (user_id) WHERE is_default;


--
-- Name: uq_authors_name_norm; Type: INDEX; Schema: public; Owner: bookstore
--

CREATE UNIQUE INDEX uq_authors_name_norm ON public.authors USING btree (lower(public.immutable_unaccent((name)::text)));


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: book_authors book_authors_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE RESTRICT;


--
-- Name: book_authors book_authors_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_images book_images_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_images
    ADD CONSTRAINT book_images_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_requests book_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book_requests
    ADD CONSTRAINT book_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: books books_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_status_history order_status_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: reservations reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5CctqxY9IU4K6oPw3lhB4y2ozKQfUtIXVUxNlxDO4By0MJI2JgEpHUpj30jLEAf

