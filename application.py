import os
import time
from flask import Flask, render_template, redirect, request, url_for, flash
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from flask_socketio import SocketIO, send, emit, join_room, leave_room, disconnect
from wtform_fields import *
from models import *


# Config flask lo
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET')

# Config database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('DATABASE')
db = SQLAlchemy(app)
# app.config['SQLALCHEMY_POOL_SIZE'] = 1
# app.config['SQLALCHEMY_MAX_OVERFLOW'] = 0

# Init SocketIO
socketio = SocketIO(app, manage_session=False)
ROOMS = ['General', "Outdoor", "Film", "Game", "Study"]
messages = {
    "General" :[],
    "Outdoor": [],
    "Film": [],
    "Game": [],
    "Study": []
}
USERS = [] #Migrate this to a dict {'username':'id'}
private_chat = []

# Config Flask login
login = LoginManager(app)
login.init_app(app)

@login.user_loader
def load_user(id):
    return User.query.get(int(id))


@app.route("/", methods=["GET", "POST"])
def index():
    reg_form = RegistrationForm()
    if reg_form.validate_on_submit():
        username = reg_form.username.data
        password = reg_form.password.data

        hashed_pswd = pbkdf2_sha512.hash(password)

        # Add user to DB if validation success
        user = User(username=username, password=hashed_pswd)
        db.session.add(user)
        db.session.commit()

        flash('Registered successfully', 'success')
        return redirect(url_for('login'))

    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["GET", "POST"])
def login():
    login_form = LoginForm()
    # Allow login if validation through
    if login_form.validate_on_submit():
        if not any(dict['username']==login_form.username.data for dict in USERS): 
            #prevent multiple log in  
            user_object = User.query.filter_by(
            username=login_form.username.data).first()
            login_user(user_object)
            #####
            duplicate = False
            for user in USERS:
                if user['username'] == current_user.username:
                    duplicate = True
            if not (duplicate):
                user_data = {'username':current_user.username}
                USERS.append(user_data)
            #####
            socketio.emit("reset-user")
            return redirect(url_for('chat'))
        else:
            flash('Account already log in', 'danger')
            return redirect(url_for('login'))

    return render_template("login.html", form=login_form)

@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    socketio.emit("reset-user");
    flash('Log out successfully', 'success')
    return redirect(url_for('login'))


@app.route("/chat", methods=["GET", "POST"])
def chat():
    if not current_user.is_authenticated:
        flash('Please login', 'danger')
        return redirect(url_for('login'))
    #store logged in users
    socketio.emit("reset-user")
    return render_template("chat.html", username = current_user.username, rooms=ROOMS, user_list = USERS)


@app.errorhandler(404)
def page_not_found(e):
    # set the 404 status explicitly
    return render_template('404.html'), 404


@app.after_request #no cache
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


@app.teardown_appcontext #bottleneck
def shutdown_session(exception=None):
    db.session.remove()


@socketio.on("request-private")
def send_list():
    socketio.emit("chat-list", private_chat)

@socketio.on("private-chat")
def private(data):
    founded = False
    for chat in private_chat: #other person click connect chat
        if (data['user1'] in chat and data['user2'] in chat):
            founded = True
            join_room(chat)
            for d in messages[chat]: #print prv messages
                send ({'msg': d["msg"], 'username': d["username"], 'time_stamp': d["time_stamp"] })   
            break 
    if not founded: #first time create connect chat
        someString = data['user1']+ "-" + data['user2'] #find way to revert join room from two side
        if someString not in private_chat:
            private_chat.append(someString)
        join_room(someString)
        messages[someString] = []



@socketio.on('message') #Fix username in isChannel;
def message(data):
    msg = data["msg"]
    username = data["username"]
    room = data["room"]
    time_stamp = time.strftime('%m/%d/%Y %I:%M %p', time.localtime())
    payload = {'msg': data['msg'], 'username': data['username'], 'room': data['room'], 'time_stamp': time_stamp}
    send(payload, room=room)
    if room in messages:
        if payload not in messages[room]:
            messages[room].append(payload)


@socketio.on('join')
def join(data):
    #User join room
    username = data["username"]
    room = data["room"]
    join_room(room)
    for d in messages[room]: #print prv messages
        send ({'msg': d["msg"], 'username': d["username"], 'time_stamp': d["time_stamp"] })
    if room in ROOMS:
        send({'msg': username + " has joined the " + room + " room."}, room=room)


@socketio.on('leave')
def leave(data):
    #User leave room
    username = data["username"]
    room = data["room"]
    leave_room(room)
    if room in ROOMS:
        send({'msg': username + " has left the " + room + " room."}, room=room)
    


@socketio.on("logout")
def logout(data):
    global USERS
    USERS = [d for d in USERS if d["username"] != current_user.username]
    socketio.emit("reset-user");

if __name__ == "__main__":  # allow excute when file run as script
    app.run(debug=True)
