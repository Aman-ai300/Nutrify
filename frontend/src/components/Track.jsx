import { UserContext } from "../contexts/UserContext";
import { useContext, useState } from "react";
import Food from "./Food";
import Header from "./Header";

export default function Track() {
    const loggedData = useContext(UserContext);

    const [foodItems, setFoodItems] = useState([]);
    const [food, setFood] = useState(null);

    function searchFood(event) {
        const value = event.target.value;

        // Clear previously selected food when searching again
        setFood(null);

        if (value.length !== 0) {
            fetch(`http://localhost:8000/foods/${encodeURIComponent(value)}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${loggedData.loggedUser.token}`
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);

                    if (data.message === undefined) {
                        setFoodItems(data);
                    } else {
                        setFoodItems([]);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setFoodItems([]);
                });
        } else {
            setFoodItems([]);
        }
    }

    function selectFood(item) {
        setFood(item);
        setFoodItems([]);
    }

    return (
        <section className="container track-container">
            <Header />

            <div className="search">
                <input
                    className="search-inp"
                    onChange={searchFood}
                    type="search"
                    placeholder="Search Food Item"
                />

                {foodItems.length !== 0 && (
                    <div className="search-results">
                        {foodItems.map((item) => (
                            <button
                                type="button"
                                className="item"
                                onClick={() => selectFood(item)}
                                key={item._id}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {food !== null && (
                <Food food={food} />
            )}
        </section>
    );
}
