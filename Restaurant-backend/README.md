# Restaurant Backend (Cloudinary image uploads)

## Setup

1. Copy `.env.example` to `.env` and fill your MongoDB and Cloudinary credentials.
2. Install dependencies:
   ```
   npm install
   ```
3. Start server:
   ```
   npm start
   ```
4.api endpoints food
| Method   | Endpoint                   | Description               |
| -------- | -------------------------- | ------------------------- |
| `POST`   | `/api/menu`                | Add food (with image)     |
| `GET`    | `/api//api/menu/category/:namemenu`                | Get all foods             |
| `GET`    | `` | Get foods by category     |
| `GET`    | `/api/menu/categories`     | Get all unique categories |
| `PUT`    | `/api/menu/:id`            | Update food + image       |
| `DELETE` | `/api/menu/:id`            | Delete food + image       |

api endpoints for user
POST http://localhost:8000/api/user
Body (JSON):
{
  "name": "Abhishek",
  "address": "Kochi, Kerala",
  "contact": "9876543210",
  "numberOfPersons": 3
}


✅ Example Requests (Postman)
1️⃣ Daily / Weekly / Monthly Revenue

GET http://localhost:8000/api/stats/revenue

2️⃣ Total Clients

GET http://localhost:8000/api/stats/clients

3️⃣ Dine-in vs Take-away %

GET http://localhost:8000/api/stats/percentages

4️⃣ Daily Orders Summary

GET http://localhost:8000/api/stats/orders