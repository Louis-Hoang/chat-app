# Chat App Using Flask-SocketIO & Deployed in Heroku
<h1 align="center">
  https://my-realtime-chatapp.herokuapp.com/chat
</h1>

## Introduction
This is a chat application, implemented using Flask-SocketIO with both the database (PostgreSQL) and the app deployed in Heroku. It also has user registration and authentication functionalities.


## Usage
### Run app
Use [the link to the production server](https://my-realtime-chatapp.herokuapp.com/login) directly.

### Clone/Modify app
1. Modify application.py to replace the secret key *(i.e. os.environ.get('SECRET'))* with a secret key of your choice and your connected database link *(i.e. os.environ.get('DATABASE'))* with the link to your own database.

2. Edit *create.py* to once again replace *os.environ.get('DATABASE')* with the link to your database.

3. Execute *create.py* from the terminal to create the table to hold users' credentials.
