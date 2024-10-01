import { executeQuery } from './neo4jConnection';

let crime = null;

export async function resetGame() {
    try {
        await executeQuery(`
            MATCH (n)-[r]->(m)
            WHERE NOT (n:Room AND m:Room)
            DELETE r
        `);

        await executeQuery(`
            MATCH (c:Crime)
            DETACH DELETE c
        `);

        crime = null;
        console.log('Jeu réinitialisé');
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du jeu:', error);
    }
}

export async function initializeGame() {
    try {
        await executeQuery(`
            MATCH (c:Crime)
            DETACH DELETE c
        `);

        const result = await executeQuery(`
            CREATE (c:Crime)
            WITH c
            MATCH (s:Person), (w:Weapon), (r:Room)
            WITH c, s, w, r
            ORDER BY rand()
            LIMIT 1
            CREATE (c)-[:INVOLVES]->(s)
            CREATE (c)-[:INVOLVES]->(w)
            CREATE (c)-[:INVOLVES]->(r)
            RETURN s.name AS suspect, w.name AS weapon, r.name AS room
        `);
        
        if (!result || result.length === 0) {
            throw new Error('Échec de la création du crime. Vérifiez la base de données.');
        }

        const record = result[0];
        
        crime = {
            suspect: record.suspect,
            weapon: record.weapon,
            room: record.room
        };

        await executeQuery(`
            MATCH (p:Player {name: 'Joueur'})-[r:HAS]->()
            DELETE r
        `);

        await executeQuery(`
            MATCH (p:Player {name: 'Joueur'})
            MATCH (card)
            WHERE (card:Person OR card:Weapon OR card:Room)
            AND NOT (:Crime)-[:INVOLVES]->(card)
            AND NOT card.name IN $crimeElements
            WITH p, card, rand() AS r
            ORDER BY r
            LIMIT 4
            CREATE (p)-[:HAS]->(card)
        `, { crimeElements: [crime.suspect, crime.weapon, crime.room] });

        console.log('Nouveau crime choisi et cartes du joueur distribuées:', crime);
        return crime;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu:', error.message);
        return null;
    }
}

export async function getCrime() {
    if (crime === null) {
        const result = await executeQuery(`
            MATCH (c:Crime)-[:INVOLVES]->(s:Person)
            MATCH (c)-[:INVOLVES]->(w:Weapon)
            MATCH (c)-[:INVOLVES]->(r:Room)
            RETURN s.name AS suspect, w.name AS weapon, r.name AS room
        `);
        
        if (result && result.length > 0) {
            const record = result[0];
            crime = {
                suspect: record.suspect,
                weapon: record.weapon,
                room: record.room
            };
        }
    }
    return crime;
}

export async function getPlayerCards() {
    const result = await executeQuery(`
        MATCH (p:Player {name: 'Joueur'})-[:HAS]->(card)
        RETURN DISTINCT card.name AS name, labels(card)[0] AS type
    `);
    return result;
}

export const checkHypothesis = (suspect, weapon, room, onGameOver) => {
    if (!crime) {
        console.error('Le crime n\'a pas été initialisé');
        return;
    }

    const isSuspectCorrect = suspect.trim().toLowerCase() === crime.suspect.trim().toLowerCase();
    const isWeaponCorrect = weapon.trim().toLowerCase() === crime.weapon.trim().toLowerCase();
    const isRoomCorrect = room.trim().toLowerCase() === crime.room.trim().toLowerCase();

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
