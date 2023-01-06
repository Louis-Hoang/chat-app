from flask import Flask, render_template, redirect, request, url_for
from wtform_fields import *
from models import *


app = Flask(__name__)
app.secret_key = 'placeholder'

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://okenthdbfaisxz:bcc6d85268ee971c63712f50b1f39ff76f105e7c71233322a3e665673dad5836@ec2-52-73-155-171.compute-1.amazonaws.com:5432/d6bhbpbas2bvci"

db = SQLAlchemy(app)


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

        return redirect(url_for('login'))

    return render_template("index.html", form=reg_form)


@app.route("/login", methods=["GET", "POST"])
def login():
    login_form = LoginForm()
    if login_form.validate_on_submit():
        return "Logged in"

    return render_template("login.html", form=login_form)


if __name__ == "__main__":  # allow excute when file run as script
    app.run(debug=True)
