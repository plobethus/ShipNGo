# Welcome to ShipNGo!! 
We have implemented a full stack website project, it is a post office/courier service that helps cosutmer ship items and buy items all around the world! 

This is the backend and frontend for shipngo, created with technologies:

html,css, javascript and NodeJS. It is hosted entirely on Azure as a web app.

## mini-world description: 
-Users: customers, employees and manager (admin). 

### User Roles
Customer:
Can create an account, log in, modify password in profile, create a shipment, track a shipment, buy from the store, use shipment calculator and file a claim 

Employee:
Modify a shipment status, edit their profile, restock store, delete shipments

Manager: 
modify claims report, look at the 3 reports, update claims status, add/remove employees, edit their profile, anything an employee can do



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
