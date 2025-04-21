# Welcome to ShipNGo!! 
To visit our web, click on this link: https://shipngo-g9cpbhdvfhgca3cb.northcentralus-01.azurewebsites.net

- We have implemented a full stack website project, it is a post office/courier service that helps cosutmer ship items and buy items all around the world! 

- ## This is the backend and frontend for shipngo, created with technologies:
html,css, javascript and NodeJS. It is hosted entirely on Azure as a web app.

## 🌍 Mini-World Description for ShipNGo
The ShipNGo system simulates a real-world postal and courier service platform, there are three main user roles in this ecosystem: Customers, Employees, and Managers. Each role has distinct permissions and functionality designed to mirror real-life operations within a logistics and e-commerce business.

## 🧑‍💼 User Roles
Customer: Registers and manages their own account, creates and tracks shipments, shops from an integrated store, uses the shipment cost calculator, submits and views claims

Employee: Updates the status of shipments, restocks store inventory, deletes shipments as necessary, manages their own profile

Manager (Admin): 

Has all employee privileges, manages claims by modifying and resolving them, views analytical reports (Claims, Sales, and Inventory), adds or removes employees


## Details for our project files can be found here: 
https://docs.google.com/document/d/1a3xp7fVdMwedBqV2qzvCY40iEtPJcbEq28Ns6vjPJZs/edit?usp=sharing

## Links
- [website](https://shipngo-g9cpbhdvfhgca3cb.northcentralus-01.azurewebsites.net)
- [front end (OLD)](https://github.com/plobethus/ShipNGo-frontend)

## Structure
```
ShipNGo/
│
├── backend/             
│   ├── server.js       server file           
│   ├── routes/         routes to controllers
│   ├── controllers/    sql queries
│   ├── db.js/          database variables
│   ├── helpers.js/     json configuration
│   └── .env            file for database connection        
│
├── frontend/                    
│   ├── index.html      homepage
│   ├── pages/          pages throughout website
│   ├── scripts/        scripts that connect to backend
│   ├── styles/         make the pages beutiful
│   └── includes/       for our header
│
├── .gitignore
├── README.md
└── package.json                
```

## Instructions To Setup locally

### 1. Clone using SSH

```bash
git clone git@github.com:plobethus/ShipNGo.git
```
### 2. Place populated .env file in backend folder

### 3. Running Project

```bash
cd ShipNGo
cd backend
npm start
```
### 4. Open in browser
http://localhost:8080/

## Created by
- [Joice](https://github.com/joiceM18)
- [Henry](https://github.com/plobethus)
- [Aaron](https://github.com/Happydragon123)
- [Sam](https://github.com/SamuelAlvarez690)
- [Yusuf](https://github.com/GlowSand)
