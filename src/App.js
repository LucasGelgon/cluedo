import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { checkHypothesis, getInitialState } from './gameLogic';
import { executeQuery } from './neo4jConnection'; 
import './App.css';
import Board from './Board';

function App() {
  const [suspect, setSuspect] = useState('');
  const [weapon, setWeapon] = useState('');
  const [result, setResult] = useState('');
  const [roomsState, setRoomsState] = useState([]);
  const [playerPosition, setPlayerPosition] = useState('');
  const [aiPositions, setAiPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suspects, setSuspects] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [crime, setCrime] = useState({ suspect: '', weapon: '', room: '' });

  const initializePositions = (rooms) => {
    const allRooms = rooms;
    const randomPlayerRoom = getRandomRoom(allRooms);
    const availableRooms = allRooms.filter(room => room !== randomPlayerRoom);

    const ai1Room = getRandomRoom(availableRooms);
    const ai2Room = getRandomRoom(availableRooms.filter(r => r !== ai1Room));
    const ai3Room = getRandomRoom(availableRooms.filter(r => r !== ai1Room && r !== ai2Room));

    const initialAiPositions = [
      { name: 'IA 1', room: ai1Room },
      { name: 'IA 2', room: ai2Room },
      { name: 'IA 3', room: ai3Room }
    ];

    setPlayerPosition(randomPlayerRoom);
    setAiPositions(initialAiPositions);
  };

  const getRandomRoom = (rooms) => {
    return rooms[Math.floor(Math.random() * rooms.length)];
  };

  useEffect(() => {
    const initializeGame = async () => {
      const initialState = await getInitialState();
      if (initialState) {
        const rooms = Object.values(initialState);
        setRoomsState(rooms.map(room => ({ name: room })));
        initializePositions(rooms);
      }
      setIsLoading(false);
    };
  
    initializeGame();
  }, []);

  const handleMovePlayer = (newRoom) => {
    console.log('Déplacement du joueur vers :', newRoom);
    setPlayerPosition(newRoom);
    moveAI();
  }; 


  const moveAI = () => {
    const updatedAiPositions = aiPositions.map(ai => {
      const accessibleRooms = getAccessibleRooms(ai.room);
      return {
        ...ai,
        room: accessibleRooms.length > 0 ? getRandomRoom(accessibleRooms) : ai.room
      };
    });
    setAiPositions(updatedAiPositions);
  };

  const getAccessibleRooms = (currentRoom) => {
    const roomMap = {
      'Cuisine': ['Grand Salon', 'Salle à manger'],
      'Grand Salon': ['Cuisine', 'Véranda', 'Salle à manger'],
      'Véranda': ['Grand Salon', 'Petit Salon'],
      'Petit Salon': ['Véranda', 'Hall', 'Bibliothèque'],
      'Studio': ['Hall'],
      'Hall': ['Cuisine', 'Grand Salon', 'Petit Salon', 'Studio', 'Bureau'],
      'Bibliothèque': ['Petit Salon'],
      'Salle à manger': ['Grand Salon'],
      'Bureau': ['Hall']
    };
    return roomMap[currentRoom] || [];
  };

  useEffect(() => {
    const fetchSuspects = async () => {
      try {
        const result = await executeQuery(`
          MATCH (s:Person)
          RETURN s.name AS suspect
          ORDER BY rand()
        `);
        setSuspects(result.map(item => item.suspect) || []);
      } catch (error) {
        console.error('Error fetching suspects:', error);
      }
    };
  
    const fetchWeapons = async () => {
      try {
        const result = await executeQuery(`
          MATCH (w:Weapon)
          RETURN w.name AS weapon
          ORDER BY rand()
        `);
        setWeapons(result.map(item => item.weapon) || []);
      } catch (error) {
        console.error('Error fetching weapons:', error);
      }
    };
  
    fetchSuspects();
    fetchWeapons();
  }, []);

  const handleCheckHypothesis = async () => {
    console.log("Vérification de l'hypothèse avec :", {
        suspect: selectedSuspect,
        weapon: selectedWeapon,
        room: playerPosition
    });
  
    const result = checkHypothesis(selectedSuspect, selectedWeapon, playerPosition, () => {
        console.log("Partie terminée !");
    });
  
    console.log("Résultat de la vérification :", result);
  
    let message = '';
    if (result.suspect) message += "Suspect correct ! ";
    else message += "Suspect incorrect. ";
    if (result.weapon) message += "Arme correcte ! ";
    else message += "Arme incorrecte. ";
    if (result.room) message += "Pièce correcte ! ";
    else message += "Pièce incorrecte. ";
  
    if (result.isCorrect) {
        message += "Vous avez gagné !";
    }
  
    setResult(message);
    alert(message);
};
  
  if (isLoading) {
    return <div>Chargement...</div>; 
  }

  return (
    <Container>
      <div>
        <h1 className="text-center my-4">Cluedo IUT</h1>
        <Board 
          roomsState={roomsState} 
          playerPosition={playerPosition} 
          handleMovePlayer={handleMovePlayer} 
          aiPositions={aiPositions}
        />
  
        <div id="hypothese">
        <Form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
        <Form.Group style={{ width: '100%', maxWidth: '400px' }}>
          <Form.Select
          className="custom-select"
          value={selectedSuspect}
          onChange={(e) => setSelectedSuspect(e.target.value)}
          >
          <option value="">Sélectionnez un suspect</option>
          {suspects.map((suspect) => (
            <option key={suspect} value={suspect}>
              {suspect}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          className="custom-select"
          value={selectedWeapon}
          onChange={(e) => setSelectedWeapon(e.target.value)}
        >
          <option value="">Sélectionnez une arme</option>
          {weapons.map((weapon) => (
            <option key={weapon} value={weapon}>
              {weapon}
            </option>
          ))}
        </Form.Select>

        </Form.Group>
  
        <Button style={{ width: '100%', maxWidth: '400px', marginTop: '15px' }} variant="primary" onClick={handleCheckHypothesis}>
          Vérifier l'hypothèse
        </Button>
      </Form>
        
        </div>
      </div>
    </Container>
  );
}  

export default App;