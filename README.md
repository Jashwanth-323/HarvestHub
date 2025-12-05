# Project: Full-Stack Data Storage with Node.js & React

This project demonstrates a complete backend and frontend flow for user registration, address management, and order creation. The backend is a Node.js/Express server designed to interact with a database (schema provided for MongoDB), and the frontend is a React application that consumes the backend APIs.

---

## 1. Database Structure (MongoDB Schema)

This schema is designed for a MongoDB database.

### `Users` Collection

Stores information about registered users.

```json
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "phone": "String",
  "billingAddress": {
    "name": "String",
    "phone": "String",
    "address": "String",
    "city": "String",
    "state": "String",
    "country": "String",
    "pincode": "String"
  },
  "createdAt": "Date"
}
```

### `Orders` Collection

Stores details about orders placed by users.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId", // Reference to the User who placed the order
  "products": [
    {
      "productId": "String",
      "name": "String",
      "quantity": "Number",
      "price": "Number"
    }
  ],
  "totalPrice": "Number",
  "shippingAddress": {
    "name": "String",
    "phone": "String",
    "address": "String",
    "city": "String",
    "state": "String",
    "country": "String",
    "pincode": "String"
  },
  "status": "String", // e.g., 'Pending', 'Shipped', 'Delivered'
  "createdAt": "Date"
}
```

---

## 2. Backend API Setup & Endpoints

The backend is located in the `backend/api.js` file.

### How to Run the Backend

1.  **Install Dependencies**: Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install express body-parser cors uuid
    ```

2.  **Start the Server**:
    ```bash
    node backend/api.js
    ```
    The server will start on `http://localhost:3001`.

### API Endpoints

#### `POST /api/users/register`

Saves new user information to the database.

-   **Request Body (JSON):**
    ```json
    {
      "username": "johndoe",
      "email": "john.doe@example.com",
      "phone": "1234567890"
    }
    ```

-   **Success Response (201):**
    ```json
    {
      "message": "User registered successfully!",
      "user": {
        "id": "generated-uuid",
        "username": "johndoe",
        "email": "john.doe@example.com",
        "phone": "1234567890",
        "billingAddress": null
      }
    }
    ```

-   **Error Response (400/500):**
    ```json
    { "message": "Email already exists." }
    ```

#### `PUT /api/users/:userId/address`

Adds or updates the billing address for a specific user.

-   **URL Parameter**: `userId` (The ID of the user to update).
-   **Request Body (JSON):**
    ```json
    {
      "name": "John Doe",
      "phone": "1234567890",
      "address": "123 Main St",
      "city": "Anytown",
      "state": "California",
      "country": "India",
      "pincode": "123456"
    }
    ```
-   **Success Response (200):**
    ```json
    { "message": "Address updated successfully." }
    ```

#### `POST /api/orders`

Saves a new order to the database.

-   **Request Body (JSON):**
    ```json
    {
      "userId": "user-uuid",
      "products": [
        { "productId": "p1", "name": "Sample Item", "quantity": 1, "price": 99.99 }
      ],
      "totalPrice": 99.99,
      "shippingAddress": {
        "name": "John Doe",
        "phone": "1234567890",
        "address": "123 Main St",
        "city": "Anytown",
        "state": "California",
        "pincode": "123456"
      }
    }
    ```
-   **Success Response (201):**
    ```json
    {
      "message": "Order created successfully!",
      "order": {
        "orderId": "generated-uuid",
        "userId": "user-uuid",
        "totalPrice": 99.99
      }
    }
    ```

---

## 3. Frontend Usage

The frontend is a React application located in `index.tsx`.

### How to Run the Frontend

1.  Make sure the backend server is running (`node backend/api.js`).
2.  Serve the project's root directory using a simple static server. For example, using Python:
    ```bash
    # In the project root directory
    python3 -m http.server
    ```
3.  Open your browser and navigate to `http://localhost:8000` (or the port provided by your static server).

The application will guide you through a multi-step form to demonstrate the full data capture and storage flow.
