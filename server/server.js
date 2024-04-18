const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors=require('cors')

const app = express();
app.use(cors())

const apiKey = process.env.API_KEY;

let stockData = []; 
let intervalIds = {}; 

async function fetchStockData() {
    try {
        const response = await axios.get('https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2022-01-09/2023-01-09', {
            params: {
                apiKey: apiKey
            }
        });
        return response.data.results.slice(0, 20);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

function generateRefreshInterval() {
    return Math.floor(Math.random() * 5) + 1;
}

function updateStockPrice(stock) {
    stock.c = Math.random() * (200 - 100) + 100;
}

function startUpdatingStock(stock) {
    const refreshInterval = stock.refreshInterval * 1000;
    intervalIds[stock.t] = setInterval(() => {
        updateStockPrice(stock);
    }, refreshInterval);
}

async function initialize() {
    stockData = await fetchStockData();
    startUpdatingStocks();
}

async function startUpdatingStocks() {
    stockData.forEach(stock => {
        startUpdatingStock(stock);
    });
}

app.get('/stocks', async (req, res) => {
    try {
        if (stockData.length === 0) {
            await initialize(); 
        }
        const stocksWithRefreshIntervals = stockData.map(stock => ({
            ...stock,
            refreshInterval: generateRefreshInterval()
        }));
        res.json(stocksWithRefreshIntervals);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
