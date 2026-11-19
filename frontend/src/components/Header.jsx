
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
    const loggedData = useContext(UserContext);
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("nutrify-user");
        loggedData.setLoggedUser(null);
        navigate("/login");
    }

    return (
        <header className="app-header">
            <Link className="brand" to="/track">
                NUTRIFY
            </Link>

            <nav className="nav-links" aria-label="Main navigation">
                <Link to="/track">Track</Link>
                <Link to="/diet">Diet</Link>

                <button
                    type="button"
                    className="logout-link"
                    onClick={logout}
                >
                    Logout
                </button>
            </nav>
        </header>
    );
}
