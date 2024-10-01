import React, { useEffect } from 'react';
import './Board.css';

const Board = ({ roomsState, playerPosition, handleMovePlayer, aiPositions, crime }) => {
  const accessibleRooms = {
    'Cuisine': ['Hall', 'Grand Salon', 'Salle a manger'],
    'Grand Salon': ['Hall', 'Cuisine', 'Salle a manger', 'Petit Salon'],
    'Veranda': ['Hall', 'Studio', 'Petit Salon'],
    'Petit Salon': ['Grand Salon', 'Veranda', 'Bibliotheque', 'Bureau'],
    'Studio': ['Veranda', 'Bibliotheque'],
    'Hall': ['Cuisine', 'Grand Salon', 'Veranda', 'Salle a manger'],
    'Bibliotheque': ['Studio', 'Petit Salon'],
    'Salle a manger': ['Hall', 'Grand Salon', 'Cuisine'],
    'Bureau': ['Petit Salon']
  };

  useEffect(() => {
    console.log('Crime actuel:', crime);
  }, [crime]);

  const handleRoomClick = (roomName) => {
    if (!playerPosition) {
      handleMovePlayer(roomName);
    } else if (accessibleRooms[playerPosition] && accessibleRooms[playerPosition].includes(roomName)) {
      handleMovePlayer(roomName);
    } else {
      console.log(`Tentative de déplacement invalide: de ${playerPosition} vers ${roomName}`);
      alert(`Vous ne pouvez pas aller à ${roomName} depuis ${playerPosition}`);
    }
  };

  const getRoomClass = (roomName) => {
    if (!playerPosition) {
      return 'room accessible-room';  
    } else if (roomName === playerPosition) {
      return 'room current-room';
    } else if (accessibleRooms[playerPosition] && accessibleRooms[playerPosition].includes(roomName)) {
      return 'room accessible-room';
    } else {
      return 'room inaccessible-room';
    }
  };

  const getImageFileName = (roomName) => {
    const nameMap = {
      'Bibliotheque': 'bibliotheque',
      'Bureau': 'bureau',
      'Cuisine': 'cuisine',
      'Grand Salon': 'grand_salon',
      'Hall': 'hall',
      'Petit Salon': 'petit_salon',
      'Salle a manger': 'salle_a_manger',
      'Studio': 'studio',
      'Veranda': 'veranda'
    };
    return nameMap[roomName] || roomName.toLowerCase().replace(' ', '_');
  };

  return (
    <div className="board">
      {roomsState.map((room) => (
        <div key={room.name} className={getRoomClass(room.name)} onClick={() => handleRoomClick(room.name)}>
          <img 
            src={`/img/${getImageFileName(room.name)}.jpg`} 
            alt={room.name} 
            className="room-image" 
          />
          <h3>{room.name}</h3>
        </div>
      ))}
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
