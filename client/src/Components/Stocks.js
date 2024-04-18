import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Stocks.module.css';

function Stocks() {
    const [numberOfStocks, setNumberOfStocks] = useState('');
    const [stocks, setStocks] = useState([]);

    const fetchStocks = async () => {
        try {
            if (!numberOfStocks || isNaN(numberOfStocks) || numberOfStocks < 1 || numberOfStocks > 20) {
                alert("Please enter a valid number of stocks between 1 and 20.");
                return;
            }

            const response = await axios.get(`http://localhost:5000/stocks`);
            setStocks(response.data.slice(0, numberOfStocks));
        } catch (error) {
            console.error('Error fetching stocks:', error.message);
        }
    };


    const fetchUpdatedStocks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/stocks');
            updateStockPrices(response.data);
        } catch (error) {
            console.error('Error fetching updated stocks:', error.message);
        }
    };

    const updateStockPrices = (newStockData) => {
        setStocks(prevStocks => {
            return prevStocks.map(prevStock => {
                const newStock = newStockData.find(newStock => newStock.t === prevStock.t);
                return newStock ? { ...newStock, previousPrice: prevStock.c } : prevStock;
            });
        });
    };

    useEffect(() => {
        const intervalId = setInterval(fetchUpdatedStocks, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const handleChange = (event) => {
        setNumberOfStocks(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchStocks();
    };

    const getPriceColor = (currentPrice, previousPrice) => {
        if (currentPrice > previousPrice) {
            return styles.green;
        } else if (currentPrice < previousPrice) {
            return styles.red;
        }
        return '';
    };

    return (
        <div className={styles.stockContainer}>
            <h1>Stock Prices</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="numberOfStocks">Enter the number of stocks (not more than 20):</label>
                <input type="number" id="numberOfStocks" min="1" max="20" value={numberOfStocks} onChange={handleChange} />
                <button type="submit">Fetch Stocks</button>
            </form>
            <div className={styles.stockHeader}>
                <div className={styles.displayStock}>
                    {stocks.map(stock => (
                        <div className={`${styles.stockDiv}`}>
                            <div key={stock.t}>{`${stock.t}`}</div>
                            <div key={stock.t} className={`${getPriceColor(stock.c, stock.previousPrice)}`}>{`$${stock.c.toFixed(2)}`}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default Stocks;
