import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.apiKey});

let orders =[]
let totalNumberOfPeople = 0;

router.post("/numberOfPeople", (req, res) => {
    const { selectedValue } = req.body; 
    totalNumberOfPeople = selectedValue;
    res.send(`You sent the number of people: ${selectedValue}`);
})


router.post("/checklist", (req, res) => {
    const { order } = req.body;

    const orderDetails = {
        name: order.name, 
        order: order.selectedFood.map((foodItem) => ({
            foodName: foodItem.name, 
            foodPrice: foodItem.price, 
        })),
    };

    orders.push(orderDetails);
    //console.log(JSON.stringify(orders, null, 2)); 

    res.send(`Order received for ${order.name}. Items: ${JSON.stringify(orderDetails.selectedFood)}`);
});


// router.get("/chat", async (req, res) => {

//     // let message = `The orders list contains a list of people with their names and a list of the food items they ordered, each food item includes the food name and price. Your task is to split the bill according to what each person ordered. 
//     // Here is a list of the orders ${orders}. Additionally, the total number of people in the group is ${totalNumberOfPeople}. 
//     // Please calculate how much each person needs to pay, considering the food items they ordered. Provide a breakdown of the amount each person owes.`;

//     let message = "hello how are u"

//     try {
//         // make req to openai api
//         const response = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo',
//             messages: [{ role: 'user', content: "hello how are u"}],
//         })

//         console.log(response.choices[0].message.content);

//         res.json({ reply: response.choices[0].message.content });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.get("/chat", async (req, res) => {

    console.log(orders)
    console.log(totalNumberOfPeople)

    const message = `The orders list contains a list of people with their names and a list of the food items they ordered, each food item includes the food name and price. Your task is to split the bill according to what each person ordered. 
                    Here is a list of the orders ${orders}. Additionally, the total number of people in the group is ${totalNumberOfPeople}. 
                    Please calculate how much each person needs to pay, considering the food items they ordered. Provide a breakdown of the amount each person owes.`;

    try {
        // make req to openai api
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message}],
        })

        console.log(response.choices[0].message.content);

        // send response back to client
        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/splitBill", (req, res) => {
    // Check if there are orders and total number of people
    if (orders.length === 0 || totalNumberOfPeople === 0) {
        return res.status(400).json({ error: "No orders or number of people set." });
    }

    // Create a dictionary to count how many people ordered each food item
    const foodItemCount = {};

    orders.forEach(order => {
        order.order.forEach(foodItem => {
            const foodName = foodItem.foodName;
            if (!foodItemCount[foodName]) {
                foodItemCount[foodName] = {
                    price: foodItem.foodPrice,
                    count: 1
                };
            } else {
                foodItemCount[foodName].count += 1;
            }
        });
    });

    // Calculate how much each person owes based on shared food items
    const billBreakdown = orders.map(order => {
        let totalForPerson = 0;

        order.order.forEach(foodItem => {
            const foodName = foodItem.foodName;
            const sharedPrice = foodItemCount[foodName].price / foodItemCount[foodName].count; // Divide price among sharers
            totalForPerson += sharedPrice;
        });

        return {
            name: order.name,
            totalAmount: totalForPerson.toFixed(2), // Round to two decimal places
        };
    });

    // Send the breakdown of how much each person owes
    res.send(billBreakdown);
});



export default router;



