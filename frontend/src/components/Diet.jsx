import { useEffect, useState, useContext } from "react"
import { UserContext } from "../contexts/UserContext"
import Header from './Header'

export default function Diet()
{
    let loggedData = useContext(UserContext)
    const [items,setItems] = useState([]);
    const [date,setDate] = useState(new Date())

    let [total,setTotal] = useState({
        totalCaloreis:0,
        totalProtein:0,
        totalCarbs:0,
        totalFats:0,
        totalFiber:0
    })

    useEffect(()=>{
        if (!loggedData.loggedUser) return;

        // Send the selected date in YYYY-MM-DD format. The backend stores dates as DD/MM/YYYY.
        const selectedDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

        fetch(`http://localhost:8000/track/${loggedData.loggedUser.userid}/${selectedDate}`,{
            method:"GET",
            headers:{
                "Authorization":`Bearer ${loggedData.loggedUser.token}`
            }
        })
        .then(async (response)=>{
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Unable to load tracking records");
            }
            setItems(data);
        })
        .catch((err)=>{
            console.log(err);
            setItems([]);
        })

    },[date, loggedData.loggedUser])

    useEffect(()=>{
        calculateTotal();
    },[items])

    function calculateTotal()
    {
        let totalCopy = {
            totalCaloreis:0,
            totalProtein:0,
            totalCarbs:0,
            totalFats:0,
            totalFiber:0
        };

        items.forEach((item)=>{
            // Existing tracking documents store foodId and quantity, not a details object.
            const food = item.foodId;
            if (!food) return;
            const factor = Number(item.quantity) / 100;

            totalCopy.totalCaloreis += (food.calories || 0) * factor;
            totalCopy.totalProtein += (food.protein || 0) * factor;
            totalCopy.totalCarbs += (food.carbohydrates || 0) * factor;
            totalCopy.totalFats += (food.fat || 0) * factor;
            totalCopy.totalFiber += (food.fiber || 0) * factor;
        })

        setTotal(totalCopy);
    }

    return (
        <section className="container diet-container">
            <Header/>

            <input
                type="date"
                value={`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
                onChange={(event)=>{
                    if (event.target.value) {
                        const [year, month, day] = event.target.value.split("-").map(Number);
                        setDate(new Date(year, month - 1, day));
                    }
                }}
            />

            {
                items.map((item)=>{
                    const food = item.foodId;
                    if (!food) return null;
                    const factor = Number(item.quantity) / 100;
                    const calories = (food.calories || 0) * factor;
                    const protein = (food.protein || 0) * factor;
                    const carbs = (food.carbohydrates || 0) * factor;
                    const fats = (food.fat || 0) * factor;
                    const fiber = (food.fiber || 0) * factor;

                    return (
                        <div className="item" key={item._id}>
                            <h3>{food.name} ( {calories.toFixed(1)} Kcal for {item.quantity}g )</h3>
                            <p>Protein {protein.toFixed(1)}g, Carbs {carbs.toFixed(1)}g, Fats {fats.toFixed(1)}g, Fiber {fiber.toFixed(1)}g</p>
                        </div>
                    )
                })
            }

            <div className="item">
                <h3>{total.totalCaloreis.toFixed(1)} Kcal</h3>
                <p>Protein {total.totalProtein.toFixed(1)}g, Carbs {total.totalCarbs.toFixed(1)}g, Fats {total.totalFats.toFixed(1)}g, Fiber {total.totalFiber.toFixed(1)}g</p>
            </div>
        </section>
    )
}
