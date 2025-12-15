# Pinky Woman 25 – Online Pajama Store

## Project Overview

**Pinky Woman 25** is a full-stack e-commerce web application specializing in women's and teenage girls' pajamas. The platform delivers a smooth online shopping experience for customers while providing powerful administrative tools for managing products, orders, and users.

---

## Features

### Customer Features

* **Product Browsing** – Browse pajamas by categories
* **Order Management** – Add products to cart, place orders, and checkout
* **Contact System** – Report technical issues or contact support
* **User-Friendly Interface** – Clean and intuitive design for seamless shopping

### Admin Features

* **Product Management** – Add, edit, and remove products from inventory
* **Order Tracking** – Monitor and confirm customer orders
* **Dashboard Analytics** – View statistics and user information
* **Admin Controls** – Secure administrative interface

---

## Tech Stack

### Backend

* **Spring Boot** – Java-based framework for building robust backend services
  [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
* **Spring Security** – Authentication and authorization
  [https://spring.io/projects/spring-security](https://spring.io/projects/spring-security)
* **Spring Data JPA** – ORM and database access layer
  [https://spring.io/projects/spring-data-jpa](https://spring.io/projects/spring-data-jpa)

### Database

* **PostgreSQL** – Relational database management system
  [https://www.postgresql.org/](https://www.postgresql.org/)
* **pgAdmin 4** – PostgreSQL administration and management tool
  [https://www.pgadmin.org/](https://www.pgadmin.org/)

### Frontend

* **HTML5** – Semantic markup
  [https://developer.mozilla.org/en-US/docs/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
* **CSS3** – Styling and responsive design
  [https://developer.mozilla.org/en-US/docs/Web/CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
* **Vanilla JavaScript** – Client-side interactivity
  [https://developer.mozilla.org/en-US/docs/Web/JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Architecture

* **MVC Pattern** – Clear separation between Model, View, and Controller
  [https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
* **RESTful API** – Stateless communication between frontend and backend
  [https://restfulapi.net/](https://restfulapi.net/)
* **Responsive Design** – Optimized for desktop and mobile devices

---

## Installation & Setup

### Prerequisites

* Java JDK 11 or higher
  [https://adoptium.net/](https://adoptium.net/)
* Maven 3.6+
  [https://maven.apache.org/](https://maven.apache.org/)
* PostgreSQL 12+
  [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
* Modern web browser (Chrome, Firefox, Edge)

---

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/pinky-woman-25.git
cd pinky-woman-25
```

2. Configure the PostgreSQL database and create the schema:

```sql
-- Create database and role (replace your_role and your_password)
CREATE DATABASE pinkywoman25;
CREATE ROLE your_role WITH LOGIN PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pinkywoman25 TO your_role;

-- Create tables
CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category INT REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    photos TEXT[]
);

CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    hex_code VARCHAR(7)
);

CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE product_colors (
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    color_id INT REFERENCES colors(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, color_id)
);

CREATE TABLE product_sizes (
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    size_id INT REFERENCES sizes(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, size_id)
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    color_id INT REFERENCES colors(id) ON DELETE SET NULL,
    size_id INT REFERENCES sizes(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    UNIQUE(product_id, color_id, size_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed','shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Indexes
CREATE INDEX idx_order_statuses ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

3. Update `application.properties` with your PostgreSQL role credentials (located in `src/main/resources`):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pinkywoman25
spring.datasource.username=your_role
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

4. Build and run the Spring Boot application:

```bash
mvn clean install
mvn spring-boot:run
```

---

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Open `index.html` in a web browser.

3. Ensure the backend server is running on the configured port.

## Key Functionalities

### Security Implementation

* User authentication and authorization
* Secure password storage with encryption
* Protected admin routes
* CSRF protection

### Error Handling

* Centralized exception handling
* User-friendly error messages
* Logging for debugging and maintenance

### Data Management

* Efficient database queries and indexing
* Client-side and server-side data validation
* Transaction management for order processing

---

## Development Guidelines

### Code Standards

* Follow Java naming conventions
* Use meaningful variable and method names
* Comment complex logic
* Maintain consistent formatting

### Testing

* Unit tests for service layers
* Integration tests for REST APIs
* Frontend functionality testing

---

## Future Enhancements

* Payment gateway integration
* User reviews and ratings
* Wishlist functionality
* Email notifications
* Advanced search and filtering
* Social media integration

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Push to your branch
5. Open a Pull Request

---

## License

Specify your license here.

---

## Contact

For technical issues or inquiries, please Contact Us Via: lokman.hamidi@univ-constantine2.dz

**Project Lead:** Lokman Hamidi

Built with **Spring Boot**, **PostgreSQL (pgAdmin 4)**, and **native HTML/CSS/JavaScript**.
