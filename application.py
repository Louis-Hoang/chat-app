import os
import time
from flask import Flask, render_template, redirect, request, url_for, flash
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from wtform_fields import *
from models import *


# Config flask login
app = Flask(__name__)
app.secret_key = 'placeholder'

# Config database
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://okenthdbfaisxz:bcc6d85268ee971c63712f50b1f39ff76f105e7c71233322a3e665673dad5836@ec2-52-73-155-171.compute-1.amazonaws.com:5432/d6bhbpbas2bvci"
db = SQLAlchemy(app)

# Init SocketIO
socketio = SocketIO(app, manage_session=False)
ROOMS = ['general', "outdoor", "film", "game", "study"]


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
        user_object = User.query.filter_by(
            username=login_form.username.data).first()
        login_user(user_object)
        return redirect(url_for('chat'))

    return render_template("login.html", form=login_form)

@app.route("/logout", methods=["GET"])
def logout():
    logout_user()
    flash('Log out successfully', 'success')
    return redirect(url_for('login'))


@app.route("/chat", methods=["GET", "POST"])
def chat():
    if not current_user.is_authenticated:
        flash('Please login', 'danger')
        return redirect(url_for('login'))
    return render_template("chat.html", username = current_user.username, rooms=ROOMS)


@app.errorhandler(404)
def page_not_found(e):
    # set the 404 status explicitly
    return render_template('404.html'), 404



@socketio.on('message')
def message(data):
    msg = data["msg"]
    username = data["username"]
    room = data["room"]
    time_stamp = time.strftime('%b-%d %I:%M%p', time.localtime())
    send({'msg': data['msg'], 'username': data['username'], 'room': data['room'], 'time_stamp': time_stamp}, room=room)
    

@socketio.on('join')
def join(data):
    #User join room
    username = data["username"]
    room = data["room"]
    join_room(room)
    send({'msg': username + " has joined the " + room + " room."}, room=room)


@socketio.on('leave')
def leave(data):
    #User leave room
    username = data["username"]
    room = data["room"]
    leave_room(room)
    send({'msg': username + " has left the " + room + " room."}, room=room)

if __name__ == "__main__":  # allow excute when file run as script
    # socketio.run(app, port=8000, debug=True)
    app.run(debug=True, port=8000)
