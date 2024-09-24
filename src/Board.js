import React, { useState, useEffect } from 'react';
import './Board.css';
import { executeQuery } from './neo4jConnection'; 
import { checkHypothesis, getInitialState } from './gameLogic'; 


const Board = ({ onGameOver, handleMovePlayer }) => {
  const [loading, setLoading] = useState(true);
  const [crime, setCrime] = useState({ suspect: '', weapon: '', room: '' });
  const [foundItems, setFoundItems] = useState({ suspect: false, weapon: false });
  const [currentRoom, setCurrentRoom] = useState('Cuisine');

  const accessibleRooms = {
    'Cuisine': ['Hall','Grand Salon', 'Salle à manger'],
    'Grand Salon': ['Hall','Cuisine', 'Salle à manger', 'Petit Salon'],
    'Véranda': ['Hall','Studio', 'Petit Salon'],
    'Petit Salon': ['Grand Salon','Véranda', 'Bibliothèque', 'Bureau'],
    'Studio': ['Véranda', 'Bibliothèque'],
    'Hall': ['Cuisine', 'Grand Salon', 'Véranda', 'Salle à manger'],
    'Bibliothèque': ['Studio', 'Petit Salon'],
    'Salle à manger': ['Hall','Grand Salon', 'Cuisine'],
    'Bureau': ['Petit Salon']
  };

  const [aiPositions, setAiPositions] = useState([
    { name: 'IA 1', room: 'Cuisine', found: { suspect: false, weapon: false } },
    { name: 'IA 2', room: 'Hall', found: { suspect: false, weapon: false } },
    { name: 'IA 3', room: 'Bureau', found: { suspect: false, weapon: false } },
  ]);

  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const result = await executeQuery(`
          MATCH (s:Suspect), (w:Weapon), (r:Room)
          WITH DISTINCT s, w, r
          RETURN s.name AS suspect, w.name AS weapon, r.name AS room
          ORDER BY rand()
          LIMIT 1
        `);
    
        console.log("Crime Data:", result); // Debugging log
    
        const crimeData = result[0] || {};
        setCrime({
          suspect: crimeData[0] || '',
          weapon: crimeData[1] || '',
          room: crimeData[2] || ''
        });
      } catch (error) {
        console.error('Failed to fetch crime data:', error);
      }
    };
 

    fetchCrimeData();
  }, []);

  const handleRoomClick = (roomName) => {
    if (accessibleRooms[currentRoom].includes(roomName)) {
      setCurrentRoom(roomName); 
      handleMovePlayer(roomName); 
      moveAi(); 
    } else {
      alert(`Vous ne pouvez pas aller à ${roomName} depuis ${currentRoom}`);
    }
  };
  
  const moveAi = () => {
    const newAiPositions = aiPositions.map(ai => {
      const accessible = accessibleRooms[ai.room] || [];
      const newRoom = accessible[Math.floor(Math.random() * accessible.length)];
      return { ...ai, room: newRoom || ai.room };
    });
    setAiPositions(newAiPositions);
  };

  const makeHypothesis = (suspect, weapon) => {
    if (currentRoom === crime.room) {
      const isCorrect = {
        suspect: suspect === crime.suspect,
        weapon: weapon === crime.weapon
      };
      
      if (isCorrect.suspect) {
        setFoundItems(prev => ({ ...prev, suspect: true }));
        alert('Suspect trouvé !');
      }
      if (isCorrect.weapon) {
        setFoundItems(prev => ({ ...prev, weapon: true }));
        alert('Arme trouvée !');
      }

      if (isCorrect.suspect && isCorrect.weapon) {
        alert('Vous avez gagné ! Vous avez trouvé le crime !');
        onGameOver();
      }

      checkHypothesis(suspect, weapon, currentRoom, crime, onGameOver);

      const newAiPositions = aiPositions.map(ai => {
        if (ai.room === currentRoom) {
          const aiSuspect = getRandomSuspect();
          const aiWeapon = getRandomWeapon();
          const found = {
            suspect: aiSuspect === crime.suspect,
            weapon: aiWeapon === crime.weapon
          };
          if (found.suspect) {
            alert(`${ai.name} a trouvé le suspect !`);
          }
          if (found.weapon) {
            alert(`${ai.name} a trouvé l'arme' !`);
          }
          return { ...ai, found: { suspect: found.suspect, weapon: found.weapon } };
        }
        return ai;
      });
      setAiPositions(newAiPositions);
    }
  };

  const getRandomSuspect = async () => {
    try {
      const result = await executeQuery(`
        MATCH (s:Suspect)
        RETURN s.name AS suspect
        ORDER BY rand()
        LIMIT 1
      `);
      
      return result[0]?.row[0] || null;
    } catch (error) {
      console.error('Error fetching suspect:', error);
      return null;
    }
 };
 
 const getRandomWeapon = async () => {
    try {
      const result = await executeQuery(`
        MATCH (w:Weapon)
        RETURN w.name AS weapon
        ORDER BY rand()
        LIMIT 1
      `);
      
      return result[0]?.row[0] || null;
    } catch (error) {
      console.error('Error fetching weapon:', error);
      return null;
    }
 };
 

  const getRoomClass = (roomName) => {
    if (roomName === currentRoom) {
      return 'room current-room';
    } else if (accessibleRooms[currentRoom] && accessibleRooms[currentRoom].includes(roomName)) {
      return 'room accessible-room';
    } else {
      return 'room inaccessible-room';
    }
  };

  return (
    <div className="board">
      <div className={getRoomClass('Cuisine')} onClick={() => handleRoomClick('Cuisine')}>
        <img src="/img/cuisine.jpg" alt="Cuisine" className="room-image" />
        <h3>Cuisine</h3>
      </div>
      <div className={getRoomClass('Grand Salon')} onClick={() => handleRoomClick('Grand Salon')}>
        <img src="/img/grand_salon.jpg" alt="Grand Salon" className="room-image" />
        <h3>Grand Salon</h3>
      </div>
      <div className={getRoomClass('Véranda')} onClick={() => handleRoomClick('Véranda')}>
        <img src="/img/veranda.jpg" alt="Véranda" className="room-image" />
        <h3>Véranda</h3>
      </div>
      <div className={getRoomClass('Petit Salon')} onClick={() => handleRoomClick('Petit Salon')}>
        <img src="/img/petit_salon.jpg" alt="Petit Salon" className="room-image" />
        <h3>Petit Salon</h3>
      </div>
      <div className={getRoomClass('Studio')} onClick={() => handleRoomClick('Studio')}>
        <img src="/img/studio.jpg" alt="Studio" className="room-image" />
        <h3>Studio</h3>
      </div>
      <div className={getRoomClass('Hall')} onClick={() => handleRoomClick('Hall')}>
        <img src="/img/hall.jpg" alt="Hall" className="room-image" />
        <h3>Hall</h3>
      </div>
      <div className={getRoomClass('Bibliothèque')} onClick={() => handleRoomClick('Bibliothèque')}>
        <img src="/img/bibliotheque.jpg" alt="Bibliothèque" className="room-image" />
        <h3>Bibliothèque</h3>
      </div>
      <div className={getRoomClass('Salle à manger')} onClick={() => handleRoomClick('Salle à manger')}>
        <img src="/img/salle_a_manger.jpg" alt="Salle à manger" className="room-image" />
        <h3>Salle à manger</h3>
      </div>
      <div className={getRoomClass('Bureau')} onClick={() => handleRoomClick('Bureau')}>
        <img src="/img/bureau.jpg" alt="Bureau" className="room-image" />
        <h3>Bureau</h3>
      </div>
      <div className="ai-positions" style={{ gridColumn: '5', gridRow: '2', textAlign: 'center' }}>
        <h3>Positions des IA :</h3>
        <ul>
          {aiPositions.map((ai, index) => (
            <li key={index}>{ai.name} est dans {ai.room}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Board;