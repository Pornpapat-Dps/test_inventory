# Inventory Management System — API Documentation

Base URL: `http://localhost:3000`

---

## 1. Database Schema (ER Diagram)

```
┌─────────────────┐         ┌──────────────────────────┐         ┌──────────────────────────────┐
│   categories    │         │        products           │         │     stock_transactions       │
├─────────────────┤         ├──────────────────────────┤         ├──────────────────────────────┤
│ id         PK   │──1───N──│ id            PK          │──1───N──│ id           PK              │
│ name            │         │ name                      │         │ product_id   FK → products   │
└─────────────────┘         │ sku           UNIQUE      │         │ type         IN | OUT        │
                            │ cost_price                │         │ quantity     INTEGER ≥ 1     │
                            │ stock_quantity DEFAULT 0  │         │ note                         │
                            │ category_id   FK          │         │ created_at   DATETIME        │
                            └──────────────────────────┘         └──────────────────────────────┘
```

**Relationships:**
- `categories` → `products` : One-to-Many
- `products` → `stock_transactions` : One-to-Many

---

## 2. Endpoints

---

### 2.1 POST /api/products

สร้างสินค้าใหม่และบันทึกลงฐานข้อมูล

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/products` |
| **Header** | `Content-Type: application/json` |

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | ชื่อสินค้า |
| sku | string | Yes | รหัสสินค้า (ต้องไม่ซ้ำ) |
| cost_price | number | Yes | ราคาทุน |
| category_id | integer | No | รหัสหมวดหมู่ |
| stock_quantity | integer | No | จำนวนสต็อกเริ่มต้น (default: 0) |

```json
{
  "name": "Laptop Dell XPS",
  "sku": "LAP-001",
  "cost_price": 25000,
  "category_id": 1,
  "stock_quantity": 0
}
```

**Response — 201 Created**

```json
{
  "data": {
    "id": 6,
    "name": "Laptop Dell XPS",
    "sku": "LAP-001",
    "cost_price": 25000,
    "stock_quantity": 0,
    "category_id": 1,
    "created_at": "2026-06-23T07:07:00.090356+00:00"
  }
}
```

**Error Responses**

| Status | Condition | Response |
|---|---|---|
| 400 | ขาด name, sku หรือ cost_price | `{ "error": "กรุณากรอกข้อมูลให้ครบ ชื่อ รหัสสินค้า และราคาทุน" }` |
| 404 | category_id ไม่มีในระบบ | `{ "error": "หมวดหมู่สินค้าไม่ถูกต้อง" }` |
| 409 | SKU ซ้ำกับที่มีอยู่ | `{ "error": "รหัสสินค้า \"LAP-001\" ซ้ำ" }` |

---

### 2.2 PATCH /api/stock/adjust

ปรับจำนวนสต็อก (รับเข้า/จ่ายออก) และบันทึก transaction ทุกครั้ง

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `http://localhost:3000/api/stock/adjust` |
| **Header** | `Content-Type: application/json` |

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| product_id | integer | Yes | รหัสสินค้า |
| quantity | integer | Yes | จำนวนที่ปรับ (บวก = รับเข้า, ลบ = จ่ายออก) |
| note | string | No | หมายเหตุ |

**รับสินค้าเข้า (+10)**

```json
{
  "product_id": 6,
  "quantity": 10,
  "note": "รับสินค้าจาก Supplier"
}
```

Response — 200 OK:

```json
{
  "data": {
    "product": {
      "id": 6,
      "name": "Laptop Dell XPS",
      "sku": "LAP-001",
      "cost_price": 25000,
      "stock_quantity": 20,
      "category_id": 1,
      "created_at": "2026-06-23T07:07:00.090356+00:00"
    },
    "transaction": {
      "id": 2,
      "product_id": 6,
      "type": "IN",
      "quantity": 10,
      "note": "รับสินค้าจาก Supplier",
      "created_at": "2026-06-23T07:18:41.104045+00:00"
    }
  }
}
```

**จ่ายสินค้าออก (-5)**

```json
{
  "product_id": 6,
  "quantity": -5,
  "note": "ส่งให้ฝ่ายขาย"
}
```

Response — 200 OK:

```json
{
  "data": {
    "product": {
      "id": 6,
      "name": "Laptop Dell XPS",
      "sku": "LAP-001",
      "cost_price": 25000,
      "stock_quantity": 14,
      "category_id": 1,
      "created_at": "2026-06-23T07:07:00.090356+00:00"
    },
    "transaction": {
      "id": 5,
      "product_id": 6,
      "type": "OUT",
      "quantity": 5,
      "note": "ส่งให้ฝ่ายขาย",
      "created_at": "2026-06-23T07:21:48.102544+00:00"
    }
  }
}
```

**Error Responses**

| Status | Condition | Response |
|---|---|---|
| 400 | ขาด product_id หรือ quantity | `{ "error": "กรุณากรอกข้อมูลให้ครบ รหัสสินค้า และจำนวน" }` |
| 400 | quantity เป็น 0 หรือไม่ใช่จำนวนเต็ม | `{ "error": "จำนวนต้องเป็นจำนวนเต็มที่ไม่ใช่ศูนย์" }` |
| 404 | product_id ไม่มีในระบบ | `{ "error": "รหัสสินค้าไม่ถูกต้อง" }` |
| 422 | สต็อกไม่พอสำหรับการจ่ายออก | ดูตัวอย่างด้านล่าง |

**422 Unprocessable Entity** — สต็อกไม่เพียงพอ

Request:
```json
{
  "product_id": 6,
  "quantity": -12,
  "note": "ส่งให้ฝ่ายขาย"
}
```

Response:
```json
{
  "error": "สต๊อกไม่เพียงพอสำหรับการปรับลดนี้",
  "current_stock": 9,
  "requested": -12
}
```

---

### 2.3 GET /api/products/low-stock

ดึงรายการสินค้าที่มีจำนวนคงเหลือน้อยกว่า 5 ชิ้น

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `http://localhost:3000/api/products/low-stock` |
| **Header** | ไม่จำเป็น |

**Response — 200 OK**

```json
{
  "data": [
    {
      "id": 8,
      "name": "USB Hub",
      "sku": "USB-001",
      "cost_price": 450,
      "stock_quantity": 2,
      "category_id": 2,
      "created_at": "2026-06-23T07:24:43.919369+00:00"
    },
    {
      "id": 9,
      "name": "Mouse Logitech",
      "sku": "MOU-001",
      "cost_price": 890,
      "stock_quantity": 4,
      "category_id": 2,
      "created_at": "2026-06-23T07:24:44.13468+00:00"
    }
  ],
  "count": 2
}
```

ไม่มีสินค้า stock ต่ำ:

```json
{
  "data": [],
  "count": 0
}
```

---

## 3. Seed Data (Categories)

| id | name |
|---|---|
| 1 | IT |
| 2 | Office Supply |
| 3 | Furniture |
