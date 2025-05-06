# Status Updates API Documentation

This document outlines the API endpoints for managing status updates and admin comments in the Architex platform.

## Base URL

All URLs referenced in the documentation have the following base:

```
https://api.architex.com/api
```

## Authentication

All API requests require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Status Updates

Status updates allow architects to provide progress updates on jobs they are working on.

### List Status Updates

Retrieves a list of status updates with optional filtering.

**URL**: `/status-updates`

**Method**: `GET`

**Query Parameters**:

- `job_id` (optional): Filter by job ID
- `user_id` (optional): Filter by user ID (architect)
- `is_read` (optional): Filter by read status (true/false)
- `per_page` (optional): Number of results per page (default: 15)
- `page` (optional): Page number for pagination

**Response**:

```json
{
  "data": [
    {
      "id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
      "job_id": "job123",
      "user_id": "user456",
      "content": "Completed initial sketches for the project",
      "is_read": false,
      "created_at": "2025-05-10T14:30:00Z",
      "updated_at": "2025-05-10T14:30:00Z",
      "user": {
        "id": "user456",
        "name": "John Architect",
        "email": "john@example.com"
      },
      "admin_comments": [
        {
          "id": "comment789",
          "status_update_id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
          "admin_id": "admin123",
          "content": "Great progress! Looking forward to seeing the detailed plans.",
          "is_read": false,
          "created_at": "2025-05-10T15:00:00Z",
          "updated_at": "2025-05-10T15:00:00Z",
          "admin": {
            "id": "admin123",
            "name": "Admin User",
            "email": "admin@architex.com"
          }
        }
      ]
    }
  ],
  "links": {
    "first": "https://api.architex.com/api/status-updates?page=1",
    "last": "https://api.architex.com/api/status-updates?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "https://api.architex.com/api/status-updates",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### Create Status Update

Creates a new status update for a job.

**URL**: `/status-updates`

**Method**: `POST`

**Request Body**:

```json
{
  "job_id": "job123",
  "content": "Completed initial sketches for the project"
}
```

**Response**:

```json
{
  "data": {
    "id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
    "job_id": "job123",
    "user_id": "user456",
    "content": "Completed initial sketches for the project",
    "is_read": false,
    "created_at": "2025-05-10T14:30:00Z",
    "updated_at": "2025-05-10T14:30:00Z",
    "user": {
      "id": "user456",
      "name": "John Architect",
      "email": "john@example.com"
    }
  }
}
```

### Get Status Update

Retrieves a specific status update by ID.

**URL**: `/status-updates/{statusUpdate}`

**Method**: `GET`

**Response**:

```json
{
  "data": {
    "id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
    "job_id": "job123",
    "user_id": "user456",
    "content": "Completed initial sketches for the project",
    "is_read": false,
    "created_at": "2025-05-10T14:30:00Z",
    "updated_at": "2025-05-10T14:30:00Z",
    "user": {
      "id": "user456",
      "name": "John Architect",
      "email": "john@example.com"
    },
    "job": {
      "id": "job123",
      "title": "Modern House Design",
      "description": "Design a modern house with sustainable features"
    },
    "admin_comments": [
      {
        "id": "comment789",
        "status_update_id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
        "admin_id": "admin123",
        "content": "Great progress! Looking forward to seeing the detailed plans.",
        "is_read": false,
        "created_at": "2025-05-10T15:00:00Z",
        "updated_at": "2025-05-10T15:00:00Z",
        "admin": {
          "id": "admin123",
          "name": "Admin User",
          "email": "admin@architex.com"
        }
      }
    ]
  }
}
```

### Mark Status Update as Read

Marks a status update as read.

**URL**: `/status-updates/{statusUpdate}/read`

**Method**: `PUT`

**Response**:

```json
{
  "message": "Status update marked as read"
}
```

### Delete Status Update

Deletes a status update.

**URL**: `/status-updates/{statusUpdate}`

**Method**: `DELETE`

**Response**:

```json
{
  "message": "Status update deleted successfully"
}
```

## Admin Comments

Admin comments allow administrators to respond to status updates from architects.

### List Admin Comments

Retrieves a list of admin comments for a specific status update.

**URL**: `/status-updates/{statusUpdate}/comments`

**Method**: `GET`

**Response**:

```json
{
  "data": [
    {
      "id": "comment789",
      "status_update_id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
      "admin_id": "admin123",
      "content": "Great progress! Looking forward to seeing the detailed plans.",
      "is_read": false,
      "created_at": "2025-05-10T15:00:00Z",
      "updated_at": "2025-05-10T15:00:00Z",
      "admin": {
        "id": "admin123",
        "name": "Admin User",
        "email": "admin@architex.com"
      }
    }
  ]
}
```

### Create Admin Comment

Creates a new admin comment on a status update.

**URL**: `/status-updates/{statusUpdate}/comments`

**Method**: `POST`

**Request Body**:

```json
{
  "content": "Great progress! Looking forward to seeing the detailed plans."
}
```

**Response**:

```json
{
  "data": {
    "id": "comment789",
    "status_update_id": "5bec5507-6987-46b0-9ef1-d74a7be74c41",
    "admin_id": "admin123",
    "content": "Great progress! Looking forward to seeing the detailed plans.",
    "is_read": false,
    "created_at": "2025-05-10T15:00:00Z",
    "updated_at": "2025-05-10T15:00:00Z",
    "admin": {
      "id": "admin123",
      "name": "Admin User",
      "email": "admin@architex.com"
    }
  }
}
```

### Mark Admin Comment as Read

Marks an admin comment as read.

**URL**: `/status-updates/comments/{adminComment}/read`

**Method**: `PUT`

**Response**:

```json
{
  "message": "Admin comment marked as read"
}
```

### Delete Admin Comment

Deletes an admin comment.

**URL**: `/status-updates/comments/{adminComment}`

**Method**: `DELETE`

**Response**:

```json
{
  "message": "Admin comment deleted successfully"
}
```
