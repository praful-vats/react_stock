import React, { useState, useEffect } from 'react';
import DisplayStockData from './Stock';
import './Stock.css'
import mid from '../mid.png';

function View() {
  const [symbols, setSymbols] = useState([]);
  const [stockData, setStockData] = useState([]);

  const [nseStocks, setNseStocks] = useState([
  { name: "Reliance Industries", symbol: "RELIANCE" },
  { name: "Tata Consultancy Services", symbol: "TCS" },
  { name: "HDFC Bank", symbol: "HDFCBANK" },
  // Add more NSE stocks here
  ]);


  // const handleAddSymbol = async symbol => {
  //   if (symbols.length < 9 && !symbols.includes(symbol)) {
  //     const response = await fetch(`http://127.0.0.1:8000/${symbol}/`);
  //     const data = await response.json();
  //     if (data.hasOwnProperty('error')) {
  //       alert(data.error);
  //       return;
  //     }
  //     setSymbols([...symbols, symbol]);
  //   } else {
  //     alert("Symbol already entered or maximum limit reached (9)");
  //   }
  // };
  const handleAddSymbol = async (symbol, name) => {
  if (symbols.length < 9 && !symbols.includes(symbol)) {
    const response = await fetch(`http://127.0.0.1:8000/${symbol}/`);
    const data = await response.json();
    if (data.hasOwnProperty("error")) {
      alert(data.error);
      return;
    }
    setSymbols([...symbols, symbol]);
  } else {
    alert("Symbol already entered or maximum limit reached (9)");
  }
};

   
  const [sensexData, setSensexData] = useState({});
  const arrow = sensexData.change > 0 ? '\u25B2' : '\u25BC';
  useEffect(() => {
    const fetchSensexData = async () => {
      const response = await fetch('http://127.0.0.1:8000/BSE/');
      const data = await response.json();
      setSensexData(data);
    };
    fetchSensexData();
  }, []);
  
  const [sensexDatai, setSensexDatai] = useState({});
  const arrowi = sensexDatai.change > 0 ? '\u25B2' : '\u25BC';
  useEffect(() => {
    const fetchSensexDatai = async () => {
      const response = await fetch('http://127.0.0.1:8000/INFY/');
      const data = await response.json();
      setSensexDatai(data);
    };
    fetchSensexDatai();
  }, []);
  


  useEffect(() => {
    const fetchData = async () => {
      if (!symbols.length) {
        return;
      }
      const urls = symbols.map(symbol => `http://127.0.0.1:8000/${symbol}/`);
      const promises = urls.map(url => fetch(url).then(response => response.json()));
      const data = await Promise.all(promises);
      setStockData(data);
    };
    fetchData();
  }, [symbols]);

  useEffect(() => {
    let sockets = [];
    if (stockData.length) {
      stockData.forEach(data => {
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/stock/${data.symbol}/`);
        socket.onmessage = event => {
          const updatedData = JSON.parse(event.data);
          setStockData(prevData => prevData.map(item => (item.symbol === updatedData.symbol ? updatedData : item)));
        };
        sockets.push(socket);
      });
    }
    return () => {
      sockets.forEach(socket => socket.close());
    };
  }, [stockData]);

  return (
    <div className='f19'>
      <div>
        <div className="info-container">
          {stockData.map(data => (
            <div key={data.symbol} >
              <DisplayStockData stockData={data} />
              {/* <button onClick={() => handleRemoveSymbol(data.symbol)}>&#10799;</button> */}
            </div>
          ))}
        </div>
      </div>
      <div className='grid'>
        <form
          onSubmit={event => {
            event.preventDefault();
            const symbol = event.target.symbol.value.toUpperCase();
            handleAddSymbol(symbol);
            event.target.symbol.value = '';
          }}
        >
          <div className='two item'>
            <input className='f19' type="text" placeholder='enter stock'  name="symbol"></input>
            {/* <button type="submit" >+</button> */}
          </div>
        </form>
        {symbols.length > 0 ? (
          <div className='four item'>
            <div className="circles-grid">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`circle ${i < symbols.length ? "black" : "red"}`}
                ></div>
              ))}
            </div>
            <div className="symbol-count">
            <span className="symbol-length">{symbols.length}</span><a className='by'>&nbsp; / 9</a>
              <button className='but f19' onClick={() => {
                setSymbols([]);
                setStockData([]);
              }}>X</button>
              
            </div>
          </div>
        ) : (
          <div className='four item'>
            <div className="circles-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="circle red"></div>
              ))}
            </div>
            <div className="symbol-count">
            <span className="symbol-length">{symbols.length}</span><a className='by'>&nbsp; / 9</a> 
            </div>
          </div>
        )}
        <div className='six  item in-grid iga'>
          <div className='ione'>
            {sensexData && (
              <>
                <div>{sensexData.symbol}</div>
                <div>{sensexData.price}</div>
                <div>{arrow}{sensexData.pChange}</div>
                <div>{sensexData.change}</div>
              </>
            )}
          </div>
          <div className='itwo'>
            {sensexDatai && (
              <>
                <div>{sensexDatai.symbol}</div>
                <div>{sensexDatai.price}</div>
                <div>{arrowi}{sensexDatai.pChange}</div>
                <div>{sensexDatai.change}</div>
              </>
            )}
          </div>
        </div>
        <div className='three element item'>
           {nseStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="nse-stock"
              onClick={() => handleAddSymbol(stock.symbol, stock.name)}
            >
              {stock.name} ({stock.symbol})
            </div>
          ))}
        </div>

        <div className='th item'>
          <img src={mid} width="200" height="415" alt="mid" />;
        </div>
      </div>  
    </div>
  );
}

export default View;