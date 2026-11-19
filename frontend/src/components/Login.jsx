import { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const loggedData = useContext(UserContext);
    const navigate = useNavigate();

    const [userCreds, setUserCreds] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState({
        type: "invisible-msg",
        text: ""
    });

    function handleInput(event) {
        setUserCreds((prevState) => {
            return { ...prevState, [event.target.name]: event.target.value };
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        fetch("http://localhost:8000/login", {
            method: "POST",
            body: JSON.stringify(userCreds),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    type: "error",
                    text: data.message || "Login failed"
                });

                setTimeout(() => {
                    setMessage({ type: "invisible-msg", text: "" });
                }, 5000);

                return null;
            }

            return data;
        })
        .then((data) => {
            if (data && data.token !== undefined) {
                localStorage.setItem("nutrify-user", JSON.stringify(data));
                loggedData.setLoggedUser(data);
                navigate("/track");
            }
        })
        .catch((err) => {
            setMessage({
                type: "error",
                text: err.message || "Unable to connect to the server"
            });
        });
    }

    return (
        <section className="container">
            <form className="form" onSubmit={handleSubmit}>
                <h1>Login To Nutrify</h1>

                <input
                    className="inp"
                    required
                    type="email"
                    onChange={handleInput}
                    placeholder="Enter Email"
                    name="email"
                    value={userCreds.email}
                />

                <input
                    className="inp"
                    maxLength={8}
                    type="password"
                    required
                    onChange={handleInput}
                    placeholder="Enter Password"
                    name="password"
                    value={userCreds.password}
                />

                <button className="btn">Login</button>

                <p>
                    Dont Have a Account ? <Link to="/register">Register Now</Link>
                </p>

                <p className={message.type}>{message.text}</p>
            </form>
        </section>
    );
}
