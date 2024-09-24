import { executeQuery } from './neo4jConnection';

let crime = null;

export async function getInitialState() {
  if (crime) {
      console.log('Crime déjà initialisé :', crime);
      return crime;
  }

  try {
      const result = await executeQuery(`
          MATCH (s:Person), (w:Weapon), (r:Room)
          WITH s, w, r
          ORDER BY rand()
          RETURN s.name AS suspect, w.name AS weapon, r.name AS room
          LIMIT 1
      `);
      
      console.log('Résultat brut de la requête :', result);
      
      if (!result || result.length === 0) {
          throw new Error('Aucun crime trouvé.');
      }

      const record = result[0];
      
      crime = {
          suspect: record.suspect || '',
          weapon: record.weapon || '',
          room: record.room || ''
      };

      console.log('Crime choisi :', crime);
      return crime;
  } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
  }
}

export const checkHypothesis = (suspect, weapon, room, onGameOver) => {
  if (!crime) {
      console.error('Le crime n\'a pas été initialisé');
      return;
  }

  console.log("Hypothèse :", { suspect, weapon, room });
  console.log("Crime actuel :", crime);

  const isSuspectCorrect = suspect.trim().toLowerCase() === crime.suspect.trim().toLowerCase();
  const isWeaponCorrect = weapon.trim().toLowerCase() === crime.weapon.trim().toLowerCase();
  const isRoomCorrect = room.trim().toLowerCase() === crime.room.trim().toLowerCase();

  console.log("Comparaisons :", {
      suspect: `${suspect.trim().toLowerCase()} === ${crime.suspect.trim().toLowerCase()}`,
      weapon: `${weapon.trim().toLowerCase()} === ${crime.weapon.trim().toLowerCase()}`,
      room: `${room.trim().toLowerCase()} === ${crime.room.trim().toLowerCase()}`
  });

  const result = {
      suspect: isSuspectCorrect,
      weapon: isWeaponCorrect,
      room: isRoomCorrect,
      isCorrect: isSuspectCorrect && isWeaponCorrect && isRoomCorrect
  };

  console.log("Résultat de la vérification :", result);

  if (result.isCorrect && onGameOver) {
      onGameOver();
  }

  return result;
};