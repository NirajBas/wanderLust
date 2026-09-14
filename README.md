# WanderLust

A travel listing web app where users can browse hotels and stays, add new listings, edit or delete them, and leave ratings and comments. Built with Express, MongoDB, and EJS.

## Features

- Home page and a grid of all listings
- Create, view, update, and delete listings (title, description, image URL, price, location, country)
- Reviews with a 1–5 rating and comments
- Joi validation for listing and review forms
- Custom error handling for missing pages, invalid IDs, and validation failures
- Bootstrap UI with a sticky navbar and shared layout

## Tech stack

- **Node.js** and **Express 5**
- **MongoDB** with **Mongoose**
- **EJS** and **ejs-mate** for layouts
- **Joi** for request validation
- **method-override** for PATCH and DELETE from forms
- **express-session** for sessions
- Bootstrap and Font Awesome on the frontend

## Prerequisites

- Node.js
- MongoDB running locally on `127.0.0.1:27017`

## Setup

1. Clone or open the project folder.

2. Install dependencies:

```bash
npm install
```

3. Start MongoDB, then seed sample listings (this **deletes** existing listings in the `wanderLust` database and inserts sample data):

```bash
node init/index.js
```

4. Start the app:

```bash
node app.js
```

The server listens on [http://localhost:8080](http://localhost:8080).

Use `npx nodemon app.js` if you want the server to restart on file changes.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Home |
| GET | `/listings` | All listings |
| GET | `/listings/new` | New listing form |
| POST | `/listings` | Create listing |
| GET | `/listings/:id` | Listing detail and reviews |
| GET | `/listings/:id/edit` | Edit form |
| PATCH | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |
| POST | `/listings/:id/reviews` | Add a review |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete a review |

## Project structure

```
├── app.js                 # Main Express app
├── expressError.js        # Custom error class
├── schema.js              # Joi schemas
├── models/
│   ├── listing.js
│   └── reviews.js
├── views/
│   ├── layouts/
│   ├── includes/
│   └── listings/
├── public/css & public/js
└── init/                  # Sample data seeder
```

`index.js` is a separate Express sandbox for middleware practice. The listing app entry point is `app.js`.

## Author

Niraj Basel
