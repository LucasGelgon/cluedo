import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { checkHypothesis, initializeGame, resetGame, getCrime, getPlayerCards } from './gameLogic';
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
  const [isGameOver, setIsGameOver] = useState(false); 
  const [playerCards, setPlayerCards] = useState([]);
  const [showPlayerCards, setShowPlayerCards] = useState(false);

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

  const initializeGameState = async () => {
    setIsLoading(true);
    await resetGame();
    await initializeGame();
    const crimeData = await getCrime();
    setCrime(crimeData);
    
    const allCards = await fetchAllCards();
    const playerCardsData = await getPlayerCards();
    setPlayerCards(playerCardsData);

    const suspectsList = allCards.filter(card => card.type === 'Person').map(card => card.name);
    const weaponsList = allCards.filter(card => card.type === 'Weapon').map(card => card.name);
    const roomsList = allCards.filter(card => card.type === 'Room').map(card => card.name);
    
    setSuspects(suspectsList);
    setWeapons(weaponsList);
    setRoomsState(roomsList.map(room => ({ name: room })));
    
    initializePositions(roomsList);
    setIsLoading(false);
  };

  useEffect(() => {
    initializeGameState();
  }, []);

  const fetchAllCards = async () => {
    const query = `
      MATCH (card)
      WHERE (card:Person OR card:Weapon OR card:Room)
      RETURN card.name AS name, labels(card)[0] AS type
    `;
    return await executeQuery(query);
  };

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
    return roomMap[currentRoom] || [];
  };

  const handleReplay = async () => {
    setIsLoading(true);
    await initializeGameState();
    setIsGameOver(false);
    setSelectedSuspect('');
    setSelectedWeapon('');
    setResult('');
  };

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
        setIsGameOver(true);
    }
  
    setResult(message);
    alert(message);
  };
  
  if (isLoading) {
    return <div>Chargement...</div>; 
  }

  if (isGameOver) {
    return (
      <Container className="text-center">
        <h1>Partie Terminée</h1>
        <p>{result}</p>
        <Button variant="primary" onClick={handleReplay}>
          Rejouer
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div>
        <h1 className="text-center my-4">Cluedo</h1>
        <Board 
          roomsState={roomsState} 
          playerPosition={playerPosition} 
          handleMovePlayer={handleMovePlayer} 
          aiPositions={aiPositions}
          crime={crime}
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

          <button onClick={() => setShowPlayerCards(!showPlayerCards)}>
            {showPlayerCards ? 'Cacher mes cartes' : 'Afficher mes cartes'}
          </button>

          {showPlayerCards && playerCards.length > 0 && (
            <div>
              <h3>Vos Cartes :</h3>
              <ul>
                {playerCards.map((card, index) => (
                  <li key={index}>{card.name} ({card.type})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}  

export default App;
